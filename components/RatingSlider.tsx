import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState, useCallback, useRef, useReducer } from "react";

import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { ScrollView } from "react-native-virtualized-view";
import { AntDesign } from "@expo/vector-icons";
import Button from "@/components/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { launchImagePicker } from "@/utils/ImagePickerHelper";
import Slider from "@react-native-community/slider";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducers";
import Input from "@/components/Input";

// Import the new memoized components
import ImageItem from "@/components/ImageItem";

interface Props {
  count: number;
  setCount: (value: number) => void;
}

export function RatingSlider({ count, setCount }: Props) {
  const sliderValueRef = useRef<number>(count);
  const { dark } = useTheme();

  // Memoize functions to prevent unnecessary re-creation
  const handleIncrease = useCallback(() => {
    if (count < 10) {
      const newValue = parseFloat((count + 0.1).toFixed(1));
      setCount(newValue);
      sliderValueRef.current = newValue;
    }
  }, [count]);

  const handleDecrease = useCallback(() => {
    if (count > 0) {
      const newValue = parseFloat((count - 0.1).toFixed(1));
      setCount(newValue);
      sliderValueRef.current = newValue;
    }
  }, [count]);

  // Handle slider value change without updating state
  const handleSliderChange = useCallback((value: number) => {
    sliderValueRef.current = value;
  }, []);

  // Update state when sliding is complete
  const handleSlidingComplete = useCallback((value: number) => {
    const newValue = parseFloat(value.toFixed(1));
    setCount(newValue);
  }, []);

  return (
    <>
      <View style={styles.ourContainer}>
        <Text
          style={[
            styles.hourTitle,
            { color: dark ? COLORS.white : COLORS.grayScale900 },
          ]}
        >
          Three Clovers Rating
        </Text>
        <View style={styles.ratingDisplay}>
          <Text style={styles.ratingValue}>{count.toFixed(1)}</Text>
          <Text style={styles.ratingMax}> / 10</Text>
        </View>
      </View>

      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleDecrease}
        >
          <AntDesign
            name="minus"
            size={16}
            color={dark ? COLORS.white : "black"}
          />
        </TouchableOpacity>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={0.1}
            value={sliderValueRef.current}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.grayScale300}
            thumbTintColor={COLORS.primary}
          />
        </View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleIncrease}
        >
          <AntDesign
            name="plus"
            size={16}
            color={dark ? COLORS.white : "black"}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  microContainer: {
    height: 48,
    width: 48,
    borderRadius: 49,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  input: {
    color: COLORS.black2,
    flex: 1,
    paddingHorizontal: 10,
  },
  attachmentIconContainer: {
    marginRight: 12,
  },
  inputMessageContainer: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10,
    backgroundColor: COLORS.grayscale100,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.black,
    marginTop: 12,
  },
  ourContainer: {
    width: SIZES.width - 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  hourTitle: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.black,
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ratingValue: {
    fontSize: 32,
    fontFamily: "bold",
    color: COLORS.white,
  },
  ratingMax: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 32,
    marginBottom: 8,
  },
  iconContainer: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: COLORS.tansparentPrimary,
  },
  hourButton: {
    padding: 10,
    borderRadius: 32,
    marginHorizontal: 5,
    borderColor: COLORS.primary,
    borderWidth: 1.4,
  },
  selectedHourButton: {
    backgroundColor: COLORS.primary,
  },
  selectedHourText: {
    fontSize: 12,
    fontFamily: "medium",
    color: COLORS.white,
  },
  hourText: {
    fontSize: 12,
    fontFamily: "medium",
    color: COLORS.primary,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 22,
    left: 0,
    right: 0,
    width: "100%",
    height: 54,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  button: {
    width: SIZES.width - 32,
    height: 54,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  imageListContainer: {
    marginBottom: 16,
    paddingTop: 20,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    alignItems: "center",
  },
  image: {
    width: (SIZES.width - 48) / 2, // Adjusted width to fit two images per row
    height: 150,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  addImageButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    backgroundColor: COLORS.transparent,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "medium",
    textAlign: "center",
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
