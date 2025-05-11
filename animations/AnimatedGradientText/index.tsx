import { FONTS } from "@/app/theme";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const AnimatedGradientText = ({
  text,
  style,
  gradientColors,
}: {
  text: string;
  style: any;
  gradientColors: string[];
}) => {
  // Create animated values for each letter
  const letterAnimations = useRef(
    Array.from({ length: text.length }).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // For each letter, create a delayed wave animation
    const animations = letterAnimations.map((anim, index) => {
      // Stagger the animations to create the wave effect
      const delay = index * 120;

      return Animated.loop(
        Animated.sequence([
          // Wait for previous letter to start
          Animated.delay(delay),
          // Move up
          Animated.timing(anim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          // Move down
          Animated.timing(anim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          // Pause before the next wave
          Animated.delay(1200 - delay),
        ])
      );
    });

    // Start all animations
    Animated.parallel(animations).start();

    // Clean up animations when component unmounts
    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  return (
    <View style={{ flexDirection: "row", justifyContent: "center" }}>
      {Array.from(text).map((letter, index) => {
        // Create y translation interpolation for wave effect
        const translateY = letterAnimations[index].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -8, 0],
        });

        return (
          <Animated.View
            key={`${letter}-${index}`}
            style={{
              transform: [{ translateY }],
            }}
          >
            <MaskedView
              maskElement={
                <Text style={[styles.text, style]}>
                  {letter === " " ? "\u00A0" : letter}
                </Text>
              }
            >
              <LinearGradient
                colors={gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: "100%", width: "100%" }}
              />
            </MaskedView>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    fontFamily: FONTS.BOLD,
  },
});

export default AnimatedGradientText;
