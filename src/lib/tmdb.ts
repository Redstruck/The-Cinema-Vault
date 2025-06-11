
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
  },

  async tvInfo(params: { id: string }) {
    console.log("=== TMDB API TV INFO CALL ===");
    console.log("TV info params:", params);
    console.log("TV ID being requested:", params.id);
    console.log("TV ID type:", typeof params.id);
    
    const { data, error } = await supabase.functions.invoke('tmdb-api', {
      body: {
        endpoint: `/tv/${params.id}`,
        params: {}
      }
    });

    console.log("TV info API response:", data);
    console.log("TV info API error:", error);
    console.log("Response TV ID:", data?.id);
    console.log("Response TV name:", data?.name);
    console.log("==============================");

    if (error) throw error;
    return data;
  },

  async mediaInfo(params: { id: string; media_type?: string }) {
    console.log("=== TMDB API MEDIA INFO CALL ===");
    console.log("Media info params:", params);
    console.log("Media type provided:", params.media_type);
    
    // If we know the media type, use it directly
    if (params.media_type === 'tv') {
      console.log("Fetching as TV series directly");
      try {
        const tvData = await this.tvInfo({ id: params.id });
        console.log("Successfully fetched TV series:", tvData.name);
        return { 
          ...tvData, 
          media_type: 'tv',
          title: tvData.name, // Normalize name to title for consistency
          release_date: tvData.first_air_date // Normalize first_air_date to release_date
        };
      } catch (tvError) {
        console.error("Failed to fetch TV series:", tvError);
        throw new Error(`TV series with ID ${params.id} not found`);
      }
    } else if (params.media_type === 'movie') {
      console.log("Fetching as movie directly");
      try {
        const movieData = await this.movieInfo({ id: params.id });
        console.log("Successfully fetched movie:", movieData.title);
        return { ...movieData, media_type: 'movie' };
      } catch (movieError) {
        console.error("Failed to fetch movie:", movieError);
        throw new Error(`Movie with ID ${params.id} not found`);
      }
    }
    
    // Fallback: try movie first, then TV (only when media_type is unknown)
    console.log("Media type unknown, trying movie first...");
    try {
      const movieData = await this.movieInfo({ id: params.id });
      console.log("Successfully fetched as movie:", movieData.title);
      return { ...movieData, media_type: 'movie' };
    } catch (movieError) {
      console.log("Failed to fetch as movie, trying TV series...");
      
      try {
        const tvData = await this.tvInfo({ id: params.id });
        console.log("Successfully fetched as TV series:", tvData.name);
        return { 
          ...tvData, 
          media_type: 'tv',
          title: tvData.name, // Normalize name to title for consistency
          release_date: tvData.first_air_date // Normalize first_air_date to release_date
        };
      } catch (tvError) {
        console.error("Failed to fetch as both movie and TV series");
        throw new Error(`Content with ID ${params.id} not found`);
      }
    }
  }
};
