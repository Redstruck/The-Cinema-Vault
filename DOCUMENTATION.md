# Cinema Vault - Comprehensive Application Documentation

## Overview

**Cinema Vault** is a modern, responsive web application for discovering and exploring trending movies and TV shows. Built with React and powered by The Movie Database (TMDb) API, it provides users with an immersive Netflix-style interface to browse entertainment content.

**Demo**: [https://cinema-vault.netlify.app/](https://cinema-vault.netlify.app/)

## Core Features

### 🎬 Content Discovery
- **Trending Content**: Displays weekly trending movies and TV shows
- **Search Functionality**: Real-time search across all available content
- **Detailed Information**: Comprehensive movie/TV show details including ratings, release dates, and descriptions
- **Cast Information**: Full cast details with profile photos, names, and character roles
- **Streaming Providers**: Shows where content is available to stream, rent, or buy in the US
- **TMDb Attribution**: Proper attribution footer for The Movie Database

### 🎨 User Experience
- **Infinite Scroll Carousel**: True infinite horizontal scrolling with seamless looping
- **Enhanced Navigation**: Smooth arrow-key navigation with 400ms debouncing
- **Centered Poster Display**: Movies perfectly centered with optimal viewing
- **Improved Typography**: Enhanced font sizes and readability
- **Responsive Design**: Optimized for all device sizes with mobile-first approach
- **Keyboard Navigation**: Full keyboard support with smooth transitions
- **Visual Polish**: Refined poster borders, spacing, and UI elements

## Technical Architecture

### Frontend Stack
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility

### UI Component Library
- **shadcn/ui**: Pre-built, customizable components
- **Lucide React**: Modern icon library
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **Custom Hooks**: Reusable logic for toasts and theme management

### Backend Integration
- **Supabase**: Backend-as-a-Service platform
- **Edge Functions**: Serverless functions for API proxying
- **TMDb API**: Third-party movie database integration

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui component library
│   ├── HorizontalMovieCarousel.tsx  # Infinite scroll carousel
│   ├── StreamingProviders.tsx       # Streaming availability
│   ├── Cast.tsx         # Cast member display component
│   ├── Footer.tsx       # TMDb attribution footer
│   └── theme-provider.tsx          # Theme context provider
├── pages/               # Route components
│   ├── Index.tsx        # Home page with trending content
│   └── MovieDetail.tsx  # Individual movie/show details with cast
├── lib/                 # Utility libraries
│   ├── tmdb.ts          # TMDb API integration with credits endpoint
│   └── utils.ts         # General utilities
├── hooks/               # Custom React hooks
│   └── use-toast.ts     # Toast notification hook
└── integrations/        # Third-party integrations
    └── supabase/        # Supabase configuration
```

## Core Mechanics

### 1. Content Fetching & Display

#### Trending Content Retrieval
```typescript
// Fetches weekly trending movies via Supabase Edge Function
const { data: trendingMovies } = useQuery({
  queryKey: ["trending"],
  queryFn: async () => {
    const response = await tmdbApi.trending({
      media_type: "movie",
      time_window: "week"
    });
    return response.results;
  }
});
```

#### Data Flow:
1. **Frontend Request**: React Query triggers API call
2. **Supabase Edge Function**: Proxies request to TMDb API
3. **TMDb API**: Returns trending content data
4. **Response Processing**: Data is normalized and cached
5. **UI Update**: Components re-render with new data

### 2. Search Functionality

#### Real-time Search Implementation
```typescript
const filteredMovies = trendingMovies?.filter(movie => 
  getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Search Mechanics**:
- **Client-side Filtering**: Searches through cached trending content
- **Case-insensitive**: Converts both query and titles to lowercase
- **Real-time Updates**: Filters update as user types
- **Fallback Handling**: Shows appropriate messages for no results

### 3. Navigation & Routing

#### Dynamic Route Handling
```typescript
// Navigation with state passing
navigate(`/movie/${item.id}`, {
  state: { media_type: item.media_type }
});
```

**Route Structure**:
- **Home Route** (`/`): Trending content carousel
- **Detail Route** (`/movie/:id`): Individual content details
- **State Management**: Media type passed via navigation state

### 4. Media Type Detection

#### Smart Content Fetching
```typescript
async mediaInfo(params: { id: string; media_type?: string }) {
  // Try specific media type first if known
  if (params.media_type === 'tv') {
    return await this.tvInfo({ id: params.id });
  } else if (params.media_type === 'movie') {
    return await this.movieInfo({ id: params.id });
  }
  
  // Fallback: try movie first, then TV
  try {
    return await this.movieInfo({ id: params.id });
  } catch {
    return await this.tvInfo({ id: params.id });
  }
}
```

**Detection Logic**:
1. **Preferred Method**: Use media_type from navigation state
2. **Fallback Strategy**: Try as movie first, then TV series
3. **Data Normalization**: Standardize field names between movies and TV
4. **Error Handling**: Graceful degradation with user feedback

### 5. Infinite Scroll Carousel Implementation

#### True Infinite Scrolling with Seamless Looping
```typescript
// Create infinite scroll array by triplicating items
const infiniteItems = useMemo(() => {
  if (items.length === 0) return [];
  return [...items, ...items, ...items];
}, [items]);

// Smart repositioning for infinite scroll
const handleInfiniteScroll = useCallback(() => {
  if (!carouselRef.current || !items.length) return;
  
  const carousel = carouselRef.current;
  const itemWidth = 384 + 48;
  
  // If we're at the start of first section, jump to start of middle section
  if (infiniteScrollIndex < items.length * 0.5) {
    const newIndex = infiniteScrollIndex + items.length;
    setInfiniteScrollIndex(newIndex);
    carousel.scrollLeft = newIndex * itemWidth;
  }
  // If we're at the end of third section, jump to end of middle section  
  else if (infiniteScrollIndex >= items.length * 2.5) {
    const newIndex = infiniteScrollIndex - items.length;
    setInfiniteScrollIndex(newIndex);
    carousel.scrollLeft = newIndex * itemWidth;
  }
}, [infiniteScrollIndex, items.length]);
```

**Infinite Scroll Features**:
- **Triple Array Structure**: Three copies of content for seamless looping
- **Invisible Repositioning**: Smart jumps between sections without user awareness
- **Smooth Navigation**: Enhanced keyboard navigation with 400ms debouncing
- **Perfect Centering**: Viewport-based padding for optimal poster positioning
- **State Synchronization**: Proper sync between infinite scroll and focused item

#### Enhanced Keyboard Navigation
```typescript
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  // Prevent rapid-fire navigation with debouncing
  const timeSinceLastKeyPress = currentTime - lastKeyPressTime.current;
  if (timeSinceLastKeyPress < 400) {
    event.preventDefault();
    return;
  }
  
  // Navigate through infinite array while updating focused item
  setInfiniteScrollIndex(prev => {
    const newIndex = prev + (direction === 'right' ? 1 : -1);
    const actualItemIndex = newIndex % items.length;
    setFocusedIndex(actualItemIndex);
    
    requestAnimationFrame(() => {
      scrollToItem(newIndex, true);
      setTimeout(() => {
        handleInfiniteScroll(); // Reposition if needed
        setIsScrolling(false);
      }, 600);
    });
    return newIndex;
  });
}, [items, handleInfiniteScroll]);
```

### 6. Streaming Provider Integration

#### Watch Provider API Integration
```typescript
const { data: watchProviders } = useQuery({
  queryKey: ["watchProviders", movieId, mediaType],
  queryFn: () => tmdbApi.watchProviders({
    id: movieId,
    media_type: mediaType
  })
});
```

**Provider Categories**:
- **Streaming**: Services like Netflix, Hulu, Prime Video
- **Rent**: Digital rental platforms
- **Buy**: Purchase options
- **Regional Support**: Currently supports US providers

### 7. Cast Integration System

#### Cast Component with Dual Layout Modes
```typescript
interface CastProps {
  movieId: string;
  mediaType: 'movie' | 'tv';
  compact?: boolean; // Toggles between compact and full layouts
}

const Cast = ({ movieId, mediaType, compact = false }: CastProps) => {
  const { data: credits } = useQuery({
    queryKey: ["credits", movieId, mediaType],
    queryFn: () => tmdbApi.credits({ id: movieId, media_type: mediaType })
  });
  
  return compact ? (
    // Compact: 5x2 grid for movie detail sidebar
    <div className="grid grid-cols-5 gap-2">
      {topCast.slice(0, 10).map(actor => (
        <CastMember key={actor.id} actor={actor} size="compact" />
      ))}
    </div>
  ) : (
    // Full: Responsive grid for mobile/tablet
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {topCast.map(actor => (
        <CastMember key={actor.id} actor={actor} size="full" />
      ))}
    </div>
  );
};
```

**Cast System Features**:
- **TMDb Credits API**: Fetches cast data from `/movie/{id}/credits` endpoint
- **Responsive Design**: Compact sidebar layout for desktop, full grid for mobile
- **Profile Images**: High-quality cast member photos from TMDb CDN
- **Character Information**: Actor names with character roles
- **Error Handling**: Graceful fallbacks for missing images or data
- **Loading States**: Skeleton placeholders during data fetching

#### Integration in Movie Detail Pages
```typescript
// Cast positioned strategically in movie detail layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Movie poster and main info */}
  </div>
  <div className="space-y-6">
    <StreamingProviders movieId={movieId} mediaType={mediaType} />
    
    {/* Cast section - compact layout for sidebar */}
    <div className="hidden md:block">
      <Cast movieId={movieId} mediaType={mediaType} compact={true} />
    </div>
    
    {/* Full cast grid for mobile */}
    <div className="md:hidden">
      <Cast movieId={movieId} mediaType={mediaType} compact={false} />
    </div>
  </div>
</div>
```

### 8. UI/UX Enhancement Implementation

#### Movie Poster Optimization
```typescript
// Enhanced poster styling with better borders and sizing
<img 
  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
  className={cn(
    "w-96 h-[600px] object-contain rounded-lg transition-all duration-500",
    isFocused && "ring-2 ring-white shadow-2xl shadow-white/20"
  )} 
/>
```

**Visual Improvements**:
- **Poster Size**: Increased from 320x480px to 384x600px for better visibility
- **Border Refinement**: Reduced ring thickness from 4px to 2px for subtlety
- **Object Fit**: Changed from `object-cover` to `object-contain` for full poster visibility
- **Spacing**: Optimized gap sizes for better visual flow

#### Typography and Layout Enhancements
```typescript
// Improved text readability and layout
<p className="leading-relaxed text-gray-200 max-w-5xl text-center text-base font-normal">
  {selectedItem.overview || 'No description available for this title.'}
</p>
```

**Content Improvements**:
- **Font Size**: Increased description text from `text-sm` to `text-base`
- **Content Width**: Expanded from `max-w-3xl` to `max-w-5xl` for better readability
- **Navigation Hints**: Updated to simple "← Navigate →" for clarity
- **Background Refinement**: Changed overlay from `bg-black/50` to `bg-gray-700/80`

### 9. Footer and Attribution System

#### TMDb Attribution Implementation
```typescript
const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-4 mt-auto">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/TMDb_Logo.svg" alt="TMDb" className="h-6 w-auto" />
          <span className="text-sm text-gray-400">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Data provided by{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" 
             className="text-blue-400 hover:text-blue-300 transition-colors">
            The Movie Database (TMDb)
          </a>
        </div>
      </div>
    </div>
  </footer>
);
```

**Attribution Features**:
- **Proper Attribution**: Complies with TMDb API terms of service
- **Logo Integration**: Official TMDb logo with proper styling
- **Responsive Design**: Adapts layout for mobile and desktop
- **External Links**: Proper link handling with security attributes

### 10. Theme Management

#### Dark/Light Mode Toggle
```typescript
const { theme, setTheme } = useTheme();

// Toggle implementation
onClick={() => setTheme(theme === "light" ? "dark" : "light")}
```

**Theme Features**:
- **Persistent Storage**: Saves preference to localStorage
- **System Preference**: Respects user's OS theme setting
- **Smooth Transitions**: CSS transitions for theme changes
- **Component Consistency**: All UI components support both themes

### 11. Error Handling & Loading States

#### Comprehensive Error Management
```typescript
// API Error Handling
try {
  const response = await tmdbApi.trending(params);
  return response.results;
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to fetch trending movies",
    variant: "destructive"
  });
  throw error;
}
```

**Error Handling Strategy**:
- **User-Friendly Messages**: Clear error descriptions
- **Toast Notifications**: Non-intrusive error alerts
- **Fallback UI**: Error state components
- **Loading Skeletons**: Placeholder content during loading

### 12. Performance Optimization

#### Caching & Optimization Strategies
- **React Query**: Automatic caching and background refetching
- **Image Optimization**: TMDb CDN for poster images
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Vite's optimized production builds
- **Infinite Scroll Efficiency**: Smart repositioning reduces DOM manipulation
- **Debounced Navigation**: Prevents excessive API calls during rapid user input

## Recent Improvements & Updates (v2.0)

### 🚀 Major Feature Additions

#### Infinite Scroll Carousel
- **True Infinite Scrolling**: Seamless looping where first movie appears after last
- **Triple Array Architecture**: Invisible content duplication for smooth experience  
- **Smart Repositioning**: Automatic section jumping without user awareness
- **Enhanced Debouncing**: 400ms navigation delay for smoother experience

#### Cast Integration System
- **Full Cast Support**: Complete cast member information with photos
- **Dual Layout Modes**: Compact sidebar and full responsive grid layouts
- **TMDb Credits API**: Direct integration with cast/crew endpoints
- **Responsive Design**: Optimized for all screen sizes

#### Visual & UX Enhancements
- **Improved Poster Display**: Larger size (384x600px) with refined borders
- **Better Typography**: Increased font sizes and improved readability
- **Centered Layout**: Perfect poster centering with viewport-based padding
- **Refined UI Elements**: Subtle borders, improved spacing, and visual polish

#### Attribution & Compliance
- **TMDb Footer**: Proper attribution footer with official logo
- **API Compliance**: Meets all TMDb API terms of service requirements
- **Legal Integration**: Proper licensing and attribution links

### 🔧 Technical Improvements

#### Enhanced Navigation System
```typescript
// Advanced keyboard navigation with state management
const [infiniteScrollIndex, setInfiniteScrollIndex] = useState(0);
const [isKeyNavigating, setIsKeyNavigating] = useState(false);

// Debounced navigation prevents rapid-fire scrolling
const timeSinceLastKeyPress = currentTime - lastKeyPressTime.current;
if (timeSinceLastKeyPress < 400) {
  event.preventDefault();
  return;
}
```

#### API Architecture Updates
```typescript
// New credits endpoint integration
async credits(params: { id: string; media_type: string }) {
  const endpoint = params.media_type === 'tv' 
    ? `/tv/${params.id}/credits`
    : `/movie/${params.id}/credits`;
  return this.get(endpoint);
}
```

#### State Management Improvements
- **Dual Index System**: Separate tracking for infinite scroll and focused items
- **Smart Synchronization**: Proper state sync between navigation systems
- **Enhanced Error Recovery**: Better fallback handling for edge cases

### 🎨 Design System Updates

#### Component Architecture
- **Cast Component**: New reusable cast display component
- **Footer Component**: Dedicated attribution footer
- **Enhanced Carousel**: Completely rebuilt with infinite scroll capability

#### Styling Improvements
- **Tailwind Optimization**: Custom utilities and improved responsive classes
- **Visual Hierarchy**: Better contrast and spacing throughout
- **Animation Refinements**: Smoother transitions and micro-interactions

### 📱 Accessibility Enhancements
- **Keyboard Navigation**: Full accessibility support with proper ARIA attributes
- **Screen Reader Support**: Enhanced semantic markup
- **Focus Management**: Improved focus states and navigation flow
- **Responsive Typography**: Better text scaling across devices

## API Integration Details

### TMDb API Wrapper
The application uses a custom API wrapper that interfaces with TMDb through Supabase Edge Functions:

#### Key Endpoints:
- **Trending**: `/trending/all/week` - Weekly trending content
- **Movie Details**: `/movie/{id}` - Individual movie information
- **TV Details**: `/tv/{id}` - Individual TV show information
- **Credits**: `/movie/{id}/credits` & `/tv/{id}/credits` - Cast and crew information
- **Watch Providers**: `/movie/{id}/watch/providers` - Streaming availability

#### Data Transformation:
- **Normalization**: Standardizes movie/TV data structures
- **Field Mapping**: Maps different field names for consistency
- **Error Handling**: Robust error catching and user feedback

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDb API (Server-side)
TMDB_API_KEY=your_tmdb_api_key
```

### Supabase Edge Function Setup
The application uses a Supabase Edge Function to proxy TMDb API requests:

```typescript
// Edge function handles CORS and API key management
const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
const response = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${tmdbApiKey}`);
```

## Development Workflow

### Local Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Type checking and IntelliSense
- **Prettier**: Code formatting (configured via ESLint)

## Deployment

### Build Process
1. **Type Checking**: TypeScript compilation
2. **Bundling**: Vite optimizes assets and creates chunks
3. **Asset Optimization**: Images and CSS optimization
4. **Static Generation**: Builds static files for deployment

### Deployment Platforms
- **Primary**: Netlify (configured for SPA routing)
- **Supabase Functions**: Deployed separately for API functionality
- **Environment Variables**: Configured in deployment platform

## Security Considerations

### API Security
- **CORS Configuration**: Proper cross-origin resource sharing
- **API Key Protection**: Server-side API key storage
- **Rate Limiting**: TMDb API rate limits respected
- **Input Validation**: User input sanitization

### Content Security
- **Image Sources**: Trusted TMDb CDN only
- **XSS Prevention**: React's built-in XSS protection
- **HTTPS**: Secure communication channels

## Future Enhancement Opportunities

### Feature Additions
- **User Authentication**: Personal watchlists and preferences
- **Advanced Search**: Filters by genre, year, rating, and cast
- **Recommendations**: AI-powered personalized content suggestions
- **Multi-language Support**: International content and UI localization
- **Social Features**: User reviews, ratings, and sharing capabilities
- **Watchlist Management**: Save and organize favorite content
- **Recently Viewed**: Track viewing history and resume functionality

### Technical Improvements
- **Progressive Web App**: Offline capability and app-like experience
- **Performance Monitoring**: Real-time analytics and performance tracking
- **A/B Testing**: Feature experimentation and user behavior analysis
- **SEO Optimization**: Server-side rendering for better search indexing
- **Enhanced Caching**: Redis integration for faster data retrieval
- **Microservices**: API architecture improvements for scalability

## Troubleshooting Guide

### Common Issues
1. **API Failures**: Check TMDb API key and Supabase configuration
2. **Build Errors**: Ensure all dependencies are installed
3. **Navigation Issues**: Verify React Router setup
4. **Theme Problems**: Check localStorage and theme provider

### Debug Information
The application includes comprehensive console logging for development:
- API request/response logging
- Navigation state tracking
- Error boundary information
- Performance metrics

## Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **Functional Components**: Hooks-based architecture
- **Component Structure**: Single responsibility principle
- **File Organization**: Feature-based directory structure

### Testing Strategy
While not currently implemented, recommended testing approach:
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing
- **Accessibility Tests**: WCAG compliance verification

---

*This documentation is maintained alongside the codebase and should be updated with any significant changes to the application architecture or features.*
