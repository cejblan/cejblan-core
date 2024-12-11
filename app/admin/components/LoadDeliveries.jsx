export const LoadDeliveries = async (setDeliveries) => {
  try {
    const response = await fetch(`/api/admin/deliveries`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setDeliveries(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar formas de entrega:", error);
  }
};