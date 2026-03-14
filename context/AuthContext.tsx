import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  profile_pic: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isOffline: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfilePic: (uri: string) => Promise<{ error: string | null }>;
};

const offlineProfile: Profile = {
  id: "local",
  first_name: "Guest",
  last_name: "",
  profile_pic: "",
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isOffline: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfilePic: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(
    isSupabaseConfigured ? null : offlineProfile
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null }; // Offline mode: skip auth
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setSession(data.session);
      if (data.session.user) {
        fetchProfile(data.session.user.id);
      }
    }
    return { error: error?.message || null };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.session) {
      setSession(data.session);
      if (data.session.user) {
        fetchProfile(data.session.user.id);
      }
    }
    return { error: error?.message || null };
  }, [fetchProfile]);

  const updateProfilePic = useCallback(async (uri: string) => {
    if (!isSupabaseConfigured || !session?.user) {
      return { error: "Not authenticated" };
    }

    try {
      const userId = session.user.id;
      const filePath = `${userId}/avatar.jpg`;

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) return { error: uploadError.message };

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl + "?t=" + Date.now();

      // Update profile record
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic: publicUrl })
        .eq("id", userId);

      if (updateError) return { error: updateError.message };

      // Update local state
      setProfile((prev) => prev ? { ...prev, profile_pic: publicUrl } : prev);

      return { error: null };
    } catch (e: any) {
      return { error: e.message || "Failed to upload profile picture" };
    }
  }, [session]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        isOffline: !isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
