import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'LocationTrackerAdmin/1.0'
          }
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const selectLocation = (result: any) => {
    onLocationSelect(
      parseFloat(result.lat),
      parseFloat(result.lon),
      result.display_name
    );
    setResults([]);
    setQuery('');
  };

  return (
    <div className="relative">
      <form onSubmit={searchLocation} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Search size={20} />
        </button>
      </form>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.place_id}
              onClick={() => selectLocation(result)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};