
import React from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const NetflixHeader = () => {
  const { setTheme } = useTheme();
  
  // Set to dark theme for Netflix look
  React.useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 md:px-16 py-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Netflix Logo */}
          <div className="text-red-600 text-2xl font-bold">
            NETFLIX
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
          </nav>
        </div>

        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Profile Avatar */}
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-sm font-semibold">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NetflixHeader;
