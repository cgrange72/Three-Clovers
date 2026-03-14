import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useMemo } from "react";
import { COLORS, SIZES } from "../constants";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";
import { useRatings } from "@/context/RatingsContext";
import { PostType } from "@/types/home";

type PubRanking = {
  locationId: number;
  name: string;
  address: string;
  avgRating: number;
  totalRatings: number;
  avgPrice: string;
  topAttributes: { label: string; count: number }[];
  gSplitRate: number;
  ratings: PostType[];
};

const Favorite = ({ navigation }: NavigationProps) => {
  const { colors, dark } = useTheme();
  const { ratings } = useRatings();

  const rankedPubs = useMemo(() => {
    const grouped = new Map<string, PostType[]>();

    ratings.forEach((post) => {
      const key = post.location.name.toLowerCase().trim();
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(post);
    });

    const pubs: PubRanking[] = [];

    grouped.forEach((posts, key) => {
      const avgRating =
        posts.reduce((sum, p) => sum + p.rating, 0) / posts.length;

      const prices = posts
        .map((p) => parseFloat(p.price))
        .filter((p) => !isNaN(p) && p > 0);
      const avgPrice =
        prices.length > 0
          ? (prices.reduce((s, p) => s + p, 0) / prices.length).toFixed(2)
          : "";

      // Count attribute occurrences
      const attrCounts = new Map<string, number>();
      posts.forEach((p) => {
        if (p.temperature) {
          const label = p.temperature;
          attrCounts.set(label, (attrCounts.get(label) || 0) + 1);
        }
        if (p.head) {
          const label = `${p.head} Head`;
          attrCounts.set(label, (attrCounts.get(label) || 0) + 1);
        }
        if (p.creaminess) {
          attrCounts.set(
            p.creaminess,
            (attrCounts.get(p.creaminess) || 0) + 1
          );
        }
        if (p.settling) {
          const label = `${p.settling} Setting`;
          attrCounts.set(label, (attrCounts.get(label) || 0) + 1);
        }
      });

      const topAttributes = Array.from(attrCounts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      const gSplitCount = posts.filter((p) => p.gSplit).length;
      const gSplitRate = gSplitCount / posts.length;

      pubs.push({
        locationId: posts[0].location.id,
        name: posts[0].location.name,
        address: posts[0].location.address,
        avgRating,
        totalRatings: posts.length,
        avgPrice,
        topAttributes,
        gSplitRate,
        ratings: posts,
      });
    });

    pubs.sort((a, b) => b.avgRating - a.avgRating);
    return pubs;
  }, [ratings]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text
          style={[
            styles.headerTitle,
            { color: dark ? COLORS.white : COLORS.grayScale900 },
          ]}
        >
          Best Pints
        </Text>
      </View>
      <Text
        style={[
          styles.headerSubtitle,
          { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
        ]}
      >
        {rankedPubs.length} pubs ranked
      </Text>
    </View>
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "#2ecc71";
    if (rating >= 6) return "#f1c40f";
    if (rating >= 4) return "#e67e22";
    return "#e74c3c";
  };

  const renderPubItem = ({
    item,
    index,
  }: {
    item: PubRanking;
    index: number;
  }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankNumber,
              { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
            ]}
          >
            #{index + 1}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.pubName,
              { color: dark ? COLORS.white : COLORS.black },
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.pubAddress}>{item.address}</Text>
        </View>
        <View
          style={[
            styles.ratingBadge,
            { backgroundColor: getRatingColor(item.avgRating) },
          ]}
        >
          <Text style={styles.ratingText}>{item.avgRating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <AntDesign
            name="star"
            size={14}
            color={dark ? COLORS.secondaryWhite : COLORS.grayScale800}
          />
          <Text
            style={[
              styles.statText,
              { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
            ]}
          >
            {item.totalRatings} {item.totalRatings === 1 ? "rating" : "ratings"}
          </Text>
        </View>
        {item.avgPrice ? (
          <View style={styles.statItem}>
            <AntDesign
              name="wallet"
              size={14}
              color={dark ? COLORS.secondaryWhite : COLORS.grayScale800}
            />
            <Text
              style={[
                styles.statText,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              Avg ${item.avgPrice}
            </Text>
          </View>
        ) : null}
        {item.gSplitRate > 0 ? (
          <View style={styles.statItem}>
            <AntDesign
              name="checkcircle"
              size={14}
              color="#2ecc71"
            />
            <Text
              style={[
                styles.statText,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              {Math.round(item.gSplitRate * 100)}% G Split
            </Text>
          </View>
        ) : null}
      </View>

      {item.topAttributes.length > 0 && (
        <View style={styles.detailsRow}>
          {item.topAttributes.map((attr) => (
            <View key={attr.label} style={styles.tag}>
              <Text style={styles.tagText}>{attr.label}</Text>
              {item.totalRatings > 1 && (
                <Text style={styles.tagCount}> ({attr.count})</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.area, { backgroundColor: colors.background }]}
    >
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {renderHeader()}
        {rankedPubs.length > 0 ? (
          <FlatList
            data={rankedPubs}
            keyExtractor={(item) => item.name}
            renderItem={renderPubItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              No ratings yet. Go rate some pints!
            </Text>
          </View>
        )}
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "bold",
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rankContainer: {
    width: 36,
    alignItems: "center",
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.grayScale800,
  },
  pubName: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  pubAddress: {
    fontSize: 13,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  ratingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontFamily: "medium",
    color: COLORS.grayScale800,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grayscale100,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "medium",
    color: COLORS.grayScale800,
  },
  tagCount: {
    fontSize: 11,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
});

export default Favorite;
