import { COLORS, FONTS, FONT_SIZES } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");
// Slider height is now set to fill the 35% container from HomeScreen
const SLIDER_HEIGHT = height * 0.35;

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define props interface
interface SliderProps {
  images?: string[]; // Array of image URLs
}

const Slider: React.FC<SliderProps> = ({ images }) => {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [key: number]: boolean;
  }>({});

  // Default slides data
  const defaultSlides = [
    {
      image: require("@/assets/images/slides/model1.png"),
      title: "Find Exclusive Parties",
      description: "Discover the most exclusive events near you",
    },
    {
      image: require("@/assets/images/slides/model2.png"),
      title: "Connect with People",
      description: "Meet like-minded partygoers around the world",
    },
    {
      image: require("@/assets/images/slides/model3.png"),
      title: "Get VIP Access",
      description: "Skip the line and enjoy premium experiences",
    },
  ];

  // For debugging image URLs
  useEffect(() => {
    if (images && images.length > 0) {
      console.log("Images passed to Slider:", images);
    }
  }, [images]);

  // Calculate the slides length based on which set we're using
  const slidesLength =
    images && images.length > 0 ? images.length : defaultSlides.length;

  // Animated values for each slide to create parallax and fade effects
  const slideAnimation = useRef(
    Array(slidesLength)
      .fill(0)
      .map((_, i) => ({
        opacity: new Animated.Value(i === 0 ? 1 : 0),
        translateY: new Animated.Value(i === 0 ? 0 : 20),
        scale: new Animated.Value(i === 0 ? 1 : 0.95),
      }))
  ).current as any;

  // Reset animations when the images prop changes
  useEffect(() => {
    // Reset animations for new slides
    const newSlidesLength =
      images && images.length > 0 ? images.length : defaultSlides.length;

    // Create new animations if needed
    if (slideAnimation.length !== newSlidesLength) {
      slideAnimation.current = Array(newSlidesLength)
        .fill(0)
        .map((_, i) => ({
          opacity: new Animated.Value(i === 0 ? 1 : 0),
          translateY: new Animated.Value(i === 0 ? 0 : 20),
          scale: new Animated.Value(i === 0 ? 1 : 0.95),
        }));
    } else {
      // Otherwise just reset existing animations
      slideAnimation.forEach((anim: any, i: number) => {
        anim.opacity.setValue(i === 0 ? 1 : 0);
        anim.translateY.setValue(i === 0 ? 0 : 20);
        anim.scale.setValue(i === 0 ? 1 : 0.95);
      });
    }

    // Reset state
    setActiveIndex(0);
    setImageLoadErrors({});
  }, [images]);

  // Auto-scrolling effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (slidesLength > 1) {
        const nextIndex = (activeIndex + 1) % slidesLength;
        animateToSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, slidesLength]);

  // Handle animation to a specific slide
  const animateToSlide = (index: number) => {
    // Animate slide change
    Animated.parallel([
      // Fade out current slide
      Animated.timing(slideAnimation[activeIndex].opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Move current slide down
      Animated.timing(slideAnimation[activeIndex].translateY, {
        toValue: 20,
        duration: 400,
        useNativeDriver: true,
      }),
      // Scale current slide down
      Animated.timing(slideAnimation[activeIndex].scale, {
        toValue: 0.95,
        duration: 400,
        useNativeDriver: true,
      }),
      // Fade in new slide
      Animated.timing(slideAnimation[index].opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Move new slide up
      Animated.timing(slideAnimation[index].translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Scale new slide up
      Animated.timing(slideAnimation[index].scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveIndex(index);
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Handle image load error
  const handleImageError = (index: number, error: any) => {
    console.error(`Error loading image at index ${index}:`, error.nativeEvent);
    setImageLoadErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDarkMode ? ["#111827", "#1F2937"] : ["#7F00FF", "#E100FF"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Slides Container */}
      <View style={styles.slidesContainer}>
        {images && images.length > 0
          ? images.map((image, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.slide,
                  {
                    opacity: slideAnimation[index].opacity,
                    transform: [
                      { translateY: slideAnimation[index].translateY },
                      { scale: slideAnimation[index].scale },
                    ],
                    zIndex: activeIndex === index ? 1 : 0,
                  },
                ]}
              >
                <Image
                  source={{
                    uri: image,
                  }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(e) => handleImageError(index, e)}
                  defaultSource={require("@/assets/images/slides/model1.png")}
                />

                {/* Image Overlay Gradient */}
                <LinearGradient
                  colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
                  style={styles.imageOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </Animated.View>
            ))
          : defaultSlides.map((slide, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.slide,
                  {
                    opacity: slideAnimation[index].opacity,
                    transform: [
                      { translateY: slideAnimation[index].translateY },
                      { scale: slideAnimation[index].scale },
                    ],
                    zIndex: activeIndex === index ? 1 : 0,
                  },
                ]}
              >
                <Image
                  source={slide.image}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Image Overlay Gradient */}
                <LinearGradient
                  colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
                  style={styles.imageOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />

                {/* Content Container - Only show for default slides */}
                {slide.title && slide.description && (
                  <View style={styles.contentContainer}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.description}>{slide.description}</Text>
                  </View>
                )}
              </Animated.View>
            ))}
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {(images && images.length > 0 ? images : defaultSlides).map(
          (_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.paginationDotContainer}
              onPress={() => animateToSlide(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                  index === activeIndex && {
                    backgroundColor: getAccentColor(),
                  },
                ]}
              />
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Bottom Fade Gradient - helps with transition to card */}
      <LinearGradient
        colors={[
          "transparent",
          isDarkMode ? "rgba(17, 24, 39, 0.9)" : "rgba(248, 249, 252, 0.9)",
        ]}
        style={styles.bottomFade}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: SLIDER_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  backgroundGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  slidesContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  slide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: "80%",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  paginationDotContainer: {
    marginRight: 8,
    padding: 5, // Increase touch area
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  paginationDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});

export default Slider;
