export const LoadOrders = async (setOrders) => {
  try {
    const response = await fetch(`/api/admin/orders`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setOrders(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  };
};