"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import UserService from "@/services/user";

interface User {
  _id: string;
  username?: string;
  name: string;
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
          onFocus={() => setShowResults(true)}
          className="h-10 w-full rounded-xl border-gray-200 bg-gray-50 pl-9 pr-9 shadow-sm transition-colors focus:border-blue-400 focus:ring-blue-100"
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="py-1.5">
              {searchResults.map((user) => (
                <li key={user._id}>
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-gray-50">
                      <AvatarImage
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        @{user.username || user.email.split("@")[0]}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery ? (
            <div className="p-4 text-center text-gray-500">
              <p>Không tìm thấy người dùng</p>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Nhập tên để tìm kiếm</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
