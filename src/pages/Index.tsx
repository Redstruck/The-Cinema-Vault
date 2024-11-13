import { useState } from "react";
import { MovieDb } from "moviedb-promise";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const moviedb = new MovieDb(import.meta.env.VITE_TMDB_API_KEY);

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

  const { data: trendingMovies, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      try {
        const response = await moviedb.trending({ media_type: "movie", time_window: "week" });
        return response.results as MovieItem[];
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch trending movies. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const getTitle = (item: MovieItem) => {
    return item.title || item.name || 'Unknown Title';
  };

  const filteredMovies = trendingMovies?.filter(movie =>
    getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">Trending Movies Explorer</h1>
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies?.map((movie: MovieItem) => (
              <Card 
                key={movie.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <CardContent className="p-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={getTitle(movie)}
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-semibold text-lg mb-2 line-clamp-1">{getTitle(movie)}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {movie.overview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;