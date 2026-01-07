import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { usePageTitle } from "../../hooks/usePageTitle";

function Wrapper() {
  const [shadow, setShadow] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  usePageTitle();

  useEffect(() => {
    const onScroll = () => {
      if (scrollRef.current?.scrollTop! > 0) setShadow(true);
      else setShadow(false);
    };

    scrollRef.current?.addEventListener("scroll", onScroll);
    return () => scrollRef.current?.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Area */}
      <main className="flex-1 flex flex-col bg-gray-100 min-w-0 transition-all duration-300">

        {/* Header */}
        <div
          className={`sticky top-0 z-40 transition-all duration-300 
          ${shadow ? "shadow-md shadow-primary-navy-dark/20" : ""}`}
        >
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Page Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 xl:p-8 bg-gray-50"
        >
          <Outlet />
        </div>

      </main>
    </div>
  );
}

export default Wrapper;
