import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { conexion } from "@/libs/mysql";
import { put } from "@vercel/blob";

export async function GET(req) {
  try {
    const [results] = await conexion.query("SELECT * FROM users");

    return NextResponse.json(results, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();

    const name = data.get("name");
    const email = data.get("email");
    const rol = data.get("rol");
    const image = data.get("image");

    // const password = data.get("password");
    // const hashedPassword = await hash(password, 10);

    let imageUrl = null;

    if (image && image instanceof Blob) {
      const blob = await put(image.name, image, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    const [result] = await conexion.query("INSERT INTO users SET ?", {
      name,
      email,
      rol,
      image: imageUrl,
      // password: hashedPassword,
    });

    return NextResponse.json({
      name,
      email,
      rol,
      image: imageUrl,
      // password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
