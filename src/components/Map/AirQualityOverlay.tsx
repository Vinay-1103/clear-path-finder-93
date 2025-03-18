
import React from 'react';
import { motion } from 'framer-motion';

interface AirQualityOverlayProps {
  data: any[];
}

export const AirQualityOverlay: React.FC<AirQualityOverlayProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-lg"
    >
      <h2 className="text-lg font-semibold mb-2">Air Quality Index</h2>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Good (0-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Poor (>100)</span>
        </div>
      </div>
    </motion.div>
  );
};
