import { useState } from "react";
import { MovieDb } from "moviedb-promise";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Initialize MovieDb (you'll need to add your API key as an environment variable)
const moviedb = new MovieDb(import.meta.env.VITE_TMDB_API_KEY);

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: trendingMovies, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      try {
        const response = await moviedb.trending({ media_type: "movie", time_window: "week" });
        return response.results;
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

  return (
    <div className="min-h-screen p-4 md:p-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Movie Explorer</h1>
        
        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button>Search</Button>
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingMovies?.map((movie: any) => (
              <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-semibold text-lg mb-2 line-clamp-1">{movie.title}</h2>
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