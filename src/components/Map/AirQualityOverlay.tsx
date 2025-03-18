
import React from 'react';
import { motion } from 'framer-motion';

interface AirQualityOverlayProps {
  data: any[];
}

export const AirQualityOverlay: React.FC<AirQualityOverlayProps> = ({ data }) => {
  // Count AQI by category
  const aqiCounts = data.reduce((acc, point) => {
    const aqi = point.aqi;
    if (aqi <= 50) acc.good++;
    else if (aqi <= 100) acc.moderate++;
    else acc.poor++;
    return acc;
  }, { good: 0, moderate: 0, poor: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-4 bottom-4 p-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 max-w-xs z-10"
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Air Quality Index</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">Good (0-50)</span>
          </div>
          <span className="font-medium text-sm">{aqiCounts.good} stations</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Moderate (51-100)</span>
          </div>
          <span className="font-medium text-sm">{aqiCounts.moderate} stations</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm">Poor (&gt;100)</span>
          </div>
          <span className="font-medium text-sm">{aqiCounts.poor} stations</span>
        </div>
      </div>
      
      {data.length === 0 && (
        <p className="text-sm text-gray-500 mt-2 italic">No air quality data available for this area.</p>
      )}
    </motion.div>
  );
};
