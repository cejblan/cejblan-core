export const LoadProducts = async (LoadProducts) => {
  try {
    const response = await fetch(`/api/admin/products`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      LoadProducts(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
};