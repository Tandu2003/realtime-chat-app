"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { login } from "@/redux/slices/userSlice";
import UserService from "@/services/user";

interface EditProfileFormProps {
  profile: {
    _id: string;
    name: string;
    username: string;
    email: string;
    profilePicture?: string;
    bio?: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({ profile, onCancel, onSuccess }: EditProfileFormProps) {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || "",
    profilePicture: profile.profilePicture || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await UserService.updateProfile(formData);
      dispatch(login(updatedUser));
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell something about yourself..."
          className="resize-none h-24"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture URL</Label>
        <Input
          id="profilePicture"
          name="profilePicture"
          type="url"
          value={formData.profilePicture}
          onChange={handleChange}
          placeholder="https://example.com/your-image.jpg"
        />
        
        {formData.profilePicture && (
          <div className="mt-2 border rounded-md p-2">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <img 
              src={formData.profilePicture}
              alt="Profile preview"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
