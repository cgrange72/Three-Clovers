import React, { forwardRef, useImperativeHandle, useRef } from "react";
import RBSheet from "react-native-raw-bottom-sheet";

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
  ({ children, ...props }, ref) => {
    const rbRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      open: () => rbRef.current?.open(),
      close: () => rbRef.current?.close(),
    }));

    return (
      <RBSheet ref={rbRef} {...props}>
        {children}
      </RBSheet>
    );
  }
);

export default BottomSheet;
