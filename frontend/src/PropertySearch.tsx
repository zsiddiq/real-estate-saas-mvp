// frontend/src/PropertySearch.tsx - COMPLETE LOGIC WITH MAP INTEGRATION & DEBUG LOG

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropertyMap from './PropertyMap'; 

// Interface for the data coming back from the Edge Function
interface Property {
  apn: string;
  address_full: string;
  city: string;
  state: string;
  zip_code: string;
  total_score: number;
  confidence_score: number;
  bed_count: number;
  bath_count: number;
  square_footage: number;
  year_built: number;
  lat?: number;
  lng?: number;
}

const API_ENDPOINT = 'https://nxbmoohozcsvglqsaujm.supabase.co/functions/v1/search-properties';
// 🛑 IMPORTANT: KEEP YOUR ACTUAL KEY HERE. 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Ym1vb2hvemNzdmdscXNhdWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjEzNDAsImV4cCI6MjA3NzMzNzM0MH0.5HKg3umeAR02xbTSfCi7Ye0wvVMWrD_z7RRH7817h0c'; 

const PropertySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState(70);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The function to call our deployed Supabase Edge Function
  const fetchProperties = useCallback(async () => {
    if (!ANON_KEY.startsWith('eyJ')) {
      setError("❌ ERROR: Please replace 'YOUR_ANON_PUBLIC_KEY' with your actual key.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.get(
        `${API_ENDPOINT}?q=${query}&minConfidence=${minConfidence}`,
        {
          headers: {
            Authorization: `Bearer ${ANON_KEY}`,
          },
        }
      );
      
      // The Edge Function returns data inside a 'data' property
      
      // 🚨 DEBUGGING LINE: CHECK THE DATA STRUCTURE!
      console.log('API Response Data for Debug:', response.data.data); 
      
      setResults(response.data.data as Property[] || []); 

    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from API. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, [query, minConfidence]);

  // Fetch results when the component loads and when search criteria change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchProperties();
    }, 500); // Debounce to prevent immediate API calls on every keystroke

    return () => clearTimeout(timeoutId);
  }, [fetchProperties]);


  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Real Estate Investment Search 📈</h1>
      
      <div className="flex space-x-4 mb-8 bg-gray-100 p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Search address, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg flex-grow focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex items-center space-x-2">
            <label htmlFor="confidence" className="whitespace-nowrap">Min Confidence:</label>
            <input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg w-20 text-center"
            />
        </div>
      </div>

      {loading && <p className="text-blue-600 font-semibold">Loading properties...</p>}
      {error && <p className="text-red-600 font-bold">{error}</p>}

      <PropertyMap properties={results} />
      
      <div className="space-y-4 mt-8"> 
        {results.length === 0 && !loading && !error && (
            <p className="text-gray-500">No properties found matching your criteria. Try changing the confidence score.</p>
        )}
        
        {results.map((prop) => (
          <div key={prop.apn} className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-lg transition duration-150 ease-in-out bg-white">
            <h2 className="text-xl font-semibold text-blue-700">{prop.address_full}, {prop.city}</h2>
            <p className="mt-2 text-sm text-gray-600">
                **Investment Score:** <span className="font-bold text-green-600">{prop.total_score || 'N/A'}</span> | 
                **Confidence:** {prop.confidence_score}% | 
                **Beds/Baths:** {prop.bed_count || 'N/A'}/{prop.bath_count || 'N/A'} |
                **Sq. Ft.:** {prop.square_footage || 'N/A'} |
                **Year Built:** {prop.year_built || 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySearch;