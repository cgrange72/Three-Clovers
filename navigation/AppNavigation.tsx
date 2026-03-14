import { createStackNavigator } from "@react-navigation/stack";
import { NavigationIndependentTree } from "@react-navigation/native";
import React from "react";

import { useAuth } from "@/context/AuthContext";
import Introduction from "@/screens/Introduction";
import Login from "@/screens/Login";
import SignUp from "@/screens/SignUp";
import Welcome from "@/screens/Welcome";
import BottomTabNavigation from "./BottomTabNavigation";
import Notifications from "@/screens/Notifications";
import ServiceDetails from "@/screens/ServiceDetails";
import BookingDetails from "@/screens/BookingDetails";
import Search from "@/screens/Search";
import BookingStep1 from "@/screens/BookingStep1";
import EditProfile from "@/screens/EditProfile";
import Comments from "@/screens/Comments";
import CreatePost from "@/screens/CreatePost";

const Stack = createStackNavigator();

const AppNavigation = () => {
  const { session, loading, isOffline } = useAuth();
  const isAuthenticated = isOffline || !!session;

  if (loading) {
    return null;
  }

  return (
    <NavigationIndependentTree>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigation} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
            <Stack.Screen name="BookingDetails" component={BookingDetails} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="BookingStep1" component={BookingStep1} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Comments" component={Comments} />
            <Stack.Screen name="RatePint" component={CreatePost} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Introduction" component={Introduction} />
            <Stack.Screen name="Welcome" component={Welcome} />
          </>
        )}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default AppNavigation;
