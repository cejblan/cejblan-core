// Función para cargar los productos
export const LoadProductsCart = async (sessionUser, setProducts) => {
  try {
    // Hacer la solicitud GET con el email del cliente en los parámetros de consulta
    const response = await fetch(`/api/cart?customerEmail=${encodeURIComponent(sessionUser)}`, {
      method: "GET",
    });

    const products = await response.json();

    if (response.ok) {
      setProducts(products); // Guardar productos en el estado
    } else {
      console.error("Error:", products.error);
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};