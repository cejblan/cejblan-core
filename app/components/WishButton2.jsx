export const HandleWish2 = async ({e, data, session, onRefresh}) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: data.id,
        customer: session.user.email,
      }),
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud DELETE");
    }

    // Refrescar el token sin redirigir
    await fetch("/api/auth/session?update=true");
    if (onRefresh) onRefresh();

  } catch (error) {
    console.error("Error al manejar la wishlist:", error);
    alert("Ocurrió un error al eliminar el producto de la wishlist.");
  }
};