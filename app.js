// Indian Sign Language (ISL) Orchestrator & UI Controller
import { ISL_DICTIONARY } from "./dictionary.js";
import { classifyISLGesture } from "./classifier.js";

// MediaPipe imports from CDN
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.mjs";

// Global App States
const state = {
  activeTab: "recognition", // recognition, dictionary, practice, translator
  isModelLoaded: false,
  isCameraActive: false,
  stream: null,
  handLandmarker: null,
  lastVideoTime: -1,
  animationFrameId: null,
  
  // Recognition Log States
  recognizedText: [], // array of words/letters
  currentSign: "-",
  stabilityCounter: 0,
  lastStableSign: null,
  stableThreshold: 20, // consecutive frames required to commit a letter
  
  // Game states (Practice Arena)
  practiceActive: false,
  targetSign: null,
  streak: 0,
  solvedCount: 0,
  highScore: 0,
  holdTime: 0, // time holding correct sign in seconds
  holdTarget: 1.5, // require holding for 1.5 seconds
  holdTimerInterval: null,
  
  // Text-To-Sign Translator States
  transSequence: [],
  transCurrentIndex: 0,
  transIsPlaying: false,
  transInterval: null,
  transSpeedMs: 1500
};

// Canvas Particle System (for success celebrations)
class ConfettiParticle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }
  
  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.size = Math.random() * 5 + 3;
    this.speedX = (Math.random() - 0.5) * 15;
    this.speedY = (Math.random() - 0.5) * 15 - 5;
    const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.gravity = 0.25;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.015 + 0.01;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= this.decay;
    
    if (this.alpha <= 0) {
      this.reset();
      this.alpha = 0; // mark for death or keep pooling
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particles = [];
let particleCanvas = null;
let particleCtx = null;
let particleAnimId = null;

function initConfetti() {
  particleCanvas = document.getElementById("particle-canvas");
  particleCtx = particleCanvas.getContext("2d");
  resizeParticleCanvas();
  window.addEventListener("resize", resizeParticleCanvas);
  
  for (let i = 0; i < 40; i++) {
    particles.push(new ConfettiParticle(particleCanvas.width, particleCanvas.height));
  }
}

function resizeParticleCanvas() {
  if (particleCanvas) {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
}

let activeParticlesTriggered = false;
let particleTriggerEndTime = 0;

function triggerConfetti() {
  activeParticlesTriggered = true;
  particleTriggerEndTime = Date.now() + 1500; // run for 1.5s
  if (!particleAnimId) {
    animateParticles();
  }
}

function animateParticles() {
  if (!activeParticlesTriggered && particles.every(p => p.alpha <= 0)) {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particleAnimId = null;
    return;
  }
  
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  
  particles.forEach(p => {
    if (Date.now() < particleTriggerEndTime || p.alpha > 0) {
      p.update();
      if (p.alpha > 0) {
        p.draw(particleCtx);
      }
    }
  });
  
  particleAnimId = requestAnimationFrame(animateParticles);
}

// ----------------------------------------------------
// UI Nodes & Elements
// ----------------------------------------------------
let webcamNode = null;
let canvasNode = null;
let ctxNode = null;

// Initialize Elements
document.addEventListener("DOMContentLoaded", () => {
  webcamNode = document.getElementById("webcam");
  canvasNode = document.getElementById("canvas");
  ctxNode = canvasNode.getContext("2d");
  
  initConfetti();
  setupNavigation();
  setupDictionary();
  setupPracticeHub();
  setupTranslator();
  setupCameraControls();
  
  // Load Highscore
  state.highScore = parseInt(localStorage.getItem("isl_high_score") || "0");
  document.getElementById("quiz-high-val").innerText = state.highScore;
  
  // Start loading neural models
  loadMediaPipeModel();
});

// Setup Tab Navigation
function setupNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");
      if (target === state.activeTab) return;
      
      // Update UI active tab buttons
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Update active view panels
      document.querySelectorAll(".tab-content").forEach(view => {
        view.classList.remove("active");
      });
      document.getElementById(`view-${target}`).classList.add("active");
      
      state.activeTab = target;
      handleTabTransition(target);
    });
  });
}

// Handle what happens when switching screens (e.g. camera porting)
function handleTabTransition(targetTab) {
  // Clear any translator playing intervals
  stopTranslatorPlayback();
  
  // Camera dynamic porting:
  // Port the webcam and canvas nodes into the current active container!
  if (targetTab === "recognition") {
    const hud = document.getElementById("recognition-hud");
    hud.insertBefore(webcamNode, hud.firstChild);
    hud.insertBefore(canvasNode, webcamNode.nextSibling);
    
    // Clear practice modes
    stopPracticeSession();
    
    if (state.isCameraActive) {
      startDetectionLoop();
    }
  } else if (targetTab === "practice") {
    const hud = document.getElementById("practice-hud-container");
    // Clear the camera placeholder
    const placeholder = document.getElementById("practice-camera-placeholder");
    placeholder.style.display = "none";
    
    hud.appendChild(webcamNode);
    hud.appendChild(canvasNode);
    
    if (state.isCameraActive) {
      startDetectionLoop();
    }
  } else {
    // If dictionary or translator, we can stop the active detection loops to save CPU/battery
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }
    // Clean canvas
    ctxNode.clearRect(0, 0, canvasNode.width, canvasNode.height);
  }
}

// ----------------------------------------------------
// MediaPipe Hand Landmarker Loader
// ----------------------------------------------------
async function loadMediaPipeModel() {
  const statusIndicator = document.getElementById("footer-status-indicator");
  const statusText = document.getElementById("footer-status-text");
  
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
    );
    
    state.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    
    state.isModelLoaded = true;
    
    // Fade out loading screen
    const loader = document.getElementById("loading-overlay");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
    
    statusIndicator.className = "status-indicator ready";
    statusText.innerText = "ENGINE READY";
  } catch (err) {
    console.error("Error loading MediaPipe model:", err);
    document.getElementById("loading-title").innerText = "Failed to Load Models";
    document.getElementById("loading-desc").innerText = "Error: Check your internet connection or console logs.";
    statusIndicator.className = "status-indicator";
    statusText.innerText = "BOOT FAILURE";
  }
}

// ----------------------------------------------------
// Camera & Video Controls
// ----------------------------------------------------
function setupCameraControls() {
  const toggleBtn = document.getElementById("toggle-camera-btn");
  toggleBtn.addEventListener("click", async () => {
    if (state.isCameraActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  });
  
  // Custom Controls for Recognition Text Output
  const speakBtn = document.getElementById("speak-recognized-btn");
  const addSpaceBtn = document.getElementById("add-space-btn");
  const deleteBtn = document.getElementById("delete-char-btn");
  const clearBtn = document.getElementById("clear-text-btn");
  
  speakBtn.addEventListener("click", () => {
    if (state.recognizedText.length > 0) {
      speakText(state.recognizedText.join(" "));
    }
  });
  
  addSpaceBtn.addEventListener("click", () => {
    commitSign(" ");
  });
  
  deleteBtn.addEventListener("click", () => {
    state.recognizedText.pop();
    renderRecognizedText();
  });
  
  clearBtn.addEventListener("click", () => {
    state.recognizedText = [];
    renderRecognizedText();
  });
}

async function startCamera() {
  const toggleBtn = document.getElementById("toggle-camera-btn");
  const statusIndicator = document.getElementById("camera-status-tag");
  
  try {
    toggleBtn.disabled = true;
    toggleBtn.innerText = "Requesting Stream...";
    
    const constraints = {
      video: {
        width: 640,
        height: 480,
        facingMode: "user"
      },
      audio: false
    };
    
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    webcamNode.srcObject = state.stream;
    
    webcamNode.addEventListener("loadedmetadata", () => {
      canvasNode.width = webcamNode.videoWidth;
      canvasNode.height = webcamNode.videoHeight;
      state.isCameraActive = true;
      toggleBtn.disabled = false;
      toggleBtn.className = "btn btn-accent";
      toggleBtn.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
        Kill Camera
      `;
      
      statusIndicator.querySelector("span").innerText = "STREAM RUNNING";
      statusIndicator.querySelector(".hud-status-dot").style.background = "var(--success)";
      
      // Enable text buttons
      document.getElementById("speak-recognized-btn").disabled = false;
      document.getElementById("add-space-btn").disabled = false;
      document.getElementById("delete-char-btn").disabled = false;
      document.getElementById("clear-text-btn").disabled = false;
      
      // Start processing loop
      startDetectionLoop();
    });
  } catch (err) {
    console.error("Camera connection failed:", err);
    toggleBtn.disabled = false;
    toggleBtn.innerText = "Activate Camera";
    alert("Camera permission denied or camera device is in use by another application.");
  }
}

function stopCamera() {
  const toggleBtn = document.getElementById("toggle-camera-btn");
  const statusIndicator = document.getElementById("camera-status-tag");
  
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
    webcamNode.srcObject = null;
  }
  
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
  
  state.isCameraActive = false;
  toggleBtn.className = "btn btn-primary";
  toggleBtn.innerHTML = `
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"></path>
    </svg>
    Activate Camera
  `;
  
  statusIndicator.querySelector("span").innerText = "HUD READY";
  statusIndicator.querySelector(".hud-status-dot").style.background = "var(--secondary)";
  
  // Disable buttons
  document.getElementById("speak-recognized-btn").disabled = true;
  document.getElementById("add-space-btn").disabled = true;
  document.getElementById("delete-char-btn").disabled = true;
  document.getElementById("clear-text-btn").disabled = true;
  
  // Reset outputs
  document.getElementById("current-char-display").innerText = "-";
  document.getElementById("telemetry-hands-count").innerText = "0 Detected";
  document.getElementById("telemetry-hand-type").innerText = "N/A";
  document.getElementById("telemetry-distance").innerText = "N/A";
  document.getElementById("telemetry-confidence").innerText = "N/A";
  
  // Clear canvas
  ctxNode.clearRect(0, 0, canvasNode.width, canvasNode.height);
}

// ----------------------------------------------------
// Real-Time Computer Vision Detection Loop
// ----------------------------------------------------
let lastFPSUpdateTime = 0;
let frameCount = 0;

function startDetectionLoop() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
  }
  
  async function loop(timestamp) {
    if (!state.isCameraActive) return;
    
    const startTime = performance.now();
    
    // FPS tracking
    frameCount++;
    if (timestamp - lastFPSUpdateTime >= 1000) {
      document.getElementById("fps-counter").innerText = frameCount;
      frameCount = 0;
      lastFPSUpdateTime = timestamp;
    }
    
    if (webcamNode.currentTime !== state.lastVideoTime) {
      state.lastVideoTime = webcamNode.currentTime;
      
      if (state.handLandmarker && state.isModelLoaded) {
        const results = state.handLandmarker.detectForVideo(webcamNode, timestamp);
        
        // Compute Latency
        const latency = Math.round(performance.now() - startTime);
        document.getElementById("latency-counter").innerText = `${latency}ms`;
        
        // Draw Skeleton overlay and analyze gestures
        processVisuals(results);
      }
    }
    
    state.animationFrameId = requestAnimationFrame(loop);
  }
  
  state.animationFrameId = requestAnimationFrame(loop);
}

// Draw futuristic glows, Cyber Mesh and calculate gestures
function processVisuals(results) {
  // Clear canvas
  ctxNode.clearRect(0, 0, canvasNode.width, canvasNode.height);
  
  const hasHands = results.landmarks && results.landmarks.length > 0;
  
  if (!hasHands) {
    // Reset temporary stable states if hand disappears
    state.currentSign = "-";
    document.getElementById("current-char-display").innerText = "-";
    document.getElementById("telemetry-hands-count").innerText = "0 Detected";
    document.getElementById("telemetry-hand-type").innerText = "N/A";
    document.getElementById("telemetry-distance").innerText = "N/A";
    document.getElementById("telemetry-confidence").innerText = "N/A";
    resetFlexBars();
    
    if (state.activeTab === "practice" && state.practiceActive) {
      updatePracticeHoldUI(0);
    }
    return;
  }
  
  // Render mesh for each hand detected
  results.landmarks.forEach((landmarks, index) => {
    drawCyberMesh(landmarks, index);
  });
  
  // Draw connecting laser beam between the two hands if both are present
  if (results.landmarks.length === 2) {
    drawInterHandLaser(results.landmarks[0], results.landmarks[1]);
  }
  
  // Classify Hand gestures!
  const classification = classifyISLGesture(results.landmarks, results.handednesses);
  updateTelemetryUI(classification.telemetry);
  
  if (classification.gesture) {
    state.currentSign = classification.gesture;
    document.getElementById("current-char-display").innerText = classification.gesture;
    
    // Handle Recognition Tab Stability Log
    if (state.activeTab === "recognition") {
      handleRecognitionStability(classification.gesture);
    }
    
    // Handle Practice Game Loop
    if (state.activeTab === "practice" && state.practiceActive) {
      handlePracticeValidation(classification.gesture);
    }
  } else {
    state.currentSign = "-";
    document.getElementById("current-char-display").innerText = "-";
    state.stabilityCounter = 0;
    
    if (state.activeTab === "practice" && state.practiceActive) {
      updatePracticeHoldUI(0);
    }
  }
}

// Draw Cyber Skeleton
function drawCyberMesh(landmarks, handIndex) {
  const pulseRadius = 3 + Math.sin(Date.now() / 150) * 1.5;
  const jointColor = handIndex === 0 ? "rgba(6, 182, 212, 0.95)" : "rgba(236, 72, 153, 0.95)";
  const boneColor = handIndex === 0 ? "rgba(6, 182, 212, 0.35)" : "rgba(236, 72, 153, 0.35)";
  const boneGlowColor = handIndex === 0 ? "rgba(6, 182, 212, 0.15)" : "rgba(236, 72, 153, 0.15)";
  
  // 1. Draw Connections (Bones)
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [9, 10], [10, 11], [11, 12],     // Middle joint
    [13, 14], [14, 15], [15, 16],    // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17]       // Knuckles bridge
  ];
  
  // Draw glowing backing lines
  ctxNode.lineWidth = 6;
  ctxNode.strokeStyle = boneGlowColor;
  ctxNode.lineCap = "round";
  
  connections.forEach(([ptA, ptB]) => {
    const nodeA = landmarks[ptA];
    const nodeB = landmarks[ptB];
    if (nodeA && nodeB) {
      ctxNode.beginPath();
      ctxNode.moveTo(nodeA.x * canvasNode.width, nodeA.y * canvasNode.height);
      ctxNode.lineTo(nodeB.x * canvasNode.width, nodeB.y * canvasNode.height);
      ctxNode.stroke();
    }
  });
  
  // Draw primary sharp bones
  ctxNode.lineWidth = 2.5;
  ctxNode.strokeStyle = boneColor;
  connections.forEach(([ptA, ptB]) => {
    const nodeA = landmarks[ptA];
    const nodeB = landmarks[ptB];
    if (nodeA && nodeB) {
      ctxNode.beginPath();
      ctxNode.moveTo(nodeA.x * canvasNode.width, nodeA.y * canvasNode.height);
      ctxNode.lineTo(nodeB.x * canvasNode.width, nodeB.y * canvasNode.height);
      ctxNode.stroke();
    }
  });
  
  // 2. Draw glowing joint nodes
  landmarks.forEach((joint, idx) => {
    const x = joint.x * canvasNode.width;
    const y = joint.y * canvasNode.height;
    
    // Draw outer glow
    ctxNode.save();
    ctxNode.shadowBlur = 10;
    ctxNode.shadowColor = jointColor;
    
    ctxNode.beginPath();
    // Fingertips get extra pulses
    if ([4, 8, 12, 16, 20].includes(idx)) {
      ctxNode.fillStyle = "#ffffff";
      ctxNode.arc(x, y, 4 + pulseRadius / 2, 0, Math.PI * 2);
    } else {
      ctxNode.fillStyle = jointColor;
      ctxNode.arc(x, y, 3, 0, Math.PI * 2);
    }
    ctxNode.fill();
    ctxNode.restore();
  });
}

// Laser line showing interaction networks between the two hands
function drawInterHandLaser(handA, handB) {
  // Connect Wrist A to Wrist B
  const wA = handA[0];
  const wB = handB[0];
  if (wA && wB) {
    ctxNode.save();
    ctxNode.lineWidth = 1.5;
    ctxNode.setLineDash([4, 4]);
    ctxNode.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctxNode.beginPath();
    ctxNode.moveTo(wA.x * canvasNode.width, wA.y * canvasNode.height);
    ctxNode.lineTo(wB.x * canvasNode.width, wB.y * canvasNode.height);
    ctxNode.stroke();
    
    // Connect index tips
    const idxA = handA[8];
    const idxB = handB[8];
    if (idxA && idxB) {
      ctxNode.strokeStyle = "rgba(139, 92, 246, 0.6)";
      ctxNode.beginPath();
      ctxNode.moveTo(idxA.x * canvasNode.width, idxA.y * canvasNode.height);
      ctxNode.lineTo(idxB.x * canvasNode.width, idxB.y * canvasNode.height);
      ctxNode.stroke();
      
      // Draw mid laser node
      const midX = ((idxA.x + idxB.x) / 2) * canvasNode.width;
      const midY = ((idxA.y + idxB.y) / 2) * canvasNode.height;
      ctxNode.shadowBlur = 15;
      ctxNode.shadowColor = "var(--primary)";
      ctxNode.fillStyle = "#fff";
      ctxNode.beginPath();
      ctxNode.arc(midX, midY, 5, 0, Math.PI * 2);
      ctxNode.fill();
    }
    ctxNode.restore();
  }
}

// ----------------------------------------------------
// UI Telemetry Update
// ----------------------------------------------------
function updateTelemetryUI(telemetry) {
  document.getElementById("telemetry-hands-count").innerText = `${telemetry.handsCount} Detected`;
  document.getElementById("telemetry-hand-type").innerText = telemetry.handType;
  
  const distNode = document.getElementById("telemetry-distance");
  distNode.innerText = telemetry.interHandDist;
  if (telemetry.interHandDist !== "N/A" && parseFloat(telemetry.interHandDist) < 0.08) {
    distNode.className = "telemetry-val success";
  } else {
    distNode.className = "telemetry-val accent";
  }
  
  const confNode = document.getElementById("telemetry-confidence");
  if (state.currentSign !== "-") {
    confNode.innerText = "MATCH 92%";
    confNode.className = "telemetry-val success";
  } else {
    confNode.innerText = "N/A";
    confNode.className = "telemetry-val";
  }
  
  // Set Flex progress bars (ext thumb to pinky)
  updateFlexBar("thumb", telemetry.flexThumb);
  updateFlexBar("index", telemetry.flexIndex);
  updateFlexBar("middle", telemetry.flexMiddle);
  updateFlexBar("ring", telemetry.flexRing);
  updateFlexBar("pinky", telemetry.flexPinky);
}

function updateFlexBar(finger, value) {
  const bar = document.getElementById(`bar-${finger}`);
  if (bar) {
    bar.style.height = `${Math.min(100, Math.max(0, value * 100))}%`;
  }
}

function resetFlexBars() {
  ["thumb", "index", "middle", "ring", "pinky"].forEach(f => updateFlexBar(f, 0));
}

// ----------------------------------------------------
// Stabilizer & Log Committer
// ----------------------------------------------------
function handleRecognitionStability(sign) {
  if (sign === state.lastStableSign) {
    state.stabilityCounter++;
    
    // Highlight large output with cyan pulse if stabilized
    if (state.stabilityCounter >= 5) {
      document.getElementById("current-char-display").style.color = "var(--secondary)";
    }
    
    if (state.stabilityCounter === state.stableThreshold) {
      commitSign(sign);
      state.stabilityCounter = 0; // reset
      triggerQuickPulseDisplay();
    }
  } else {
    state.lastStableSign = sign;
    state.stabilityCounter = 0;
    document.getElementById("current-char-display").style.color = "#fff";
  }
}

function commitSign(sign) {
  // Push word/character to logs
  state.recognizedText.push(sign);
  renderRecognizedText();
  
  // Text-To-Speech playback on confirmation
  if (sign !== " ") {
    speakText(sign.toLowerCase());
  }
}

function renderRecognizedText() {
  const container = document.getElementById("recognized-bubbles-container");
  const placeholder = document.getElementById("recognition-placeholder");
  
  if (state.recognizedText.length === 0) {
    container.innerHTML = "";
    placeholder.style.display = "block";
    return;
  }
  
  placeholder.style.display = "none";
  container.innerHTML = "";
  
  state.recognizedText.forEach((word, idx) => {
    const bubble = document.createElement("div");
    bubble.className = "gesture-word-bubble";
    if (idx === state.recognizedText.length - 1) {
      bubble.classList.add("current-char");
    }
    
    bubble.innerText = word === " " ? "[Space]" : word;
    container.appendChild(bubble);
  });
  
  // Auto scroll to bottom
  const wrapper = document.getElementById("recognized-text-wrapper");
  wrapper.scrollTop = wrapper.scrollHeight;
}

function triggerQuickPulseDisplay() {
  const node = document.getElementById("current-char-display");
  node.style.transform = "scale(1.25)";
  node.style.transition = "transform 0.1s ease-out";
  setTimeout(() => {
    node.style.transform = "scale(1)";
  }, 100);
}

// ----------------------------------------------------
// Dictionary Visualizer Setup
// ----------------------------------------------------
function setupDictionary() {
  const dictGrid = document.getElementById("dict-grid-container");
  const searchInput = document.getElementById("dictionary-search");
  
  // Populate Cards
  renderDictionaryCards(ISL_DICTIONARY);
  
  // Filters listeners
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      filterDictionary();
    });
  });
  
  // Search listener
  searchInput.addEventListener("input", filterDictionary);
  
  // Test gesture button inside dictionary details panel
  document.getElementById("dict-test-gesture-btn").addEventListener("click", () => {
    const activeCard = document.querySelector(".dictionary-card.active");
    if (activeCard) {
      const signId = activeCard.getAttribute("data-id");
      // Jump to practice tab
      const tabBtn = document.getElementById("tab-btn-practice");
      tabBtn.click();
      
      // Auto select target gesture and trigger practice!
      selectPracticeTarget(signId);
      if (!state.practiceActive) {
        document.getElementById("start-practice-btn").click();
      }
    }
  });
}

function renderDictionaryCards(list) {
  const dictGrid = document.getElementById("dict-grid-container");
  dictGrid.innerHTML = "";
  
  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "dictionary-card";
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-category", item.category);
    
    // Single or two-handed tag
    const isTwoHanded = item.description.toLowerCase().includes("two-handed");
    const handTag = isTwoHanded ? "2 Hands" : "1 Hand";
    
    card.innerHTML = `
      <div class="card-letter">${item.id.length > 2 ? "★" : item.id}</div>
      <div class="card-label">${item.label}</div>
      <div class="card-hands-badge">${handTag}</div>
    `;
    
    card.addEventListener("click", () => {
      document.querySelectorAll(".dictionary-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      showDictionaryDetail(item);
    });
    
    dictGrid.appendChild(card);
  });
}

function filterDictionary() {
  const query = document.getElementById("dictionary-search").value.toLowerCase();
  const category = document.querySelector(".filter-btn.active").getAttribute("data-filter");
  
  const filtered = ISL_DICTIONARY.filter(item => {
    const matchesQuery = item.label.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
    const matchesCategory = category === "all" || item.category === category;
    return matchesQuery && matchesCategory;
  });
  
  renderDictionaryCards(filtered);
}

function showDictionaryDetail(item) {
  const detailLayout = document.getElementById("dict-details-layout");
  detailLayout.style.display = "grid";
  
  document.getElementById("dict-detail-title").innerText = item.label;
  document.getElementById("dict-detail-desc").innerText = item.description;
  
  const stepsList = document.getElementById("dict-detail-steps");
  stepsList.innerHTML = "";
  item.steps.forEach(step => {
    const li = document.createElement("li");
    li.innerText = step;
    stepsList.appendChild(li);
  });
  
  document.getElementById("dict-vector-container").innerHTML = item.svgHands;
  
  // Scroll to detail area
  detailLayout.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ----------------------------------------------------
// Practice Arena Gaming Mechanics
// ----------------------------------------------------
function setupPracticeHub() {
  const startBtn = document.getElementById("start-practice-btn");
  const skipBtn = document.getElementById("skip-practice-btn");
  
  startBtn.addEventListener("click", () => {
    if (state.practiceActive) {
      stopPracticeSession();
    } else {
      startPracticeSession();
    }
  });
  
  skipBtn.addEventListener("click", () => {
    if (state.practiceActive) {
      rollNextPracticeTarget();
    }
  });
}

function startPracticeSession() {
  const startBtn = document.getElementById("start-practice-btn");
  const skipBtn = document.getElementById("skip-practice-btn");
  
  state.practiceActive = true;
  state.holdTime = 0;
  
  startBtn.className = "btn btn-accent";
  startBtn.innerHTML = `
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
    </svg>
    End Training
  `;
  skipBtn.disabled = false;
  
  // If target hasn't been set yet (e.g. from Dictionary jump), roll a random one
  if (!state.targetSign) {
    rollNextPracticeTarget();
  } else {
    selectPracticeTarget(state.targetSign.id);
  }
  
  // Ensure camera is active
  if (!state.isCameraActive) {
    document.getElementById("toggle-camera-btn").click();
  }
}

function stopPracticeSession() {
  const startBtn = document.getElementById("start-practice-btn");
  const skipBtn = document.getElementById("skip-practice-btn");
  
  state.practiceActive = false;
  state.holdTime = 0;
  updatePracticeHoldUI(0);
  
  startBtn.className = "btn btn-primary";
  startBtn.innerText = "Start Session";
  skipBtn.disabled = true;
  
  // Reset HUD Countdown visual overlays
  document.getElementById("hold-countdown-overlay").classList.remove("visible");
  
  // Reset targets display
  document.getElementById("practice-subtitle").innerText = "ISL TRAINING";
  document.getElementById("practice-target-letter").innerText = "-";
  document.getElementById("practice-target-desc").innerText = "Press 'Start Session' to begin training!";
  document.getElementById("practice-vector-preview").innerHTML = "";
  
  state.streak = 0;
  document.getElementById("quiz-streak-val").innerText = "0";
}

function selectPracticeTarget(signId) {
  const sign = ISL_DICTIONARY.find(item => item.id === signId);
  if (!sign) return;
  
  state.targetSign = sign;
  state.holdTime = 0;
  
  document.getElementById("practice-subtitle").innerText = sign.category.toUpperCase();
  document.getElementById("practice-target-letter").innerText = sign.id;
  document.getElementById("practice-target-desc").innerText = sign.description;
  document.getElementById("practice-vector-preview").innerHTML = sign.svgHands;
  
  updatePracticeHoldUI(0);
}

function rollNextPracticeTarget() {
  // Pull a random sign from our rich vocabulary dictionary
  const randomIndex = Math.floor(Math.random() * ISL_DICTIONARY.length);
  const nextTarget = ISL_DICTIONARY[randomIndex];
  selectPracticeTarget(nextTarget.id);
}

// Match evaluation in Game Loop
function handlePracticeValidation(gesture) {
  if (!state.targetSign) return;
  
  if (gesture === state.targetSign.id) {
    // Correct gesture held! Increase timer
    state.holdTime += 0.05; // 50ms frame increment approximately
    
    const percentage = Math.min(1.0, state.holdTime / state.holdTarget);
    updatePracticeHoldUI(percentage);
    
    if (state.holdTime >= state.holdTarget) {
      // Completed gesture! Celebrations!
      triggerPracticeSuccess();
    }
  } else {
    // Lost hold stability
    state.holdTime = 0;
    updatePracticeHoldUI(0);
  }
}

function updatePracticeHoldUI(percent) {
  const overlay = document.getElementById("hold-countdown-overlay");
  const bar = document.getElementById("circular-timer-bar");
  const textVal = document.getElementById("hold-text-val");
  
  if (percent > 0) {
    overlay.classList.add("visible");
    // Circle circumference is 2 * PI * r = 2 * 3.1415 * 10 ≈ 63
    const offset = 63 - (percent * 63);
    bar.style.strokeDashoffset = offset;
    
    const remaining = Math.max(0, state.holdTarget - state.holdTime).toFixed(1);
    textVal.innerText = `HOLD SIGN ${remaining}s`;
  } else {
    overlay.classList.remove("visible");
    bar.style.strokeDashoffset = 63;
    textVal.innerText = `HOLD SIGN 1.5s`;
  }
}

function triggerPracticeSuccess() {
  state.holdTime = 0;
  updatePracticeHoldUI(0);
  
  // Streak updates
  state.solvedCount++;
  state.streak++;
  
  document.getElementById("quiz-solved-val").innerText = state.solvedCount;
  document.getElementById("quiz-streak-val").innerText = state.streak;
  
  if (state.streak > state.highScore) {
    state.highScore = state.streak;
    localStorage.setItem("isl_high_score", state.highScore);
    document.getElementById("quiz-high-val").innerText = state.highScore;
  }
  
  // Voice celebration
  speakText("Excellent! Next sign.");
  
  // Confetti celebrations!
  triggerConfetti();
  
  // Fetch next card
  rollNextPracticeTarget();
}

// ----------------------------------------------------
// Text-To-Sign Sequence Animator
// ----------------------------------------------------
function setupTranslator() {
  const playBtn = document.getElementById("translator-play-btn");
  const searchInput = document.getElementById("translator-search-input");
  
  const playPauseBtn = document.getElementById("trans-play-pause-btn");
  const prevBtn = document.getElementById("trans-prev-btn");
  const nextBtn = document.getElementById("trans-next-btn");
  
  playBtn.addEventListener("click", () => {
    const text = searchInput.value.trim().toUpperCase();
    if (text.length > 0) {
      parseAndBuildTranslationTape(text);
    }
  });
  
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      playBtn.click();
    }
  });
  
  playPauseBtn.addEventListener("click", () => {
    if (state.transIsPlaying) {
      pauseTranslatorPlayback();
    } else {
      startTranslatorPlayback();
    }
  });
  
  prevBtn.addEventListener("click", () => {
    navigateTranslatorTape(-1);
  });
  
  nextBtn.addEventListener("click", () => {
    navigateTranslatorTape(1);
  });
}

function parseAndBuildTranslationTape(rawText) {
  stopTranslatorPlayback();
  state.transSequence = [];
  state.transCurrentIndex = 0;
  
  // Tokenize input string: Check if any full dictionary word keys are typed (e.g. "HELLO"), 
  // else split into character arrays!
  // Simple search tokenizer:
  let words = rawText.split(/\s+/);
  
  words.forEach(word => {
    // See if the full word exists as a phrase in dictionary
    const dictWord = ISL_DICTIONARY.find(item => item.id === word && item.category === "phrases");
    if (dictWord) {
      state.transSequence.push(dictWord);
    } else {
      // Split word into constituent alphabetical letter signs
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const dictLetter = ISL_DICTIONARY.find(item => item.id === letter && item.category === "alphabets");
        if (dictLetter) {
          state.transSequence.push(dictLetter);
        } else {
          // Placeholder for unknown symbols
          state.transSequence.push({
            id: letter,
            label: `Symbol: ${letter}`,
            description: "No registered hand gesture inside ISL guide.",
            steps: ["No active gesture visualizer available."],
            svgHands: `<svg viewBox='0 0 100 80' xmlns='http://www.w3.org/2000/svg'><text x='50%' y='55%' text-anchor='middle' font-family='sans-serif' font-size='24' fill='var(--error)' font-weight='bold'>?</text></svg>`
          });
        }
      }
    }
    // Append a space spacer sign between word splits
    state.transSequence.push({
      id: "SPACE",
      label: "Space Spacer",
      description: "Spacer indicating word separation.",
      steps: ["Hold hands relaxed."],
      svgHands: `<svg viewBox='0 0 100 80' xmlns='http://www.w3.org/2000/svg'><path d='M30 40 L70 40' stroke='var(--text-muted)' stroke-width='2' stroke-dasharray='4 4' /><text x='50%' y='35%' text-anchor='middle' font-size='8' fill='var(--text-muted)'>SPACE</text></svg>`
    });
  });
  
  // Pop last space spacer
  if (state.transSequence.length > 0 && state.transSequence[state.transSequence.length - 1].id === "SPACE") {
    state.transSequence.pop();
  }
  
  if (state.transSequence.length === 0) return;
  
  // Render Tape
  renderTranslatorTape();
  
  // Enable buttons
  document.getElementById("trans-play-pause-btn").disabled = false;
  document.getElementById("trans-prev-btn").disabled = false;
  document.getElementById("trans-next-btn").disabled = false;
  
  // Play immediately
  startTranslatorPlayback();
}

function renderTranslatorTape() {
  const container = document.getElementById("trans-tape-container");
  container.innerHTML = "";
  
  state.transSequence.forEach((item, idx) => {
    const cell = document.createElement("div");
    cell.className = "tape-cell";
    cell.setAttribute("data-index", idx);
    cell.innerText = item.id === "SPACE" ? "␣" : item.id;
    
    cell.addEventListener("click", () => {
      pauseTranslatorPlayback();
      state.transCurrentIndex = idx;
      showTranslatorIndexSign();
    });
    
    container.appendChild(cell);
  });
}

function showTranslatorIndexSign() {
  const item = state.transSequence[state.transCurrentIndex];
  if (!item) return;
  
  // Update Tape cells highlighted index
  document.querySelectorAll(".tape-cell").forEach(cell => {
    cell.classList.remove("active");
  });
  const activeCell = document.querySelector(`.tape-cell[data-index="${state.transCurrentIndex}"]`);
  if (activeCell) {
    activeCell.classList.add("active");
    activeCell.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
  
  // Display target letter details
  document.getElementById("trans-anim-char").innerText = item.id === "SPACE" ? "SPACE" : item.id;
  document.getElementById("trans-anim-desc").innerText = item.description;
  document.getElementById("trans-vector-container").innerHTML = item.svgHands;
}

function startTranslatorPlayback() {
  const btn = document.getElementById("trans-play-pause-btn");
  
  state.transIsPlaying = true;
  btn.innerText = "Pause Sequence";
  btn.className = "btn btn-primary";
  
  showTranslatorIndexSign();
  
  state.transInterval = setInterval(() => {
    state.transCurrentIndex++;
    if (state.transCurrentIndex >= state.transSequence.length) {
      // Loop complete or end
      state.transCurrentIndex = 0;
      stopTranslatorPlayback();
      return;
    }
    showTranslatorIndexSign();
  }, state.transSpeedMs);
}

function pauseTranslatorPlayback() {
  const btn = document.getElementById("trans-play-pause-btn");
  
  state.transIsPlaying = false;
  btn.innerText = "Play Sequence";
  btn.className = "btn btn-accent";
  
  if (state.transInterval) {
    clearInterval(state.transInterval);
    state.transInterval = null;
  }
}

function stopTranslatorPlayback() {
  pauseTranslatorPlayback();
  // Reset play/pause states button
  const btn = document.getElementById("trans-play-pause-btn");
  btn.disabled = true;
  btn.innerText = "Play Sequence";
  btn.className = "btn";
  
  document.getElementById("trans-prev-btn").disabled = true;
  document.getElementById("trans-next-btn").disabled = true;
}

function navigateTranslatorTape(direction) {
  pauseTranslatorPlayback();
  state.transCurrentIndex += direction;
  
  // Bounds checks
  if (state.transCurrentIndex < 0) {
    state.transCurrentIndex = state.transSequence.length - 1;
  } else if (state.transCurrentIndex >= state.transSequence.length) {
    state.transCurrentIndex = 0;
  }
  
  showTranslatorIndexSign();
}

// ----------------------------------------------------
// Web Speech Audio Playback API
// ----------------------------------------------------
function speakText(text) {
  if (!window.speechSynthesis) return;
  
  // Cancel active sounds to avoid queuing lag
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  // Fetch Indian English voice if available, else default English
  const voices = window.speechSynthesis.getVoices();
  const indEnglishVoice = voices.find(v => v.lang.includes("EN-IN") || v.lang.includes("en-IN"));
  if (indEnglishVoice) {
    utterance.voice = indEnglishVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}
