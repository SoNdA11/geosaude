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
    
    const poiStyle = [
      {
        featureType: "poi", 
        elementType: "labels", 
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ lightness: 100 }, { visibility: "simplified" }]
      }
    ];

    const newMap = new window.google.maps.Map(mapRef.current, {
        center: mossoro,
        zoom: 13,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: poiStyle, 
    });
    setMap(newMap);
};

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!map) return;

    markers.forEach(m => m.setMap(null));
    
    const filteredUnits = units.filter(u => {
      if (filters && filters.types.length > 0 && !filters.types.includes(u.type)) return false;
      if (filters && filters.urgency && !u.urgency) return false;
      if (filters && filters.open24h && !u.open24h) return false;
      return true;
    });

    const newMarkers = filteredUnits.map(unit => {
      
      let pinColor = "#10B981"; // Verde (Padrão/UBS)
      if (unit.type === 'Hospital') pinColor = "#9333EA";
      else if (unit.type === 'UPA') pinColor = "#F97316";
      else if (unit.urgency) pinColor = "#EF4444";
      
      const pinSvg = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: pinColor,
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: "#FFFFFF",
        scale: 2.2, 
        anchor: new window.google.maps.Point(12, 22),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: unit.lat, lng: unit.lng },
        map,
        title: unit.name,
        icon: pinSvg,
        animation: window.google.maps.Animation.DROP,
      });
      
      marker.addListener("click", () => onMarkerClick(unit));
      return marker;
    });
    
    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds, 50); 
        
        const listener = window.google.maps.event.addListener(map, "idle", () => { 
          if (map.getZoom() > 16) map.setZoom(16); 
          window.google.maps.event.removeListener(listener); 
        });
    }

  }, [map, units, filters]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-none md:rounded-lg shadow-inner" />;
};

export default GoogleMap;