
import React, { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { MapContainer } from './MapStyles';
import { AirQualityOverlay } from './AirQualityOverlay';
import { SearchBar } from './SearchBar';
import { RouteSearch } from './RouteSearch';
import { TokenInput } from './TokenInput';
import { MapComponent } from './MapComponent';
import { searchLocations, fetchAQIData, fetchAQIDataForLocation, fetchRoute, getRouteAQI } from '@/services/mapService';
import { toast } from 'sonner';

const Map = () => {
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [iqairToken, setIqairToken] = useState(localStorage.getItem('iqair_token') || '');
  const [showMap, setShowMap] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
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
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchLocations(query);
      setSearchResults(results);
    } catch (error) {
      toast.error("Error searching for locations");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = async (location: any) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    setSelectedLocation([lat, lon]);
    setSearchResults([]);
    
    setIsLoading(true);
    try {
      const data = await fetchAQIDataForLocation(lat, lon, iqairToken);
      setAqiData(data);
    } catch (error) {
      toast.error("Failed to load air quality data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = async (start: { lat: number; lon: number }, end: { lat: number; lon: number }) => {
    try {
      setIsLoading(true);
      const routeGeometry = await fetchRoute(start, end);
      if (routeGeometry) {
        const coordinates = routeGeometry.coordinates;
        const sampledCoordinates = coordinates.filter((_, index) => index % 10 === 0);
        const aqiValues = await getRouteAQI(sampledCoordinates, iqairToken);
        setRouteData({ coordinates, aqiValues });
      }
    } catch (error) {
      console.error('Error handling route selection:', error);
      toast.error("Error calculating route");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapInitialized = useCallback((mapInstance: L.Map) => {
    map.current = mapInstance;
    setMapInitialized(true);
    
    setIsLoading(true);
    fetchAQIData(iqairToken, true).then(data => {
      setAqiData(data);
      setIsLoading(false);
    }).catch(error => {
      console.error("Error loading initial AQI data:", error);
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
        routeData={routeData}
      />
      
      <SearchBar 
        onSearch={handleSearch} 
        searchResults={searchResults} 
        onSelectLocation={handleSelectLocation}
        isLoading={isSearching}
      />
      
      <RouteSearch onRouteSelect={handleRouteSelect} />
      
      <AirQualityOverlay data={aqiData} isLoading={isLoading} />
    </MapContainer>
  );
};

export default Map;
