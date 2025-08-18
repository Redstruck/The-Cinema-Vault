import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbApi } from "@/lib/tmdb";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

interface CastProps {
  mediaId: string;
  mediaType: string;
}

const Cast = ({ mediaId, mediaType }: CastProps) => {
  const { data: credits, isLoading, error } = useQuery({
    queryKey: ["credits", mediaId, mediaType],
    queryFn: async () => {
      console.log("=== CAST COMPONENT DEBUG ===");
      console.log("Fetching credits for ID:", mediaId);
      console.log("Media type:", mediaType);
      
      try {
        const response = await tmdbApi.credits({ 
          id: mediaId, 
          media_type: mediaType 
        });
        
        console.log("Credits response:", response);
        console.log("Cast members count:", response?.cast?.length);
        console.log("============================");
        
        return response;
      } catch (error) {
        console.error("=== CAST ERROR DEBUG ===");
        console.error("Error fetching credits:", error);
        console.error("========================");
        throw error;
      }
    },
    enabled: !!mediaId && !!mediaType,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-full aspect-[2/3] rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !credits?.cast) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Cast</h2>
        <p className="text-muted-foreground">Cast information not available.</p>
      </div>
    );
  }

  // Get the top 12 cast members (most important roles)
  const topCast = credits.cast
    .sort((a: CastMember, b: CastMember) => a.order - b.order)
    .slice(0, 12);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {topCast.map((castMember: CastMember) => (
          <div key={castMember.id} className="space-y-2">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={
                  castMember.profile_path
                    ? `https://image.tmdb.org/t/p/w300${castMember.profile_path}`
                    : '/placeholder.svg'
                }
                alt={castMember.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {castMember.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                {castMember.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cast;
