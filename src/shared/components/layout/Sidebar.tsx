import {
  LayoutDashboard,
  User,
  BookOpen,
  Building2,
  Users,
  GraduationCap,
  Layers,
  Award,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store";
import { logout } from "../../../domains/auth/store/authSlice";

import { APP_CONFIG } from "../../../config/app.config";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Dynamic classes for active links
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group whitespace-nowrap ${isActive
      ? "bg-secondary-gold text-primary-navy font-bold shadow-lg shadow-secondary-gold/20 translate-x-1"
      : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
    }`;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/my-courses", label: "My Courses", icon: GraduationCap },
    { to: "/categories", label: "Categories", icon: Layers },
    { to: "/certificates", label: "Certificates", icon: Award },
    { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { to: "/admin/users", label: "Users Management", icon: User },
    { to: "/admin/organizations", label: "Organizations", icon: Building2 },
    { to: "/admin/groups", label: "Study Groups", icon: Users },
    // { to: "/projects", label: "Projects", icon: Briefcase },
    // { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-gradient-to-b from-primary-navy via-primary-navy to-primary-navy-dark text-white
         z-50 transition-all duration-300 ease-in-out border-r border-white/5 shadow-2xl
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none"}`}
      >
        <div className={`flex flex-col h-full p-6 ${!isOpen && "lg:hidden"}`}>
          {/* Logo Section */}
          <div className="mb-10 px-2">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-gold to-secondary-gold-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-primary-navy" strokeWidth={2.5} />
              </div>
              <div className="overflow-hidden">
                <span className="text-white font-black text-2xl tracking-tighter block leading-none">{APP_CONFIG.name}</span>
                <span className="text-secondary-gold text-[10px] font-bold uppercase tracking-[0.2em]">{APP_CONFIG.subtitle}</span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClasses}
                onClick={() => {
                  // Only close on mobile
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              >
                <item.icon size={20} className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                <span className="text-sm tracking-wide">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group whitespace-nowrap"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
