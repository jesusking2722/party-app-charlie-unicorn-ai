import { FONTS } from "@/app/theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 40; // Account for padding
const ITEM_HEIGHT = 220;

const Slider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
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

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setActiveIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.slideContainer}>
        <LinearGradient
          colors={["rgba(127, 0, 255, 0.7)", "rgba(225, 0, 255, 0.7)"]}
          style={styles.slideGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
              style={styles.overlayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: idx,
                animated: true,
              });
              setActiveIndex(idx);
            }}
          >
            <View
              style={[
                styles.paginationDot,
                idx === activeIndex ? styles.paginationDotActive : null,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={styles.flatListContent}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: ITEM_HEIGHT,
    marginBottom: 24,
  },
  flatListContent: {
    alignItems: "center",
  },
  slideContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
  },
  slideGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlayGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.BOLD,
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 16,
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "white",
  },
});

export default Slider;
