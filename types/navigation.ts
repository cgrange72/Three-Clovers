import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

export type NavigationProps = {
  navigation: NativeStackNavigationProp<any>;
};

export interface RefRbProps {
  open: () => void;
  close: () => void;
}
