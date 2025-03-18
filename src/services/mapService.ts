
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
      const response = await axios.get(
        `https://api.waqi.info/v2/map/bounds?latlng=${bounds}&token=${iqairToken}`
      );
      
      if (response.data && response.data.data) {
        return response.data.data || [];
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
    // Define a bounding box around the selected location (roughly 20km in each direction)
    const offset = 0.18; // roughly 20km in decimal degrees
    const response = await axios.get(
      `https://api.waqi.info/v2/map/bounds?latlng=${lat-offset},${lon-offset},${lat+offset},${lon+offset}&token=${iqairToken}`
    );
    
    if (response.data && response.data.data) {
      return response.data.data || [];
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
