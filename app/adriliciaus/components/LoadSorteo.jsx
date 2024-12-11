export const LoadSorteo = async (setParticipantes) => {
  try {
    const response = await fetch(`/api/suspiros/sorteo`, {
      method: "GET",
    });

    const participantes = await response.json();

    if (response.ok) {
      setParticipantes(participantes);
    } else {
      console.error("Error:", participantes.error);
    }
  } catch (error) {
    console.error("Error al cargar participantes:", error);
  }
};