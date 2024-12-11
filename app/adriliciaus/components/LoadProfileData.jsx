export const LoadProfileData = async (sessionUser, setDataProfile) => {
  try {
    const response = await fetch(`/api/profile?customerEmail=${encodeURIComponent(sessionUser)}`, {
      method: "GET",
    });
    const data = await response.json();
    if (response.ok) {
      setDataProfile(data);
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};