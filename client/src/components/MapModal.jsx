import React, { useState, useEffect } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CITY_COORDINATES = {
  "Toshkent": [41.2995, 69.2401],
  "Samarqand": [39.6542, 66.9597],
  "Buxoro": [39.7745, 64.4286],
  "Andijon": [40.7821, 72.3442],
  "Farg'ona": [40.3842, 71.7891],
  "Namangan": [41.0011, 71.6722],
  "Qarshi": [38.8612, 65.7986],
  "Termiz": [37.2241, 67.2783],
  "Navoiy": [40.1033, 65.3792],
  "Jizzax": [40.1158, 67.8422],
  "Urganch": [41.5534, 60.6317],
  "Nukus": [42.4628, 59.6031]
};

// Create custom icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const normalIcon = createCustomIcon('green'); // Using green for emerald
const vipIcon = createCustomIcon('gold');

// Component to handle map view updates when region changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function MapModal({ isOpen, onClose, products = [], onSelectProduct }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  if (!isOpen) return null;

  // Find unique regions from products that have coordinates
  const availableRegions = [...new Set(products
    .map(p => p.location)
    .filter(loc => CITY_COORDINATES[loc]))
  ];

  const filteredProducts = selectedRegion 
    ? products.filter(p => p.location === selectedRegion)
    : products.filter(p => CITY_COORDINATES[p.location]);

  const defaultCenter = [41.3, 64.5];
  const defaultZoom = 6;
  
  const mapCenter = selectedRegion && CITY_COORDINATES[selectedRegion]
    ? CITY_COORDINATES[selectedRegion]
    : defaultCenter;
    
  const mapZoom = selectedRegion ? 10 : defaultZoom;

  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Map Area */}
        <div className="flex-1 h-full relative z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={defaultZoom} 
            className="w-full h-full"
            style={{ backgroundColor: '#e5e7eb' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles" // Add class to allow CSS dark mode filtering if desired
            />
            
            <MapUpdater center={mapCenter} zoom={mapZoom} />

            {filteredProducts.map(product => {
              const coords = CITY_COORDINATES[product.location];
              if (!coords) return null;
              
              // Add slight random offset for multiple products in same city
              const latOffset = (Math.random() - 0.5) * 0.05;
              const lngOffset = (Math.random() - 0.5) * 0.05;
              
              return (
                <Marker 
                  key={product.id} 
                  position={[coords[0] + latOffset, coords[1] + lngOffset]}
                  icon={product.is_vip ? vipIcon : normalIcon}
                >
                  <Popup className="product-popup">
                    <div 
                      className="w-48 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <img 
                        src={product.primary_image || 'https://via.placeholder.com/150'} 
                        alt={product.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm">
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white">
                          {product.title}
                        </h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                          {product.price?.toLocaleString()} {product.currency || 'UZS'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {product.location}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 h-full bg-gray-50 dark:bg-gray-800/50 border-l border-gray-200 dark:border-gray-700 flex flex-col z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Xaritadan qidirish
            </h2>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRegion(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedRegion === null 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Barchasi
              </button>
              {availableRegions.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {filteredProducts.length} ta e'lon topildi
            </h3>
            
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white dark:bg-gray-900 rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <img 
                  src={product.primary_image || 'https://via.placeholder.com/150'} 
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                    {product.title}
                  </h4>
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {product.price?.toLocaleString()} {product.currency || 'UZS'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Bu hududda e'lonlar yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        /* Dark mode map tiles */
        .dark .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        /* Fix popup styles in dark mode */
        .dark .leaflet-popup-content-wrapper {
          background-color: #1f2937;
          color: #f3f4f6;
        }
        .dark .leaflet-popup-tip {
          background-color: #1f2937;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
