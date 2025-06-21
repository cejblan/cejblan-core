-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: byzluukxwwmdtk07mhpe-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 18-06-2025 a las 15:47:26
-- Versión del servidor: 8.0.22-13
-- Versión de PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `byzluukxwwmdtk07mhpe`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart`
--

CREATE TABLE `cart` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `quantity` int NOT NULL,
  `customer` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(21) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `data`, `status`) VALUES
(0001, 'Formación Estudiantil', 'Cursos', 'Activado'),
(0002, 'Productos', 'Productos', 'Activado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coins`
--

CREATE TABLE `coins` (
  `id` int NOT NULL,
  `moneda` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `coins`
--

INSERT INTO `coins` (`id`, `moneda`, `valor`, `fecha`) VALUES
(1, 'USD', 101.08, '2025-06-13 17:08:35'),
(2, 'EUR', 117.08, '2025-06-13 17:10:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deliveries`
--

CREATE TABLE `deliveries` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(21) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `deliveries`
--

INSERT INTO `deliveries` (`id`, `name`, `data`, `status`) VALUES
(0001, 'Delivery', 'Solo en Araira', 'Activado'),
(0002, 'Retiro UCV', 'Algún lugar de la UCV', 'Activado'),
(0003, 'Retiro Araira', 'Araira, Plaza 19 de Abril', 'Activado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `productsIds` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `productsQuantity` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalPrice` decimal(4,2) NOT NULL,
  `name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNumber` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deliveryMethod` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deliveryMethodData` varchar(99) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chatId` varchar(99) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `productsIds`, `productsQuantity`, `totalPrice`, `name`, `email`, `phoneNumber`, `paymentMethod`, `deliveryMethod`, `deliveryMethodData`, `address`, `latitude`, `longitude`, `image`, `status`, `chatId`, `date`) VALUES
(0083, '0001,0002,0004', '3,2,1', 12.50, 'cejblan', 'cejblan@gmail.com', '+584142245444', 'Transferencia', 'Retiro Araira', 'Araira, Plaza 19 de Abril', 'Guatire', '10.4722296', '-66.5419982', NULL, 'COMPLETADO', '6039953539', '2024-11-26 02:53:18'),
(0084, '0002', '1', 3.00, 'cejblan', 'cejblan@gmail.com', '+584142245444', 'Transferencia', 'Retiro UCV', 'Algún lugar de la UCV', 'Guatire', '10.4722296', '-66.5419982', NULL, 'COMPLETADO', '6039953539', '2024-12-03 05:06:23'),
(0085, '0002', '1', 3.00, 'Francisco González', 'benfran21ramon1999@gmail.com', '+584142245444', 'Transferencia', 'Retiro UCV', 'Algún lugar de la UCV', 'Guatire, Calle Sucre, Casa #59', '10.4722375', '-66.5419981', NULL, 'COMPLETADO', '6039953539', '2024-12-03 07:24:51'),
(0086, '0002', '1', 3.00, 'cejblan', 'cejblan@gmail.com', '+584142245444', 'Transferencia', 'Retiro UCV', 'Algún lugar de la UCV', 'Guatire', '10.4722296', '-66.5419982', NULL, 'COMPLETADO', '6039953539', '2024-12-05 05:26:38'),
(0087, '0002', '1', 3.00, 'cejblan', 'cejblan@gmail.com', '+584142245444', 'Transferencia', 'Retiro UCV', 'Algún lugar de la UCV', 'Guatire', '10.4722296', '-66.5419982', NULL, 'PROCESANDO', '6039953539', '2025-05-17 18:10:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(21) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `payments`
--

INSERT INTO `payments` (`id`, `name`, `data`, `status`) VALUES
(0001, 'Pago Móvil', 'Venezuela 0102 V-28.000.000 0424-2778208', 'Desactivado'),
(0002, 'Transferencia', 'Venezuela 0102 V-28.000.000 0424-2778208', 'Activado'),
(0003, 'Efectivo', 'Bolívares', 'Activado'),
(0004, 'Dólares', 'Dólares', 'Activado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(4,2) NOT NULL,
  `iva` int DEFAULT NULL,
  `category` varchar(21) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `iva`, `category`, `quantity`, `image`, `date`) VALUES
(0001, 'Curso PHP', 'Domina PHP, el lenguaje que impulsa millones de sitios web dinámicos. Aprenderás a crear sistemas robustos del lado del servidor, conectarte con bases de datos y desarrollar desde blogs hasta tiendas online. Ideal para quienes quieren crear soluciones completas.', 9.00, 16, 'Damas', '0', 'https://res.cloudinary.com/dugd4cv0s/image/upload/v1749831573/tjyjvxdtns7xiyz6z10x.png', '2024-06-27 19:11:46'),
(0002, 'Curso HTML', 'Descubre el poder de HTML, el lenguaje esencial para estructurar páginas web. En este curso aprenderás desde lo más básico hasta las mejores prácticas modernas, dominando las etiquetas clave para crear contenido claro, accesible y profesional. ¡Tu viaje en el desarrollo web comienza aquí!', 6.00, 8, 'Damas', '99', 'https://res.cloudinary.com/dugd4cv0s/image/upload/v1749831264/y2qofmzxceoljxnbz5rq.png', '2024-10-03 16:48:04'),
(0003, 'Curso CSS', 'Dale vida a tus sitios con CSS. Aprende a diseñar interfaces visualmente atractivas y responsivas, controlando cada detalle del estilo: colores, tipografías, animaciones y más. Este curso te enseñará a transformar código en experiencias visuales únicas.', 6.00, 0, 'Damas', '99', 'https://res.cloudinary.com/dugd4cv0s/image/upload/v1749831425/n4dlwoflgnarhbqcrxdm.png', '2024-10-03 17:56:23'),
(0004, 'Curso JavaScript', 'Aprende JavaScript, el motor interactivo de la web. Desde manipular elementos dinámicamente hasta crear aplicaciones completas, este curso te lleva paso a paso en el dominio de la lógica de programación que hace posible la web moderna.', 6.00, 0, 'Damas', '99', 'https://res.cloudinary.com/dugd4cv0s/image/upload/v1749831489/o4n62o3bdw57enxhyt93.png', '2024-10-05 19:14:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `qualification`
--

CREATE TABLE `qualification` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `product` int(4) UNSIGNED ZEROFILL NOT NULL,
  `comment` varchar(111) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user` varchar(33) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` int(1) UNSIGNED ZEROFILL NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `qualification`
--

INSERT INTO `qualification` (`id`, `product`, `comment`, `user`, `value`) VALUES
(0003, 0002, 'Excelente', 'cejblan@gmail.com', 5),
(0006, 0002, 'Normal', 'benfran21ramon1999@gmail.com', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `settings`
--

INSERT INTO `settings` (`id`, `name`, `description`, `value`) VALUES
(1, 'conversion_activa', 'Indica si se activa la conversión automática a bolívares', 'true'),
(2, 'conversion_moneda', 'Define cuál moneda base se usará para la conversión a Bs', 'USD'),
(6, 'nombre_tienda', 'Registro para editar el nombre de la tienda en la factura', 'CejblanCMS'),
(7, 'rif_tienda', 'Registro para editar el RIF de la tienda en la factura', 'RIF por defecto'),
(8, 'direccion_tienda', 'Registro para editar la dirección de la tienda en la factura', 'Dirección por defecto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(222) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneCode` int DEFAULT NULL,
  `phoneNumber` int DEFAULT NULL,
  `phoneCodeDos` int DEFAULT NULL,
  `phoneNumberDos` int DEFAULT NULL,
  `address` varchar(81) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `chatId` varchar(99) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `image`, `rol`, `phoneCode`, `phoneNumber`, `phoneCodeDos`, `phoneNumberDos`, `address`, `latitude`, `longitude`, `code`, `expiresAt`, `chatId`, `verified`, `date`) VALUES
(0002, 'Francisco González', 'benfran21ramon1999@gmail.com', 'https://res.cloudinary.com/dugd4cv0s/image/upload/v1731123045/kjsfbxnr8glgxoblw4rt.png', 'Cliente', 414, 2245444, NULL, NULL, 'Guatire, Calle Sucre, Casa #59', '10.4722375', '-66.5419981', NULL, '0000-00-00 00:00:00', '6039953539', 1, '2024-11-06 17:57:13'),
(0006, 'cejblan', 'cejblan@gmail.com', NULL, 'Admin', 414, 2245444, NULL, NULL, 'Guatire', '10.4722296', '-66.5419982', NULL, NULL, '6039953539', 1, '2024-11-20 00:09:57'),
(0004, 'Manuel Fetta', 'manuelfetta23@gmail.com', NULL, 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0000-00-00 00:00:00', NULL, 0, '2024-11-11 17:20:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `customer` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `wishlist`
--

INSERT INTO `wishlist` (`id`, `customer`) VALUES
(0002, 'cejblan@gmail.com'),
(0001, 'cejblan@gmail.com');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `coins`
--
ALTER TABLE `coins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `moneda` (`moneda`);

--
-- Indices de la tabla `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `qualification`
--
ALTER TABLE `qualification`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD UNIQUE KEY `UNIQUE` (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `coins`
--
ALTER TABLE `coins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `qualification`
--
ALTER TABLE `qualification`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
