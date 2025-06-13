
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  media_type?: string;
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
      if (menuRef.current && menuRef.current.contains(document.activeElement)) {
        handleKeyDown(event);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Focus the menu container when component mounts
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Reset focus when items change
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

  return (
    <div
      ref={menuRef}
      className="h-screen overflow-y-auto focus:outline-none scroll-smooth"
      tabIndex={0}
      role="listbox"
      aria-label="Movies and TV Series Menu"
      aria-activedescendant={`menu-item-${focusedIndex}`}
    >
      <div className="p-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={el => itemRefs.current[index] = el}
            id={`menu-item-${index}`}
            role="option"
            aria-selected={index === focusedIndex}
            className={cn(
              "transition-all duration-200 ease-in-out transform",
              index === focusedIndex && isKeyboardNavigation && "scale-105"
            )}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-102",
                index === focusedIndex && "ring-2 ring-primary shadow-lg",
                index === focusedIndex && isKeyboardNavigation && "ring-4 ring-primary/70"
              )}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => {
                setFocusedIndex(index);
                setIsKeyboardNavigation(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={getTitle(item)}
                      className="w-16 h-24 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        "font-semibold truncate transition-colors duration-200",
                        index === focusedIndex ? "text-primary" : "text-foreground"
                      )}>
                        {getTitle(item)}
                      </h3>
                      {item.media_type && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0">
                          {item.media_type === 'tv' ? 'TV' : 'Movie'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.overview || 'No description available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalMediaMenu;
