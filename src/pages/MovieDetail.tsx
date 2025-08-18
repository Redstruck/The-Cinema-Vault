import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import StreamingProviders from "@/components/StreamingProviders";
import Cast from "@/components/Cast";
import { tmdbApi } from "@/lib/tmdb";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Try to get media_type from navigation state
  const mediaType = location.state?.media_type;

  console.log("=== MOVIE DETAIL DEBUG ===");
  console.log("URL Parameter ID:", id);
  console.log("ID type:", typeof id);
  console.log("Media type from navigation state:", mediaType);
  console.log("========================");

  const { data: media, isLoading, error } = useQuery({
    queryKey: ["media", id, mediaType],
    queryFn: async () => {
      console.log("=== API CALL DEBUG ===");
      console.log("Fetching media details for ID:", id);
      console.log("ID being sent to API:", id);
      console.log("Media type being sent to API:", mediaType);
      
      try {
        const response = await tmdbApi.mediaInfo({ 
          id: id as string, 
          media_type: mediaType 
        });
        
        console.log("=== API RESPONSE DEBUG ===");
        console.log("Full API response:", response);
        console.log("Media ID in response:", response?.id);
        console.log("Media title in response:", response?.title);
        console.log("Media type:", response?.media_type);
        console.log("Response poster path:", response?.poster_path);
        console.log("========================");
        
        return response;
      } catch (error) {
        console.error("=== API ERROR DEBUG ===");
        console.error("Error fetching media details:", error);
        console.error("Error for media ID:", id);
        console.error("Error for media type:", mediaType);
        console.error("========================");
        
        toast({
          title: "Error",
          description: "Failed to fetch content details. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!id, // Only run query if ID exists
  });

  console.log("=== RENDER DEBUG ===");
  console.log("Current media data:", media);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  console.log("URL ID vs Media ID:", { urlId: id, mediaId: media?.id });
  console.log("==================");

  const getContentType = () => {
    return media?.media_type === 'tv' ? 'TV Series' : 'Movie';
  };

  const getRuntime = () => {
    if (media?.media_type === 'tv') {
      if (media?.episode_run_time && media.episode_run_time.length > 0) {
        return `${media.episode_run_time[0]} min per episode`;
      }
      return 'Runtime varies';
    }
    return media?.runtime ? `${media.runtime} minutes` : 'Runtime unknown';
  };

  const getAdditionalInfo = () => {
    if (media?.media_type === 'tv') {
      return (
        <>
          {media?.number_of_seasons && (
            <div>
              <span className="font-semibold">Seasons:</span> {media.number_of_seasons}
            </div>
          )}
          {media?.number_of_episodes && (
            <div>
              <span className="font-semibold">Episodes:</span> {media.number_of_episodes}
            </div>
          )}
          {media?.first_air_date && (
            <div>
              <span className="font-semibold">First Air Date:</span> {media.first_air_date}
            </div>
          )}
          {media?.last_air_date && (
            <div>
              <span className="font-semibold">Last Air Date:</span> {media.last_air_date}
            </div>
          )}
        </>
      );
    }
    return null;
  };

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
          ) : !media ? (
            <div className="text-center mt-8">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-2 text-destructive">Content Not Found</h2>
                <p className="text-sm text-muted-foreground">
                  Could not find content with ID: {id}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                    alt={media.title}
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-4xl font-bold">{media.title}</h1>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                      {getContentType()}
                    </span>
                  </div>
                  <p className="text-lg mb-4">{media.overview}</p>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">Release Date:</span> {media.release_date}
                    </div>
                    <div>
                      <span className="font-semibold">Rating:</span> {media.vote_average?.toFixed(1)}/10
                    </div>
                    <div>
                      <span className="font-semibold">Runtime:</span> {getRuntime()}
                    </div>
                    <div>
                      <span className="font-semibold">Genres:</span>{" "}
                      {media.genres?.map(genre => genre.name).join(", ")}
                    </div>
                    {getAdditionalInfo()}
                    {media.tagline && (
                      <div>
                        <span className="font-semibold">Tagline:</span> {media.tagline}
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <StreamingProviders 
                        movieId={id as string} 
                        mediaType={media.media_type || 'movie'} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cast Section */}
              <Cast 
                mediaId={id as string} 
                mediaType={media.media_type || 'movie'} 
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MovieDetail;