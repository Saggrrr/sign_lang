// Indian Sign Language (ISL) Dictionary Registry

export const ISL_DICTIONARY = [
  {
    id: "A",
    label: "Letter A",
    category: "alphabets",
    description: "Two-handed sign. Left hand palm flat facing upwards. Right index finger touches the tip of the left thumb.",
    steps: [
      "Open your non-dominant hand flat, palm facing up.",
      "Clench your dominant hand except for your index finger.",
      "Touch the tip of your dominant index finger to the tip of your non-dominant thumb."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Hand Flat Palm Up -->
        <path d="M15 50 C15 40, 20 30, 25 32 C30 34, 25 45, 25 50 C25 55, 30 60, 45 60 C55 60, 60 55, 60 45 L60 30 C60 28, 63 28, 63 30 L63 45 L66 28 C66 26, 69 26, 69 28 L69 45 L72 30 C72 28, 75 28, 75 30 L72 50 C70 60, 60 68, 45 68 C25 68, 15 60, 15 50 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Non dominant thumb pointing out -->
        <path d="M22 34 C16 35, 12 40, 15 45 C18 50, 23 45, 25 42" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Right hand finger touching thumb tip -->
        <path d="M12 42 L6 30 C5 28, 8 26, 9 28 L14 38" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="14" cy="42" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "B",
    label: "Letter B",
    category: "alphabets",
    description: "Two-handed sign. Both hands open, fingers together. Place palms together with thumbs crossed.",
    steps: [
      "Extend all fingers and keep them tightly together on both hands.",
      "Bring both palms to touch each other in front of your chest.",
      "Cross your thumbs over each other to lock them."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 5)">
          <path d="M25 65 L25 25 C25 20, 31 20, 31 25 L31 65 L37 22 C37 17, 43 17, 43 22 L43 65 L49 24 C49 19, 55 19, 55 24 L55 65 L61 28 C61 23, 67 23, 67 28 L61 70 C58 75, 30 75, 25 65" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linejoin="round" />
          <!-- Crossed palms mirroring -->
          <path d="M45 65 L45 25 C45 20, 51 20, 51 25 L51 65" fill="none" stroke="var(--accent)" stroke-width="2" />
        </g>
      </svg>
    `
  },
  {
    id: "C",
    label: "Letter C",
    category: "alphabets",
    description: "Single-handed sign. Use dominant hand to form an open curved 'C' shape in the air.",
    steps: [
      "Hold your dominant hand up facing sideways.",
      "Curve your fingers together and your thumb downwards to form a clear letter C.",
      "Ensure the gap between your fingertips and thumb is clearly visible to the camera."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- C shape Hand -->
        <path d="M60 20 C45 20, 35 30, 35 45 C35 60, 45 70, 60 70 C65 70, 68 67, 65 64 C55 64, 45 57, 45 45 C45 33, 55 26, 65 26 C68 23, 65 20, 60 20 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M57 20 C52 17, 48 20, 50 25 M57 70 C52 73, 48 70, 50 65" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "D",
    label: "Letter D",
    category: "alphabets",
    description: "Two-handed sign. Left index finger vertical. Right index finger and thumb form a loop touching left index finger.",
    steps: [
      "Hold your non-dominant index finger pointing straight up, other fingers folded.",
      "With your dominant hand, form a circle using index finger and thumb.",
      "Touch the circle to your non-dominant index finger to resemble a visual 'D'."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Vertical Index -->
        <path d="M30 65 L30 25 C30 20, 35 20, 35 25 L35 65 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Right loop forming circle touching left -->
        <circle cx="50" cy="45" r="15" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <path d="M65 45 L65 25 C65 20, 70 20, 70 25 L70 65" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <circle cx="35" cy="45" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "E",
    label: "Letter E",
    category: "alphabets",
    description: "Two-handed sign. Left index finger vertical. Right index finger touches the tip of the left index finger.",
    steps: [
      "Hold your non-dominant index finger straight up.",
      "Point your dominant index finger horizontally.",
      "Touch the tip of your dominant index finger to the tip of your non-dominant index finger."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Vertical Index -->
        <path d="M35 65 L35 25 C35 20, 40 20, 40 25 L40 65" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Right finger horizontal touching top -->
        <path d="M70 25 L42 25" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="40" cy="25" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "F",
    label: "Letter F",
    category: "alphabets",
    description: "Two-handed sign. Index and middle fingers together on both hands. Cross dominant fingers over non-dominant fingers.",
    steps: [
      "Extend the index and middle fingers on both hands, keeping other fingers folded.",
      "Cross the dominant fingers perpendicular over the non-dominant fingers to form an 'F'."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left index and middle -->
        <path d="M40 65 L40 25 M46 65 L46 25" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Crossed Right index and middle -->
        <path d="M25 40 L60 40 M25 46 L60 46" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    `
  },
  {
    id: "G",
    label: "Letter G",
    category: "alphabets",
    description: "Two-handed sign. Both hands clenched into fists, placed vertically one on top of the other.",
    steps: [
      "Clench both hands into fists.",
      "Place your dominant fist directly on top of your non-dominant fist."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Fist 1 bottom -->
        <rect x="35" y="45" width="30" height="22" rx="6" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Fist 2 top -->
        <rect x="35" y="20" width="30" height="22" rx="6" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>
    `
  },
  {
    id: "H",
    label: "Letter H",
    category: "alphabets",
    description: "Two-handed sign. Left hand flat palm up. Right hand flat palm down, sweeps across left hand from wrist to fingers.",
    steps: [
      "Keep non-dominant palm flat facing upwards.",
      "Sweep your dominant palm flat, face down, along the non-dominant palm, from wrist outwards."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Palm -->
        <path d="M15 50 C20 40, 70 40, 75 50 C75 60, 20 60, 15 50 Z" fill="none" stroke="var(--secondary)" stroke-width="2" />
        <!-- Right sweeping hand (dashed arrow) -->
        <path d="M30 35 L65 35" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="4 3" />
        <path d="M60 30 L67 35 L60 40" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>
    `
  },
  {
    id: "I",
    label: "Letter I",
    category: "alphabets",
    description: "Two-handed sign. Left index finger vertical. Right index finger touches the tip of the left middle finger.",
    steps: [
      "Hold your non-dominant hand up with fingers extended, index vertical.",
      "Touch the tip of your dominant index finger to the tip of your non-dominant middle finger."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left fingers, middle vertical -->
        <path d="M35 65 L35 25 M42 65 L42 20 M49 65 L49 28" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Right pointing finger -->
        <path d="M75 20 L45 20" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="42" cy="20" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "K",
    label: "Letter K",
    category: "alphabets",
    description: "Two-handed sign. Left index vertical. Right index bent, touching center of left index to resemble a 'K'.",
    steps: [
      "Hold your non-dominant index finger straight up.",
      "Bend your dominant index finger at a 45-degree angle.",
      "Touch the joint of the dominant index to the center of the non-dominant index to form a 'K' shape."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Vertical Index -->
        <path d="M35 65 L35 25" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Right diagonal forms 'K' -->
        <path d="M55 25 L36 42 L55 60" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="36" cy="42" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "L",
    label: "Letter L",
    category: "alphabets",
    description: "Single-handed sign. Dominant hand forms an 'L' shape using the thumb and index finger.",
    steps: [
      "Raise your dominant hand facing forward.",
      "Extend your index finger straight up and your thumb straight out horizontally.",
      "Keep other fingers curled into your palm."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- L shape -->
        <path d="M60 60 L40 60 L40 25" fill="none" stroke="var(--secondary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="40" cy="60" r="4" fill="var(--accent)" />
      </svg>
    `
  },
  {
    id: "M",
    label: "Letter M",
    category: "alphabets",
    description: "Two-handed sign. Left hand flat palm up. Right index, middle, and ring fingers touch the left palm.",
    steps: [
      "Hold your non-dominant palm flat, facing upwards.",
      "Extend the index, middle, and ring fingers of your dominant hand.",
      "Touch all three dominant fingertips down onto the center of your non-dominant palm."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 55 C15 45, 20 40, 45 40 C70 40, 75 45, 75 55 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- 3 fingers touching -->
        <path d="M35 15 L35 45 M45 15 L45 45 M55 15 L55 45" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="45" cy="45" r="4" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "N",
    label: "Letter N",
    category: "alphabets",
    description: "Two-handed sign. Left hand flat palm up. Right index and middle fingers touch the left palm.",
    steps: [
      "Hold your non-dominant palm flat, facing upwards.",
      "Extend only the index and middle fingers of your dominant hand.",
      "Touch both dominant fingertips down onto the center of your non-dominant palm."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 55 C15 45, 20 40, 45 40 C70 40, 75 45, 75 55 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- 2 fingers touching -->
        <path d="M40 15 L40 45 M50 15 L50 45" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="45" cy="45" r="4" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "O",
    label: "Letter O",
    category: "alphabets",
    description: "Two-handed sign. Left hand flat palm up. Right index and thumb form a circle touching the left palm.",
    steps: [
      "Hold your non-dominant palm flat, facing upwards.",
      "Form a circle with your dominant index finger and thumb.",
      "Touch the bottom of the circle onto your non-dominant palm."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 55 C15 45, 20 40, 45 40 C70 40, 75 45, 75 55 Z" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Circle touching palm -->
        <circle cx="45" cy="28" r="10" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <line x1="45" y1="38" x2="45" y2="44" stroke="var(--accent)" stroke-width="2.5" />
        <circle cx="45" cy="44" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "P",
    label: "Letter P",
    category: "alphabets",
    description: "Two-handed sign. Left index vertical. Right index and thumb form a loop touching the top of the left index.",
    steps: [
      "Hold your non-dominant index finger straight up, other fingers folded.",
      "Form a circle with your dominant index finger and thumb.",
      "Place the center of the circle onto the very tip of your non-dominant index finger."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Vertical Index -->
        <path d="M35 65 L35 35" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Circle touching top -->
        <circle cx="35" cy="22" r="12" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <circle cx="35" cy="34" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "U",
    label: "Letter U",
    category: "alphabets",
    description: "Two-handed sign. Left hand flat palm up. Right index finger touches the tip of the left pinky finger.",
    steps: [
      "Open your non-dominant hand flat, palm facing up.",
      "Touch the tip of your dominant index finger to the tip of your non-dominant pinky finger."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Left palm pointing up, showing fingers -->
        <path d="M25 65 M30 35 L30 55 M38 28 L38 55 M46 32 L46 55 M54 40 L54 55" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <path d="M20 55 C20 65, 65 65, 65 55" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Right index touching pinky (54, 40) -->
        <path d="M75 40 L55 40" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="54" cy="40" r="3" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "V",
    label: "Letter V",
    category: "alphabets",
    description: "Single-handed sign. Dominant index and middle fingers spread in a 'V' shape (peace sign).",
    steps: [
      "Raise your dominant hand, palm facing forward.",
      "Extend your index and middle fingers, spreading them wide apart.",
      "Fold your thumb, ring, and pinky fingers down."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- V shape hand -->
        <path d="M35 25 L45 55 L55 25" fill="none" stroke="var(--secondary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M45 55 L45 70 C45 72, 55 72, 55 70" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
      </svg>
    `
  },
  {
    id: "W",
    label: "Letter W",
    category: "alphabets",
    description: "Two-handed sign. Both hands open, fingers spread out, and wrists crossed together.",
    steps: [
      "Spread all fingers wide on both hands.",
      "Cross your wrists in front of your chest with fingers pointing upwards/outwards."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(20 50 40)">
          <path d="M30 20 L40 50 L50 20 M35 20 L40 50 M45 20 L40 50" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        </g>
        <g transform="rotate(-20 50 40)">
          <path d="M50 20 L60 50 L70 20 M55 20 L60 50 M65 20 L60 50" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        </g>
        <circle cx="50" cy="52" r="4" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "X",
    label: "Letter X",
    category: "alphabets",
    description: "Two-handed sign. Index fingers on both hands extended and crossed perpendicularly to form an 'X'.",
    steps: [
      "Extend the index finger of both hands, folding other fingers.",
      "Cross the two index fingers in front of you to form a visual 'X' shape."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <line x1="30" y1="20" x2="70" y2="60" stroke="var(--secondary)" stroke-width="3.5" stroke-linecap="round" />
        <line x1="70" y1="20" x2="30" y2="60" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="50" cy="40" r="3.5" fill="var(--success)" />
      </svg>
    `
  },
  {
    id: "Y",
    label: "Letter Y",
    category: "alphabets",
    description: "Single-handed sign. Extend only the thumb and pinky finger, keep other fingers folded (the 'shaka' gesture).",
    steps: [
      "Raise your dominant hand, palm facing forward.",
      "Extend your thumb and pinky finger as far out as possible.",
      "Keep index, middle, and ring fingers tightly folded into your palm."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 45 C30 43, 38 48, 40 55" fill="none" stroke="var(--secondary)" stroke-width="3" stroke-linecap="round" />
        <rect x="40" y="55" width="20" height="15" rx="3" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <path d="M60 55 C62 48, 70 43, 75 45" fill="none" stroke="var(--secondary)" stroke-width="3" stroke-linecap="round" />
      </svg>
    `
  },
  // Conversational Phrases / Words
  {
    id: "HELLO",
    label: "HELLO",
    category: "phrases",
    description: "Dominant hand open, fingers together, raised to the temple in a polite salute gesture, then moving slightly outward.",
    steps: [
      "Bring your dominant hand up to your right temple, fingers extended and held together.",
      "Perform a gentle salute motion, angling your palm slightly outward.",
      "Bring the hand down smoothly towards the viewer."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Saluting Hand Outline -->
        <path d="M50 60 C55 58, 65 35, 70 20 C71 18, 65 15, 60 18 C50 25, 45 45, 42 55" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Head template in background -->
        <circle cx="30" cy="40" r="18" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />
        <!-- Movement arrows -->
        <path d="M72 25 L82 28" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 2" />
        <path d="M80 25 L84 29 L79 32" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "THANK_YOU",
    label: "THANK YOU",
    category: "phrases",
    description: "Touch fingertips of open flat dominant hand to your lips, then move hand down and forward towards the person.",
    steps: [
      "Bring your dominant hand flat, palm facing inward.",
      "Touch your fingertips gently to your lips/chin.",
      "Move the hand straight forward and slightly downward in a graceful bowing gesture."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Hand at chin -->
        <path d="M38 52 C42 45, 48 20, 50 15 C52 13, 48 10, 44 12 C35 22, 28 42, 25 50" fill="none" stroke="var(--secondary)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Flow arrow indicating outward curve -->
        <path d="M52 25 Q65 30 70 45" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 2" />
        <path d="M66 45 L71 46 L71 40" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "YES",
    label: "YES",
    category: "phrases",
    description: "Dominant hand closed into a fist, tilting forward and backward repeatedly (mimicking a nodding head).",
    steps: [
      "Clench your dominant hand into an 'S' or 'A' fist.",
      "Bend your wrist forward so the knuckles tilt downwards.",
      "Tilt it back up and repeat, mimicking a nodding head gesture."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Fist -->
        <rect x="40" y="30" width="22" height="24" rx="6" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <!-- Node lines -->
        <path d="M51 22 L51 14" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 2" />
        <path d="M51 60 L51 52" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 2" />
        <path d="M47 18 L51 13 L55 18" fill="none" stroke="var(--accent)" stroke-width="2" />
        <path d="M47 56 L51 61 L55 56" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "NO",
    label: "NO",
    category: "phrases",
    description: "Index and middle fingers extended together, thumb extended. Snap fingers down to touch the thumb tip repeatedly.",
    steps: [
      "Extend your index and middle fingers, keeping them side by side.",
      "Extend your thumb outwards.",
      "Snap the index and middle fingers downwards quickly to tap against the tip of the thumb."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Index/Middle closed onto thumb -->
        <path d="M30 45 C35 40, 48 40, 52 45 M32 46 C36 42, 49 42, 53 46" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <circle cx="52" cy="45" r="3" fill="var(--accent)" />
        <!-- Movement speed marks -->
        <path d="M58 35 C62 38, 62 48, 58 51" fill="none" stroke="var(--accent)" stroke-width="1.5" />
      </svg>
    `
  },
  {
    id: "PLEASE",
    label: "PLEASE",
    category: "phrases",
    description: "Place your flat dominant hand on the center of your chest and move it in a circular motion clockwise.",
    steps: [
      "Open your dominant hand flat, palm facing your chest.",
      "Place your palm against the center of your chest.",
      "Rub your hand in a gentle circular motion clockwise (from left, up, right, down)."
    ],
    svgHands: `
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <!-- Flat hand over circle -->
        <circle cx="50" cy="40" r="18" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3" />
        <path d="M40 30 C45 28, 55 25, 58 30 C60 32, 52 45, 48 50" fill="none" stroke="var(--secondary)" stroke-width="2.5" />
        <path d="M53 23 L58 20 L61 24" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>
    `
  }
];
