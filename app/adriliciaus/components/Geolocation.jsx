import { useState, useEffect } from "react";

export default function Geolocation() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error obteniendo geolocalización:", error);
          setLocation({ latitude: null, longitude: null }); // Mantén el objeto aunque falle
        }
      );
    }
  }, []);

  return location;
}
