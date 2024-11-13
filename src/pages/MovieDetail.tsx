import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MovieDb } from "moviedb-promise";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

const moviedb = new MovieDb(import.meta.env.VITE_TMDB_API_KEY);

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: async () => {
      try {
        const response = await moviedb.movieInfo({ id: id as string });
        return response;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch movie details. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
  });

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (!movie) return <div className="text-center mt-8">Movie not found</div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
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
      </div>
    </div>
  );
};

export default MovieDetail;