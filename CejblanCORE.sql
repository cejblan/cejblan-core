-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: bbgcbcnrrmonslx6dtaj-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 29-08-2025 a las 17:03:10
-- Versión del servidor: 8.4.2-2
-- Versión de PHP: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bbgcbcnrrmonslx6dtaj`
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
(1, 'USD', 108.18, '2025-07-01 12:40:20'),
(2, 'EUR', 127.13, '2025-07-01 12:40:33');

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
(0001, 'Delivery Guatire', '2', 'Activado'),
(0002, 'Delivery Araira', '5', 'Activado'),
(0003, 'Delivery Guarenas', '5', 'Activado'),
(0004, 'Retiro 1', 'Direccion', 'Activado'),
(0005, 'Retiro 2', 'Direccion', 'Activado');

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
  `delivery` int UNSIGNED DEFAULT NULL,
  `deliveryMethod` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deliveryMethodData` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryDate` datetime DEFAULT NULL,
  `address` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chatId` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(0001, 'Pago Móvil', 'Datos', 'Desactivado'),
(0002, 'Transferencia', 'Datos', 'Activado'),
(0003, 'Efectivo', 'Bolívares', 'Activado'),
(0004, 'Dólares', 'Dólares', 'Activado'),
(0005, 'Euros', 'Euros', 'Desactivado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `code_bill` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(5,2) NOT NULL,
  `wholesale_price` decimal(5,2) DEFAULT NULL,
  `iva` int DEFAULT NULL,
  `category` varchar(21) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `image` varchar(201) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `code_bill`, `name`, `description`, `price`, `wholesale_price`, `iva`, `category`, `quantity`, `image`, `date`) VALUES
(1, 'prueba', 'RESISTENCIA DE DISCO SOLIDO 6\" 220V 1500', 'Resistencia De Disco Solido 6\" 220V 1500w', 28.00, 22.40, NULL, 'Productos', 0, 'https://9mtfxauv5xssy4w3.public.blob.vercel-storage.com/1755448017934.png', '2025-06-24 19:44:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `qualification`
--

CREATE TABLE `qualification` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `product` int(4) UNSIGNED ZEROFILL NOT NULL,
  `comment` varchar(111) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` int(1) UNSIGNED ZEROFILL NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sales`
--

CREATE TABLE `sales` (
  `id` bigint UNSIGNED NOT NULL,
  `plugin_name` varchar(255) DEFAULT NULL,
  `rute` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `paypal_order_id` varchar(255) DEFAULT NULL,
  `paypal_capture_id` varchar(255) DEFAULT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `payer_email` varchar(255) DEFAULT NULL,
  `payer_id` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `capture_response` json DEFAULT NULL,
  `external_ref` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `settings`
--

INSERT INTO `settings` (`id`, `name`, `description`, `value`) VALUES
(1, 'conversion_activa', 'Indica si se activa la conversión automática a bolívares', 'true'),
(2, 'conversion_moneda', 'Define cuál moneda base se usará para la conversión a Bs', 'USD'),
(3, 'nombre_tienda', 'Registro para editar el nombre de la tienda en la factura', 'CejblanCMS'),
(4, 'rif_tienda', 'Registro para editar el RIF de la tienda en la factura', 'RIF por defecto'),
(5, 'direccion_tienda', 'Registro para editar la dirección de la tienda en la factura', 'Dirección por defecto'),
(7, 'working_hours', 'Horario de trabajo', '09:00-17:00'),
(8, 'delivery_hours', 'Horas permitidas para el Delivery', '12:00,18:00'),
(9, 'free_delivery', 'Limite de costo para aplicar el Delivery Gratis', '5'),
(10, 'free_delivery_activated', 'Delivery Gratis Activado o Desactivado', 'Activado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telegram_messages`
--

CREATE TABLE `telegram_messages` (
  `id` int NOT NULL,
  `chat_id` bigint NOT NULL,
  `text` text NOT NULL,
  `from_bot` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `telegram_messages`
--

INSERT INTO `telegram_messages` (`id`, `chat_id`, `text`, `from_bot`, `created_at`) VALUES
(1, 6039953539, '335146', 0, '2025-08-06 03:17:08'),
(2, 6039953539, '<b>Hola, Francisco</b>. Tu cuenta ha sido enlazada correctamente con el bot. Ahora podré entregarte los datos de tus pedidos por aquí 😏. Recuerda completar los datos del perfil para que puedas comprar en nuestra tienda 🥰', 1, '2025-08-06 03:17:09'),
(3, 6039953539, '<b>Tu pedido es el: #1</b>\n  \nDetalles del pedido:\n📛 Nombre: cejblan\n📧 Correo: cejblan@gmail.com\n📱 Teléfono: +584142245444\n\n🔎 Productos:\n   ✅ <a href=\"https://cejblan-core-dev.vercel.app/products/1\">1</a>\n #️⃣ Cantidad:\n   ✅ 2\n  \n💰 Total: 56$\n💳 Pago: Transferencia\n📦 Entrega: Retiro 1\n📍 Dirección: Direccion\n\n📆 Fecha: 28/08/2025\n⏳ Estado: PROCESANDO\n', 1, '2025-08-28 20:27:17'),
(4, 6039953539, '<b>Tu pedido es el: #2</b>\n  \nDetalles del pedido:\n📛 Nombre: cejblan\n📧 Correo: cejblan@gmail.com\n📱 Teléfono: +584142245444\n\n🔎 Productos:\n   ✅ <a href=\"https://cejblan-core-dev.vercel.app/products/2\">2</a>\n #️⃣ Cantidad:\n   ✅ 1\n  \n💰 Total: 0$\n💳 Pago: Efectivo\n📦 Entrega: Retiro 2\n📍 Dirección: Direccion\n\n📆 Fecha: 29/08/2025\n⏳ Estado: PROCESANDO\n', 1, '2025-08-29 15:54:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transfer_orders`
--

CREATE TABLE `transfer_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `plugin_name` varchar(255) NOT NULL,
  `rute` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `provider` varchar(50) DEFAULT 'bank_transfer',
  `status` varchar(50) DEFAULT 'pending',
  `notes` text,
  `external_ref` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` datetime DEFAULT NULL,
  `paid_by` varchar(255) DEFAULT NULL,
  `admin_notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `transfer_orders`
--

INSERT INTO `transfer_orders` (`id`, `plugin_name`, `rute`, `domain`, `amount`, `provider`, `status`, `notes`, `external_ref`, `created_at`, `paid_at`, `paid_by`, `admin_notes`) VALUES
(1, 'CMS', 'cms', 'cejblan.com', 27.00, 'bank_transfer', 'pending', NULL, NULL, '2025-08-25 15:26:30', NULL, NULL, NULL),
(2, 'CMS', 'cms', 'cejblan.com', 27.00, 'bank_transfer', 'pending', NULL, NULL, '2025-08-25 15:28:14', NULL, NULL, NULL),
(3, 'CMS', 'cms', 'cejblan.com', 27.00, 'bank_transfer', 'pending', NULL, NULL, '2025-08-25 16:54:23', NULL, NULL, NULL);

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
  `code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `chatId` varchar(99) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `image`, `rol`, `phoneCode`, `phoneNumber`, `phoneCodeDos`, `phoneNumberDos`, `address`, `latitude`, `longitude`, `code`, `expiresAt`, `chatId`, `verified`, `date`) VALUES
(0003, 'Francisco González', 'benfran21ramon1999@gmail.com', NULL, 'Cliente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-08-06 03:07:10'),
(0001, 'cejblan', 'cejblan@gmail.com', '', 'Desarrollador', 414, 2245444, NULL, NULL, 'Guatire', '10.4702723', '-66.5436872', NULL, NULL, '6039953539', 1, '2024-11-20 00:09:57'),
(0002, 'Nanci Quintero Amaricua', 'namaricua35@gmail.com', '', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-07-09 13:06:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `webhook_events`
--

CREATE TABLE `webhook_events` (
  `id` bigint UNSIGNED NOT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `resource` json DEFAULT NULL,
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(4) UNSIGNED ZEROFILL NOT NULL,
  `customer` varchar(33) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Indices de la tabla `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_paypal_order_id` (`paypal_order_id`),
  ADD KEY `idx_provider_created_at` (`provider`,`created_at`);

--
-- Indices de la tabla `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `telegram_messages`
--
ALTER TABLE `telegram_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transfer_orders`
--
ALTER TABLE `transfer_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD UNIQUE KEY `UNIQUE` (`id`);

--
-- Indices de la tabla `webhook_events`
--
ALTER TABLE `webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_received_at` (`received_at`);

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
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=432;

--
-- AUTO_INCREMENT de la tabla `qualification`
--
ALTER TABLE `qualification`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `telegram_messages`
--
ALTER TABLE `telegram_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `transfer_orders`
--
ALTER TABLE `transfer_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `webhook_events`
--
ALTER TABLE `webhook_events`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
