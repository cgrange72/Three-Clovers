import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { COLORS, SIZES, images } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { reducer } from "../utils/reducers/formReducers";
import { validateInput } from "../utils/actions/formActions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { launchImagePicker } from "../utils/ImagePickerHelper";
import Input from "../components/Input";
import Button from "../components/Button";
import { useTheme } from "../theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { commonStyles } from "@/styles/CommonStyles";
import { useAuth } from "@/context/AuthContext";

const initialState = {
  inputValues: {
    fullName: "",
    nickname: "",
  },
  inputValidities: {
    fullName: false,
    nickname: false,
  },
  formIsValid: false,
};

const EditProfile = ({ navigation }: NavigationProps) => {
  const { profile, updateProfilePic } = useAuth();
  const [image, setImage] = useState<string | null>(profile?.profile_pic || null);
  const [error, setError] = useState();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const { dark } = useTheme();

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("An error occurred", error);
    }
  }, [error]);

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setImage(tempUri);
      await updateProfilePic(tempUri);
    } catch (error) {}
  };

  return (
    <SafeAreaView
      style={[
        styles.area,
        { backgroundColor: dark ? COLORS.dark1 : COLORS.white },
      ]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: dark ? COLORS.dark1 : COLORS.white },
        ]}
      >
        <Header title="Edit Profile" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={commonStyles.scrollViewContent}
        >
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <View style={styles.avatarContainer}>
              <Image
                source={image === null ? images.user1 : { uri: image }}
                resizeMode="cover"
                style={styles.avatar}
              />
              <TouchableOpacity onPress={pickImage} style={styles.pickImage}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Input
              id="fullName"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities["fullName"]}
              placeholder="Full Name"
              placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            />
            <Input
              id="nickname"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities["nickname"]}
              placeholder="Nickname"
              placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomContainer}>
        <Button
          title="Update"
          filled
          style={styles.continueButton}
          onPress={() => navigation.navigate("Profile")}
        />
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
    padding: 16,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    marginVertical: 12,
    alignItems: "center",
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatar: {
    height: 130,
    width: 130,
    borderRadius: 65,
  },
  pickImage: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 32,
    right: 16,
    left: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width - 32,
    alignItems: "center",
  },
  continueButton: {
    width: SIZES.width - 32,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default EditProfile;
