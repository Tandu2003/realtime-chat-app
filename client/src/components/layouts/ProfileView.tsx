"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import FollowButton from "@/components/FollowButton";
import EditProfileForm from "@/components/layouts/EditProfileForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserList from "@/components/UserList";

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

interface ProfileViewProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  currentUser: any;
}

export default function ProfileView({ profile, isOwnProfile, currentUser }: ProfileViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("followers");
  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState<"followers" | "following">("followers");

  const handleBackClick = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleViewFollowers = () => {
    setUserListType("followers");
    setShowUserList(true);
  };

  const handleViewFollowing = () => {
    setUserListType("following");
    setShowUserList(true);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBackClick}
      >
        ← Back
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Profile</CardTitle>
            {isOwnProfile && !isEditing && (
              <Button onClick={handleEditToggle}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditing && isOwnProfile ? (
            <EditProfileForm 
              profile={profile} 
              onCancel={handleEditToggle}
              onSuccess={handleEditToggle}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profilePicture || "/default-avatar.png"} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-gray-500">@{profile.username}</p>
                  {profile.bio && <p className="text-gray-700">{profile.bio}</p>}
                  
                  {!isOwnProfile && (
                    <div className="mt-4">
                      <FollowButton 
                        userId={profile._id}
                        isFollowing={currentUser.following.includes(profile._id)}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-around pt-4 border-t">
                <button 
                  onClick={handleViewFollowers}
                  className="text-center"
                >
                  <div className="font-bold text-xl">{profile.followers.length}</div>
                  <div className="text-gray-500">Followers</div>
                </button>
                
                <button 
                  onClick={handleViewFollowing}
                  className="text-center"
                >
                  <div className="font-bold text-xl">{profile.following.length}</div>
                  <div className="text-gray-500">Following</div>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showUserList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">
                {userListType === "followers" ? "Followers" : "Following"}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUserList(false)}
              >
                ✕
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <UserList 
                userIds={userListType === "followers" ? profile.followers : profile.following}
                emptyMessage={
                  userListType === "followers" 
                    ? "No followers yet"
                    : "Not following anyone yet"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
