import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";

interface BottomSheetProps {
  height?: number;
  customStyles?: any;
  closeOnPressBack?: boolean;
  closeOnPressMask?: boolean;
  children: React.ReactNode;
}

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, customStyles, height = 260, closeOnPressMask = true }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const containerBg =
      customStyles?.container?.backgroundColor || "#fff";
    const containerRadius =
      customStyles?.container?.borderTopLeftRadius || 32;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeOnPressMask ? () => setVisible(false) : undefined}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.container,
              {
                height: customStyles?.container?.height || height,
                backgroundColor: containerBg,
                borderTopLeftRadius: containerRadius,
                borderTopRightRadius: containerRadius,
              },
            ]}
          >
            <View style={styles.dragIndicator} />
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 8,
  },
});

export default BottomSheet;
