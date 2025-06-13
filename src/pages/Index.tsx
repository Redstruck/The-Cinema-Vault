
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import NetflixHeader from "@/components/NetflixHeader";
import NetflixHero from "@/components/NetflixHero";
import NetflixContentRow from "@/components/NetflixContentRow";
import { tmdbApi } from "@/lib/tmdb";

type MovieItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  media_type?: string;
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Fetch TV shows
  const { data: trendingTV } = useQuery({
    queryKey: ["trending-tv"],
    queryFn: async () => {
      try {
        const response = await tmdbApi.trending({
          media_type: "tv",
          time_window: "week"
        });
        return response.results as MovieItem[];
      } catch (error) {
        console.error("TV API Error:", error);
        return [];
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

  const handleMovieClick = (movie: MovieItem) => {
    console.log("=== MOVIE CLICK DEBUG ===");
    console.log("Clicked movie object:", movie);
    console.log("Movie ID being passed:", movie.id);
    console.log("Movie title:", getTitle(movie));
    console.log("Movie media type:", movie.media_type);
    console.log("Navigation path:", `/movie/${movie.id}`);
    console.log("========================");
    
    navigate(`/movie/${movie.id}`, { 
      state: { media_type: movie.media_type } 
    });
  };

  // Transform data for Netflix-style rows
  const transformForNetflix = (items: MovieItem[]) => {
    return items?.map(item => ({
      id: item.id,
      title: getTitle(item),
      poster_path: item.poster_path
    })) || [];
  };

  return (
    <div className="min-h-screen bg-black">
      <NetflixHeader />
      
      {/* Hero Section */}
      <NetflixHero />
      
      {/* Content Rows */}
      <div className="relative z-10 -mt-32 pb-16">
        {/* My List */}
        <NetflixContentRow 
          title="My List" 
          items={transformForNetflix(trendingMovies?.slice(0, 6))} 
        />
        
        {/* Continue Watching */}
        <NetflixContentRow 
          title="Continue Watching" 
          items={transformForNetflix(trendingTV?.slice(0, 6))} 
        />
        
        {/* Trending Now */}
        <NetflixContentRow 
          title="Trending Now" 
          items={transformForNetflix(trendingMovies?.slice(6, 12))} 
        />
        
        {/* Popular on Netflix */}
        <NetflixContentRow 
          title="Popular on Netflix" 
          items={transformForNetflix(trendingTV?.slice(6, 12))} 
        />
      </div>
    </div>
  );
};

export default Index;
