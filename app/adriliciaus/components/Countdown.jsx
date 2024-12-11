import { useState, useEffect } from "react";

function Countdown({ initialTime, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime); // Actualiza el tiempo restante cuando cambia el `initialTime`
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp(); // Llama a la función pasada cuando el tiempo llega a 0
      return; // Detiene el contador cuando el tiempo llega a 0
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer); // Limpia el intervalo cuando el componente se desmonta o el tiempo cambia
  }, [timeLeft, onTimeUp]);

  return (
    <div>
      <p>{timeLeft} segundos</p>
    </div>
  );
}

export default Countdown;