export const LoadCoins = async (setCoins) => {
  try {
    const response = await fetch(`/api/admin/coins`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setCoins(data.tasas);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar monedas:", error);
  }
};
