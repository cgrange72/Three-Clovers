import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PostType } from "@/types/home";
import { posts as seedPosts } from "@/data/rating-posts";
import { useAuth } from "./AuthContext";

type RatingsContextType = {
  ratings: PostType[];
  addRating: (rating: PostType) => void;
  refreshRatings: () => Promise<void>;
};

const RatingsContext = createContext<RatingsContextType>({
  ratings: [],
  addRating: () => {},
  refreshRatings: async () => {},
});

export const useRatings = () => useContext(RatingsContext);

function mapRowToPost(row: any): PostType {
  return {
    ulid: row.id,
    location: {
      id: row.location_id || 0,
      name: row.location_name,
      address: row.location_address || "",
    },
    user: {
      id: row.user_id,
      firstName: row.profiles?.first_name || "User",
      lastName: row.profiles?.last_name || "",
      profilePic: row.profiles?.profile_pic || "",
    },
    rating: parseFloat(row.rating),
    images: row.images || [],
    submitted_dt: row.created_at,
    price: row.price || "",
    temperature: row.temperature || "",
    head: row.head || "",
    creaminess: row.creaminess || "",
    settling: row.settling || "",
    gSplit: row.g_split || false,
    caption: row.caption || "",
    created_dt: row.created_at,
    created_by: row.user_id,
    updated_dt: row.created_at,
    updated_by: row.user_id,
  };
}

export const RatingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [ratings, setRatings] = useState<PostType[]>([]);
  const { session } = useAuth();

  const fetchRatings = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRatings(seedPosts as PostType[]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRatings(data.map(mapRowToPost));
      } else {
        setRatings(seedPosts as PostType[]);
      }
    } catch (e) {
      console.error("Failed to fetch ratings from Supabase:", e);
      setRatings(seedPosts as PostType[]);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings, session]);

  const addRating = useCallback(
    async (rating: PostType) => {
      if (!isSupabaseConfigured) {
        // Offline mode: just add locally
        setRatings((prev) => [rating, ...prev]);
        return;
      }

      if (!session?.user) {
        console.error("Must be logged in to add a rating");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ratings")
          .insert({
            user_id: session.user.id,
            location_name: rating.location.name,
            location_address: rating.location.address,
            location_id: rating.location.id?.toString() || "",
            rating: rating.rating,
            caption: rating.caption,
            price: rating.price,
            temperature: rating.temperature,
            head: rating.head,
            creaminess: rating.creaminess,
            settling: rating.settling,
            g_split: rating.gSplit || false,
            images: rating.images,
          })
          .select("*, profiles(*)")
          .single();

        if (error) throw error;

        if (data) {
          setRatings((prev) => [mapRowToPost(data), ...prev]);
        }
      } catch (e) {
        console.error("Failed to save rating to Supabase:", e);
        // Optimistic local add as fallback
        setRatings((prev) => [rating, ...prev]);
      }
    },
    [session]
  );

  return (
    <RatingsContext.Provider value={{ ratings, addRating, refreshRatings: fetchRatings }}>
      {children}
    </RatingsContext.Provider>
  );
};
