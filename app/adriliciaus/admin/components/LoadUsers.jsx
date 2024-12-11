export const LoadUsers = async (setUsers) => {
  try {
    const response = await fetch(`/api/admin/users`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.ok) {
      setUsers(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
};