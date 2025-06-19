export const CheckWish = async (data, session, setIsInWishlist) => {
  try {
    const response = await fetch(`/api/admin/products/${data.id}/checkWish?customerEmail=${encodeURIComponent(session.user.email)}`, {
      method: "GET",
    });
    const { rows } = await response.json(); // Obtener el valor "rows" de la respuesta

    if (response.ok) {
      setIsInWishlist(rows[0]); // Almacenar solo el valor booleano
    } else {
      console.error("Error:", rows);
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};
