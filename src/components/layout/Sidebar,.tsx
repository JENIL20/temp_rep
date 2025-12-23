import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  // Dynamic classes for active links
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `rounded px-3 py-2 transition-colors ${isActive
      ? "bg-primary-navy-light text-secondary-gold font-semibold"
      : "text-white hover:bg-primary-navy-light"
    }`;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden p-2 m-2 text-primary-navy border border-primary-navy rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-primary-navy text-white
         z-50 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-secondary-gold mb-6">
            {/* Left Side — Logo */}
            <NavLink to="/" className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span className="text-secondary-gold font-bold text-lg">LMS</span>
            </NavLink>
          </h2>

          <nav className="flex flex-col gap-2">

            {/* Dashboard */}
            <NavLink to="/dashboard" className={linkClasses}>
              Dashboard
            </NavLink>

            {/* Courses */}
            <NavLink to="/courses" className={linkClasses}>
              Courses
            </NavLink>

            {/* My Courses */}
            <NavLink to="/my-courses" className={linkClasses}>
              My Courses
            </NavLink>

            {/* Categories */}
            <NavLink to="/categories" className={linkClasses}>
              Categories
            </NavLink>

            {/* Certificates */}
            <NavLink to="/certificates" className={linkClasses}>
              Certificates
            </NavLink>

            {/* Roles Management */}
            <NavLink to="/admin/roles" className={linkClasses}>
              Roles & Permissions
            </NavLink>

            {/* Projects */}
            <NavLink to="/projects" className={linkClasses}>
              Projects
            </NavLink>

            {/* Settings */}
            <NavLink to="/settings" className={linkClasses}>
              Settings
            </NavLink>

          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
