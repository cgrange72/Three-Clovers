import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import { COLORS, SIZES } from "../constants";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";

interface Props {
  count: number;
  setCount: (value: number) => void;
}

export function RatingSlider({ count, setCount }: Props) {
  const { dark } = useTheme();

  const handleIncrease = useCallback(() => {
    if (count < 10) {
      setCount(parseFloat((count + 0.1).toFixed(1)));
    }
  }, [count, setCount]);

  const handleDecrease = useCallback(() => {
    if (count > 0) {
      setCount(parseFloat((count - 0.1).toFixed(1)));
    }
  }, [count, setCount]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCount(parseFloat(parseFloat(e.target.value).toFixed(1)));
    },
    [setCount]
  );

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
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={count}
            onChange={handleSliderChange}
            style={{
              width: "100%",
              height: 40,
              accentColor: COLORS.primary,
              cursor: "pointer",
            }}
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
  ourContainer: {
    width: "100%" as any,
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
    width: "100%" as any,
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
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
});
