import React, { useState, useEffect, useRef } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../../data/mockData';

const GoogleMap = ({ units, onMarkerClick, filters }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;
      const mossoro = { lat: -5.1878, lng: -37.3442 };
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: mossoro,
        zoom: 13,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      setMap(newMap);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!map) return;

    // Limpar marcadores antigos
    markers.forEach(m => m.setMap(null));
    
    // Filtragem no mapa
    const filteredUnits = units.filter(u => {
      if (filters.types.length > 0 && !filters.types.includes(u.type)) return false;
      if (filters.urgency && !u.urgency) return false;
      if (filters.open24h && !u.open24h) return false;
      return true;
    });

    const newMarkers = filteredUnits.map(unit => {
      const marker = new window.google.maps.Marker({
        position: { lat: unit.lat, lng: unit.lng },
        map,
        title: unit.name,
        label: {
          text: unit.name,
          color: "#C0392B",
          fontSize: "10px",
          fontWeight: "bold"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#E74C3C",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        }
      });
      marker.addListener("click", () => onMarkerClick(unit));
      return marker;
    });
    setMarkers(newMarkers);

  }, [map, units, filters]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-none md:rounded-lg" />;
};

export default GoogleMap;