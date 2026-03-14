import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";

type ImageItemProps = {
  uri: string;
  index: number;
  onRemove: (index: number) => void;
};

const ImageItem = React.memo(({ uri, index, onRemove }: ImageItemProps) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => onRemove(index)}
      >
        <AntDesign name="closecircle" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    margin: 5,
    alignItems: "center",
  },
  image: {
    width: (SIZES.width - 48) / 2,
    height: 150,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});

export default ImageItem;
