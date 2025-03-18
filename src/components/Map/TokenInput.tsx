
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TokenInputProps {
  iqairToken: string;
  setIqairToken: (token: string) => void;
  handleSaveToken: () => void;
}

export const TokenInput: React.FC<TokenInputProps> = ({ 
  iqairToken, 
  setIqairToken, 
  handleSaveToken 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-gradient-to-br from-sky-50 to-indigo-100">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-indigo-700">Air Quality Map</h1>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">IQAir Token</label>
          <Input
            type="text"
            placeholder="Enter your IQAir API key"
            value={iqairToken}
            onChange={(e) => setIqairToken(e.target.value)}
            className="border-indigo-200 focus:border-indigo-400"
          />
          <p className="text-xs text-gray-500">
            Get your API key from{' '}
            <a href="https://www.iqair.com/air-pollution-data-api" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 hover:underline">
              IQAir
            </a>
          </p>
        </div>
        <Button onClick={handleSaveToken} className="w-full bg-indigo-600 hover:bg-indigo-700">
          Show Map
        </Button>
      </div>
    </div>
  );
};
