import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAQIColor } from '@/lib/utils';

interface MapComponentProps {
  aqiData: any[];
  selectedLocation: [number, number] | null;
  onMapInitialized: (mapInstance: L.Map) => void;
  routeData?: any;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  aqiData, 
  selectedLocation, 
  onMapInitialized,
  routeData 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
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

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
      
      onMapInitialized(mapRef.current);
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 500);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapInitialized]);

  useEffect(() => {
    if (!mapRef.current || !Array.isArray(aqiData) || aqiData.length === 0) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        layer.remove();
      }
    });

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

  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    const [lat, lon] = selectedLocation;
    
    mapRef.current.setView([lat, lon], 12);
    
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
    
    const marker = L.marker([lat, lon]).addTo(mapRef.current);
    marker.bindPopup(`<b>Selected Location</b>`).openPopup();
    
  }, [selectedLocation]);

  useEffect(() => {
    if (!mapRef.current || !routeData) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        layer.remove();
      }
    });

    if (routeData.coordinates && routeData.aqiValues) {
      for (let i = 0; i < routeData.coordinates.length - 1; i++) {
        const segment = [
          routeData.coordinates[i],
          routeData.coordinates[i + 1]
        ];
        const aqi = routeData.aqiValues[i] || 0;
        
        L.polyline(segment.map(coord => [coord[1], coord[0]]), {
          color: getAQIColor(aqi),
          weight: 4,
          opacity: 0.8
        }).addTo(mapRef.current);
      }

      const bounds = L.latLngBounds(routeData.coordinates.map((coord: number[]) => [coord[1], coord[0]]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData]);

  return <div ref={mapContainer} className="map-container" />;
};
