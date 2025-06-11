
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { tmdbApi } from "@/lib/tmdb";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("=== MOVIE DETAIL DEBUG ===");
  console.log("URL Parameter ID:", id);
  console.log("ID type:", typeof id);
  console.log("========================");

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: async () => {
      console.log("=== API CALL DEBUG ===");
      console.log("Fetching movie details for ID:", id);
      console.log("ID being sent to API:", id);
      
      try {
        const response = await tmdbApi.movieInfo({ id: id as string });
        
        console.log("=== API RESPONSE DEBUG ===");
        console.log("Full API response:", response);
        console.log("Movie ID in response:", response?.id);
        console.log("Movie title in response:", response?.title);
        console.log("Response poster path:", response?.poster_path);
        console.log("========================");
        
        return response;
      } catch (error) {
        console.error("=== API ERROR DEBUG ===");
        console.error("Error fetching movie details:", error);
        console.error("Error for movie ID:", id);
        console.error("========================");
        
        toast({
          title: "Error",
          description: "Failed to fetch movie details. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!id, // Only run query if ID exists
  });

  console.log("=== RENDER DEBUG ===");
  console.log("Current movie data:", movie);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  console.log("URL ID vs Movie ID:", { urlId: id, movieId: movie?.id });
  console.log("==================");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="w-full h-[600px] rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ) : !movie ? (
            <div className="text-center mt-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-2 text-destructive">Movie Not Found</h2>
                <p className="text-sm text-muted-foreground">
                  Could not find movie with ID: {id}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4 text-sm">
                  <strong>Debug Info:</strong> URL ID: {id}, Movie ID: {movie.id}
                </div>
                <p className="text-lg mb-4">{movie.overview}</p>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Release Date:</span> {movie.release_date}
                  </div>
                  <div>
                    <span className="font-semibold">Rating:</span> {movie.vote_average?.toFixed(1)}/10
                  </div>
                  <div>
                    <span className="font-semibold">Runtime:</span> {movie.runtime} minutes
                  </div>
                  <div>
                    <span className="font-semibold">Genres:</span>{" "}
                    {movie.genres?.map(genre => genre.name).join(", ")}
                  </div>
                  {movie.tagline && (
                    <div>
                      <span className="font-semibold">Tagline:</span> {movie.tagline}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MovieDetail;
