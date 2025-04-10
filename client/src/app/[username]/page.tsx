"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ProfileView from "@/components/layouts/ProfileView";
import RequireAuth from "@/components/layouts/RequireAuth";
import { RootState } from "@/redux/store";
import UserService from "@/services/user";

interface UserProfile {
  _id: string;
  username: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
}

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = useSelector((state: RootState) => state.user);
  const isOwnProfile = currentUser.username === username;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await UserService.getUserByUsername(username);
        setProfile(userData);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  return (
    <RequireAuth>
      <div className="bg-gray-100 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-red-500">Error</h2>
              <p className="mt-2 text-gray-600">{error}</p>
            </div>
          </div>
        ) : profile ? (
          <ProfileView 
            profile={profile} 
            isOwnProfile={isOwnProfile} 
            currentUser={currentUser} 
          />
        ) : null}
      </div>
    </RequireAuth>
  );
}
