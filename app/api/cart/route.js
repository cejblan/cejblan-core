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
    const [cartItems] = await conexion.query(
      "SELECT id, quantity FROM cart WHERE customer = ?",
      [customerEmail]
    );

    if (cartItems.length === 0) {
    
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
    const [products] = await conexion.query(
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
  }
}

export async function POST(request) {
  try {
    const data = await request.formData();
    const [result] = await conexion.query("INSERT INTO cart SET ?", {
      id: data.get("id"),
      quantity: data.get("quantity"),
      customer: data.get("customer"),
    });

    return NextResponse.json({
      id: data.get("id"),
      quantity: data.get("quantity"),
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
  }
}