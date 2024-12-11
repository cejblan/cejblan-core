export const LoadCategoriesData = async (setDataCategories) => {
  try {
    const response = await fetch(`/api/categories`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setDataCategories(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};