
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentItem {
  id: number;
  title: string;
  poster_path: string;
}

interface NetflixContentRowProps {
  title: string;
  items: ContentItem[];
}

const NetflixContentRow = ({ title, items }: NetflixContentRowProps) => {
  const [scrollX, setScrollX] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const scrollAmount = 300;
      const newScrollX = direction === 'left' 
        ? Math.max(0, scrollX - scrollAmount)
        : scrollX + scrollAmount;
      
      container.scrollTo({ left: newScrollX, behavior: 'smooth' });
      setScrollX(newScrollX);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-semibold mb-4 px-4 md:px-16">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Content Container */}
        <div 
          id={`scroll-${title.replace(/\s+/g, '-')}`}
          className="flex space-x-2 overflow-x-auto scrollbar-hide px-4 md:px-16"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex-shrink-0 w-48 h-28 bg-gray-800 rounded cursor-pointer transform hover:scale-105 transition-transform duration-200"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default NetflixContentRow;
