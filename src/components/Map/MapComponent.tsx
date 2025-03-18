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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

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
      
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      routeLayerRef.current = L.layerGroup().addTo(mapRef.current);
      
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
        markersLayerRef.current = null;
        routeLayerRef.current = null;
      }
    };
  }, [onMapInitialized]);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !Array.isArray(aqiData)) return;

    markersLayerRef.current.clearLayers();

    aqiData.forEach((point) => {
      if (point && typeof point.lat === 'number' && typeof point.lon === 'number' && typeof point.aqi === 'number') {
        const circleMarker = L.circleMarker([point.lat, point.lon], {
          radius: 8,
          fillColor: getAQIColor(point.aqi),
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup(`
          <div style="text-align: center;">
            <h3 style="margin: 0; font-weight: bold;">AQI: ${point.aqi}</h3>
            <div style="font-size: 0.9em; margin-top: 5px;">${point.station?.name || 'Unknown Station'}</div>
            <div style="margin-top: 5px; padding: 5px; background-color: ${getAQIColor(point.aqi)}; color: white; border-radius: 4px;">
              ${getAQILabel(point.aqi)}
            </div>
          </div>
        `);

        const pulseIcon = L.divIcon({
          html: `<div class="pulse-icon" style="background-color: ${getAQIColor(point.aqi)};"></div>`,
          className: 'pulse-icon-wrapper',
          iconSize: [20, 20]
        });

        if (!document.getElementById('pulse-icon-style')) {
          const style = document.createElement('style');
          style.id = 'pulse-icon-style';
          style.innerHTML = `
            .pulse-icon-wrapper {
              background-color: transparent;
            }
            .pulse-icon {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              position: relative;
            }
            .pulse-icon:before {
              content: '';
              position: absolute;
              width: 200%;
              height: 200%;
              left: -50%;
              top: -50%;
              background-color: inherit;
              border-radius: 50%;
              opacity: 0.6;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% {
                transform: scale(0.5);
                opacity: 0.6;
              }
              50% {
                opacity: 0.3;
              }
              100% {
                transform: scale(1.2);
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(style);
        }

        circleMarker.addTo(markersLayerRef.current!);
        
        if (point.aqi > 100) {
          L.marker([point.lat, point.lon], { icon: pulseIcon }).addTo(markersLayerRef.current!);
        }
      }
    });
  }, [aqiData]);

  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    const [lat, lon] = selectedLocation;
    
    mapRef.current.setView([lat, lon], 12);
    
    const existingMarkers = document.querySelectorAll('.leaflet-marker-icon:not(.pulse-icon-wrapper)');
    existingMarkers.forEach(marker => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    });
    
    const marker = L.marker([lat, lon]).addTo(mapRef.current);
    marker.bindPopup(`<b>Selected Location</b><br>Analyzing air quality...`).openPopup();
    
  }, [selectedLocation]);

  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current || !routeData) return;

    routeLayerRef.current.clearLayers();

    if (routeData.coordinates && routeData.aqiValues) {
      const routeCoordinates = routeData.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      
      for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const segmentStart = routeCoordinates[i];
        const segmentEnd = routeCoordinates[i + 1];
        const segmentIndex = Math.floor(i * routeData.aqiValues.length / routeCoordinates.length);
        const aqi = routeData.aqiValues[segmentIndex] || 0;
        
        const polyline = L.polyline([segmentStart, segmentEnd], {
          color: getAQIColor(aqi),
          weight: 5,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).bindPopup(`Air Quality Index: ${aqi} (${getAQILabel(aqi)})`);
        
        polyline.addTo(routeLayerRef.current);
      }
      
      const startPoint = routeCoordinates[0];
      const endPoint = routeCoordinates[routeCoordinates.length - 1];
      
      L.marker(startPoint, {
        icon: createCustomIcon('green', 'A')
      }).addTo(routeLayerRef.current).bindPopup('Starting Point');
      
      L.marker(endPoint, {
        icon: createCustomIcon('red', 'B')
      }).addTo(routeLayerRef.current).bindPopup('Destination');

      const bounds = L.latLngBounds(routeCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData]);

  const createCustomIcon = (color: string, letter: string) => {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${letter}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return <div ref={mapContainer} className="map-container" />;
};
