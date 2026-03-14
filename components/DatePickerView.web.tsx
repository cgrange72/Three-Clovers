import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants";

interface DatePickerViewProps {
  open?: boolean;
  onClose?: () => void;
  startDate: string;
  selectedDate: string;
  onChangeStartDate: (date: string) => void;
}

const DatePickerView = ({
  startDate,
  selectedDate,
  onChangeStartDate,
}: DatePickerViewProps) => {
  const [value, setValue] = useState(selectedDate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setValue(date);
    onChangeStartDate(date);
  };

  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <input
          type="date"
          value={value}
          min={startDate}
          onChange={handleChange}
          style={{
            fontSize: 18,
            padding: 16,
            borderRadius: 12,
            border: "none",
            backgroundColor: COLORS.primary,
            color: "#fff",
            width: "100%",
            maxWidth: 350,
            textAlign: "center",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  modalView: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

export default DatePickerView;
