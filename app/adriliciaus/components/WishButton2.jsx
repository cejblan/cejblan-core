import { CheckWish } from "./CheckWish";

export const HandleWish2 = async (e, data, session) => {
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
  
  } catch (error) {
    console.error("Error al manejar la wishlist:", error);
    alert("Ocurrió un error al eliminar el producto de la wishlist.");
  }  
};
