import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

// Animation Types
export enum AnimationType {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

// Props for base animation component
interface AnimationProps {
  style?: any;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  onAnimationFinish?: () => void;
}

// ==========================================
// 1. PENDING ANIMATION COMPONENT
// ==========================================
export const PendingAnimation: React.FC<AnimationProps> = ({
  style,
  loop = true,
  autoPlay = true,
  speed = 1,
  onAnimationFinish,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Ensure animation plays when component mounts
    if (animationRef.current && autoPlay) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, style]}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/animations/verification-pending.json")}
        style={styles.animation}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

// ==========================================
// 2. SUCCESS ANIMATION COMPONENT
// ==========================================
export const SuccessAnimation: React.FC<AnimationProps> = ({
  style,
  loop = false,
  autoPlay = true,
  speed = 1,
  onAnimationFinish,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Ensure animation plays when component mounts
    if (animationRef.current && autoPlay) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, style]}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/animations/verification-success.json")}
        style={styles.animation}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

// ==========================================
// 3. FAILED ANIMATION COMPONENT
// ==========================================
export const FailedAnimation: React.FC<AnimationProps> = ({
  style,
  loop = false,
  autoPlay = true,
  speed = 1,
  onAnimationFinish,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Ensure animation plays when component mounts
    if (animationRef.current && autoPlay) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, style]}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/animations/verification-failed.json")}
        style={styles.animation}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

// ==========================================
// 4. UNIFIED VERIFICATION ANIMATION COMPONENT
// ==========================================
interface VerificationAnimationProps extends AnimationProps {
  type: AnimationType;
}

export const VerificationAnimation: React.FC<VerificationAnimationProps> = ({
  type,
  ...props
}) => {
  switch (type) {
    case AnimationType.PENDING:
      return <PendingAnimation {...props} />;
    case AnimationType.SUCCESS:
      return <SuccessAnimation {...props} />;
    case AnimationType.FAILED:
      return <FailedAnimation {...props} />;
    default:
      return <PendingAnimation {...props} />;
  }
};

// Shared styles
const styles = StyleSheet.create({
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

export default VerificationAnimation;
