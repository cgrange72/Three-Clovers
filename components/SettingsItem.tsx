import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { SIZES, COLORS, icons } from "../constants";
import { useTheme } from "../theme/ThemeProvider";

interface SettingsItemProps {
  icon: ImageSourcePropType;
  name: string;
  onPress: () => void;
  hasArrowRight?: boolean;
}

const SettingsItem = ({
  icon,
  name,
  onPress,
  hasArrowRight = true,
}: SettingsItemProps) => {
  const { dark } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.leftContainer}>
        <Image
          source={icon}
          resizeMode="contain"
          style={[
            styles.icon,
            {
              tintColor: dark ? COLORS.white : COLORS.grayScale900,
            },
          ]}
        />
        <Text
          style={[
            styles.name,
            {
              color: dark ? COLORS.white : COLORS.grayScale900,
            },
          ]}
        >
          {name}
        </Text>
      </View>
      {hasArrowRight && (
        <Image
          source={icons.arrowRight}
          resizeMode="contain"
          style={[
            styles.arrowRight,
            {
              tintColor: dark ? COLORS.white : COLORS.grayScale900,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.width - 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    height: 24,
    width: 24,
    tintColor: COLORS.grayScale900,
  },
  name: {
    fontSize: 18,
    fontFamily: "semiBold",
    color: COLORS.grayScale900,
    marginLeft: 12,
  },
  arrowRight: {
    width: 24,
    height: 24,
    tintColor: COLORS.grayScale900,
  },
});

export default SettingsItem;
