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
interface HorizontalMovieCarouselProps {
  items: MediaItem[];
  onItemSelect?: (item: MediaItem) => void;
}
const HorizontalMovieCarousel = ({
  items,
  onItemSelect
}: HorizontalMovieCarouselProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const getTitle = (item: MediaItem) => {
    return item.title || item.name || 'Unknown Title';
  };

  const getReleaseYear = (item: MediaItem) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  const getContentType = (item: MediaItem) => {
    if (item.media_type === 'tv') return 'TV';
    return 'Movie';
  };

  const handleItemClick = (item: MediaItem, index: number) => {
    setFocusedIndex(index);
    if (onItemSelect) {
      onItemSelect(item);
    } else {
      navigate(`/movie/${item.id}`, {
        state: {
          media_type: item.media_type
        }
      });
    }
  };

  const scrollToItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item && carouselRef.current) {
      // Calculate the position to center the item
      const itemWidth = 320 + 48; // 320px width + 48px gap
      const containerWidth = carouselRef.current.clientWidth;
      const scrollPosition = (index * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
      
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const navigateCarousel = useCallback((direction: 'left' | 'right') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    setFocusedIndex(prev => {
      let newIndex;
      if (direction === 'left') {
        newIndex = prev <= 0 ? items.length - 1 : prev - 1;
      } else {
        newIndex = prev >= items.length - 1 ? 0 : prev + 1;
      }
      scrollToItem(newIndex);
      return newIndex;
    });
    
    // Clear existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Set a timeout to allow navigation again
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 300); // 300ms delay between navigations
  }, [items.length, scrollToItem, isNavigating]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateCarousel('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigateCarousel('right');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (items[focusedIndex]) {
          handleItemClick(items[focusedIndex], focusedIndex);
        }
        break;
    }
  }, [items, focusedIndex, navigateCarousel]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (items.length > 0 && focusedIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, [items, focusedIndex]);

  useEffect(() => {
    // Center the first item on initial load
    if (items.length > 0) {
      setTimeout(() => scrollToItem(0), 100);
    }
  }, [items, scrollToItem]);

  if (!items.length) {
    return <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No movies or TV series available</p>
      </div>;
  }

  const selectedItem = items[focusedIndex];

  return <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Carousel Container */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div ref={carouselRef} className="flex items-center gap-12 px-96 overflow-x-auto scrollbar-hide scroll-smooth" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} tabIndex={0} role="listbox" aria-label="Movies and TV Series Carousel" aria-activedescendant={`carousel-item-${focusedIndex}`}>
          {items.map((item, index) => {
          const isFocused = index === focusedIndex;
          return <div key={item.id} ref={el => itemRefs.current[index] = el} id={`carousel-item-${index}`} role="option" aria-selected={isFocused} className={cn("relative cursor-pointer transition-all duration-500 ease-out flex-shrink-0", "hover:scale-110", isFocused ? "scale-110 z-10" : "scale-85 opacity-50")} onClick={() => handleItemClick(item, index)} onMouseEnter={() => !isNavigating && setFocusedIndex(index)}>
                <div className="relative w-80 h-[450px]">
                  <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={getTitle(item)} className={cn("w-full h-full object-cover rounded-lg transition-all duration-500", isFocused && "ring-4 ring-white shadow-2xl shadow-white/20")} onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }} />
                  
                  {isFocused && <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Movie Information Section */}
      <div className="bg-black/95 backdrop-blur-sm p-8 border-t border-gray-800 mx-0 min-h-[200px] flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white text-center">
            {getTitle(selectedItem)}
          </h2>
          
          <div className="flex items-center justify-center gap-6 mb-6 text-sm">
            {getReleaseYear(selectedItem) && <span className="text-gray-300">{getReleaseYear(selectedItem)}</span>}
            {selectedItem.vote_average && <div className="flex items-center gap-2">
                <span className="text-gray-300">Rating:</span>
                <span className="text-white font-medium">{selectedItem.vote_average.toFixed(1)}/10</span>
              </div>}
            <span className="text-gray-300">{getContentType(selectedItem)}</span>
            <span className="text-gray-300">HD</span>
          </div>
          
          <div className="h-24 flex items-center justify-center">
            <p className="leading-loose text-gray-200 max-w-3xl text-center px-0 py-0 my-0 mx-[92px] text-base font-normal line-clamp-3">
            {selectedItem.overview || 'No description available for this title.'}
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default HorizontalMovieCarousel;