import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {} from "react";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { COLORS, SIZES } from "@/constants";
import React from "react";
import Button from "./Button";

export default function MultiImageUpload({
  images,
  onImagesChange,
  imageLimit,
}: {
  images: string[];
  onImagesChange: (uris: string[]) => void;
  imageLimit: number;
}) {
  const pickGalleryImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      const newPhotos = [...images, ...selectedUris].slice(0, imageLimit);
      onImagesChange(newPhotos);
    }
  };

  const removeGalleryImage = (uri: string) => {
    onImagesChange(images.filter((photo) => photo !== uri));
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {images.length > 0 && (
        <ScrollView
          horizontal={images.length > 1}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        >
          {images.map((uri) => (
            <View
              key={uri}
              style={[
                styles.galleryImageContainer,
                images.length === 1 && styles.singleImageContainer,
              ]}
            >
              <Image
                source={{ uri }}
                style={[
                  styles.galleryImage,
                  images.length === 1 && styles.singleImage,
                ]}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeGalleryImage(uri)}
              >
                <AntDesign name="close-circle-o" size={15} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <Button
        title="Add Image"
        startIcon={
          <AntDesign
            name="plus-circle"
            size={20}
            style={{ marginRight: 10 }}
            color={COLORS.primary}
          />
        }
        style={styles.addButton}
        onPress={pickGalleryImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    width: SIZES.width - 32,
  },
  galleryImageContainer: {
    position: "relative",
    marginRight: 10,
    width: 300, // Example width
    height: 300, // Example height
  },
  flatListContent: {
    paddingVertical: 10,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "medium",
    textAlign: "center",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 2,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  addButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  singleImageContainer: {
    width: SIZES.width - 32, // Full width for a single image
    height: SIZES.width - 32, // Adjust height as needed
  },
  singleImage: {
    width: "100%", // Full width for a single image
    height: "100%",
  },
});
