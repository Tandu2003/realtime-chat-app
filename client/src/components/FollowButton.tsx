"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { login } from "@/redux/slices/userSlice";
import UserService from "@/services/user";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      const data = await UserService.followUser(userId);
      
      // Update the follow state based on the response
      setFollowing(data.isFollowing);
      
      // Update the current user in Redux with new following list
      if (data.currentUser) {
        dispatch(login(data.currentUser));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={following ? "secondary" : "default"}
      className={following ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : ""}
    >
      {loading ? "Processing..." : following ? "Following" : "Follow"}
    </Button>
  );
}
