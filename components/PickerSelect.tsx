import React from "react";
import RNPickerSelect from "react-native-picker-select";

type PickerItem = { label: string; value: string };

interface PickerSelectProps {
  placeholder?: { label: string; value: string };
  items: PickerItem[];
  onValueChange: (value: string) => void;
  value: string;
  style?: any;
  useNativeAndroidPickerStyle?: boolean;
  Icon?: () => React.ReactElement;
}

const PickerSelect = (props: PickerSelectProps) => {
  return <RNPickerSelect {...props} />;
};

export default PickerSelect;
