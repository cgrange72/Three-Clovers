import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants";

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

const PickerSelect = ({
  placeholder,
  items,
  onValueChange,
  value,
  style,
}: PickerSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      style={{
        fontSize: 16,
        color: COLORS.white,
        height: 52,
        minWidth: 150,
        textAlign: "right",
        backgroundColor: "transparent",
        border: "none",
        outline: "none",
        cursor: "pointer",
        paddingRight: 8,
        appearance: "auto" as any,
      }}
    >
      {placeholder && (
        <option value={placeholder.value} style={{ color: COLORS.grayScale800 }}>
          {placeholder.label}
        </option>
      )}
      {items.map((item) => (
        <option key={item.value} value={item.value} style={{ color: "#000" }}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

export default PickerSelect;
