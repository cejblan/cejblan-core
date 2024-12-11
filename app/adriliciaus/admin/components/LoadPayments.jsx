export const LoadPayments = async (setPayments) => {
  try {
    const response = await fetch(`/api/admin/payments`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setPayments(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar formas de pago:", error);
  }
};