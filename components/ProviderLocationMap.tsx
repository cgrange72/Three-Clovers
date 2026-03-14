import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { COLORS, SIZES } from "../constants";
import { useTheme } from "../theme/ThemeProvider";
import { mapDarkStyle, mapStandardStyle } from "../data/mapData";
import { charlestonPubs } from "@/data/pubs";

export type PubPin = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
};

export type MapControls = {
  animateTo: (lat: number, lon: number) => void;
};

const ProviderLocationMap = ({
  initialLatitude,
  initialLongitude,
  onPubsChanged,
  onPubPress,
  onMapReady,
}: {
  initialLatitude: number;
  initialLongitude: number;
  onPubsChanged?: (pubs: PubPin[]) => void;
  onPubPress?: (pub: PubPin) => void;
  onMapReady?: (controls: MapControls) => void;
}) => {
  const { dark } = useTheme();
  const [pubs, setPubs] = useState<PubPin[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (onMapReady) {
      onMapReady({
        animateTo: (lat: number, lon: number) => {
          mapRef.current?.animateToRegion(
            {
              latitude: lat,
              longitude: lon,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            },
            500
          );
        },
      });
    }
  }, [onMapReady]);

  const updatePubs = (newPubs: PubPin[]) => {
    setPubs(newPubs);
    onPubsChanged?.(newPubs);
  };

  const fetchPubsInRegion = useCallback(async (region: Region) => {
    const south = region.latitude - region.latitudeDelta / 2;
    const north = region.latitude + region.latitudeDelta / 2;
    const west = region.longitude - region.longitudeDelta / 2;
    const east = region.longitude + region.longitudeDelta / 2;

    setLoading(true);
    try {
      const overpassQuery = [
        "[out:json][timeout:15];",
        "(",
        `node["amenity"~"pub|bar|biergarten"](${south},${west},${north},${east});`,
        `way["amenity"~"pub|bar|biergarten"](${south},${west},${north},${east});`,
        `node["leisure"="beer_garden"](${south},${west},${north},${east});`,
        `way["leisure"="beer_garden"](${south},${west},${north},${east});`,
        ");",
        "out center 200;",
      ].join("");

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(overpassQuery),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.ok) {
        const data = await response.json();
        const fetched: PubPin[] = (data.elements || [])
          .filter((el: any) => el.tags?.name)
          .map((el: any) => ({
            id: el.id.toString(),
            latitude: el.lat || el.center?.lat,
            longitude: el.lon || el.center?.lon,
            name: el.tags.name,
            address: [
              el.tags["addr:housenumber"],
              el.tags["addr:street"],
              el.tags["addr:city"],
              el.tags["addr:state"],
            ]
              .filter(Boolean)
              .join(", ") || "Nearby",
          }))
          .filter((p: PubPin) => p.latitude && p.longitude);

        if (fetched.length > 0) {
          updatePubs(fetched);
        } else {
          loadFallback();
        }
      } else {
        loadFallback();
      }
    } catch {
      loadFallback();
    }
    setLoading(false);
  }, [onPubsChanged]);

  const loadFallback = () => {
    const fallback = charlestonPubs.map((p) => ({
      id: p.id.toString(),
      latitude: p.latitude,
      longitude: p.longitude,
      name: p.name,
      address: p.address,
    }));
    updatePubs(fallback);
  };

  const handleRegionChange = useCallback(
    (region: Region) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchPubsInRegion(region);
      }, 800);
    },
    [fetchPubsInRegion]
  );

  React.useEffect(() => {
    fetchPubsInRegion({
      latitude: initialLatitude,
      longitude: initialLongitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    });
  }, [initialLatitude, initialLongitude]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={dark ? mapDarkStyle : mapStandardStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        onRegionChangeComplete={handleRegionChange}
      >
        {pubs.map((pub) => (
          <Marker
            key={pub.id}
            coordinate={{
              latitude: pub.latitude,
              longitude: pub.longitude,
            }}
            title={pub.name}
            description="Tap to rate"
            pinColor={COLORS.primary}
            onCalloutPress={() => onPubPress?.(pub)}
          />
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding pubs...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.width - 32,
    height: 400,
    borderRadius: 16,
    paddingVertical: 12,
  },
  map: {
    width: SIZES.width - 32,
    height: 400,
    borderRadius: 12,
  },
  loadingOverlay: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: "medium",
  },
});

export default ProviderLocationMap;
