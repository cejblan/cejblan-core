import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { conexion2 } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

export async function GET(req, res) {
  try {
    const results = await conexion2.query("SELECT * FROM users");
    // Devuelve la respuesta con los encabezados configurados dentro de NextResponse
    return NextResponse.json(results, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    await conexion2.end(); // Asegúrate de cerrar la conexión
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    //const password = data.get("password");
    // Hashear la contraseña
    //const hashedPassword = await hash(password, 10); // 10 es el número de saltos (nivel de seguridad)
    const image = data.get("image");
    if (!image) {
      const result = await conexion2.query("INSERT INTO users SET ?", {
        name: data.get("name"),
        email: data.get("email"),
        //password: hashedPassword,
        rol: data.get("rol"),
      });

      return NextResponse.json({
        name: data.get("name"),
        email: data.get("email"),
        //password: hashedPassword,
        rol: data.get("rol"),
      });
    } else {
      const buffer = await processImage(image);
      const res = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
            },
            async (err, result) => {
              if (err) {
                console.log(err);
                reject(err);
              }
              resolve(result);
            }
          )
          .end(buffer);
      });
      const result = await conexion2.query("INSERT INTO users SET ?", {
        name: data.get("name"),
        email: data.get("email"),
        //password: hashedPassword,
        rol: data.get("rol"),
        image: res.secure_url,
      });

      return NextResponse.json({
        name: data.get("name"),
        email: data.get("email"),
        //password: hashedPassword,
        rol: data.get("rol"),
        image: res.secure_url,
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    await conexion2.end();
  }
}
