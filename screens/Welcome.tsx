import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageContainer from "@/components/PageContainer";
import Onboarding1Styles from "@/styles/OnboardingStyles";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { StatusBar } from "expo-status-bar";
import Button from "@/components/Button";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const Welcome = ({ navigation }: NavigationProps) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        Onboarding1Styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <PageContainer>
        <StatusBar backgroundColor="transparent" translucent={true} />
        <View style={Onboarding1Styles.contentContainer}>
          <Image
            source={require("../assets/images/finalonbor.png")}
            resizeMode="stretch"
            style={{
              width: width,
              height: height / 1.9, // Adjust the height as needed
              marginTop: -50, // Negative margin to overflow on top
            }}
          />
        </View>
        <View style={{ flex: 0.9, backgroundColor: colors.background }}>
          <View style={{ marginHorizontal: 20, marginTop: 20 }}>
            <Text
              style={[
                Onboarding1Styles.title,
                { textAlign: "center", color: colors.text },
              ]}
            >
              Three Clovers
            </Text>
            <View style={{ paddingTop: 15 }}>
              <Text
                style={[Onboarding1Styles.description, { color: colors.text }]}
              >
                Your journey to finding the best pint of Guinness in Charleston starts here.
              </Text>
            </View>
            <Button
              title="Next"
              filled
              onPress={() => navigation.navigate("Login")}
              style={Onboarding1Styles.nextButton}
            />
            <View
              style={{
                paddingTop: 15,
                flexDirection: "row",
                justifyContent: "center",
                paddingBottom: 15,
              }}
            >
              <Text
                style={[Onboarding1Styles.description, { color: colors.text }]}
              >
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text
                  style={[
                    Onboarding1Styles.description,
                    { color: colors.primary },
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
};

export default Welcome;
