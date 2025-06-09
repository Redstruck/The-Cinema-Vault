import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <img 
            src="/TMDb_Logo.svg" 
            alt="The Movie Database (TMDb)" 
            className="h-8 w-auto"
          />
          <p className="text-sm text-muted-foreground">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;