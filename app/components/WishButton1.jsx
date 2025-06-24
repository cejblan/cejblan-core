export const HandleWish1 = async (e, data, session) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("id", data.id);
  formData.append("customer", session.user.email);

  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al agregar a la wishlist");
    }

    // Refrescar el token sin redirigir
    await fetch("/api/auth/session?update=true");
    window.location.reload();

  } catch (error) {
    console.error("Error al manejar la wishlist:", error);
  }
};
