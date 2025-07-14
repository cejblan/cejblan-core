import { getSettings } from "@/lib/settings";

export async function GET() {
  const deliveryHours = await getSettings("delivery_hours");
  const workingHours = await getSettings("working_hours");

  return Response.json({
    deliveryHours: deliveryHours?.value || "",
    workingHours: workingHours?.value || ""
  });
}
