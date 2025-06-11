
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { tmdbApi } from "@/lib/tmdb";

type MovieItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  console.log("Using Supabase TMDB API integration");

  const {
    data: trendingMovies,
    isLoading,
    error
  } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      console.log("Fetching trending movies via Supabase...");
      try {
        const response = await tmdbApi.trending({
          media_type: "movie",
          time_window: "week"
        });
        console.log("API Response:", response);
        console.log("Movies count:", response.results?.length);
        
        // Debug: Log movie IDs and titles
        if (response.results) {
          console.log("Movie data mapping:");
          response.results.forEach((movie: MovieItem, index: number) => {
            console.log(`Index ${index}: ID=${movie.id}, Title="${movie.title || movie.name}"`);
          });
        }
        
        return response.results as MovieItem[];
      } catch (error) {
        console.error("API Error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch trending movies. Please try again later.",
          variant: "destructive"
        });
        throw error;
      }
    }
  });

  console.log("Current state:", {
    isLoading,
    error,
    moviesCount: trendingMovies?.length
  });

  const getTitle = (item: MovieItem) => {
    return item.title || item.name || 'Unknown Title';
  };

  const handleMovieClick = (movie: MovieItem) => {
    console.log("=== MOVIE CLICK DEBUG ===");
    console.log("Clicked movie object:", movie);
    console.log("Movie ID being passed:", movie.id);
    console.log("Movie title:", getTitle(movie));
    console.log("Navigation path:", `/movie/${movie.id}`);
    console.log("========================");
    
    navigate(`/movie/${movie.id}`);
  };

  const filteredMovies = trendingMovies?.filter(movie => 
    getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <img 
                src="/image.png" 
                alt="Cinema Vault Logo" 
                className="h-20 w-auto object-contain"
              />
              <h1 className="my-0 mx-0 text-4xl font-extrabold">Cinema Vault</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
              className="rounded-full"
            >
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          
          <div className="flex gap-4 mb-8">
            <Input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="flex-1" 
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="w-full h-[300px]" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-2 text-destructive">Error Loading Movies</h2>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "Something went wrong while fetching movies."}
                </p>
              </div>
            </div>
          ) : filteredMovies?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {searchQuery ? `No results found for "${searchQuery}"` : "No movies available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies?.map((movie: MovieItem) => (
                <Card 
                  key={movie.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => handleMovieClick(movie)}
                >
                  <CardContent className="p-0">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={getTitle(movie)} 
                      className="w-full h-[300px] object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }} 
                    />
                    <div className="p-4">
                      <h2 className="font-semibold text-lg mb-2 line-clamp-1">{getTitle(movie)}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {movie.overview}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">ID: {movie.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
