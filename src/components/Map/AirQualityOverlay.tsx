
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AirQualityOverlayProps {
  data: any[];
  isLoading?: boolean;
}

export const AirQualityOverlay: React.FC<AirQualityOverlayProps> = ({ data, isLoading = false }) => {
  // Safely check if data is an array before using reduce
  const aqiCounts = Array.isArray(data) ? data.reduce((acc, point) => {
    const aqi = point.aqi;
    if (aqi <= 50) acc.good++;
    else if (aqi <= 100) acc.moderate++;
    else acc.poor++;
    return acc;
  }, { good: 0, moderate: 0, poor: 0 }) : { good: 0, moderate: 0, poor: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute right-4 bottom-4 p-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 max-w-xs z-50"
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Air Quality Index</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Loading data...</span>
        </div>
      ) : (
        <>
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
          
          {(!Array.isArray(data) || data.length === 0) && (
            <p className="text-sm text-gray-500 mt-2 italic">No air quality data available for this area.</p>
          )}
        </>
      )}
    </motion.div>
  );
};
