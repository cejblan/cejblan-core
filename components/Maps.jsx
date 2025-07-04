// Importante, este componente siempre debe importare de forma dinamica para funcionar

"use client"; // Para habilitar el uso de React hooks en Next.js

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

export default function Maps({ latitude, longitude, onPositionChange }) {
  const [position, setPosition] = useState([latitude, longitude]);

  // Para evitar errores con los íconos de Leaflet (opcional)
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  // Función para manejar los eventos del mapa, como los clics
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        onPositionChange(newPosition); // Llama al callback para actualizar en el componente padre
      },
    });

    return (
      <Marker position={position}>
        <Popup>Estás aquí: {position[0]}, {position[1]}</Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      className="rounded-xl z-10"
      center={position} // Ubicación inicial
      zoom={16}
      style={{ height: "100%", width: "100%" }} // Ajusta el tamaño del mapa
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
}
