import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  userName?: string;
  userImage?: string;
  onSignOut?: () => void;
}

const Header = ({ userName = "User", userImage, onSignOut }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-primary-navy w-full px-4 py-3 ">
      <div className="flex items-center justify-end">



        {/* Right Side — Profile */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-2"
          >
            <img
              src={userImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              className="w-7 h-7 rounded-full border border-secondary-gold"
            />
            <span className="text-white font-medium">{userName}</span>

            <svg
              className={`w-4 h-4 text-secondary-gold transition-transform ${open ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 bg-white w-36 shadow-lg rounded-lg border py-2 text-sm">
              <Link className="block px-4 py-2 text-primary-navy hover:bg-secondary-gold/10" to="/profile">
                Profile
              </Link>
              <Link className="block px-4 py-2 text-primary-navy hover:bg-secondary-gold/10" to="/settings">
                Settings
              </Link>
              <button
                onClick={onSignOut}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
