import React from "react";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import ProviderLocationMap, { PubPin, MapControls } from "./ProviderLocationMap";

const MartiniMap = ({
  onPubsChanged,
  onPubPress,
  onMapReady,
}: {
  onPubsChanged?: (pubs: PubPin[]) => void;
  onPubPress?: (pub: PubPin) => void;
  onMapReady?: (controls: MapControls) => void;
}) => {
  const [ready, setReady] = React.useState(false);
  const [userLat, setUserLat] = React.useState(32.7810);
  const [userLon, setUserLon] = React.useState(-79.9310);

  React.useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setUserLat(location.coords.latitude);
          setUserLon(location.coords.longitude);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
      setReady(true);
    };
    getLocation();
  }, []);

  if (!ready) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ProviderLocationMap
        initialLatitude={userLat}
        initialLongitude={userLon}
        onPubsChanged={onPubsChanged}
        onPubPress={onPubPress}
        onMapReady={onMapReady}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MartiniMap;
