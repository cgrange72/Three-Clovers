import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Switch,
} from "react-native";
import React, { useState, useCallback, useRef, useReducer } from "react";

import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import Header from "@/components/Header";
import { AntDesign } from "@expo/vector-icons";
import Button from "@/components/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { launchImagePicker } from "@/utils/ImagePickerHelper";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducers";
import Input from "@/components/Input";
import PickerSelect from "@/components/PickerSelect";

// Import the new memoized components
import ImageItem from "@/components/ImageItem";
import { RatingSlider } from "@/components/RatingSlider";
import MultiImageUpload from "@/components/MultiImageUpload";
import { commonStyles } from "@/styles/CommonStyles";
import { useRatings } from "@/context/RatingsContext";
import { useAuth } from "@/context/AuthContext";
import { PostType } from "@/types/home";

const initialState = {
  inputValues: {
    rating: 2,
    caption: "",
  },
  inputValidities: {
    caption: false,
  },
  formIsValid: false,
};

const CreatePost = ({ navigation, route }: any) => {
  const pubName = route?.params?.pubName || null;
  const pubAddress = route?.params?.pubAddress || "";
  const pubId = route?.params?.pubId || "";
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const today = new Date();
  const { colors, dark } = useTheme();
  const { addRating } = useRatings();
  const { user, profile } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [temperature, setTemperature] = useState("");
  const [head, setHead] = useState("");
  const [creaminess, setCreaminess] = useState("");
  const [settling, setSettling] = useState("");
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState("");
  const [gSplit, setGSplit] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);

  const temperatureOptions = [
    { label: "Cold", value: "Cold" },
    { label: "Cool", value: "Cool" },
    { label: "Warm", value: "Warm" },
  ];

  const headOptions = [
    { label: "Thin", value: "Thin" },
    { label: "Medium", value: "Medium" },
    { label: "Thick", value: "Thick" },
  ];

  const creaminessOptions = [
    { label: "Flat", value: "Flat" },
    { label: "Average", value: "Average" },
    { label: "Creamy", value: "Creamy" },
    { label: "Very Creamy", value: "Very Creamy" },
  ];

  const settingOptions = [
    { label: "Rushed", value: "Rushed" },
    { label: "Good", value: "Good" },
    { label: "Perfect", value: "Perfect" },
  ];

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const handleImagesChange = useCallback((uris: string[]) => {
    setSelectedImages(uris);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const renderImageItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <ImageItem uri={item} index={index} onRemove={handleRemoveImage} />
    ),
    [handleRemoveImage]
  );

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={pubName ? `Rate: ${pubName}` : "Rate a Pint"} position="middle" backButton={!!pubName} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[commonStyles.scrollViewContent, { paddingBottom: 80 }]}
        >
          <MultiImageUpload images={selectedImages} onImagesChange={handleImagesChange} imageLimit={5} />

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.captionInput]}
              placeholder="Add a caption..."
              placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
              selectionColor="#111"
              multiline={true}
              numberOfLines={4}
              value={caption}
              onChangeText={setCaption}
            />
          </View>
          <RatingSlider
            count={parseFloat(formState.inputValues.rating)}
            setCount={(value) =>
              inputChangedHandler("rating", value.toString())
            }
          />
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Price $</Text>

            <TextInput
              placeholder="0.00"
              placeholderTextColor={COLORS.grayScale800}
              selectionColor="#fff"
              keyboardType="numeric"
              style={styles.priceInput}
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Temperature</Text>
            <PickerSelect
              placeholder={{ label: "Select", value: "" }}
              items={temperatureOptions}
              onValueChange={setTemperature}
              value={temperature}
              style={{
                ...pickerSelectStyles,
                placeholder: { color: COLORS.grayScale800 },
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => <AntDesign name="down" size={14} color={COLORS.grayScale800} style={{ marginTop: 18, marginRight: 8 }} />}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Head</Text>
            <PickerSelect
              placeholder={{ label: "Select", value: "" }}
              items={headOptions}
              onValueChange={setHead}
              value={head}
              style={{
                ...pickerSelectStyles,
                placeholder: { color: COLORS.grayScale800 },
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => <AntDesign name="down" size={14} color={COLORS.grayScale800} style={{ marginTop: 18, marginRight: 8 }} />}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Creaminess</Text>
            <PickerSelect
              placeholder={{ label: "Select", value: "" }}
              items={creaminessOptions}
              onValueChange={setCreaminess}
              value={creaminess}
              style={{
                ...pickerSelectStyles,
                placeholder: { color: COLORS.grayScale800 },
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => <AntDesign name="down" size={14} color={COLORS.grayScale800} style={{ marginTop: 18, marginRight: 8 }} />}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Setting</Text>
            <PickerSelect
              placeholder={{ label: "Select", value: "" }}
              items={settingOptions}
              onValueChange={setSettling}
              value={settling}
              style={{
                ...pickerSelectStyles,
                placeholder: { color: COLORS.grayScale800 },
              }}
              useNativeAndroidPickerStyle={false}
              Icon={() => <AntDesign name="down" size={14} color={COLORS.grayScale800} style={{ marginTop: 18, marginRight: 8 }} />}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>G Split?</Text>
            <Switch
              value={gSplit}
              onValueChange={setGSplit}
              thumbColor={gSplit ? "#fff" : COLORS.white}
              trackColor={{ false: "#EEEEEE", true: COLORS.primary }}
              ios_backgroundColor="#EEEEEE"
            />
          </View>

          <View style={styles.submitContainer}>
            <Button
              title="Submit Rating"
              filled
              style={styles.button}
              onPress={() => {
            const now = new Date().toISOString();
            const ratingValue = parseFloat(formState.inputValues.rating) || 0;
            const newPost: PostType = {
              ulid: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
              location: {
                id: parseInt(pubId) || Date.now(),
                name: pubName || "Unknown Pub",
                address: pubAddress || "",
              },
              user: {
                id: user?.id || "anonymous",
                firstName: profile?.first_name || "User",
                lastName: profile?.last_name || "",
                profilePic: profile?.profile_pic || "",
              },
              rating: ratingValue,
              images: selectedImages.map((uri, i) => ({ order: i + 1, image: uri })),
              submitted_dt: now,
              price: price || "0.00",
              temperature,
              head,
              creaminess,
              settling,
              gSplit,
              caption,
              created_dt: now,
              created_by: user?.id || "anonymous",
              updated_dt: now,
              updated_by: user?.id || "anonymous",
            };
            addRating(newPost);
            navigation.goBack();
          }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.black,
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: "semiBold",
  },
  priceInput: {
    fontSize: 16,
    color: COLORS.white,
    minWidth: 80,
    textAlign: "right",
    paddingVertical: 8,
  },

  microContainer: {
    height: 48,
    width: 48,
    borderRadius: 49,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  captionInput: {
    height: 100,
    textAlignVertical: "top", // Ensures text starts from the top in Android
    padding: 10,
    borderColor: COLORS.grayscale100,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    color: COLORS.primary,
  },
  input: {
    color: COLORS.black2,
    flex: 1,
    paddingHorizontal: 10,
  },
  attachmentIconContainer: {
    marginRight: 12,
  },
  inputMessageContainer: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10,
    backgroundColor: COLORS.grayscale100,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.black,
    marginTop: 12,
  },
  ourContainer: {
    width: SIZES.width - 32,
    height: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    justifyContent: "space-between",
  },
  iconContainer: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: COLORS.tansparentPrimary,
  },
  selectedHourButton: {
    backgroundColor: COLORS.primary,
  },
  selectedHourText: {
    fontSize: 12,
    fontFamily: "medium",
    color: COLORS.white,
  },
  submitContainer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 22,
    left: 0,
    right: 0,
    width: "100%",
    height: 54,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  button: {
    width: SIZES.width - 32,
    height: 54,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  imageListContainer: {
    marginBottom: 16,
    paddingTop: 20,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  imageContainer: {
    flex: 1,
    margin: 5,
    alignItems: "center",
  },
  image: {
    width: (SIZES.width - 48) / 2, // Adjusted width to fit two images per row
    height: 150,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  addImageButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    backgroundColor: COLORS.transparent,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "medium",
    textAlign: "center",
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    color: COLORS.white,
    height: 52,
    minWidth: 150,
    textAlign: "right",
    backgroundColor: "transparent",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    color: COLORS.white,
    height: 52,
    minWidth: 150,
    textAlign: "right",
    backgroundColor: "transparent",
    paddingRight: 30,
  },
});

export default CreatePost;
