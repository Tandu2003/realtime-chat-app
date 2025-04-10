"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import UserService from "@/services/user";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

export default function UserSearch({ onSelectUser }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      setIsLoading(true);
      setShowResults(true);
      try {
        const results = await UserService.searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full h-11 pl-10 pr-8 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-100"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="h-5 w-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="py-1.5">
              {searchResults.map((user) => (
                <li key={user._id}>
                  <button
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-gray-50">
                      <AvatarImage
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy người dùng nào
            </div>
          ) : (
            <p className="p-3 text-center text-gray-500">Nhập ít nhất 2 ký tự để tìm kiếm</p>
          )}
        </div>
      )}
    </div>
  );
}
