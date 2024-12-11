import { useMemo } from "react";

// Función para agrupar productos por ID y calcular cantidad y subtotal
export const GroupedProducts = (products) => {
  return useMemo(() => {
    return products.reduce((acc, product) => {
      const existingProductIndex = acc.findIndex((p) => p.id === product.id);

      if (existingProductIndex !== -1) {
        // Sumar cantidad y subtotal si el producto ya existe en el carrito
        acc[existingProductIndex].quantity += product.quantity;
        acc[existingProductIndex].subtotal += product.price * product.quantity;
      } else {
        // Si es un nuevo producto, añadirlo con su cantidad y subtotal calculado
        acc.push({
          ...product,
          subtotal: product.price * product.quantity, // Calcular el subtotal al agregarlo
        });
      }

      return acc;
    }, []);
  }, [products]);
};

// Función para calcular el total de los productos usando el array agrupado
export const CalculateTotalPrice = (groupedProducts) => {
  return useMemo(() => {
    return groupedProducts.reduce((total, product) => total + product.subtotal, 0).toFixed(2);
  }, [groupedProducts]);
};