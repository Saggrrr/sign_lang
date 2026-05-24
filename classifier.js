// Indian Sign Language (ISL) Gesture Classifier Engine

// Helper to calculate 3D Euclidean distance between two landmarks
export function getDistance(pt1, pt2) {
  if (!pt1 || !pt2) return Infinity;
  return Math.sqrt(
    Math.pow(pt1.x - pt2.x, 2) +
    Math.pow(pt1.y - pt2.y, 2) +
    Math.pow(pt1.z - pt2.z, 2)
  );
}

// Check finger extension ratio (rotation and scale-invariant)
// Joints array is [MCP, PIP, DIP, TIP]
export function getFingerExtension(landmarks, joints) {
  if (!landmarks || landmarks.length < 21) return 0;
  
  const mcp = landmarks[joints[0]];
  const pip = landmarks[joints[1]];
  const dip = landmarks[joints[2]];
  const tip = landmarks[joints[3]];
  
  if (!mcp || !pip || !dip || !tip) return 0;
  
  const totalLength = getDistance(mcp, pip) + getDistance(pip, dip) + getDistance(dip, tip);
  const straightLength = getDistance(mcp, tip);
  
  if (totalLength === 0) return 0;
  return straightLength / totalLength;
}

// Extract primary geometric metrics for a single hand
export function analyzeHand(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;
  
  const wrist = landmarks[0];
  
  // Finger Joint Mappings
  const thumbJoints = [1, 2, 3, 4];
  const indexJoints = [5, 6, 7, 8];
  const middleJoints = [9, 10, 11, 12];
  const ringJoints = [13, 14, 15, 16];
  const pinkyJoints = [17, 18, 19, 20];
  
  // Method A: Straight-to-curve ratio
  const extThumb = getFingerExtension(landmarks, thumbJoints);
  const extIndex = getFingerExtension(landmarks, indexJoints);
  const extMiddle = getFingerExtension(landmarks, middleJoints);
  const extRing = getFingerExtension(landmarks, ringJoints);
  const extPinky = getFingerExtension(landmarks, pinkyJoints);
  
  // Method B: Tip-to-wrist vs joint-to-wrist distance (highly rotation invariant)
  // A finger is extended if the tip is further from the wrist than the PIP joint
  const isIndexExtended = extIndex > 0.80 || (getDistance(landmarks[8], wrist) > getDistance(landmarks[6], wrist) * 1.04);
  const isMiddleExtended = extMiddle > 0.80 || (getDistance(landmarks[12], wrist) > getDistance(landmarks[10], wrist) * 1.04);
  const isRingExtended = extRing > 0.80 || (getDistance(landmarks[16], wrist) > getDistance(landmarks[14], wrist) * 1.04);
  const isPinkyExtended = extPinky > 0.80 || (getDistance(landmarks[20], wrist) > getDistance(landmarks[18], wrist) * 1.04);
  
  // Thumb extended if thumb tip is far from middle finger knuckle (9)
  const isThumbExtended = extThumb > 0.72 || (getDistance(landmarks[4], landmarks[9]) > getDistance(landmarks[2], landmarks[9]) * 1.08);
  
  // Curled states
  const isIndexCurled = extIndex < 0.52 || (getDistance(landmarks[8], wrist) < getDistance(landmarks[6], wrist) * 0.95);
  const isMiddleCurled = extMiddle < 0.52 || (getDistance(landmarks[12], wrist) < getDistance(landmarks[10], wrist) * 0.95);
  const isRingCurled = extRing < 0.52 || (getDistance(landmarks[16], wrist) < getDistance(landmarks[14], wrist) * 0.95);
  const isPinkyCurled = extPinky < 0.52 || (getDistance(landmarks[20], wrist) < getDistance(landmarks[18], wrist) * 0.95);
  const isThumbCurled = extThumb < 0.58 || (getDistance(landmarks[4], landmarks[9]) < getDistance(landmarks[2], landmarks[9]) * 0.95);
  
  return {
    landmarks,
    extThumb,
    extIndex,
    extMiddle,
    extRing,
    extPinky,
    isThumbExtended,
    isIndexExtended,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended,
    isThumbCurled,
    isIndexCurled,
    isMiddleCurled,
    isRingCurled,
    isPinkyCurled,
    wrist,
    thumbTip: landmarks[4],
    indexTip: landmarks[8],
    middleTip: landmarks[12],
    ringTip: landmarks[16],
    pinkyTip: landmarks[20]
  };
}

// Main ISL Classifier function
export function classifyISLGesture(multiHandLandmarks, handednesses) {
  const result = {
    gesture: null,
    confidence: 0,
    telemetry: {
      handsCount: 0,
      handType: "None",
      flexThumb: 0,
      flexIndex: 0,
      flexMiddle: 0,
      flexRing: 0,
      flexPinky: 0,
      interHandDist: "N/A"
    }
  };
  
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
    return result;
  }
  
  const handsCount = multiHandLandmarks.length;
  result.telemetry.handsCount = handsCount;
  
  // Correct Mirror Hand Mappings:
  // MediaPipe Hand Landmarker corrects for mirror flip and returns physical hand labels:
  // - Hand labeled "Left" is the user's PHYSICAL left hand.
  // - Hand labeled "Right" is the user's PHYSICAL right hand.
  let leftHandData = null;
  let rightHandData = null;
  
  for (let i = 0; i < handsCount; i++) {
    const rawLandmarks = multiHandLandmarks[i];
    const handAnalysis = analyzeHand(rawLandmarks);
    const handLabel = handednesses[i]?.categoryName || handednesses[i]?.displayName || "Right";
    
    if (handLabel === "Right") {
      rightHandData = handAnalysis; // Physical Right
    } else {
      leftHandData = handAnalysis;  // Physical Left
    }
  }
  
  // Proximity touch threshold (increased from 0.07 to 0.095 for better recognition margins)
  const TOUCH_THRESHOLD = 0.095;
  
  // Single-handed gestures (C, L, V, Y, YES, HELLO)
  if (handsCount === 1) {
    const singleHand = rightHandData || leftHandData || analyzeHand(multiHandLandmarks[0]);
    const label = rightHandData ? "Right" : "Left";
    result.telemetry.handType = label;
    result.telemetry.flexThumb = singleHand.extThumb;
    result.telemetry.flexIndex = singleHand.extIndex;
    result.telemetry.flexMiddle = singleHand.extMiddle;
    result.telemetry.flexRing = singleHand.extRing;
    result.telemetry.flexPinky = singleHand.extPinky;
    
    // Letter L: Index and Thumb extended, others curled
    if (singleHand.isIndexExtended && singleHand.isThumbExtended && 
        singleHand.isMiddleCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "L";
      result.confidence = 0.92;
      return result;
    }
    
    // Letter V: Index and Middle extended, others curled
    if (singleHand.isIndexExtended && singleHand.isMiddleExtended && 
        singleHand.isThumbCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "V";
      result.confidence = 0.94;
      return result;
    }
    
    // Letter Y: Thumb and Pinky extended, others curled
    if (singleHand.isThumbExtended && singleHand.isPinkyExtended && 
        singleHand.isIndexCurled && singleHand.isMiddleCurled && singleHand.isRingCurled) {
      result.gesture = "Y";
      result.confidence = 0.92;
      return result;
    }
    
    // Letter C: Curve shape
    const isCClosed = singleHand.extIndex > 0.52 && singleHand.extIndex < 0.78 &&
                       singleHand.extMiddle > 0.52 && singleHand.extMiddle < 0.78 &&
                       singleHand.extRing > 0.52 && singleHand.extRing < 0.78 &&
                       singleHand.extPinky > 0.52 && singleHand.extPinky < 0.78;
                       
    const thumbIndexDist = getDistance(singleHand.thumbTip, singleHand.indexTip);
    if (isCClosed && thumbIndexDist > 0.08 && thumbIndexDist < 0.24) {
      result.gesture = "C";
      result.confidence = 0.88;
      return result;
    }

    // YES (Nodding fist): all fingers curled
    if (singleHand.isThumbCurled && singleHand.isIndexCurled && 
        singleHand.isMiddleCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "YES";
      result.confidence = 0.85;
      return result;
    }

    // HELLO (Salute): all fingers extended and together
    if (singleHand.isThumbExtended && singleHand.isIndexExtended && 
        singleHand.isMiddleExtended && singleHand.isRingExtended && singleHand.isPinkyExtended) {
      const indexMiddleDist = getDistance(singleHand.indexTip, singleHand.middleTip);
      const middleRingDist = getDistance(singleHand.middleTip, singleHand.ringTip);
      if (indexMiddleDist < 0.05 && middleRingDist < 0.05) {
        result.gesture = "HELLO";
        result.confidence = 0.88;
        return result;
      }
    }
  }
  
  // Two-handed gestures
  if (handsCount === 2) {
    result.telemetry.handType = "Both";
    
    // Resolve fallback if explicit handedness labels were missing
    let left = leftHandData;
    let right = rightHandData;
    
    if (!left || !right) {
      const h1 = analyzeHand(multiHandLandmarks[0]);
      const h2 = analyzeHand(multiHandLandmarks[1]);
      // In mirrored camera:
      // - Smaller screen X is visually left -> physically RIGHT hand!
      // - Larger screen X is visually right -> physically LEFT hand!
      if (h1.wrist.x < h2.wrist.x) {
        right = h1;
        left = h2;
      } else {
        right = h2;
        left = h1;
      }
    }
    
    // Fill average flex levels for dashboard telemetry
    result.telemetry.flexThumb = (left.extThumb + right.extThumb) / 2;
    result.telemetry.flexIndex = (left.extIndex + right.extIndex) / 2;
    result.telemetry.flexMiddle = (left.extMiddle + right.extMiddle) / 2;
    result.telemetry.flexRing = (left.extRing + right.extRing) / 2;
    result.telemetry.flexPinky = (left.extPinky + right.extPinky) / 2;
    
    // Inter-hand touch points:
    // Physical RIGHT index tip touching physical LEFT fingertips
    const distRightIdxLeftThb = getDistance(right.indexTip, left.thumbTip);
    const distRightIdxLeftIdx = getDistance(right.indexTip, left.indexTip);
    const distRightIdxLeftMid = getDistance(right.indexTip, left.middleTip);
    const distRightIdxLeftRng = getDistance(right.indexTip, left.ringTip);
    const distRightIdxLeftPnk = getDistance(right.indexTip, left.pinkyTip);
    
    // Right fingertips touching left palm (modeled by left middle MCP joint 9)
    const distRightIdxLeftPalm = getDistance(right.indexTip, left.landmarks[9]);
    const distRightMidLeftPalm = getDistance(right.middleTip, left.landmarks[9]);
    const distRightRngLeftPalm = getDistance(right.ringTip, left.landmarks[9]);
    
    const minInterDist = Math.min(distRightIdxLeftThb, distRightIdxLeftIdx, distRightIdxLeftMid, distRightIdxLeftRng, distRightIdxLeftPnk);
    result.telemetry.interHandDist = minInterDist.toFixed(3);
    
    // --- GESTURE LAWS ---
    
    // 1. Letter A: Right index tip touches left thumb tip
    if (distRightIdxLeftThb < TOUCH_THRESHOLD && right.isIndexExtended && left.isThumbExtended) {
      result.gesture = "A";
      result.confidence = 0.96;
      return result;
    }
    
    // 2. Letter E: Right index tip touches left index tip
    if (distRightIdxLeftIdx < TOUCH_THRESHOLD && right.isIndexExtended && left.isIndexExtended && 
        left.isMiddleCurled && left.isRingCurled && right.isMiddleCurled && right.isRingCurled) {
      result.gesture = "E";
      result.confidence = 0.95;
      return result;
    }
    
    // 3. Letter I: Right index tip touches left middle tip
    if (distRightIdxLeftMid < TOUCH_THRESHOLD && right.isIndexExtended && left.isMiddleExtended) {
      result.gesture = "I";
      result.confidence = 0.94;
      return result;
    }
    
    // 4. Letter O: Right index tip touches left ring tip
    if (distRightIdxLeftRng < TOUCH_THRESHOLD && right.isIndexExtended && left.isRingExtended) {
      result.gesture = "O";
      result.confidence = 0.94;
      return result;
    }
    
    // 5. Letter U: Right index tip touches left pinky tip
    if (distRightIdxLeftPnk < TOUCH_THRESHOLD && right.isIndexExtended && left.isPinkyExtended) {
      result.gesture = "U";
      result.confidence = 0.94;
      return result;
    }
    
    // 6. Letter D: Left index vertical, right index/thumb loop touching left index
    const isRightCircle = getDistance(right.thumbTip, right.indexTip) < 0.085;
    if (isRightCircle && left.isIndexExtended && left.isMiddleCurled && left.isRingCurled) {
      const distCircleLeftIdx = getDistance(right.indexTip, left.indexTip);
      if (distCircleLeftIdx < TOUCH_THRESHOLD * 1.2) {
        result.gesture = "D";
        result.confidence = 0.90;
        return result;
      }
    }
    
    // 7. Letter M: Left hand flat. Right index, middle, ring touch left palm
    if (left.isIndexExtended && left.isMiddleExtended && left.isRingExtended &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingExtended &&
        distRightIdxLeftPalm < TOUCH_THRESHOLD * 1.2 && distRightMidLeftPalm < TOUCH_THRESHOLD * 1.2) {
      result.gesture = "M";
      result.confidence = 0.95;
      return result;
    }
    
    // 8. Letter N: Left hand flat. Right index and middle touch left palm
    if (left.isIndexExtended && left.isMiddleExtended &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingCurled &&
        distRightIdxLeftPalm < TOUCH_THRESHOLD * 1.2 && distRightMidLeftPalm < TOUCH_THRESHOLD * 1.2) {
      result.gesture = "N";
      result.confidence = 0.93;
      return result;
    }
    
    // 9. Letter B: Both hands flat, palms together
    if (left.isThumbExtended && left.isIndexExtended && left.isMiddleExtended && left.isRingExtended && left.isPinkyExtended &&
        right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      const distIndexIndex = getDistance(left.indexTip, right.indexTip);
      if (distWristWrist < TOUCH_THRESHOLD * 1.5 && distIndexIndex < TOUCH_THRESHOLD * 1.1) {
        result.gesture = "B";
        result.confidence = 0.92;
        return result;
      }
    }
    
    // 10. Letter X: Index fingers crossed perpendicularly
    if (left.isIndexExtended && left.isMiddleCurled && left.isRingCurled &&
        right.isIndexExtended && right.isMiddleCurled && right.isRingCurled) {
      const distMidIndexSegment = getDistance(left.landmarks[6], right.landmarks[6]);
      if (distMidIndexSegment < TOUCH_THRESHOLD * 0.8) {
        result.gesture = "X";
        result.confidence = 0.93;
        return result;
      }
    }
    
    // 11. Letter W: Wrists crossed, fingers spread out
    if (left.isIndexExtended && left.isMiddleExtended && left.isRingExtended &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingExtended) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      const distIndexIndex = getDistance(left.indexTip, right.indexTip);
      if (distWristWrist < TOUCH_THRESHOLD * 1.1 && distIndexIndex > TOUCH_THRESHOLD * 1.2) {
        result.gesture = "W";
        result.confidence = 0.88;
        return result;
      }
    }
    
    // 12. Letter F: Both index and middle extended, crossing or touching
    if (left.isIndexExtended && left.isMiddleExtended && left.isRingCurled &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingCurled) {
      const distIdxIdx = getDistance(left.indexTip, right.indexTip);
      const distMidMid = getDistance(left.middleTip, right.middleTip);
      if (distIdxIdx < TOUCH_THRESHOLD && distMidMid < TOUCH_THRESHOLD) {
        result.gesture = "F";
        result.confidence = 0.92;
        return result;
      }
    }
    
    // 13. Letter K: Right index bent touching center of left index
    if (left.isIndexExtended && left.isMiddleCurled &&
        right.isIndexExtended && right.isMiddleCurled) {
      const distRightTipLeftIdxMid = getDistance(right.indexTip, left.landmarks[6]);
      if (distRightTipLeftIdxMid < TOUCH_THRESHOLD) {
        result.gesture = "K";
        result.confidence = 0.90;
        return result;
      }
    }
    
    // 14. Letter G: Fist on fist
    if (left.isIndexCurled && left.isMiddleCurled && left.isRingCurled &&
        right.isIndexCurled && right.isMiddleCurled && right.isRingCurled) {
      const distHandHand = getDistance(left.landmarks[9], right.landmarks[9]);
      if (distHandHand < TOUCH_THRESHOLD * 1.3) {
        const verticalGap = Math.abs(left.landmarks[9].y - right.landmarks[9].y);
        if (verticalGap > 0.035) {
          result.gesture = "G";
          result.confidence = 0.88;
          return result;
        }
      }
    }

    // 15. Letter P: Left index vertical. Right thumb/index circle touches left index tip
    if (isRightCircle && left.isIndexExtended) {
      const distRightIdxLeftIdxTip = getDistance(right.indexTip, left.indexTip);
      if (distRightIdxLeftIdxTip < TOUCH_THRESHOLD) {
        result.gesture = "P";
        result.confidence = 0.91;
        return result;
      }
    }

    // 16. NO (Snapping fingers)
    const isRightNoClosed = getDistance(right.indexTip, right.thumbTip) < 0.05 && getDistance(right.middleTip, right.thumbTip) < 0.05;
    if (isRightNoClosed && left.isIndexCurled && left.isMiddleCurled) {
      result.gesture = "NO";
      result.confidence = 0.86;
      return result;
    }

    // 17. PLEASE (Fist/Chest circular motion)
    if (right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended) {
      if (left.isIndexCurled && left.isMiddleCurled) {
        result.gesture = "PLEASE";
        result.confidence = 0.85;
        return result;
      }
    }

    // 18. THANK_YOU (Salute sweep)
    if (right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended &&
        left.isThumbExtended && left.isIndexExtended && left.isMiddleExtended) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      if (distWristWrist > 0.14 && distWristWrist < 0.38) {
        result.gesture = "THANK_YOU";
        result.confidence = 0.88;
        return result;
      }
    }
  }
  
  return result;
}
