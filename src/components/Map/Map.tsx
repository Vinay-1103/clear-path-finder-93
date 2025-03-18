
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { MapContainer } from './MapStyles';
import { AirQualityOverlay } from './AirQualityOverlay';
import { getAQIColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [iqairToken, setIqairToken] = useState(localStorage.getItem('iqair_token') || '');
  const [showMap, setShowMap] = useState(false);

  const handleSaveToken = () => {
    localStorage.setItem('iqair_token', iqairToken);
    setShowMap(true);
  };

  useEffect(() => {
    if (!mapContainer.current || !showMap) return;

    try {
      map.current = L.map(mapContainer.current).setView([40, -74.5], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map.current);

      // Load AQI data
      const fetchAQIData = async () => {
        try {
          const response = await axios.get(
            `https://api.waqi.info/v2/map/bounds?latlng=39.379436,116.091230,40.235643,116.784382&token=${iqairToken}`
          );
          setAqiData(response.data.data || []);
        } catch (error) {
          console.error('Error fetching AQI data:', error);
        }
      };

      fetchAQIData();
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [showMap, iqairToken]);

  useEffect(() => {
    if (!map.current || !aqiData.length) return;

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        layer.remove();
      }
    });

    // Add AQI data points to the map
    aqiData.forEach((point) => {
      L.circleMarker([point.lat, point.lon], {
        radius: 8,
        fillColor: getAQIColor(point.aqi),
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(map.current!)
        .bindPopup(`AQI: ${point.aqi}`);
    });
  }, [aqiData]);

  if (!showMap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">IQAir Token</label>
            <Input
              type="text"
              placeholder="Enter your IQAir API key"
              value={iqairToken}
              onChange={(e) => setIqairToken(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a href="https://www.iqair.com/air-pollution-data-api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                IQAir
              </a>
            </p>
          </div>
          <Button onClick={handleSaveToken} className="w-full">
            Show Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MapContainer>
      <div ref={mapContainer} className="map-container" />
      <AirQualityOverlay data={aqiData} />
    </MapContainer>
  );
};

export default Map;
