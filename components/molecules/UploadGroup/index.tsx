// src/components/chat/UploadGroup.tsx
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
} from "@/app/theme";

// Simplified MediaItem type
export type MediaItem = {
  uri: string;
  id: string;
};

interface UploadGroupProps {
  mediaItems: MediaItem[];
  loading: boolean;
  onDelete: (index: number) => void;
  isDarkMode: boolean;
}

const { width } = Dimensions.get("window");
const PREVIEW_SIZE = (width - SPACING.XL) / 4;

const UploadGroup = ({
  mediaItems,
  loading,
  onDelete,
  isDarkMode,
}: UploadGroupProps) => {
  // Animation values for each media item
  const animationValues = useRef<
    Map<number, { scale: Animated.Value; opacity: Animated.Value }>
  >(new Map());

  // Hover state for delete button
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Get animation values for a specific item
  const getAnimationValues = (index: number) => {
    if (!animationValues.current.has(index)) {
      animationValues.current.set(index, {
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      });

      // Start animation for new item
      const animation = animationValues.current.get(index);
      if (animation) {
        // Use a small delay to avoid the frozen object error
        setTimeout(() => {
          if (animation && animation.scale && animation.opacity) {
            Animated.sequence([
              Animated.delay(10),
              Animated.parallel([
                Animated.spring(animation.scale, {
                  toValue: 1,
                  tension: 70,
                  friction: 5,
                  useNativeDriver: true,
                }),
                Animated.timing(animation.opacity, {
                  toValue: 1,
                  duration: ANIMATIONS.FAST,
                  useNativeDriver: true,
                }),
              ]),
            ]).start();
          }
        }, 0);
      }
    }

    return (
      animationValues.current.get(index) || {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      }
    );
  };

  // Handle delete press with animation
  const handleDeletePress = useCallback(
    (index: number) => {
      const animation = animationValues.current.get(index);

      if (animation) {
        Animated.parallel([
          Animated.timing(animation.scale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animation.opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDelete(index);
          // Clean up animation values
          animationValues.current.delete(index);
        });
      } else {
        onDelete(index);
      }
    },
    [onDelete]
  );

  // Render each media item
  const renderMediaItem = useCallback(
    (item: MediaItem, index: number) => {
      const animation = getAnimationValues(index);
      const isHovered = hoverIndex === index;

      return (
        <Animated.View
          key={`${item.uri}-${index}`}
          style={[
            styles.mediaItemContainer,
            {
              transform: [{ scale: animation.scale }],
              opacity: animation.opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.mediaItem}
            onPressIn={() => setHoverIndex(index)}
            onPressOut={() => setHoverIndex(null)}
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.mediaImage}
              resizeMode="cover"
            />

            {/* Loading Overlay */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              </View>
            )}

            {/* Delete Button */}
            <Animated.View
              style={[
                styles.deleteButtonContainer,
                {
                  opacity: Animated.add(
                    0.5,
                    Animated.multiply(isHovered ? 0.5 : 0, animation.opacity)
                  ),
                  transform: [{ scale: isHovered ? 1.1 : 1 }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePress(index)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.8)"]}
                  style={styles.deleteButtonGradient}
                >
                  <Ionicons name="close" size={12} color={COLORS.WHITE} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [loading, isDarkMode, hoverIndex, handleDeletePress]
  );

  // Render message if no media items
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
          },
        ]}
      >
        No media attachments
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {mediaItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mediaItems.map(renderMediaItem)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.XS,
  },
  scrollContent: {
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.XS,
  },
  mediaItemContainer: {
    marginRight: SPACING.XS,
  },
  mediaItem: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.M,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.M,
  },
  deleteButtonContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 10,
  },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  deleteButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  emptyContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
});

export default UploadGroup;
