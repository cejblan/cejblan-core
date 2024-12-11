export const LoadCheckoutData = async (setDataCheckout) => {
  try {
    const response = await fetch(`/api/checkout`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setDataCheckout(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};