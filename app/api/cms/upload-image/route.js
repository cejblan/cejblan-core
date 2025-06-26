import { NextResponse } from "next/server";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function POST(request) {
  try {
    const data = await request.formData();
    const image = data.get("image");
    if (!image) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 });

    const buffer = await processImage(image);
    const res = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ secure_url: res.secure_url });
  } catch (err) {
    console.error("Error al subir imagen:", err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
