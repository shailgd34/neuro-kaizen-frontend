import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  getProfile,
  updateProfile,
  updatePassword,
} from "../../api/profileApi";

import Input from "../../components/ui/Input";
import { IdCardIcon, ShieldAlert, BadgeCheck, UploadCloud, Settings, Lock } from "lucide-react";
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
    <div className="mx-auto px-6 lg:px-10 py-8 animate-in fade-in zoom-in-95 duration-1000">
      {/* HEADER TABS & HERO */}
      <div className="relative mb-10 pb-8 border-b border-white/5">
        <div className="absolute top-0 right-10 w-64 h-64 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-widest mb-2">
              <Settings className="w-4 h-4" /> Account Settings
            </div>
            <h4 className="text-3xl text-white font-bold tracking-tight">
              Profile <span className="text-secondary">Management</span>
            </h4>
            <p className="text-gray-400 text-sm mt-2 max-w-xl leading-relaxed">
              Update your personal details, secure your account, and manage your neural tracking preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SIDEBAR TABS */}
        <Card className="w-full lg:w-64 shrink-0 p-3 bg-white/[0.02] border-white/5 space-y-2 lg:sticky lg:top-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "general"
                ? "bg-secondary/10 text-secondary border border-secondary/20 shadow-inner"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <IdCardIcon size={18} className={activeTab === "general" ? "text-secondary" : "opacity-70"} />
            General Info
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "security"
                ? "bg-secondary/10 text-secondary border border-secondary/20 shadow-inner"
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <ShieldAlert size={18} className={activeTab === "security" ? "text-secondary" : "opacity-70"} />
            Security & Login
          </button>
        </Card>

        {/* ================= GENERAL ================= */}
        {activeTab === "general" && (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 w-full">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
              
              {/* FORM CARD */}
              <Card className="bg-[#0B0E14] border-white/5 shadow-2xl relative overflow-hidden order-2 xl:order-1">
                <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-transparent via-secondary/20 to-transparent" />
                
                <div className="mb-6 pb-4 border-b border-white/5">
                  <h5 className="text-white font-bold text-lg">Personal Details</h5>
                  <p className="text-gray-500 text-xs mt-1">Keep your contact information up to date.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    showIcon={false}
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled
                    showIcon={false}
                  />

                  <Input
                    label="Phone Number"
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
                    label="State / Region"
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
                    label="ZIP Code"
                    name="zip_code"
                    value={form.zip_code || ""}
                    onChange={handleChange}
                    placeholder="Enter zip code"
                    showIcon={false}
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <Button
                    variant="goldDark"
                    onClick={handleSaveProfile}
                    disabled={updateMutation.isPending}
                    className="min-w-40 h-11 text-sm font-bold shadow-lg"
                  >
                    {updateMutation.isPending && (
                      <span className="w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>

              {/* AVATAR CARD */}
              <Card className="text-center bg-white/[0.02] border-white/5 order-1 xl:order-2 self-start flex flex-col items-center">
                <div className="relative group w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-secondary/20 blur-xl group-hover:bg-secondary/40 transition-all duration-500 rounded-full" />
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A0D11] border-2 border-white/10 group-hover:border-secondary/50 transition-colors flex items-center justify-center shadow-xl">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <IdCardIcon className="w-10 h-10 text-gray-600" />
                    )}
                  </div>
                  {form.name && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#0F172A] flex items-center justify-center shrink-0 shadow-lg">
                      <BadgeCheck size={16} className="text-white" />
                    </div>
                  )}
                </div>

                <h6 className="text-white font-bold mb-1">{form.name || "User Profile"}</h6>
                <p className="text-secondary text-xs font-medium mb-6 uppercase tracking-wider">{form.email || "Active User"}</p>

                <input type="file" id="avatarUpload" onChange={handleAvatar} className="hidden" accept="image/png, image/jpeg, image/gif" />

                <label
                  htmlFor="avatarUpload"
                  className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-secondary/30 transition-all hover:text-secondary group"
                >
                  <UploadCloud size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  Upload Photo
                </label>

                <p className="text-[10px] text-gray-500 mt-4 font-medium uppercase tracking-widest leading-relaxed">
                  Allowed JPEG, PNG, GIF.<br />Max size 3.1 MB.
                </p>
              </Card>

            </div>
          </div>
        )}

        {/* ================= SECURITY ================= */}
        {activeTab === "security" && (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl w-full">
            <Card className="bg-[#0B0E14] border-white/5 shadow-2xl relative overflow-hidden">
              
              <div className="mb-8 pb-4 border-b border-white/5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-lg">Change Password</h5>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    Ensure your account is using a long, random password to stay secure. 
                    You will be required to log in again after updating your password.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white text-sm font-semibold mb-3">Current Password</p>
                  <Input
                    name="oldPassword"
                    value={password.oldPassword}
                    onChange={handlePasswordChange}
                    type="password"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-white text-sm font-semibold mb-3">New Password</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="newPassword"
                      value={password.newPassword}
                      onChange={handlePasswordChange}
                      type="password"
                      placeholder="Enter new password"
                    />
                    <Input
                      name="confirmPassword"
                      value={password.confirmPassword}
                      onChange={handlePasswordChange}
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button
                    variant="goldDark"
                    onClick={handleSavePassword}
                    disabled={passwordMutation.isPending}
                    className="min-w-48 h-11 text-sm font-bold"
                  >
                    {passwordMutation.isPending ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="mt-6 p-4 rounded-xl bg-secondary/5 border border-secondary/10 flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Security Check:</strong> Your password must be at least 8 characters long, include a number, and a special character to comply with our security protocols.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
