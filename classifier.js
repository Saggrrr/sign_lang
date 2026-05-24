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
  
  // Finger Joint Mappings
  const thumbJoints = [1, 2, 3, 4];
  const indexJoints = [5, 6, 7, 8];
  const middleJoints = [9, 10, 11, 12];
  const ringJoints = [13, 14, 15, 16];
  const pinkyJoints = [17, 18, 19, 20];
  
  const extThumb = getFingerExtension(landmarks, thumbJoints);
  const extIndex = getFingerExtension(landmarks, indexJoints);
  const extMiddle = getFingerExtension(landmarks, middleJoints);
  const extRing = getFingerExtension(landmarks, ringJoints);
  const extPinky = getFingerExtension(landmarks, pinkyJoints);
  
  // Rules for simple classifications
  const isThumbExtended = extThumb > 0.72;
  const isIndexExtended = extIndex > 0.82;
  const isMiddleExtended = extMiddle > 0.82;
  const isRingExtended = extRing > 0.82;
  const isPinkyExtended = extPinky > 0.82;
  
  const isThumbCurled = extThumb < 0.55;
  const isIndexCurled = extIndex < 0.50;
  const isMiddleCurled = extMiddle < 0.50;
  const isRingCurled = extRing < 0.50;
  const isPinkyCurled = extPinky < 0.50;
  
  return {
    landmarks,
    // Finger extensions
    extThumb,
    extIndex,
    extMiddle,
    extRing,
    extPinky,
    // Boolean flags
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
    // Wrist and joints
    wrist: landmarks[0],
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
  
  // Parse Handedness info (taking mirrored camera into account)
  // MediaPipe hand labels: CategoryName is "Left" or "Right"
  let leftHandData = null;
  let rightHandData = null;
  
  for (let i = 0; i < handsCount; i++) {
    const rawLandmarks = multiHandLandmarks[i];
    const handAnalysis = analyzeHand(rawLandmarks);
    const handLabel = handednesses[i]?.categoryName || handednesses[i]?.displayName || "Right";
    
    // Note: Since camera is mirrored, MediaPipe labels might be flipped. 
    // Usually, raw "Left" is visually on the right, and "Right" is visually on the left.
    if (handLabel === "Left") {
      rightHandData = handAnalysis; // Mirrored flip
    } else {
      leftHandData = handAnalysis;
    }
  }
  
  // If we only got one hand but handsCount is 1, let's just assign it
  if (handsCount === 1) {
    const singleHand = leftHandData || rightHandData || analyzeHand(multiHandLandmarks[0]);
    const label = handednesses[0]?.categoryName || "Right";
    result.telemetry.handType = label;
    result.telemetry.flexThumb = singleHand.extThumb;
    result.telemetry.flexIndex = singleHand.extIndex;
    result.telemetry.flexMiddle = singleHand.extMiddle;
    result.telemetry.flexRing = singleHand.extRing;
    result.telemetry.flexPinky = singleHand.extPinky;
    
    // ----------------------------------------------------
    // SINGLE HANDED ISL LETTERS (C, L, V, Y, YES, NO)
    // ----------------------------------------------------
    
    // Letter L: Index and Thumb extended, others curled
    if (singleHand.isIndexExtended && singleHand.isThumbExtended && 
        singleHand.isMiddleCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "L";
      result.confidence = 0.90;
      return result;
    }
    
    // Letter V: Index and Middle extended, others curled
    if (singleHand.isIndexExtended && singleHand.isMiddleExtended && 
        singleHand.isThumbCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "V";
      result.confidence = 0.92;
      return result;
    }
    
    // Letter Y: Thumb and Pinky extended, others curled
    if (singleHand.isThumbExtended && singleHand.isPinkyExtended && 
        singleHand.isIndexCurled && singleHand.isMiddleCurled && singleHand.isRingCurled) {
      result.gesture = "Y";
      result.confidence = 0.90;
      return result;
    }
    
    // Letter C: Thumb, Index, Middle curled slightly but extended in ratio (C-shape curves)
    // We check if all fingers are partially extended, and thumb tip is moderately far from fingers
    const isCClosed = singleHand.extIndex > 0.55 && singleHand.extIndex < 0.78 &&
                       singleHand.extMiddle > 0.55 && singleHand.extMiddle < 0.78 &&
                       singleHand.extRing > 0.55 && singleHand.extRing < 0.78 &&
                       singleHand.extPinky > 0.55 && singleHand.extPinky < 0.78;
                       
    const thumbIndexDist = getDistance(singleHand.thumbTip, singleHand.indexTip);
    if (isCClosed && thumbIndexDist > 0.08 && thumbIndexDist < 0.22) {
      result.gesture = "C";
      result.confidence = 0.85;
      return result;
    }

    // YES (Nodding fist): all fingers tightly curled, wrist tilted down
    if (singleHand.isThumbCurled && singleHand.isIndexCurled && 
        singleHand.isMiddleCurled && singleHand.isRingCurled && singleHand.isPinkyCurled) {
      result.gesture = "YES";
      result.confidence = 0.80;
      return result;
    }

    // HELLO (Single Hand Salute at head level)
    // Hand flat (all extended), fingers together
    if (singleHand.isThumbExtended && singleHand.isIndexExtended && 
        singleHand.isMiddleExtended && singleHand.isRingExtended && singleHand.isPinkyExtended) {
      // Check if fingers are close together
      const indexMiddleDist = getDistance(singleHand.indexTip, singleHand.middleTip);
      const middleRingDist = getDistance(singleHand.middleTip, singleHand.ringTip);
      if (indexMiddleDist < 0.04 && middleRingDist < 0.04) {
        result.gesture = "HELLO";
        result.confidence = 0.82;
        return result;
      }
    }
  }
  
  // ----------------------------------------------------
  // TWO-HANDED ISL LETTERS (A, B, D, E, F, G, H, I, K, M, N, O, P, U, W, X, PLEASE, THANK_YOU, NO)
  // ----------------------------------------------------
  if (handsCount === 2) {
    result.telemetry.handType = "Both";
    
    // Assign Left and Right hands by checking horizontal coords if handedness was ambiguous
    let left = leftHandData;
    let right = rightHandData;
    
    if (!left || !right) {
      const h1 = analyzeHand(multiHandLandmarks[0]);
      const h2 = analyzeHand(multiHandLandmarks[1]);
      if (h1.wrist.x < h2.wrist.x) {
        left = h1;
        right = h2;
      } else {
        left = h2;
        right = h1;
      }
    }
    
    // Fill average flex levels for dashboard telemetry
    result.telemetry.flexThumb = (left.extThumb + right.extThumb) / 2;
    result.telemetry.flexIndex = (left.extIndex + right.extIndex) / 2;
    result.telemetry.flexMiddle = (left.extMiddle + right.extMiddle) / 2;
    result.telemetry.flexRing = (left.extRing + right.extRing) / 2;
    result.telemetry.flexPinky = (left.extPinky + right.extPinky) / 2;
    
    // Calculate primary touch distances
    const distRightIdxLeftThb = getDistance(right.indexTip, left.thumbTip);
    const distRightIdxLeftIdx = getDistance(right.indexTip, left.indexTip);
    const distRightIdxLeftMid = getDistance(right.indexTip, left.middleTip);
    const distRightIdxLeftRng = getDistance(right.indexTip, left.ringTip);
    const distRightIdxLeftPnk = getDistance(right.indexTip, left.pinkyTip);
    
    // Distance between right hand fingertips and left hand palm (modeled by left middle MCP joint / index MCP)
    const distRightIdxLeftPalm = getDistance(right.indexTip, left.landmarks[9]);
    const distRightMidLeftPalm = getDistance(right.middleTip, left.landmarks[9]);
    const distRightRngLeftPalm = getDistance(right.ringTip, left.landmarks[9]);
    
    // Record minimum touch distance in telemetry for easy tuning
    const minInterDist = Math.min(distRightIdxLeftThb, distRightIdxLeftIdx, distRightIdxLeftMid, distRightIdxLeftRng, distRightIdxLeftPnk);
    result.telemetry.interHandDist = minInterDist.toFixed(3);
    
    // --- GESTURE RULES ---
    
    // 1. Letter A: Right index tip touches left thumb tip, left hand flat palm up, others extended
    if (distRightIdxLeftThb < 0.075 && right.isIndexExtended && left.extThumb > 0.6) {
      result.gesture = "A";
      result.confidence = 0.95;
      return result;
    }
    
    // 2. Letter E: Right index tip touches left index tip
    if (distRightIdxLeftIdx < 0.065 && right.isIndexExtended && left.isIndexExtended && 
        left.isMiddleCurled && left.isRingCurled && left.isPinkyCurled &&
        right.isMiddleCurled && right.isRingCurled && right.isPinkyCurled) {
      result.gesture = "E";
      result.confidence = 0.93;
      return result;
    }
    
    // 3. Letter I: Right index tip touches left middle tip
    if (distRightIdxLeftMid < 0.07 && right.isIndexExtended && left.isMiddleExtended) {
      result.gesture = "I";
      result.confidence = 0.90;
      return result;
    }
    
    // 4. Letter O: Right index tip touches left ring tip
    if (distRightIdxLeftRng < 0.07 && right.isIndexExtended && left.isRingExtended) {
      result.gesture = "O";
      result.confidence = 0.90;
      return result;
    }
    
    // 5. Letter U: Right index tip touches left pinky tip
    if (distRightIdxLeftPnk < 0.07 && right.isIndexExtended && left.isPinkyExtended) {
      result.gesture = "U";
      result.confidence = 0.90;
      return result;
    }
    
    // 6. Letter D: Left index vertical (others curled). Right index/thumb form circle, touching left index tip
    // Right index/thumb circle means right thumb tip is close to right index tip
    const isRightCircle = getDistance(right.thumbTip, right.indexTip) < 0.06;
    if (isRightCircle && left.isIndexExtended && left.isMiddleCurled && left.isRingCurled) {
      const distCircleLeftIdx = getDistance(right.indexTip, left.indexTip);
      if (distCircleLeftIdx < 0.09) {
        result.gesture = "D";
        result.confidence = 0.88;
        return result;
      }
    }
    
    // 7. Letter M: Left hand flat palm up. Right index, middle, ring tips all touch left palm
    if (left.extIndex > 0.6 && left.extMiddle > 0.6 && left.extRing > 0.6 &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingExtended &&
        distRightIdxLeftPalm < 0.095 && distRightMidLeftPalm < 0.095) {
      result.gesture = "M";
      result.confidence = 0.94;
      return result;
    }
    
    // 8. Letter N: Left hand flat palm up. Right index and middle tips touch left palm
    if (left.extIndex > 0.6 && left.extMiddle > 0.6 &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingCurled &&
        distRightIdxLeftPalm < 0.095 && distRightMidLeftPalm < 0.095) {
      result.gesture = "N";
      result.confidence = 0.92;
      return result;
    }
    
    // 9. Letter B: Both hands open flat, palms together.
    if (left.isThumbExtended && left.isIndexExtended && left.isMiddleExtended && left.isRingExtended && left.isPinkyExtended &&
        right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      const distIndexIndex = getDistance(left.indexTip, right.indexTip);
      if (distWristWrist < 0.12 && distIndexIndex < 0.09) {
        result.gesture = "B";
        result.confidence = 0.88;
        return result;
      }
    }
    
    // 10. Letter X: Right and left index fingers crossing. Both index straight, others curled.
    if (left.isIndexExtended && left.isMiddleCurled && left.isRingCurled && left.isPinkyCurled &&
        right.isIndexExtended && right.isMiddleCurled && right.isRingCurled && right.isPinkyCurled) {
      // Check distance between middle segment of index fingers (joint index 6 or 7)
      const distMidIndexSegment = getDistance(left.landmarks[6], right.landmarks[6]);
      if (distMidIndexSegment < 0.065) {
        result.gesture = "X";
        result.confidence = 0.90;
        return result;
      }
    }
    
    // 11. Letter W: Wrists crossed, fingers spread out
    if (left.extIndex > 0.75 && left.extMiddle > 0.75 && left.extRing > 0.75 &&
        right.extIndex > 0.75 && right.extMiddle > 0.75 && right.extRing > 0.75) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      // Palms should be close, fingers separated
      const distIndexIndex = getDistance(left.indexTip, right.indexTip);
      if (distWristWrist < 0.09 && distIndexIndex > 0.10) {
        result.gesture = "W";
        result.confidence = 0.85;
        return result;
      }
    }
    
    // 12. Letter F: Both hands extend index and middle, other fingers curled. Index/middle touch or cross.
    if (left.isIndexExtended && left.isMiddleExtended && left.isRingCurled && left.isPinkyCurled &&
        right.isIndexExtended && right.isMiddleExtended && right.isRingCurled && right.isPinkyCurled) {
      const distIdxIdx = getDistance(left.indexTip, right.indexTip);
      const distMidMid = getDistance(left.middleTip, right.middleTip);
      if (distIdxIdx < 0.07 && distMidMid < 0.07) {
        result.gesture = "F";
        result.confidence = 0.89;
        return result;
      }
    }
    
    // 13. Letter K: Left index straight. Right index bent touching left index center.
    if (left.isIndexExtended && left.isMiddleCurled && left.isRingCurled &&
        right.isIndexExtended && right.isMiddleCurled && right.isRingCurled) {
      const distRightTipLeftIdxMid = getDistance(right.indexTip, left.landmarks[6]);
      if (distRightTipLeftIdxMid < 0.07) {
        result.gesture = "K";
        result.confidence = 0.86;
        return result;
      }
    }
    
    // 14. Letter G: Clenched fists one on top of the other
    if (left.isIndexCurled && left.isMiddleCurled && left.isRingCurled && left.isPinkyCurled &&
        right.isIndexCurled && right.isMiddleCurled && right.isRingCurled && right.isPinkyCurled) {
      const distHandHand = getDistance(left.landmarks[9], right.landmarks[9]);
      if (distHandHand < 0.095) {
        // One is higher than other in Y (screen coords: Y goes down, so smaller Y is higher)
        const verticalGap = Math.abs(left.landmarks[9].y - right.landmarks[9].y);
        if (verticalGap > 0.04) {
          result.gesture = "G";
          result.confidence = 0.84;
          return result;
        }
      }
    }

    // 15. Letter P: Left index vertical. Right thumb/index form a circle touching left index tip.
    if (isRightCircle && left.isIndexExtended) {
      const distRightIdxLeftIdxTip = getDistance(right.indexTip, left.indexTip);
      if (distRightIdxLeftIdxTip < 0.07) {
        result.gesture = "P";
        result.confidence = 0.88;
        return result;
      }
    }

    // 16. NO (Snapping fingers): Right index/middle folding down to touch right thumb, left fist near.
    const isRightNoClosed = getDistance(right.indexTip, right.thumbTip) < 0.04 && getDistance(right.middleTip, right.thumbTip) < 0.04;
    if (isRightNoClosed && left.isIndexCurled && left.isMiddleCurled) {
      result.gesture = "NO";
      result.confidence = 0.82;
      return result;
    }

    // 17. PLEASE (Circular motion of flat hand over chest, other hand relaxed)
    if (right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended) {
      // Just check if right hand is open flat and left is closed or relaxed
      if (left.isIndexCurled && left.isMiddleCurled) {
        result.gesture = "PLEASE";
        result.confidence = 0.80;
        return result;
      }
    }

    // 18. THANK_YOU (Hand at mouth going down, left hand open flat waiting)
    if (right.isThumbExtended && right.isIndexExtended && right.isMiddleExtended && right.isRingExtended && right.isPinkyExtended &&
        left.isThumbExtended && left.isIndexExtended && left.isMiddleExtended) {
      const distWristWrist = getDistance(left.wrist, right.wrist);
      if (distWristWrist > 0.15 && distWristWrist < 0.35) {
        result.gesture = "THANK_YOU";
        result.confidence = 0.83;
        return result;
      }
    }
  }
  
  return result;
}
