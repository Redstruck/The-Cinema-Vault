
import { supabase } from "@/integrations/supabase/client";

export const tmdbApi = {
  async trending(params: { media_type: string; time_window: string }) {
    const { data, error } = await supabase.functions.invoke('tmdb-api', {
      body: {
        endpoint: '/trending/all/week',
        params: {
          media_type: params.media_type,
          time_window: params.time_window
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async movieInfo(params: { id: string }) {
    const { data, error } = await supabase.functions.invoke('tmdb-api', {
      body: {
        endpoint: `/movie/${params.id}`,
        params: {}
      }
    });

    if (error) throw error;
    return data;
  }
};
