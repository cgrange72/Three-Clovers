import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants";

interface DatePickerModalProps {
  open: boolean;
  startDate: string;
  selectedDate: string;
  onClose: () => void;
  onChangeStartDate: (date: string) => void;
}

const DatePickerModal = ({
  open,
  startDate,
  selectedDate,
  onClose,
  onChangeStartDate,
}: DatePickerModalProps) => {
  const [value, setValue] = useState(selectedDate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setValue(date);
    onChangeStartDate(date);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Select Date</Text>
          <input
            type="date"
            value={value}
            min={startDate}
            onChange={handleChange}
            style={{
              fontSize: 18,
              padding: 12,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#fff",
              color: COLORS.primary,
              width: 250,
              textAlign: "center",
              marginVertical: 16,
            }}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 35,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "semiBold",
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "medium",
  },
});

export default DatePickerModal;
