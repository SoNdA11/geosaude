import React, { useState, useEffect, useRef } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../../data/mockData';

const GoogleMap = ({ units, onMarkerClick, filters }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const mossoro = { lat: -5.1878, lng: -37.3442 };
      
      const poiStyle = [
        {
          featureType: "poi", 
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
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
          mapId: "DEMO_MAP_ID",
      });
      setMap(newMap);
    };

    const loadGoogleMaps = () => {
      // Se a API global já estiver pronta, inicializa o mapa diretamente
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Se já houver um script de API do Google Maps injetado na página,
      // evitamos carregar múltiplos scripts e apenas redefinimos o callback global
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        window.initMap = initMap;
        
        // Polling rápido caso o script anterior ainda esteja baixando
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
        return;
      }

      // Se for a primeira inicialização do script, injeta-o no document head
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&loading=async&libraries=marker`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!map) return;

    // Limpar marcadores anteriores
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
      
      // Conversão defensiva para Number para evitar erros de setPosition
      const latVal = unit.lat !== undefined ? Number(unit.lat) : NaN;
      const lngVal = unit.lng !== undefined ? Number(unit.lng) : NaN;

      if (isNaN(latVal) || isNaN(lngVal)) {
        console.warn(`Coordenadas inválidas para unidade: ${unit.name}`, { latVal, lngVal });
        return null;
      }

      let marker;
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        const pinElement = new window.google.maps.marker.PinElement({
          background: pinColor,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          scale: 1.0,
        });

        marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: latVal, lng: lngVal },
          map,
          title: unit.name,
          content: pinElement.element,
        });
      } else {
        const pinSvg = {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: pinColor,
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "#FFFFFF",
          scale: 2.2, 
          anchor: new window.google.maps.Point(12, 22),
        };

        marker = new window.google.maps.Marker({
          position: { lat: latVal, lng: lngVal },
          map,
          title: unit.name,
          icon: pinSvg,
          animation: window.google.maps.Animation.DROP,
        });
      }
      
      marker.addListener("click", () => onMarkerClick(unit));
      return marker;
    }).filter(Boolean); // Remover nulos
    
    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        const singleUnit = filteredUnits[0];
        const latVal = Number(singleUnit.lat);
        const lngVal = Number(singleUnit.lng);
        map.setCenter({ lat: latVal, lng: lngVal });
        map.setZoom(16);
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        filteredUnits.forEach(unit => {
          const latVal = Number(unit.lat);
          const lngVal = Number(unit.lng);
          if (!isNaN(latVal) && !isNaN(lngVal)) {
            bounds.extend({ lat: latVal, lng: lngVal });
          }
        });
        map.fitBounds(bounds, 50); 
      }
    }

  }, [map, units, filters]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-none md:rounded-lg shadow-inner" />;
};

export default GoogleMap;