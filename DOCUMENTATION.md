# Cinema Vault - Comprehensive Application Documentation

## Overview

**Cinema Vault** is a modern, responsive web application for discovering and exploring trending movies and TV shows. Built with React and powered by The Movie Database (TMDb) API, it provides users with an immersive Netflix-style interface to browse entertainment content.

**Demo**: [https://cinema-vault.netlify.app/](https://cinema-vault.netlify.app/)

## Core Features

### 🎬 Content Discovery
- **Trending Content**: Displays weekly trending movies and TV shows
- **Search Functionality**: Real-time search across all available content
- **Detailed Information**: Comprehensive movie/TV show details including ratings, release dates, and descriptions
- **Streaming Providers**: Shows where content is available to stream, rent, or buy in the US

### 🎨 User Experience
- **Netflix-Style Interface**: Horizontal scrolling carousel for content browsing
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Optimized for all device sizes
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Smooth Animations**: Tailwind CSS animations for enhanced user experience

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
│   ├── HorizontalMovieCarousel.tsx  # Main content carousel
│   ├── StreamingProviders.tsx       # Streaming availability
│   ├── Footer.tsx       # Application footer
│   └── theme-provider.tsx          # Theme context provider
├── pages/               # Route components
│   ├── Index.tsx        # Home page with trending content
│   └── MovieDetail.tsx  # Individual movie/show details
├── lib/                 # Utility libraries
│   ├── tmdb.ts          # TMDb API integration
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

### 5. Carousel Implementation

#### Horizontal Scrolling with Focus Management
```typescript
const [focusedIndex, setFocusedIndex] = useState(0);

// Keyboard navigation
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        setFocusedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
        break;
    }
  };
}, [items.length]);
```

**Carousel Features**:
- **Keyboard Navigation**: Arrow keys for browsing
- **Focus Management**: Visual feedback for current selection
- **Smooth Scrolling**: Automatic scroll to focused item
- **Click Interaction**: Mouse/touch support
- **Responsive Design**: Adapts to different screen sizes

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

### 7. Theme Management

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

### 8. Error Handling & Loading States

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

### 9. Performance Optimization

#### Caching & Optimization Strategies
- **React Query**: Automatic caching and background refetching
- **Image Optimization**: TMDb CDN for poster images
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Vite's optimized production builds

## API Integration Details

### TMDb API Wrapper
The application uses a custom API wrapper that interfaces with TMDb through Supabase Edge Functions:

#### Key Endpoints:
- **Trending**: `/trending/all/week` - Weekly trending content
- **Movie Details**: `/movie/{id}` - Individual movie information
- **TV Details**: `/tv/{id}` - Individual TV show information
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
- **Advanced Search**: Filters by genre, year, rating
- **Recommendations**: Personalized content suggestions
- **Multi-language Support**: International content and UI
- **Social Features**: Sharing and reviews

### Technical Improvements
- **Progressive Web App**: Offline capability and app-like experience
- **Performance Monitoring**: Analytics and performance tracking
- **A/B Testing**: Feature experimentation framework
- **SEO Optimization**: Server-side rendering for better indexing

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
