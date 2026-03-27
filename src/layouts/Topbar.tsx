import { useState, useRef, useEffect } from "react";
import { Bell, LogOutIcon, Settings, UserCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import StatusDialog from "../components/ui/StatusDialog";
import Button from "../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../api/profileApi";
import { useQueryClient } from "@tanstack/react-query";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [dialog, setdialog] = useState(false);
  const role = useSelector((state: any) => state.auth.role);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const BASE_URL = import.meta.env.VITE_PROFILE_URL;

  const apiImage = data?.data?.client?.profile_image;

  const imageUrl = apiImage
    ? apiImage.startsWith("http")
      ? apiImage
      : `${BASE_URL}/${apiImage}`
    : "/assets/images/avatar.png";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileRedirect = () => {
    if (role === "coach") {
      navigate("/coach/profile");
    } else if (role === "client") {
      navigate("/client/profile");
    }
  };

  const auth = useSelector((state: RootState) => state.auth);

  const name = auth.name || sessionStorage.getItem("name");
  const email = auth.email || sessionStorage.getItem("email");


const handleLogout = () => {
  
  queryClient.clear();
  sessionStorage.clear();
  dispatch(logout());
  navigate("/login", { replace: true });
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="py-4 flex items-center justify-end px-6 gap-3 relative">
        {/* Search */}
        <input
          placeholder="Search for anything"
          className="bg-[#0F141A] border border-[#30363F] rounded-lg px-4 py-2 w-80 text-sm outline-none"
        />

        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-300" size={22} />

          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-primary" />
        </div>

        {/* Profile */}
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-white">{name}</p>

              <p className="text-xs text-gray-400">{email}</p>
            </div>

            <div className="w-10 h-10 rounded-full border border-borderColor p-1">
              <img
                src={imageUrl}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-4 w-56 bg-[#0F141A] border border-[#30363F] rounded-lg shadow-lg z-10">
              <button
                onClick={handleProfileRedirect}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#151A21] text-gray-300 flex gap-2 items-center"
              >
                <UserCircle className="w-5" /> Profile
              </button>

              <button className="w-full text-left px-4 py-3 text-sm hover:bg-[#151A21] text-gray-300 flex gap-2 items-center">
                <Settings className="w-5" /> Settings
              </button>

              <div className="border-t border-[#30363F]" />

              <button
                onClick={() => {
                  setOpen(false);
                  setdialog(true);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#151A21] text-red-400 flex gap-2 items-center "
              >
                <LogOutIcon className="w-5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <StatusDialog
        open={dialog}
        onClose={() => setdialog(false)}
        icon={
          <LogOutIcon className="text-secondary bg-secondary/10 p-6 rounded-full w-20 h-20" />
        }
        title="Confirm Logout"
        description="Are you sure you want to logout from your account?"
        buttonText="Logout"
        onAction={handleLogout}
      >
        <Button
          variant="outlineWhite"
          className="w-full"
          onClick={() => setdialog(false)}
        >
          Cancel
        </Button>
      </StatusDialog>
    </>
  );
}
