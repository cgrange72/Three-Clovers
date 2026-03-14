import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useMemo } from "react";
import { COLORS } from "../constants";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { useRatings } from "@/context/RatingsContext";

type UserLeader = {
  userId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  pintCount: number;
};

const PintLeaders = () => {
  const { colors, dark } = useTheme();
  const { ratings } = useRatings();

  const leaders = useMemo(() => {
    // Get today's date string in local time
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Filter ratings to today only
    const todayRatings = ratings.filter((r) => {
      const dt = new Date(r.created_dt || r.submitted_dt);
      const rDateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      return rDateStr === todayStr;
    });

    // Group by user
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
        });
      }
      userMap.get(uid)!.pintCount += 1;
    });

    return Array.from(userMap.values()).sort((a, b) => b.pintCount - a.pintCount);
  }, [ratings]);

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

  const renderLeader = ({ item, index }: { item: UserLeader; index: number }) => (
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
        </View>
        <View style={styles.countSection}>
          <Text
            style={[
              styles.pintCount,
              { color: index === 0 ? "#FFD700" : COLORS.primary },
            ]}
          >
            {item.pintCount}
          </Text>
          <Text
            style={[
              styles.pintLabel,
              { color: dark ? COLORS.secondaryWhite : COLORS.grayScale800 },
            ]}
          >
            {item.pintCount === 1 ? "pint" : "pints"}
          </Text>
        </View>
      </View>
    </View>
  );

  const totalToday = leaders.reduce((sum, l) => sum + l.pintCount, 0);

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
            {totalToday} pints rated today
          </Text>
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
              name="Trophy"
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
    marginBottom: 16,
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
  countSection: {
    alignItems: "center",
    marginLeft: 12,
  },
  pintCount: {
    fontSize: 28,
    fontFamily: "bold",
    color: COLORS.primary,
  },
  pintLabel: {
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
