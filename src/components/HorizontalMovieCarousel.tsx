import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [infiniteScrollIndex, setInfiniteScrollIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isKeyNavigating, setIsKeyNavigating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastKeyPressTime = useRef<number>(0);
  const keyNavigationTimeout = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // Create infinite scroll array by triplicating items
  const infiniteItems = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items, ...items];
  }, [items]);

  // Start at the middle set of items
  const initialScrollIndex = items.length;
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
  const scrollToItem = useCallback((index: number, isKeyboardNavigation: boolean = false) => {
    if (!carouselRef.current || !items.length) return;

    const carousel = carouselRef.current;
    const itemWidth = 384 + 48; // 384px poster width (w-96) + 48px gap (3rem = 48px)
    
    // Calculate target scroll position to center the item in infinite scroll
    const targetScrollLeft = index * itemWidth;
    
    const scrollOptions: ScrollToOptions = {
      left: targetScrollLeft,
      behavior: 'smooth'
    };
    
    if (isKeyboardNavigation) {
      carousel.style.scrollBehavior = 'smooth';
      carousel.style.transition = 'scroll-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    
    carousel.scrollTo(scrollOptions);
    
    if (isKeyboardNavigation) {
      setTimeout(() => {
        carousel.style.transition = '';
      }, 600);
    }
  }, [items.length]);

  // Handle infinite scroll repositioning
  const handleInfiniteScroll = useCallback(() => {
    if (!carouselRef.current || !items.length) return;
    
    const carousel = carouselRef.current;
    const itemWidth = 384 + 48;
    const sectionWidth = items.length * itemWidth;
    
    // If we're at the start of first section, jump to start of middle section
    if (infiniteScrollIndex < items.length * 0.5) {
      const newIndex = infiniteScrollIndex + items.length;
      setInfiniteScrollIndex(newIndex);
      carousel.scrollLeft = newIndex * itemWidth;
    }
    // If we're at the end of third section, jump to end of middle section  
    else if (infiniteScrollIndex >= items.length * 2.5) {
      const newIndex = infiniteScrollIndex - items.length;
      setInfiniteScrollIndex(newIndex);
      carousel.scrollLeft = newIndex * itemWidth;
    }
  }, [infiniteScrollIndex, items.length]);
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length || isScrolling || isKeyNavigating) return;
    
    const currentTime = Date.now();
    const timeSinceLastKeyPress = currentTime - lastKeyPressTime.current;
    
    // Prevent rapid-fire navigation - require at least 400ms between key presses
    if (timeSinceLastKeyPress < 400) {
      event.preventDefault();
      return;
    }
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        lastKeyPressTime.current = currentTime;
        setIsScrolling(true);
        setIsKeyNavigating(true);
        
        setInfiniteScrollIndex(prev => {
          const newIndex = prev - 1;
          const actualItemIndex = newIndex % items.length;
          const displayIndex = actualItemIndex < 0 ? items.length - 1 : actualItemIndex;
          
          setFocusedIndex(displayIndex);
          
          requestAnimationFrame(() => {
            scrollToItem(newIndex, true);
            setTimeout(() => {
              handleInfiniteScroll();
              setIsScrolling(false);
              setIsKeyNavigating(false);
            }, 600);
          });
          return newIndex;
        });
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        lastKeyPressTime.current = currentTime;
        setIsScrolling(true);
        setIsKeyNavigating(true);
        
        setInfiniteScrollIndex(prev => {
          const newIndex = prev + 1;
          const actualItemIndex = newIndex % items.length;
          
          setFocusedIndex(actualItemIndex);
          
          requestAnimationFrame(() => {
            scrollToItem(newIndex, true);
            setTimeout(() => {
              handleInfiniteScroll();
              setIsScrolling(false);
              setIsKeyNavigating(false);
            }, 600);
          });
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
  }, [items, focusedIndex, scrollToItem, isScrolling, isKeyNavigating, handleInfiniteScroll]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Clear any pending timeouts on cleanup
      if (keyNavigationTimeout.current) {
        clearTimeout(keyNavigationTimeout.current);
      }
    };
  }, [handleKeyDown]);
  useEffect(() => {
    if (items.length > 0 && focusedIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, [items, focusedIndex]);
  useEffect(() => {
    // Initialize at the middle section of infinite items
    if (items.length > 0) {
      const startIndex = items.length; // Start at middle section
      setInfiniteScrollIndex(startIndex);
      setFocusedIndex(0); // Display first item
      setTimeout(() => scrollToItem(startIndex), 100);
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
      <div className="flex-1 flex items-center justify-center relative">
        <div 
          ref={carouselRef} 
          className="flex items-center gap-12 overflow-x-auto scrollbar-hide scroll-smooth w-full" 
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            paddingLeft: '50vw',
            paddingRight: '50vw'
          }} 
          tabIndex={0} 
          role="listbox" 
          aria-label="Movies and TV Series Carousel" 
          aria-activedescendant={`carousel-item-${focusedIndex}`}
        >
          {infiniteItems.map((item, index) => {
            const actualItemIndex = index % items.length;
            const isFocused = actualItemIndex === focusedIndex;
            
            return <div 
              key={`${item.id}-${Math.floor(index / items.length)}`} 
              ref={el => itemRefs.current[index] = el} 
              id={`carousel-item-${index}`} 
              role="option" 
              aria-selected={isFocused} 
              className={cn(
                "relative cursor-pointer transition-all duration-500 ease-out flex-shrink-0",
                "hover:scale-110",
                isFocused ? "scale-110 z-10" : "scale-85 opacity-50"
              )} 
              onClick={() => handleItemClick(item, actualItemIndex)} 
              onMouseEnter={() => {
                setFocusedIndex(actualItemIndex);
                setInfiniteScrollIndex(index);
              }}
            >
                <div className="relative w-96 h-[600px]">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    alt={getTitle(item)} 
                    className={cn(
                      "w-full h-full object-contain rounded-lg transition-all duration-500",
                      isFocused && "ring-2 ring-white shadow-2xl shadow-white/20"
                    )} 
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }} 
                  />
                  
                  {isFocused && <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Movie Information Section */}
      <div className="bg-black/95 backdrop-blur-sm p-6 border-t border-gray-800 mx-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-white text-center">
            {getTitle(selectedItem)}
          </h2>
          
          <div className="flex items-center justify-center gap-6 mb-4 text-sm">
            {getReleaseYear(selectedItem) && <span className="text-gray-300">{getReleaseYear(selectedItem)}</span>}
            {selectedItem.vote_average && <div className="flex items-center gap-2">
                <span className="text-gray-300">Rating:</span>
                <span className="text-white font-medium">{selectedItem.vote_average.toFixed(1)}/10</span>
              </div>}
            <span className="text-gray-300">{getContentType(selectedItem)}</span>
            <span className="text-gray-300">HD</span>
          </div>
          
          <p className="leading-relaxed text-gray-200 max-w-5xl text-center px-0 py-0 my-0 mx-auto text-base font-normal">
            {selectedItem.overview || 'No description available for this title.'}
          </p>
        </div>
      </div>

      {/* Navigation hint */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-700/80 px-4 py-2 rounded-full backdrop-blur-sm">
          <span>← Navigate →</span>
        </div>
      </div>
    </div>;
};
export default HorizontalMovieCarousel;