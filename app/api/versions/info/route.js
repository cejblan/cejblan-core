const UPDATE_SERVER = "https://cejblan.vercel.app//api/versions/update-info";

export async function GET() {
  try {
    const res = await fetch(UPDATE_SERVER);
    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error proxy /versions/info:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
