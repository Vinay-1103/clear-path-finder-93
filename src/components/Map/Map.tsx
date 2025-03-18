
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { MapContainer } from './MapStyles';
import { AirQualityOverlay } from './AirQualityOverlay';
import { getAQIColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [aqiData, setAqiData] = useState<any[]>([]);
  const [mapboxToken, setMapboxToken] = useState(localStorage.getItem('mapbox_token') || '');
  const [iqairToken, setIqairToken] = useState(localStorage.getItem('iqair_token') || '');
  const [showMap, setShowMap] = useState(false);

  const handleSaveTokens = () => {
    localStorage.setItem('mapbox_token', mapboxToken);
    localStorage.setItem('iqair_token', iqairToken);
    setShowMap(true);
  };

  useEffect(() => {
    if (!mapContainer.current || !showMap || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40],
        zoom: 9,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
  }, [showMap, mapboxToken, iqairToken]);

  useEffect(() => {
    if (!map.current || !aqiData.length) return;

    // Add AQI data points to the map
    map.current.on('load', () => {
      map.current?.addSource('aqi-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: aqiData.map((point) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lon, point.lat],
            },
            properties: {
              aqi: point.aqi,
              color: getAQIColor(point.aqi),
            },
          })),
        },
      });

      map.current?.addLayer({
        id: 'aqi-points',
        type: 'circle',
        source: 'aqi-data',
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.8,
        },
      });
    });
  }, [aqiData]);

  if (!showMap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mapbox Token</label>
            <Input
              type="text"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your token from{' '}
              <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Mapbox
              </a>
            </p>
          </div>
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
          <Button onClick={handleSaveTokens} className="w-full">
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
