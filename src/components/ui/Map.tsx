import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map - using public token placeholder
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVzdCIsImEiOiJjbDgyZzFpenowMGVrM29xb2N2dWh6cjl4In0.rLThUBPxc3W8H9z2rB7m-g';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Changed to streets for better visibility
      zoom: 13,
      center: [8.9139, 45.5943], // Legnano, Italia coordinates
    });

    // Add marker for Legnano
    new mapboxgl.Marker({
      color: '#3B82F6',
      scale: 1.2
    })
      .setLngLat([8.9139, 45.5943])
      .setPopup(new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        className: 'custom-popup'
      }).setHTML(`
        <div style="padding: 10px; text-align: center;">
          <strong style="color: #1a202c; font-size: 14px;">GenZ Creation Site</strong><br>
          <span style="color: #4a5568; font-size: 12px;">Legnano, Italia</span><br>
          <a href="mailto:info.genzcreationsite@gmail.com" style="color: #3182ce; font-size: 11px; text-decoration: none;">📧 Contattaci</a>
        </div>
      `))
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default Map;