
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface RouteSearchProps {
  onRouteSelect: (start: { lat: number; lon: number }, end: { lat: number; lon: number }) => void;
}

export const RouteSearch: React.FC<RouteSearchProps> = ({ onRouteSelect }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startResults, setStartResults] = useState<any[]>([]);
  const [endResults, setEndResults] = useState<any[]>([]);
  const [selectedStart, setSelectedStart] = useState<any>(null);
  const [selectedEnd, setSelectedEnd] = useState<any>(null);

  const handleSearch = async (query: string, isStart: boolean) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (isStart) {
        setStartResults(data.slice(0, 5));
      } else {
        setEndResults(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleSelectLocation = (location: any, isStart: boolean) => {
    if (isStart) {
      setStartLocation(location.display_name);
      setSelectedStart(location);
      setStartResults([]);
    } else {
      setEndLocation(location.display_name);
      setSelectedEnd(location);
      setEndResults([]);
    }

    if (selectedStart && !isStart) {
      onRouteSelect(
        { lat: parseFloat(selectedStart.lat), lon: parseFloat(selectedStart.lon) },
        { lat: parseFloat(location.lat), lon: parseFloat(location.lon) }
      );
    } else if (selectedEnd && isStart) {
      onRouteSelect(
        { lat: parseFloat(location.lat), lon: parseFloat(location.lon) },
        { lat: parseFloat(selectedEnd.lat), lon: parseFloat(selectedEnd.lon) }
      );
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md space-y-2">
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Start location"
              value={startLocation}
              onChange={(e) => {
                setStartLocation(e.target.value);
                handleSearch(e.target.value, true);
              }}
              className="pl-9"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          {startResults.length > 0 && (
            <ul className="absolute w-full bg-white shadow-lg rounded-md mt-1 z-50">
              {startResults.map((result, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(result, true)}
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Destination"
              value={endLocation}
              onChange={(e) => {
                setEndLocation(e.target.value);
                handleSearch(e.target.value, false);
              }}
              className="pl-9"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          {endResults.length > 0 && (
            <ul className="absolute w-full bg-white shadow-lg rounded-md mt-1 z-50">
              {endResults.map((result, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(result, false)}
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
