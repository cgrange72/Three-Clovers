import { ImageSourcePropType } from "react-native";

export type Slide = {
  id: number;
  title1: string;
  subtitle: string;
  bg: ImageSourcePropType;
};

export default [
  {
    id: 1,
    title1: "Find the Perfect Pint of Guinness",
    subtitle:
      "Explore pubs near you serving the best Guinness in Charleston. Your journey to the perfect pint starts here.",
    bg: require("@/assets/images/onbor1.png"),
  },
  {
    id: 2,
    title1: "Rate Every Pint",
    subtitle:
      "Score the head, creaminess, temperature, and settling. Help others find the top pints by sharing your ratings.",
    bg: require("@/assets/images/onbor2.png"),
  },
  {
    id: 3,
    title1: "Join Three Clovers",
    subtitle:
      "Connect with fellow Guinness enthusiasts. Share experiences, compare pubs, and find the best pour in town.",
    bg: require("@/assets/images/onbor3.png"),
  },
] as Slide[];
