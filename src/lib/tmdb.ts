
import { supabase } from "@/integrations/supabase/client";

export const tmdbApi = {
  async trending(params: { media_type: string; time_window: string }) {
    console.log("=== TMDB API TRENDING CALL ===");
    console.log("Trending params:", params);
    
    const { data, error } = await supabase.functions.invoke('tmdb-api', {
      body: {
        endpoint: '/trending/all/week',
        params: {
          media_type: params.media_type,
          time_window: params.time_window
        }
      }
    });

    console.log("Trending API response:", data);
    console.log("Trending API error:", error);
    console.log("==============================");

    if (error) throw error;
    return data;
  },

  async movieInfo(params: { id: string }) {
    console.log("=== TMDB API MOVIE INFO CALL ===");
    console.log("Movie info params:", params);
    console.log("Movie ID being requested:", params.id);
    console.log("Movie ID type:", typeof params.id);
    
    const { data, error } = await supabase.functions.invoke('tmdb-api', {
      body: {
        endpoint: `/movie/${params.id}`,
        params: {}
      }
    });

    console.log("Movie info API response:", data);
    console.log("Movie info API error:", error);
    console.log("Response movie ID:", data?.id);
    console.log("Response movie title:", data?.title);
    console.log("===============================");

    if (error) throw error;
    return data;
  }
};
