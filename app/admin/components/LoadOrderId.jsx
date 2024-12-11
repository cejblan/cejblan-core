export const LoadOrderId = async (params, setOrder) => {
  try {
    const response = await fetch("/api/admin/orders/" + params.id, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setOrder(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};