
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { MapContainer } from './MapStyles';
import { AirQualityOverlay } from './AirQualityOverlay';
import { getAQIColor } from '@/lib/utils';

// Temporary solution for development - in production, use environment variables
const MAPBOX_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN';
const IQAIR_API_KEY = 'YOUR_IQAIR_API_KEY';

mapboxgl.accessToken = MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [aqiData, setAqiData] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

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
          `https://api.waqi.info/v2/map/bounds?latlng=39.379436,116.091230,40.235643,116.784382&token=${IQAIR_API_KEY}`
        );
        setAqiData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching AQI data:', error);
      }
    };

    fetchAQIData();

    return () => {
      map.current?.remove();
    };
  }, []);

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

  return (
    <MapContainer>
      <div ref={mapContainer} className="map-container" />
      <AirQualityOverlay data={aqiData} />
    </MapContainer>
  );
};

export default Map;
