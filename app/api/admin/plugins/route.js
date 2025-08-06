import { loadPlugins } from "@/libs/loadPlugins";

export async function GET() {
  const plugins = await loadPlugins();
  return Response.json(plugins);
}
