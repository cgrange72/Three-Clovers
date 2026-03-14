import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useRatings } from "@/context/RatingsContext";

type SortMode = "pints" | "gsplits";

type UserLeader = {
  userId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  pintCount: number;
  gSplitCount: number;
};

const PintLeaders = () => {
  const { colors, dark } = useTheme();
  const { ratings } = useRatings();
  const [sortMode, setSortMode] = useState<SortMode>("pints");

  const leaders = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const todayRatings = ratings.filter((r) => {
      const dt = new Date(r.created_dt || r.submitted_dt);
      const rDateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      return rDateStr === todayStr;
    });

    const userMap = new Map<string, UserLeader>();
    todayRatings.forEach((r) => {
      const uid = r.user.id?.toString() || r.created_by?.toString() || "unknown";
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          userId: uid,
          firstName: r.user.firstName || "User",
          lastName: r.user.lastName || "",
          profilePic: r.user.profilePic || "",
          pintCount: 0,
          gSplitCount: 0,
        });
      }
      const entry = userMap.get(uid)!;
      entry.pintCount += 1;
      if (r.gSplit) {
        entry.gSplitCount += 1;
      }
    });

    const list = Array.from(userMap.values());
    if (sortMode === "gsplits") {
      list.sort((a, b) => b.gSplitCount - a.gSplitCount || b.pintCount - a.pintCount);
    } else {
      list.sort((a, b) => b.pintCount - a.pintCount || b.gSplitCount - a.gSplitCount);
    }
    return list;
  }, [ratings, sortMode]);

  const getMedalColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return dark ? COLORS.gray3 : COLORS.grayScale800;
  };

  const getMedalIcon = (index: number): "trophy" | "star" | "staro" => {
    if (index === 0) return "trophy";
    if (index <= 2) return "star";
    return "staro";
  };

  const renderLeader = ({ item, index }: { item: UserLeader; index: number }) => {
    const mainCount = sortMode === "pints" ? item.pintCount : item.gSplitCount;
    const subCount = sortMode === "pints" ? item.gSplitCount : item.pintCount;
    const mainLabel = sortMode === "pints"
      ? (mainCount === 1 ? "pint" : "pints")
      : (mainCount === 1 ? "G split" : "G splits");
    const subLabel = sortMode === "pints"
      ? `${subCount} G split${subCount !== 1 ? "s" : ""}`
      : `${subCount} pint${subCount !== 1 ? "s" : ""}`;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
          index === 0 && styles.firstPlace,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.rankSection}>
            <AntDesign
              name={getMedalIcon(index)}
              size={index === 0 ? 28 : 22}
              color={getMedalColor(index)}
            />
            <Text
              style={[
                styles.rankNumber,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              #{index + 1}
            </Text>
          </View>
          <View style={styles.nameSection}>
            <Text
              style={[
                styles.userName,
                { color: dark ? COLORS.white : COLORS.black },
                index === 0 && styles.firstPlaceName,
              ]}
            >
              {item.firstName} {item.lastName}
            </Text>
            <Text
              style={[
                styles.subStat,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              {subLabel}
            </Text>
          </View>
          <View style={styles.countSection}>
            <Text
              style={[
                styles.countText,
                { color: index === 0 ? "#FFD700" : COLORS.primary },
              ]}
            >
              {mainCount}
            </Text>
            <Text
              style={[
                styles.countLabel,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              {mainLabel}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const totalPints = leaders.reduce((sum, l) => sum + l.pintCount, 0);
  const totalGSplits = leaders.reduce((sum, l) => sum + l.gSplitCount, 0);

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.headerTitle,
              { color: dark ? COLORS.white : COLORS.grayScale900 },
            ]}
          >
            Pint Leaders
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
            ]}
          >
            {totalPints} pints | {totalGSplits} G splits today
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              sortMode === "pints" && styles.toggleActive,
            ]}
            onPress={() => setSortMode("pints")}
          >
            <Text
              style={[
                styles.toggleText,
                sortMode === "pints" && styles.toggleTextActive,
              ]}
            >
              Total Pints
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              sortMode === "gsplits" && styles.toggleActive,
            ]}
            onPress={() => setSortMode("gsplits")}
          >
            <Text
              style={[
                styles.toggleText,
                sortMode === "gsplits" && styles.toggleTextActive,
              ]}
            >
              G Splits
            </Text>
          </TouchableOpacity>
        </View>

        {leaders.length > 0 ? (
          <FlatList
            data={leaders}
            keyExtractor={(item) => item.userId}
            renderItem={renderLeader}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <AntDesign
              name="trophy"
              size={48}
              color={dark ? COLORS.gray3 : COLORS.grayScale800}
            />
            <Text
              style={[
                styles.emptyText,
                { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
              ]}
            >
              No pints rated today yet.{"\n"}Get out there!
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
    marginBottom: 12,
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
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.grayscale100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "semiBold",
    color: COLORS.grayScale800,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  firstPlace: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankSection: {
    alignItems: "center",
    width: 44,
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 13,
    fontFamily: "medium",
    marginTop: 2,
  },
  nameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.black,
  },
  firstPlaceName: {
    fontSize: 20,
  },
  subStat: {
    fontSize: 13,
    fontFamily: "regular",
    marginTop: 2,
  },
  countSection: {
    alignItems: "center",
    marginLeft: 12,
  },
  countText: {
    fontSize: 28,
    fontFamily: "bold",
    color: COLORS.primary,
  },
  countLabel: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayScale800,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.grayScale800,
    textAlign: "center",
  },
});

export default PintLeaders;
