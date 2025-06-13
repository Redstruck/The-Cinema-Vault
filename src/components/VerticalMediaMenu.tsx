
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

interface VerticalMediaMenuProps {
  items: MediaItem[];
  onItemSelect?: (item: MediaItem) => void;
}

const VerticalMediaMenu = ({ items, onItemSelect }: VerticalMediaMenuProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  const getTitle = (item: MediaItem) => {
    return item.title || item.name || 'Unknown Title';
  };

  const getReleaseYear = (item: MediaItem) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  const getContentType = (item: MediaItem) => {
    if (item.media_type === 'tv') return 'TV Series';
    return 'Movie';
  };

  const handleItemClick = (item: MediaItem, index: number) => {
    setFocusedIndex(index);
    setIsKeyboardNavigation(false);
    
    if (onItemSelect) {
      onItemSelect(item);
    } else {
      navigate(`/movie/${item.id}`, { 
        state: { media_type: item.media_type } 
      });
    }
  };

  const scrollToItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      
      if (itemRect.top < menuRect.top || itemRect.bottom > menuRect.bottom) {
        item.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setIsKeyboardNavigation(true);
        setFocusedIndex(prev => {
          const newIndex = prev >= items.length - 1 ? 0 : prev + 1;
          scrollToItem(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setIsKeyboardNavigation(true);
        setFocusedIndex(prev => {
          const newIndex = prev <= 0 ? items.length - 1 : prev - 1;
          scrollToItem(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (items[focusedIndex]) {
          handleItemClick(items[focusedIndex], focusedIndex);
        }
        break;
    }
  }, [items, focusedIndex, scrollToItem]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (items.length > 0 && focusedIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, [items, focusedIndex]);

  if (!items.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No movies or TV series available</p>
      </div>
    );
  }

  const featuredItem = items[focusedIndex];

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <div className="flex h-full">
        {/* Featured Content Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/w1280${featuredItem.poster_path}`}
              alt={getTitle(featuredItem)}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                {getContentType(featuredItem)}
              </span>
            </div>
            
            <h1 className="text-6xl font-bold mb-4 leading-tight">
              {getTitle(featuredItem)}
            </h1>
            
            <div className="flex items-center gap-4 mb-4 text-sm">
              {getReleaseYear(featuredItem) && (
                <span className="text-gray-300">{getReleaseYear(featuredItem)}</span>
              )}
              {featuredItem.media_type === 'tv' && <span className="text-gray-300">Limited Series</span>}
              <span className="text-gray-300">TV-MA</span>
            </div>
            
            <p className="text-lg leading-relaxed mb-6 text-gray-200">
              {featuredItem.overview || 'No description available'}
            </p>
            
            {featuredItem.vote_average && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Rating:</span>
                <span className="text-sm font-medium">{featuredItem.vote_average.toFixed(1)}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* Content List */}
        <div 
          ref={menuRef}
          className="w-80 bg-black/90 backdrop-blur-sm overflow-y-auto focus:outline-none"
          tabIndex={0}
          role="listbox"
          aria-label="Movies and TV Series Menu"
          aria-activedescendant={`menu-item-${focusedIndex}`}
        >
          <div className="p-4 space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={el => itemRefs.current[index] = el}
                id={`menu-item-${index}`}
                role="option"
                aria-selected={index === focusedIndex}
                className={cn(
                  "relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200",
                  "hover:scale-105 hover:shadow-lg",
                  index === focusedIndex && "ring-2 ring-white scale-105 shadow-xl"
                )}
                onClick={() => handleItemClick(item, index)}
                onMouseEnter={() => {
                  setFocusedIndex(index);
                  setIsKeyboardNavigation(false);
                }}
              >
                <div className="relative aspect-video">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={getTitle(item)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {getTitle(item)}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">
                        {getReleaseYear(item)}
                      </span>
                      
                      {item.media_type && (
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                          N
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {index === focusedIndex && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalMediaMenu;
