
import { Play, Plus, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const NetflixHero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://image.tmdb.org/t/p/original/xGexTKCJHSVEN3BcwoLWsi10Lrx.jpg')",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16 max-w-2xl">
        {/* Netflix Series Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-red-600 text-lg font-bold">N</span>
          <span className="text-white text-sm uppercase tracking-wider">Series</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          GRISELDA
        </h1>

        {/* Metadata */}
        <div className="flex items-center space-x-4 text-white mb-6">
          <span>TV Dramas</span>
          <span>•</span>
          <span>2024</span>
          <span>•</span>
          <span>Limited Series</span>
          <span>•</span>
          <span>TV-MA</span>
        </div>

        {/* Description */}
        <p className="text-white text-lg leading-relaxed mb-8 max-w-xl">
          Inspired by real events, this fictional dramatization shows Griselda Blanco's journey from Medellín to becoming "the Godmother" of Miami's drug empire.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button className="bg-white text-black hover:bg-gray-200 flex items-center space-x-2 px-8 py-3 text-lg font-semibold">
            <Play className="h-5 w-5 fill-current" />
            <span>Play</span>
          </Button>
          
          <Button variant="outline" className="border-gray-400 text-white hover:bg-white hover:text-black flex items-center space-x-2 px-8 py-3 text-lg font-semibold bg-gray-600/50">
            <Plus className="h-5 w-5" />
            <span>My List</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NetflixHero;
