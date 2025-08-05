import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  const selectedItem = items[focusedIndex];

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Carousel Container */}
      <div className="flex-1 flex items-center justify-center py-8">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full max-w-6xl"
        >
          <CarouselContent className="-ml-4">
            {items.map((item, index) => {
              const isFocused = index === focusedIndex;
              return (
                <CarouselItem key={item.id} className="pl-4 basis-1/3 lg:basis-1/5">
                  <div className="p-1">
                    <Card 
                      className={cn(
                        "bg-transparent border-none cursor-pointer transition-all duration-500 ease-out",
                        "hover:scale-110",
                        isFocused ? "scale-110 z-10" : "scale-85 opacity-50"
                      )}
                      onClick={() => handleItemClick(item, index)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <CardContent className="p-0">
                        <div className="relative w-full h-[450px]">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={getTitle(item)}
                            className={cn(
                              "w-full h-full object-cover rounded-lg transition-all duration-500",
                              isFocused && "ring-4 ring-white shadow-2xl shadow-white/20"
                            )}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          
                          {isFocused && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Movie Information Section */}
      <div className="bg-black/95 backdrop-blur-sm p-8 border-t border-gray-800 mx-0 min-h-[200px] flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white text-center">
            {getTitle(selectedItem)}
          </h2>
          
          <div className="flex items-center justify-center gap-6 mb-6 text-sm">
            {getReleaseYear(selectedItem) && (
              <span className="text-gray-300">{getReleaseYear(selectedItem)}</span>
            )}
            {selectedItem.vote_average && (
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Rating:</span>
                <span className="text-white font-medium">{selectedItem.vote_average.toFixed(1)}/10</span>
              </div>
            )}
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
    </div>
  );
};

export default HorizontalMovieCarousel;