import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import IntroItem from "../components/IntroItem";
import Slides, { Slide } from "../constants/intro-slides";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/theme/ThemeProvider";
import Onboarding1Styles from "@/styles/OnboardingStyles";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import DotsView from "@/components/DotsView";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export default function Introduction() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();

  const ref = React.useRef<FlatList<Slide>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const Footer = () => {
    return (
      <SafeAreaView
        style={[
          Onboarding1Styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={Onboarding1Styles.dotsContainer}>
          <DotsView
            progress={currentSlideIndex / (Slides.length - 1)}
            numDots={Slides.length}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.background,
            marginBottom: 20,
            marginHorizontal: 20,
          }}
        >
          <View style={{ marginHorizontal: 20, marginTop: 20 }}>
            <Text
              style={[
                Onboarding1Styles.title,
                { textAlign: "center", color: colors.text },
              ]}
            >
              {Slides[currentSlideIndex].title1}
            </Text>
            <View style={{ paddingTop: 15 }}>
              <Text
                style={[Onboarding1Styles.description, { color: colors.text }]}
              >
                {Slides[currentSlideIndex].subtitle}
              </Text>
            </View>
          </View>
        </View>
        <PageContainer>
          <View style={Onboarding1Styles.contentContainer}>
            <Button
              title={
                currentSlideIndex === Slides.length - 1 ? "Get Started" : "Next"
              }
              filled
              onPress={
                currentSlideIndex === Slides.length - 1
                  ? () => navigation.navigate("Welcome")
                  : goNextSlide
              }
              style={Onboarding1Styles.nextButton}
            />
            <Button
              title="Skip"
              onPress={() => navigation.navigate("Welcome")}
              textColor={colors.primary}
              style={Onboarding1Styles.skipButton}
            />
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  };

  const updateCurrentSlideIndex = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != Slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {Slides.map((item) => (
        <IntroItem key={item.id} item={item} />
      ))}
      <FlatList
        data={Slides}
        ref={ref}
        renderItem={({ item }) => <IntroItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item: Slide) => item.id.toString()}
        onMomentumScrollEnd={updateCurrentSlideIndex}
      />
      <Footer />
    </SafeAreaView>
  );
}
