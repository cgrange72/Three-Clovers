import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-virtualized-view";
import { images, COLORS, SIZES, icons } from "../constants";
import { AntDesign } from "@expo/vector-icons";
import { PostType } from "@/types/home";
import { useRatings } from "@/context/RatingsContext";
import { useTheme } from "@/theme/ThemeProvider";
import { NavigationProps } from "@/types/navigation";

const Home = ({ navigation }: NavigationProps) => {
  const { dark, colors } = useTheme();
  const { ratings: posts } = useRatings();

  const renderPostItem = ({ item }: { item: PostType }) => {
    const getPriceCategory = (price: number) => {
      if (price < 8) return "$";
      if (price < 12) return "$$";
      if (price < 18) return "$$$";
      return "$$$$";
    };

    return (
      <View style={[styles.postContainer, item.gSplit && { backgroundColor: "#169b62" }]}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profilePic }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>
              {item.user.firstName} {item.user.lastName}
            </Text>
            <Text style={styles.location}>
              {item.location.name}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingText}>{parseFloat(item.rating.toFixed(1))}</Text>
              <View
                style={[
                  styles.ratingProgress,
                  { transform: [{ rotate: `${(parseFloat(item.rating.toFixed(1)) / 10) * 360}deg` }] },
                ]}
              />
            </View>
          </View>
        </View>
        {item.images && item.images.length > 0 && item.images[0].image ? (
          <Image
            source={{ uri: item.images[0].image }}
            style={styles.postImage}
            onError={(error) => {
              console.error("Image Load Error:", error.nativeEvent.error);
            }}
          />
        ) : null}
        <View style={styles.dateAndPriceContainer}>
          <Text style={styles.priceCategory}>
            {getPriceCategory(Number(item.price))}
          </Text>
          <Text style={styles.createdDate}>
            {new Date(item.created_dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <View style={styles.detailsContainer}>
          {item.temperature && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.temperature}</Text>
            </View>
          )}
          {item.head && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.head} Head</Text>
            </View>
          )}
          {item.creaminess && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.creaminess}</Text>
            </View>
          )}
          {item.settling && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.settling} Setting</Text>
            </View>
          )}
          {item.gSplit && (
            <View style={styles.detailItem}>
              <AntDesign name="checkcircle" size={16} color="#2ecc71" />
              <Text style={[styles.detailText, { color: "#2ecc71", marginLeft: 4 }]}>G Split</Text>
            </View>
          )}
        </View>
        <View style={styles.commentsAndDateContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Comments", { postId: item.ulid })}
          >
            <Text style={styles.comments}>View Comments</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: dark ? COLORS.white : COLORS.black }]}>
          🍺 Three Clovers 🍺
        </Text>
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.ulid.toString()}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "bold",
    textAlign: "center",
    paddingVertical: 16,
  },
  postContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.black,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  caption: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayScale900,
    marginBottom: 8,
  },
  comments: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.primary,
  },
  ratingContainer: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'gold',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  ratingProgress: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'gold',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  imageIndicator: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayscale700, // Corrected property name
    textAlign: 'center',
    marginVertical: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  detailItem: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayScale900,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayScale900,
  },
  createdDate: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayScale900,
  },
  priceAndDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    fontFamily: "italic",
    color: COLORS.grayscale700, // Corrected property name
    marginBottom: 8,
  },
  commentsAndDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCategory: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayScale900,
  },
  dateAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Adjust as needed
  },
});

export default Home;
