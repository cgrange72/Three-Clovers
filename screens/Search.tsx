import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Keyboard,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { COLORS, SIZES, icons } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import MartiniMap from "@/components/MartiniMap";
import { PubPin, MapControls } from "@/components/ProviderLocationMap";
import { useRatings } from "@/context/RatingsContext";
import * as Location from "expo-location";

type SearchSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const Search = ({ navigation }: NavigationProps) => {
  const [pubs, setPubs] = useState<PubPin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const { dark, colors } = useTheme();
  const { ratings } = useRatings();
  const mapControlsRef = useRef<MapControls | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLat(loc.coords.latitude);
          setUserLon(loc.coords.longitude);
        }
      } catch {}
    })();
  }, []);

  const handleMapReady = useCallback((controls: MapControls) => {
    mapControlsRef.current = controls;
  }, []);

  const handlePubsChanged = useCallback((newPubs: PubPin[]) => {
    setPubs(newPubs);
  }, []);

  const handlePubPress = useCallback(
    (pub: PubPin) => {
      navigation.navigate("RatePint", {
        pubName: pub.name,
        pubAddress: pub.address || "Nearby",
        pubId: pub.id,
      });
    },
    [navigation]
  );

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const params: Record<string, string> = {
          q: query,
          format: "json",
          limit: "5",
          addressdetails: "1",
        };

        // Bias results toward user's location (roughly 50km box)
        if (userLat !== null && userLon !== null) {
          const delta = 0.135;
          params.viewbox = [
            userLon - delta,
            userLat + delta,
            userLon + delta,
            userLat - delta,
          ].join(",");
          params.bounded = "0"; // prefer but don't restrict
        }

        const url =
          "https://nominatim.openstreetmap.org/search?" +
          new URLSearchParams(params).toString();

        const response = await fetch(url, {
          headers: { "User-Agent": "CreamusMaximus/1.0" },
        });

        if (response.ok) {
          const results = await response.json();
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch (error) {
        console.error("Suggestion error:", error);
      }
    },
    [userLat, userLon]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(text);
      }, 400);
    },
    [fetchSuggestions]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);
      mapControlsRef.current?.animateTo(lat, lon);
      setSearchQuery(suggestion.display_name.split(",")[0]);
      setSuggestions([]);
      setShowSuggestions(false);
      Keyboard.dismiss();
    },
    []
  );

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (query.length < 2) return;
    Keyboard.dismiss();
    setShowSuggestions(false);

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
          q: query,
          format: "json",
          limit: "1",
        }).toString();

      const response = await fetch(url, {
        headers: { "User-Agent": "CreamusMaximus/1.0" },
      });

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          mapControlsRef.current?.animateTo(lat, lon);
        }
      }
    } catch (error) {
      console.error("Geocode error:", error);
    }
  }, [searchQuery]);

  const renderPubItem = ({ item }: { item: PubPin }) => {
    const ratings = ratingMap.get(item.name.toLowerCase());
    const avgRating = ratings ? ratings.total / ratings.count : null;
    const numRatings = ratings ? ratings.count : 0;
    const shortAddress =
      item.address && item.address.length > 50
        ? item.address.substring(0, 50) + "..."
        : item.address || "Nearby";

    return (
      <TouchableOpacity
        style={[
          styles.pubCard,
          { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
        ]}
        onPress={() => handlePubPress(item)}
      >
        <View style={styles.pubInfo}>
          <Text
            style={[
              styles.pubName,
              { color: dark ? COLORS.white : COLORS.black },
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.pubAddress}>{shortAddress}</Text>
          <View style={styles.pubMeta}>
            {avgRating !== null ? (
              <>
                <Text style={styles.pubRating}>
                  {avgRating.toFixed(1)} / 10
                </Text>
                <Text style={styles.pubReviews}>
                  {numRatings} {numRatings === 1 ? "rating" : "ratings"}
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
    <SafeAreaView
      style={[styles.area, { backgroundColor: colors.background }]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.headerTitle,
            { color: dark ? COLORS.white : COLORS.grayScale900 },
          ]}
        >
          Pubs Near You
        </Text>

        <View style={{ zIndex: 10 }}>
          <View style={styles.searchContainer}>
            <TouchableOpacity onPress={handleSearch}>
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
              onSubmitEditing={handleSearch}
              placeholder="Search a city, address, or place..."
              placeholderTextColor="#999"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.clearButton}>X</Text>
              </TouchableOpacity>
            )}
          </View>

          {showSuggestions && (
            <View
              style={[
                styles.suggestionsContainer,
                { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
              ]}
            >
              {suggestions.map((item, index) => {
                const parts = item.display_name.split(",");
                const title = parts[0];
                const subtitle = parts.slice(1, 3).join(",").trim();
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Text
                      style={[
                        styles.suggestionTitle,
                        { color: dark ? COLORS.white : COLORS.black },
                      ]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <MartiniMap
          onPubsChanged={handlePubsChanged}
          onPubPress={handlePubPress}
          onMapReady={handleMapReady}
        />

        <View style={styles.listHeader}>
          <Text
            style={[
              styles.listTitle,
              { color: dark ? COLORS.white : COLORS.black },
            ]}
          >
            {pubs.length} pubs in view
          </Text>
          <Text style={styles.listSubtitle}>Tap to rate</Text>
        </View>

        <FlatList
          data={pubs}
          keyExtractor={(item) => item.id}
          renderItem={renderPubItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    backgroundColor: COLORS.white,
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  searchContainer: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchIcon: {
    height: 18,
    width: 18,
    tintColor: "#999",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginHorizontal: 8,
    color: COLORS.black,
  },
  clearButton: {
    fontSize: 14,
    color: "#999",
    paddingHorizontal: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  suggestionTitle: {
    fontSize: 15,
    fontFamily: "semiBold",
    color: COLORS.black,
  },
  suggestionSubtitle: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayScale800,
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.black,
  },
  listSubtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 100,
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
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  pubAddress: {
    fontSize: 13,
    fontFamily: "regular",
    color: COLORS.grayScale800,
    marginBottom: 6,
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

export default Search;
