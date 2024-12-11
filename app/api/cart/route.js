import { NextResponse } from "next/server"; // Importar NextResponse
import { conexion } from "@/libs/mysql";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const customerEmail = searchParams.get("customerEmail");

  if (!customerEmail) {
    return NextResponse.json({ error: "No se proporcionó el email del cliente" }, { status: 400 });
  }

  try {
    // Primera consulta: obtener los productos del carrito filtrados por el cliente
    const cartItems = await conexion.query(
      "SELECT id, quantity FROM cart WHERE customer = ?",
      [customerEmail]
    );

    if (cartItems.length === 0) {
      await conexion.end();
      return NextResponse.json([], { status: 200 }); // Si el carrito está vacío, retornamos un arreglo vacío
    }
    // Agrupar los productos por ID y sumar sus quantities
    const groupedCartItems = cartItems.reduce((acc, item) => {
      const existingItem = acc.find((p) => p.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity; // Sumar la cantidad si ya existe el producto
      } else {
        acc.push({ ...item }); // Añadir un nuevo producto si no existe
      }
      return acc;
    }, []);
    // Obtener los ids de los productos agrupados
    const productIds = groupedCartItems.map(item => item.id);
    // Segunda consulta: obtener todos los detalles de los productos según los ids obtenidos del carrito
    const products = await conexion.query(
      "SELECT * FROM products WHERE id IN (?)",
      [productIds]
    );
    // Combinar productos con su cantidad del carrito
    const productsWithQuantity = products.map(product => {
      const cartItem = groupedCartItems.find(item => item.id === product.id);
      return {
        ...product,
        quantity: cartItem ? cartItem.quantity : 0, // Añadir la cantidad del carrito
      };
    });
    // Retornar los productos con la cantidad
    return NextResponse.json(productsWithQuantity, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  } finally {
    await conexion.end(); // Asegúrate de cerrar la conexión
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const result = await conexion.query("INSERT INTO cart SET ?", {
      id: data.get("id"),
      quantity: data.get("quantity"),
      customer: data.get("customer"),
    });

    const result2 = await conexion.query(
      "SELECT quantity FROM products WHERE id = ?",
      [data.get("id")]
    );
    // Extrae el valor de `quantity` del resultado
    const productQuantity = result2[0]?.quantity;

    if (productQuantity === undefined) {
      return NextResponse.json(
        { message: "Producto no encontrado en la tabla 'products'" },
        { status: 404 }
      );
    }
    // Asegúrate de convertir `data.get("quantity")` a un número
    const newQuantity = productQuantity - Number(data.get("quantity"));

    if (isNaN(newQuantity)) {
      return NextResponse.json(
        { message: "La cantidad calculada es inválida (NaN)" },
        { status: 400 }
      );
    }

    const result3 = await conexion.query(
      "UPDATE products SET quantity = ? WHERE id = ?",
      [newQuantity, data.get("id")]
    );

    if (result3.affectedRows === 0) {
      return NextResponse.json(
        { message: "Producto no encontrado al intentar actualizar" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.get("id"),
      newQuantity,
      customer: data.get("customer"),
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
    await conexion.end();
  }
}