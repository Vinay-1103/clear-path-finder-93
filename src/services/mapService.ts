
import axios from 'axios';
import { toast } from 'sonner';

export const searchLocations = async (query: string) => {
  if (!query) {
    return [];
  }
  
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    return response.data.slice(0, 5);
  } catch (error) {
    console.error('Error searching locations:', error);
    toast.error("Error searching for locations");
    return [];
  }
};

export const fetchAQIData = async (iqairToken: string, isInitial = false) => {
  try {
    // For initial load, fetch USA bounds
    const bounds = isInitial 
      ? "24.396308,-125.000000,49.384358,-66.934570" 
      : null;
    
    if (isInitial) {
      toast.info("Loading air quality data...");
      const response = await axios.get(
        `https://api.waqi.info/v2/map/bounds?latlng=${bounds}&token=${iqairToken}`
      );
      
      if (response.data && response.data.data) {
        const processedData = response.data.data.map((station: any) => {
          return {
            ...station,
            // Add a readable category for display
            category: getAQICategory(station.aqi)
          };
        });
        toast.success("Air quality data loaded successfully");
        return processedData || [];
      } else {
        toast.warning("No air quality data available. Please check your API key.");
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    toast.error("Failed to load air quality data. Please check your API key.");
    return [];
  }
};

export const fetchAQIDataForLocation = async (lat: number, lon: number, iqairToken: string) => {
  try {
    toast.info("Loading air quality data for this location...");
    
    // Define a bounding box around the selected location (roughly 20km in each direction)
    const offset = 0.18; // roughly 20km in decimal degrees
    const response = await axios.get(
      `https://api.waqi.info/v2/map/bounds?latlng=${lat-offset},${lon-offset},${lat+offset},${lon+offset}&token=${iqairToken}`
    );
    
    if (response.data && response.data.data) {
      const processedData = response.data.data.map((station: any) => {
        return {
          ...station,
          category: getAQICategory(station.aqi)
        };
      });
      
      if (processedData.length > 0) {
        toast.success(`Found ${processedData.length} air quality stations in this area`);
      } else {
        toast.warning("No air quality data available for this location");
      }
      
      return processedData || [];
    } else {
      toast.warning("No air quality data available for this location");
      return [];
    }
  } catch (error) {
    console.error('Error fetching AQI data for location:', error);
    toast.error("Failed to load air quality data");
    return [];
  }
};

export const fetchRoute = async (start: { lat: number; lon: number }, end: { lat: number; lon: number }) => {
  try {
    toast.info("Calculating route...");
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
    );
    toast.success("Route calculated successfully");
    return response.data.routes[0].geometry;
  } catch (error) {
    console.error('Error fetching route:', error);
    toast.error("Error fetching route");
    return null;
  }
};

export const getRouteAQI = async (coordinates: number[][], iqairToken: string) => {
  try {
    toast.info("Analyzing air quality along route...");
    
    // Use a reasonable number of samples to avoid rate limiting
    const maxSamples = 10;
    const stride = Math.max(1, Math.floor(coordinates.length / maxSamples));
    const sampledCoordinates = coordinates.filter((_, i) => i % stride === 0).slice(0, maxSamples);
    
    const aqiPromises = sampledCoordinates.map(async ([lon, lat]) => {
      try {
        const response = await axios.get(
          `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${iqairToken}`
        );
        return response.data.data.aqi;
      } catch (e) {
        console.error("Error fetching AQI for coordinate:", e);
        // Return default value if we can't get AQI for this point
        return 50; 
      }
    });

    const aqiValues = await Promise.all(aqiPromises);
    toast.success("Route air quality analysis complete");
    return aqiValues;
  } catch (error) {
    console.error('Error fetching route AQI:', error);
    toast.error("Error fetching air quality data for route");
    return [];
  }
};

// Helper function to categorize AQI values
const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};
