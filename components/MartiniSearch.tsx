import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { COLORS, SIZES, icons } from "../constants";
import NotFoundCard from "@/components/NotFoundCard";
import { NavigationProps } from "@/types/navigation";
import { useRatings } from "@/context/RatingsContext";
import { charlestonPubs } from "@/data/pubs";

type SearchResult = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  avgRating: number | null;
  numRatings: number;
};

const MartiniSearch = ({ navigation }: NavigationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyPubs, setNearbyPubs] = useState<SearchResult[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ratings } = useRatings();

  const ratingMap = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const post of ratings) {
      const key = post.location.name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.total += post.rating;
        existing.count += 1;
      } else {
        map.set(key, { total: post.rating, count: 1 });
      }
    }
    return map;
  }, [ratings]);

  const attachRatings = (
    items: Omit<SearchResult, "avgRating" | "numRatings">[]
  ): SearchResult[] => {
    return items.map((item) => {
      const ratings = ratingMap.get(item.name.toLowerCase());
      return {
        ...item,
        avgRating: ratings ? ratings.total / ratings.count : null,
        numRatings: ratings ? ratings.count : 0,
      };
    });
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } else {
        setLoadingNearby(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    fetchNearbyPubs();
  }, [userLocation]);

  const fetchNearbyPubs = async () => {
    if (!userLocation) return;
    setLoadingNearby(true);
    try {
      const radius = 5000;
      const overpassQuery = [
        "[out:json][timeout:15];",
        "(",
        `node["amenity"="pub"](around:${radius},${userLocation.latitude},${userLocation.longitude});`,
        `node["amenity"="bar"](around:${radius},${userLocation.latitude},${userLocation.longitude});`,
        ");",
        "out body 50;",
      ].join("");

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(overpassQuery),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!response.ok) throw new Error("Overpass returned " + response.status);

      const data = await response.json();

      const pubs = (data.elements || [])
        .filter((el: any) => el.tags?.name)
        .map((el: any) => ({
          id: el.id.toString(),
          name: el.tags.name,
          address: [
            el.tags["addr:housenumber"],
            el.tags["addr:street"],
            el.tags["addr:city"],
            el.tags["addr:state"],
          ]
            .filter(Boolean)
            .join(", ") || "Nearby",
          latitude: el.lat,
          longitude: el.lon,
        }));

      if (pubs.length > 0) {
        setNearbyPubs(attachRatings(pubs));
      } else {
        loadFallbackPubs();
      }
    } catch (error) {
      console.error("Overpass error, using fallback:", error);
      loadFallbackPubs();
    }
    setLoadingNearby(false);
  };

  const loadFallbackPubs = () => {
    const fallback = charlestonPubs.map((pub) => ({
      id: pub.id.toString(),
      name: pub.name,
      address: pub.address,
      latitude: pub.latitude,
      longitude: pub.longitude,
    }));
    setNearbyPubs(attachRatings(fallback));
  };

  const searchPlaces = async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    // Instant local filter first
    const localMatches = nearbyPubs.filter(
      (pub) =>
        pub.name.toLowerCase().includes(query.toLowerCase()) ||
        pub.address.toLowerCase().includes(query.toLowerCase())
    );
    setResults(localMatches);

    // If few local matches, search Overpass for more in the area
    if (localMatches.length < 5 && userLocation) {
      setLoading(true);
      try {
        const radius = 15000; // 15km
        const escaped = query.replace(/[\\.*+?^${}()|[\]]/g, "\\\\$&");
        const overpassQuery = [
          "[out:json][timeout:15];",
          "(",
          `node["name"~"${escaped}",i]["amenity"~"pub|bar|restaurant|cafe"](around:${radius},${userLocation.latitude},${userLocation.longitude});`,
          `way["name"~"${escaped}",i]["amenity"~"pub|bar|restaurant|cafe"](around:${radius},${userLocation.latitude},${userLocation.longitude});`,
          ");",
          "out center 25;",
        ].join("");

        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: "data=" + encodeURIComponent(overpassQuery),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (response.ok) {
          const data = await response.json();
          const remoteResults = (data.elements || [])
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
              id: el.id.toString(),
              name: el.tags.name,
              address: [
                el.tags["addr:housenumber"],
                el.tags["addr:street"],
                el.tags["addr:city"],
                el.tags["addr:state"],
              ]
                .filter(Boolean)
                .join(", ") || "Nearby",
              latitude: el.lat || el.center?.lat,
              longitude: el.lon || el.center?.lon,
            }));

          const seenIds = new Set(localMatches.map((p) => p.id));
          const merged = [
            ...localMatches,
            ...attachRatings(remoteResults).filter((p) => !seenIds.has(p.id)),
          ];
          setResults(merged);
        }
      } catch (error) {
        // Keep local matches, no-op
      }
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchPlaces(text);
    }, 500);
  }, [userLocation]);

  const displayData = searchQuery.trim().length >= 2 ? results : nearbyPubs;
  const isLoading = searchQuery.trim().length >= 2 ? loading : loadingNearby;

  const renderPubItem = ({ item }: { item: SearchResult }) => {
    const shortAddress =
      item.address.length > 60
        ? item.address.substring(0, 60) + "..."
        : item.address;

    return (
      <TouchableOpacity
        style={styles.pubCard}
        onPress={() =>
          navigation.navigate("RatePint", {
            pubName: item.name,
            pubAddress: item.address,
            pubId: item.id,
          })
        }
      >
        <View style={styles.pubInfo}>
          <Text style={styles.pubName}>{item.name}</Text>
          <Text style={styles.pubAddress}>{shortAddress}</Text>
          <View style={styles.pubMeta}>
            {item.avgRating !== null ? (
              <>
                <Text style={styles.pubRating}>
                  {item.avgRating.toFixed(1)} / 10
                </Text>
                <Text style={styles.pubReviews}>
                  {item.numRatings}{" "}
                  {item.numRatings === 1 ? "rating" : "ratings"}
                </Text>
              </>
            ) : (
              <Text style={styles.pubNoRating}>No ratings yet</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Image
            source={icons.search2}
            resizeMode="contain"
            style={styles.searchIcon}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search for a bar or pub..."
          placeholderTextColor="#999"
          autoCorrect={false}
          color={COLORS.white}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setResults([]);
            }}
          >
            <Text style={styles.clearButton}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      <View>
        <View style={styles.resultContainer}>
          {searchQuery.trim().length >= 2 ? (
            <>
              <View style={styles.resultLeftView}>
                <Text style={styles.subtitle}>Results for "</Text>
                <Text style={styles.subtitle}>{searchQuery}</Text>
                <Text style={styles.subtitle}>"</Text>
              </View>
              <Text style={styles.subResult}>{results.length} found</Text>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Bars & pubs near you</Text>
              <Text style={styles.subResult}>{nearbyPubs.length} found</Text>
            </>
          )}
        </View>

        <View style={{ marginVertical: 16 }}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : displayData.length > 0 ? (
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id}
              renderItem={renderPubItem}
            />
          ) : (
            <NotFoundCard />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    height: 50,
    width: SIZES.width - 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    height: 20,
    width: 20,
    tintColor: "#999",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginHorizontal: 8,
    color: COLORS.white,
  },
  clearButton: {
    fontSize: 16,
    color: "#999",
    paddingHorizontal: 8,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SIZES.width - 32,
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.black,
  },
  subResult: {
    fontSize: 14,
    fontFamily: "semiBold",
    color: COLORS.primary,
  },
  resultLeftView: {
    flexDirection: "row",
  },
  pubCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pubInfo: {
    flex: 1,
  },
  pubName: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  pubAddress: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayScale800,
    marginBottom: 8,
  },
  pubMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  pubRating: {
    fontSize: 14,
    fontFamily: "semiBold",
    color: COLORS.primary,
    marginRight: 16,
  },
  pubReviews: {
    fontSize: 13,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  pubNoRating: {
    fontSize: 13,
    fontFamily: "regular",
    color: COLORS.grayScale800,
    fontStyle: "italic",
  },
});

export default MartiniSearch;
