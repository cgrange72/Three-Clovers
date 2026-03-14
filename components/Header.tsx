import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SIZES, COLORS, icons } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeProvider";

interface HeaderProps {
  title?: string;
  position?: "start" | "middle" | "end";
  backButton?: boolean;
}

const Header = ({
  title,
  position = "start",
  backButton = true,
}: HeaderProps) => {
  const navigation = useNavigation();
  const { colors, dark } = useTheme();
  const getTitleAlignment = () => {
    switch (position) {
      case "middle":
        return "center";
      case "end":
        return "flex-end";
      default:
        return "flex-start";
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? COLORS.dark1 : COLORS.white,
          justifyContent: getTitleAlignment(),
        },
      ]}
    >
      {backButton && navigation.canGoBack() && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={icons.back}
            resizeMode="contain"
            style={[
              styles.backIcon,
              {
                tintColor: colors.text,
              },
            ]}
          />
        </TouchableOpacity>
      )}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingBottom: 10,
    width: SIZES.width - 32,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "bold",
    color: COLORS.black,
  },
});

export default Header;
