
import React, { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { MapContainer } from './MapStyles';
import { AirQualityOverlay } from './AirQualityOverlay';
import { SearchBar } from './SearchBar';
import { TokenInput } from './TokenInput';
import { MapComponent } from './MapComponent';
import { searchLocations, fetchAQIData, fetchAQIDataForLocation } from '@/services/mapService';
import { toast } from 'sonner';

const Map = () => {
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [iqairToken, setIqairToken] = useState(localStorage.getItem('iqair_token') || '');
  const [showMap, setShowMap] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const map = useRef<L.Map | null>(null);

  const handleSaveToken = () => {
    if (!iqairToken.trim()) {
      toast.error("Please enter a valid IQAir API token");
      return;
    }
    
    localStorage.setItem('iqair_token', iqairToken);
    setShowMap(true);
  };

  const handleSearch = async (query: string) => {
    const results = await searchLocations(query);
    setSearchResults(results);
  };

  const handleSelectLocation = async (location: any) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    setSelectedLocation([lat, lon]);
    setSearchResults([]);
    
    // Fetch AQI data for the selected location area
    setIsLoading(true);
    const data = await fetchAQIDataForLocation(lat, lon, iqairToken);
    setAqiData(data);
    setIsLoading(false);
  };
  
  // Memoize the map initialization callback to prevent re-renders
  const handleMapInitialized = useCallback((mapInstance: L.Map) => {
    map.current = mapInstance;
    setMapInitialized(true);
    
    // After map is initialized, fetch initial AQI data
    setIsLoading(true);
    fetchAQIData(iqairToken, true).then(data => {
      setAqiData(data);
      setIsLoading(false);
    });
  }, [iqairToken]);

  if (!showMap) {
    return (
      <TokenInput 
        iqairToken={iqairToken} 
        setIqairToken={setIqairToken} 
        handleSaveToken={handleSaveToken} 
      />
    );
  }

  return (
    <MapContainer>
      <MapComponent 
        aqiData={aqiData} 
        selectedLocation={selectedLocation} 
        onMapInitialized={handleMapInitialized} 
      />
      
      <SearchBar 
        onSearch={handleSearch} 
        searchResults={searchResults} 
        onSelectLocation={handleSelectLocation} 
      />
      
      <AirQualityOverlay data={aqiData} isLoading={isLoading} />
    </MapContainer>
  );
};

export default Map;
