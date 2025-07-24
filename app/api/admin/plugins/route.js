import { getPlugins } from "@/libs/loadPlugins";

export async function GET() {
  const plugins = await getPlugins();
  return Response.json(plugins);
}
