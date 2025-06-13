
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { tmdbApi } from "@/lib/tmdb";
import VerticalMediaMenu from "@/components/VerticalMediaMenu";

type MovieItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  media_type?: string;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

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
        
        if (response.results) {
          console.log("Movie data mapping:");
          response.results.forEach((movie: MovieItem, index: number) => {
            console.log(`Index ${index}: ID=${movie.id}, Title="${movie.title || movie.name}", Type=${movie.media_type}`);
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

  const filteredMovies = trendingMovies?.filter(movie => 
    getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center p-4 md:p-8 pb-4">
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
          
          <div className="px-4 md:px-8 pb-4">
            <Input 
              type="text" 
              placeholder="Search movies and TV series..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full max-w-md" 
            />
          </div>

          {isLoading ? (
            <div className="p-4 md:p-8 pt-0 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 md:p-8 pt-0">
              <div className="text-center py-8">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-lg font-semibold mb-2 text-destructive">Error Loading Movies</h2>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error ? error.message : "Something went wrong while fetching movies."}
                  </p>
                </div>
              </div>
            </div>
          ) : filteredMovies?.length === 0 ? (
            <div className="p-4 md:p-8 pt-0">
              <div className="text-center py-8">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No movies available"}
                </p>
              </div>
            </div>
          ) : (
            <VerticalMediaMenu items={filteredMovies || []} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
