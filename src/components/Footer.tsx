import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <a 
            href="https://www.themoviedb.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-75 focus:opacity-75 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            aria-label="Visit The Movie Database website"
          >
            <img 
              src="/TMDb_Logo.svg" 
              alt="The Movie Database (TMDb) logo" 
              className="h-8 w-auto"
            />
          </a>
          <p className="text-sm text-muted-foreground">
            This product uses the{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4 hover:underline-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="Visit The Movie Database website"
            >
              TMDb
            </a>{' '}
            API but is not endorsed or certified by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4 hover:underline-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="Visit The Movie Database website"
            >
              TMDb
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;