import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  View,
} from "react-native";
import React from "react";
import { COLORS, SIZES } from "../constants";

interface ButtonProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  title: string;
  onPress: () => void;
  filled?: boolean;
  color?: string;
  textColor?: string;
  isLoading?: boolean;
  style?: any;
}

const Button = (props: ButtonProps) => {
  const filledBgColor = props.color || COLORS.primary;
  const outlinedBgColor = COLORS.white;
  const bgColor = props.filled ? filledBgColor : outlinedBgColor;
  const textColor = props.filled
    ? COLORS.white || props.textColor
    : props.textColor || COLORS.primary;
  const isLoading = props.isLoading || false;

  return (
    <TouchableOpacity
      style={{
        ...styles.btn,
        ...{ backgroundColor: bgColor },
        ...props.style,
      }}
      onPress={props.onPress}
    >
      {isLoading && isLoading == true ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {props.startIcon}
          <Text
            style={{
              fontSize: 18,
              fontFamily: "semiBold",
              ...{ color: textColor },
            }}
          >
            {props.title}
          </Text>
          {props.endIcon}
        </View>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
});

export default Button;
