import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbApi } from "@/lib/tmdb";
import HorizontalMovieCarousel from "@/components/HorizontalMovieCarousel";
type MovieItem = {
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
const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const {
    toast
  } = useToast();
  const {
    theme,
    setTheme
  } = useTheme();
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
  const filteredMovies = trendingMovies?.filter(movie => getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase()));
  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-48 mx-auto bg-gray-800" />
          <Skeleton className="h-6 w-32 mx-auto bg-gray-800" />
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center py-8">
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Error Loading Content</h2>
            <p className="text-sm text-gray-300">
              {error instanceof Error ? error.message : "Something went wrong while fetching movies."}
            </p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-black text-white relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-violet-600">CINEMA VAULT</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-white font-medium">Trending</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {showSearch && <Input type="text" placeholder="Search titles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 bg-black/50 border-gray-600 text-white placeholder-gray-400" autoFocus />}
            
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {filteredMovies?.length === 0 ? <div className="min-h-screen flex items-center justify-center">
          <div className="text-center py-8">
            <p className="text-lg text-gray-400">
              {searchQuery ? `No results found for "${searchQuery}"` : "No movies available"}
            </p>
          </div>
        </div> : <HorizontalMovieCarousel items={filteredMovies || []} />}
    </div>;
};
export default Index;