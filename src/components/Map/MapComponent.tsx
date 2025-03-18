
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAQIColor } from '@/lib/utils';

interface MapComponentProps {
  aqiData: any[];
  selectedLocation: [number, number] | null;
  onMapInitialized: (mapInstance: L.Map) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  aqiData, 
  selectedLocation, 
  onMapInitialized 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      // Default view of USA
      mapRef.current = L.map(mapContainer.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ],
        zoomControl: false
      });

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
      
      // Pass the map instance to the parent component
      onMapInitialized(mapRef.current);
      
      // Force a resize event to ensure the map renders properly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 500);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapInitialized]);

  // Update map with AQI data
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(aqiData) || aqiData.length === 0) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        layer.remove();
      }
    });

    // Add AQI data points to the map
    aqiData.forEach((point) => {
      if (point && typeof point.lat === 'number' && typeof point.lon === 'number' && typeof point.aqi === 'number') {
        L.circleMarker([point.lat, point.lon], {
          radius: 8,
          fillColor: getAQIColor(point.aqi),
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
          .addTo(mapRef.current!)
          .bindPopup(`<b>AQI: ${point.aqi}</b><br>${point.station?.name || 'Unknown Station'}`);
      }
    });
  }, [aqiData]);

  // Update map when selected location changes
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    const [lat, lon] = selectedLocation;
    
    mapRef.current.setView([lat, lon], 12);
    
    // Clear existing markers first
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
    
    // Add a marker for the selected location
    const marker = L.marker([lat, lon]).addTo(mapRef.current);
    marker.bindPopup(`<b>Selected Location</b>`).openPopup();
    
  }, [selectedLocation]);

  return <div ref={mapContainer} className="map-container" />;
};
