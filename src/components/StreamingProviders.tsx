import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { tmdbApi } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
interface StreamingProvidersProps {
  movieId: string;
  mediaType: string;
}
interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}
interface WatchProvidersData {
  results: {
    US?: {
      flatrate?: Provider[];
      rent?: Provider[];
      buy?: Provider[];
    };
  };
}
const StreamingProviders = ({
  movieId,
  mediaType
}: StreamingProvidersProps) => {
  const {
    data: watchProviders,
    isLoading
  } = useQuery({
    queryKey: ["watchProviders", movieId, mediaType],
    queryFn: () => tmdbApi.watchProviders({
      id: movieId,
      media_type: mediaType
    }),
    enabled: !!movieId
  });
  if (isLoading) {
    return <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>;
  }
  const providers = (watchProviders as WatchProvidersData)?.results?.US;
  if (!providers) {
    return <div>
        <span className="font-semibold">Streaming:</span> Not available in US
      </div>;
  }
  const streamingServices = providers.flatrate || [];
  const rentServices = providers.rent || [];
  const buyServices = providers.buy || [];
  return <div className="space-y-3">
      {streamingServices.length > 0 && <div>
          <span className="font-semibold block mb-2">Streaming On:</span>
          <div className="flex flex-wrap gap-2">
            {streamingServices.map(provider => <Badge key={provider.provider_id} variant="secondary" className="flex items-center gap-1">
                <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-4 h-4 rounded" />
                {provider.provider_name}
              </Badge>)}
          </div>
        </div>}
      
      {rentServices.length > 0 && <div>
          <span className="font-semibold block mb-2">Rent:</span>
          <div className="flex flex-wrap gap-2">
            {rentServices.map(provider => <Badge key={provider.provider_id} variant="outline" className="flex items-center gap-1">
                <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-4 h-4 rounded" />
                {provider.provider_name}
              </Badge>)}
          </div>
        </div>}
      
      {buyServices.length > 0 && <div>
          <span className="font-semibold block mb-2">Buy:</span>
          <div className="flex flex-wrap gap-2">
            {buyServices.map(provider => <Badge key={provider.provider_id} variant="outline" className="flex items-center gap-1">
                <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-4 h-4 rounded" />
                {provider.provider_name}
              </Badge>)}
          </div>
        </div>}
      
      {streamingServices.length === 0 && rentServices.length === 0 && buyServices.length === 0 && <div>
          <span className="font-semibold">Streaming:</span> Not currently available
        </div>}
    </div>;
};
export default StreamingProviders;