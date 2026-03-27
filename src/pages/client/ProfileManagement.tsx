import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  getProfile,
  updateProfile,
  updatePassword,
} from "../../api/profileApi";

import Input from "../../components/ui/Input";
import { IdCardIcon, ShieldAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";

export default function ProfileManagement() {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const dispatch = useDispatch();
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState<any>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* =========================
     FETCH PROFILE
  ========================= */
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (data?.data?.client && !initialized) {
      const client = data.data.client;

      const { profile_image, ...restClient } = client;

      setForm({
        ...restClient,
        profile_image: null, // ❗ never inject string
      });

      const BASE_URL = import.meta.env.VITE_PROFILE_URL;

      setAvatarPreview(profile_image ? `${BASE_URL}${profile_image}` : null);

      setInitialized(true); // ✅ STOP future overwrites
    }
  }, [data, initialized]);

  /* =========================
     UPDATE PROFILE
  ========================= */

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      toast.success("Profile updated");

      // backend image (important)
      const imageFromApi = res?.data?.profile_image;

      const updatedUser = {
        name: form.name,
        email: form.email,
        profile_image: imageFromApi || avatarPreview, // fallback
      };

      // ✅ update sessionStorage (individual keys because your slice uses them)
      sessionStorage.setItem("name", updatedUser.name);
      sessionStorage.setItem("email", updatedUser.email);
      sessionStorage.setItem("profile_image", updatedUser.profile_image || "");

      // ✅ update redux
      dispatch(setUser(updatedUser));
    },
    onError: () => {
      toast.error("Failed to update profile!");
    },
  });

  /* =========================
     UPDATE PASSWORD
  ========================= */
 const passwordMutation = useMutation({
  mutationFn: updatePassword,

  onSuccess: () => {
    toast.success("Password updated. Please login again.");
    sessionStorage.clear();
    window.location.href = "/login";
  },

  onError: (error: any) => {
    const message =
      error?.response?.data?.message ||
      "Something went wrong. Try again.";

    toast.error(message);
  },
});

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: any) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleAvatar = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    setForm((prev: any) => ({
      ...prev,
      profile_image: file,
    }));
  };

  const handleSaveProfile = () => {
    console.log("IMAGE BEFORE SEND:", form.profile_image);
    updateMutation.mutate(form);
  };

  const handleSavePassword = () => {
  if (!password.oldPassword) {
    toast.error("Old password is required");
    return;
  }

  if (!password.newPassword) {
    toast.error("New password is required");
    return;
  }

  if (!password.confirmPassword) {
    toast.error("Confirm password is required");
    return;
  }

  if (password.newPassword !== password.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  passwordMutation.mutate({
    oldPassword: password.oldPassword,
    newPassword: password.newPassword,
    confirmPassword: password.confirmPassword,
  });
};


 

  return (
    <>
      <div className="">
        {/* HEADER TABS */}
        <div className="mb-6 border-b border-[#2A3441] flex gap-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm flex items-center gap-2 ${
              activeTab === "general"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400"
            }`}
          >
            <IdCardIcon size={16} />
            General
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 text-sm flex items-center gap-2 ${
              activeTab === "security"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400"
            }`}
          >
            <ShieldAlert size={16} />
            Security
          </button>
        </div>

        {/* ================= GENERAL ================= */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* AVATAR CARD */}
            <Card className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-[#1A222C] mb-4 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Photo</span>
                )}
              </div>

              <input
                type="file"
                id="avatarUpload"
                onChange={handleAvatar}
                className="hidden"
              />

              <label
                htmlFor="avatarUpload"
                className="cursor-pointer inline-block px-4 py-2 text-sm rounded-md border border-[#2A3441] text-gray-300 hover:border-yellow-400 hover:text-white transition"
              >
                Upload photo
              </label>

              <p className="text-xs text-gray-500 mt-3">
                Allowed *.jpeg, *.jpg, *.png, *.gif <br />
                Max size of 3.1 MB
              </p>
            </Card>

            {/* FORM CARD */}
            <Card className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 gap-x-6">
                <Input
                  label="Name"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  showIcon={false}
                />

                <Input
                  label="Email"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled
                  showIcon={false}
                />

                <Input
                  label="Phone number"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  showIcon={false}
                />

                <Input
                  label="Address"
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  placeholder="Enter address"
                  showIcon={false}
                />

                <Input
                  label="Country"
                  name="country"
                  value={form.country || ""}
                  onChange={handleChange}
                  placeholder="Enter country"
                  showIcon={false}
                />

                <Input
                  label="State/region"
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                  placeholder="Enter state"
                  showIcon={false}
                />

                <Input
                  label="City"
                  name="city"
                  value={form.city || ""}
                  onChange={handleChange}
                  placeholder="Enter city"
                  showIcon={false}
                />

                <Input
                  label="Zip/code"
                  name="zip_code"
                  value={form.zip_code || ""}
                  onChange={handleChange}
                  placeholder="Enter zip code"
                  showIcon={false}
                />
              </div>

              <div className="mt-2 flex justify-start">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ================= SECURITY ================= */}
        {activeTab === "security" && (
          <Card className="mx-auto">
            <div className="space-y-5">
              <Input
                name="oldPassword"
                value={password.oldPassword}
                onChange={handlePasswordChange}
                type="password"
                placeholder="Enter your old password"
              />
              <Input
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                type="password"
                placeholder="Enter your New password"
              />
              <Input
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                type="password"
                placeholder="Enter your New confirm password"
              />

              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSavePassword}
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending ? "Updating..." : "Save changes"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
