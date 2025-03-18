
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults: any[];
  onSelectLocation: (location: any) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  searchResults, 
  onSelectLocation,
  isLoading = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div 
      ref={searchRef}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md"
    >
      <div className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for a location..."
              value={query}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              className="pl-9 pr-8 w-full bg-white/90 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-indigo-300"
            />
            {query && (
              <button 
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !query.trim()} 
            variant="default" 
            size="sm"
            className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>

        <AnimatePresence>
          {isFocused && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm rounded-md shadow-lg max-h-60 overflow-y-auto z-20"
            >
              <ul className="py-1">
                {searchResults.map((result, index) => (
                  <li 
                    key={index}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex items-start gap-2"
                    onClick={() => {
                      onSelectLocation(result);
                      setQuery(result.display_name.split(',')[0]);
                      setIsFocused(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-indigo-500" />
                    <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
