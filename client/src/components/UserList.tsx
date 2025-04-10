"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserService from "@/services/user";

interface User {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

interface UserListProps {
  userIds: string[];
  emptyMessage: string;
}

export default function UserList({ userIds, emptyMessage }: UserListProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userIds.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const usersData = await Promise.all(
          userIds.map(id => UserService.getUserById(id))
        );
        setUsers(usersData);
      } catch (err: any) {
        setError("Failed to load users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userIds]);

  const handleUserClick = (username: string) => {
    router.push(`/${username}`);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {users.map(user => (
        <li 
          key={user._id}
          onClick={() => handleUserClick(user.username)}
          className="p-4 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture || "/default-avatar.png"} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
