import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, icons, images } from "@/constants";
import Header from "@/components/Header";
import { reducer } from "@/utils/reducers/formReducers";
import { validateInput } from "@/utils/actions/formActions";
import Input from "@/components/Input";
import Checkbox from "expo-checkbox";
import Button from "@/components/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { useAuth } from "@/context/AuthContext";

const initialState = {
  inputValues: {
    email: "",
    password: "",
  },
  inputValidities: {
    email: false,
    password: false,
  },
  formIsValid: false,
};

const Login = ({ navigation }: NavigationProps) => {
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colors, dark } = useTheme();
  const { signIn } = useAuth();

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: any) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      if (Platform.OS === "web") {
        // Alert.alert doesn't work well on web
        console.warn(error);
      } else {
        Alert.alert("Login Error", error);
      }
    }
  }, [error]);

  const handleLogin = async () => {
    const email = formState.inputValues.email;
    const password = formState.inputValues.password;

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setIsLoading(false);
    } else {
      navigation.navigate("Main");
    }
  };

  return (
    <SafeAreaView
      style={[styles.area, { backgroundColor: colors.background }]}
    >
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Header />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text
            style={[
              styles.title,
              {
                color: dark ? COLORS.white : COLORS.black,
                marginBottom: 20,
              },
            ]}
          >
            Login
          </Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <Input
            id="email"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities["email"]}
            placeholder="Email"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.email}
            keyboardType="email-address"
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities["password"]}
            autoCapitalize="none"
            id="password"
            placeholder="Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry={true}
          />
          <View style={styles.checkBoxContainer}>
            <View style={{ flexDirection: "row" }}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                color={
                  isChecked ? COLORS.primary : dark ? COLORS.primary : "gray"
                }
                onValueChange={setChecked}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.privacy,
                    { color: dark ? COLORS.white : COLORS.black },
                  ]}
                >
                  Remember me
                </Text>
              </View>
            </View>
          </View>
          <Button
            title={isLoading ? "Logging in..." : "Login"}
            filled
            onPress={handleLogin}
            style={styles.button}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordMethods")}
          >
            <Text style={styles.forgotPasswordBtnText}>
              Forgot the password?
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text
            style={[
              styles.bottomLeft,
              { color: dark ? COLORS.white : COLORS.black },
            ]}
          >
            Don't have an account ?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.bottomRight}>{"  "}Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 200,
    height: 200,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: "medium",
    textAlign: "center",
    marginBottom: 12,
  },
  checkBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 18,
  },
  checkbox: {
    marginRight: 8,
    height: 16,
    width: 16,
    borderRadius: 4,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  privacy: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.black,
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
    position: "absolute",
    bottom: 12,
    right: 0,
    left: 0,
  },
  bottomLeft: {
    fontSize: 14,
    fontFamily: "regular",
    color: "black",
  },
  bottomRight: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.primary,
  },
  button: {
    marginVertical: 6,
    width: SIZES.width - 32,
    borderRadius: 30,
  },
  forgotPasswordBtnText: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 12,
  },
});

export default Login;
