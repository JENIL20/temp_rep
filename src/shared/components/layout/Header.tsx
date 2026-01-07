import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../store";
import { logout } from "../../../domains/auth/store/authSlice";
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 w-full px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        {/* Left Side — Search & Toggle */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:block w-full">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-navy transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search courses, lessons, or resources..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-primary-navy/20 focus:ring-4 focus:ring-primary-navy/5 rounded-xl text-sm transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Side — Actions & Profile */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notifications</p>
              <p className="text-sm text-gray-600">No new notifications</p>
            </div>
          </button>

          <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block" />

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-3 p-1 pr-3 hover:bg-gray-100 rounded-2xl transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={user?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  className="w-9 h-9 rounded-xl border-2 border-white shadow-md object-cover"
                  alt={user?.name}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-primary-navy leading-none mb-0.5">{user?.name || "User"}</p>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{user?.role || "Student"}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 bg-white w-56 shadow-2xl rounded-2xl border border-gray-100 py-2 text-sm z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="font-bold text-primary-navy">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <Link
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-primary-navy hover:bg-primary-navy/5 transition-colors"
                  to="/profile"
                  onClick={() => setOpen(false)}
                >
                  <User size={18} />
                  Profile
                </Link>
                <Link
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-primary-navy hover:bg-primary-navy/5 transition-colors"
                  to="/settings"
                  onClick={() => setOpen(false)}
                >
                  <Settings size={18} />
                  Settings
                </Link>

                <div className="h-[1px] bg-gray-50 my-1" />

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
