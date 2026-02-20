import React from "react";
import { useUser } from "../../hooks/useUser";
import { supabase } from "../../supabaseClient";
import Starfield from "../../components/Starfield";
import { Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { user } = useUser();
  const [username, setUsername] = React.useState(user?.user_metadata?.username || "");
  const [firstName, setFirstName] = React.useState(user?.user_metadata?.firstName || "");
  const [lastName, setLastName] = React.useState(user?.user_metadata?.lastName || "");
  const [avatar, setAvatar] = React.useState(user?.user_metadata?.avatar || "");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  // Show/hide password toggles
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Upload Avatar to Cloudinary
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "strawberry-avatars");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/diiapd2pv/image/upload",
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (data.secure_url) {
        setAvatar(data.secure_url);

        await supabase.auth.updateUser({ data: { avatar: data.secure_url } });
        setMessage("Avatar updated!");
      }
    } catch {
      setMessage("Error uploading avatar.");
    }
  }

  // Update Profile Fields
  async function handleUpdateProfile() {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({
      data: { username, firstName, lastName },
    });
    setMessage(error ? error.message : "Profile updated successfully!");
  }

  // Change Password
  async function handleChangePassword() {
    if (!user) return;
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 text-white overflow-hidden">
      {/* Starfield + golden aurora rift */}
      <Starfield gradient="from-stone-950 via-neutral-950 to-zinc-950" />

      {/* Glass-card container */}
      <div className="w-full max-w-md bg-gray-950/70 backdrop-blur-xl border border-red-700/40 rounded-2xl p-5 shadow-xl z-10 mt-10">
        <h2 className="text-center text-3xl font-bold text-zinc-100 mb-6 pb-2">Profile Preferences</h2>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatar || ""}
            alt=""
            className="w-27 h-27 rounded-full object-cover border-3 border-red-800 shadow-md mb-1"
          />
          <label className="mt-2 bg-red-800 hover:bg-red-950 shadow-lg active:scale-[.98] transition tracking-wide shadow-red-600/30 font-semibold px-3 py-1 mb-1 rounded-lg cursor-pointer">
            Upload Avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Email (read-only) */}
        <div className="relative mb-4">
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            placeholder=" "
            className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none peer"
          />
          <label className="absolute left-3 px-1 bg-gray-950/70 rounded-md transition-all pointer-events-none top-[-0.55rem] text-xs text-red-300">
            Email
          </label>
        </div>

        {/* Editable Fields */}
        {[
          { label: "Username", value: username, setter: setUsername },
          { label: "First Name", value: firstName, setter: setFirstName },
          { label: "Last Name", value: lastName, setter: setLastName },
        ].map((field) => (
          <div key={field.label} className="relative mb-4">
            <input
              type="text"
              value={field.value}
              placeholder=" "
              onChange={(e) => field.setter(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none peer"
            />
            <label
              className={`absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all pointer-events-none ${
                field.value
                  ? "top-[-0.55rem] text-xs text-red-300"
                  : "top-2.5 text-base"
              } peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-red-300`}
            >
              {field.label}
            </label>
          </div>
        ))}

        <button
          onClick={handleUpdateProfile}
          className="w-full py-1.5 rounded-lg bg-red-800 hover:bg-red-950 active:scale-[.98] transition tracking-wide shadow-lg shadow-red-600/30"
        >
          Save Profile Changes
        </button>

        {/* Password Change Section */}
        <h3 className="text-lg font-semibold mt-6 mb-2 pt-4 pb-2 text-center">Change Password</h3>

        {/* New Password */}
        <div className="relative mb-3">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            placeholder=" "
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none peer"
          />
          <label
            className={`absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all pointer-events-none ${
              newPassword ? "top-[-0.55rem] text-xs text-red-300" : "top-2.5 text-base"
            } peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-red-300`}
          >
            New Password
          </label>
          <button
            type="button"
            onClick={() => setShowNewPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-300 transition"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm New Password */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            placeholder=" "
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-800/60 text-white rounded-lg border border-gray-700 outline-none peer"
          />
          <label
            className={`absolute left-3 px-1 bg-gray-950/70 rounded-md text-gray-400 transition-all pointer-events-none ${
              confirmPassword ? "top-[-0.55rem] text-xs text-red-300" : "top-2.5 text-base"
            } peer-focus:top-[-0.55rem] peer-focus:text-xs peer-focus:text-red-300`}
          >
            Confirm New Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-300 transition"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={handleChangePassword}
          className="w-full py-1.5 rounded-lg bg-red-800 hover:bg-red-950 active:scale-[.98] transition tracking-wide shadow-lg shadow-red-600/30"
        >
          Change Password
        </button>

        {message && <p className="mt-4 pt-2 text-center text-sm text-green-300">{message}</p>}
      </div>
    </div>
  );
}
