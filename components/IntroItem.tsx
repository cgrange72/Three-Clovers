import {
  View,
  Text,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
  StyleSheet,
} from "react-native";
import React from "react";
import { Slide } from "../constants/intro-slides";
import Onboarding1Styles from "@/styles/OnboardingStyles";
import { useTheme } from "@/theme/ThemeProvider";

const { width, height } = Dimensions.get("window");

export default function IntroItem({ item }: { item: Slide }) {
  const { colors } = useTheme();

  return (
    <View key={item.id}>
      <View style={Onboarding1Styles.contentContainer}>
        <Image
          source={item.bg}
          style={{ width: width, height: height / 1.7, resizeMode: "stretch" }}
        />
      </View>
    </View>
  );
}
