-- Script de base de datos adaptado para Turso (SQLite / libSQL)

CREATE TABLE IF NOT EXISTS `catalogo_enfermedades` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre` TEXT NOT NULL,
  `cie_10` TEXT DEFAULT NULL,
  `color_mapa` TEXT NOT NULL,
  `nivel_gravedad` TEXT NOT NULL DEFAULT 'normal',
  `activo` INTEGER NOT NULL DEFAULT 1,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `catalogo_unidades_operativas` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `distrito_operativo` TEXT NOT NULL,
  `unidad_operativa` TEXT NOT NULL,
  `activo` INTEGER NOT NULL DEFAULT 1,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre` TEXT NOT NULL,
  `apellido` TEXT NOT NULL,
  `correo` TEXT NOT NULL,
  `contrasena` TEXT NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `pacientes_dengue` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `nombre_completo` TEXT NOT NULL,
  `cedula` TEXT DEFAULT NULL,
  `telefono` TEXT DEFAULT NULL,
  `direccion_barrio` TEXT NOT NULL,
  `edad` INTEGER NOT NULL,
  `sexo` TEXT NOT NULL,
  `enfermedad_id` INTEGER NOT NULL,
  `nivel_gravedad` TEXT NOT NULL,
  `unidad_operativa_id` INTEGER DEFAULT NULL,
  `fecha_consulta` TEXT NOT NULL,
  `latitud` REAL NOT NULL,
  `longitud` REAL NOT NULL,
  `fecha_reporte` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` TEXT DEFAULT NULL,
  `usuario_id` INTEGER DEFAULT 2,
  `activo` INTEGER DEFAULT 1,
  FOREIGN KEY (`enfermedad_id`) REFERENCES `catalogo_enfermedades` (`id`),
  FOREIGN KEY (`unidad_operativa_id`) REFERENCES `catalogo_unidades_operativas` (`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
);

-- Inserción de catálogo de enfermedades iniciales
INSERT INTO `catalogo_enfermedades` (id, nombre, cie_10, color_mapa, nivel_gravedad, activo) VALUES
(1, 'Dengue sin signos de alarma', 'A90', '#3b82f6', 'normal', 1),
(2, 'Dengue con signos de alarma', 'A97.1', '#f59e0b', 'grave', 1),
(3, 'Dengue grave', 'A97.2', '#ef4444', 'grave', 1),
(4, 'Zika', 'A92.5', '#10b981', 'normal', 1),
(5, 'Chikungunya', 'A92.0', '#8b5cf6', 'normal', 1),
(6, 'Fiebre Amarilla', 'A95', '#eab308', 'grave', 1),
(7, 'Malaria', 'B54', '#ec4899', 'normal', 1);

-- Inserción de unidades operativas iniciales
INSERT INTO `catalogo_unidades_operativas` (id, distrito_operativo, unidad_operativa, activo) VALUES
(1, 'DISTRITO 23D01', 'CENTRO DE SALUD AUGUSTO EGAS', 1),
(2, 'DISTRITO 23D01', 'CENTRO DE SALUD LA CONCORDIA', 1),
(3, 'DISTRITO 23D02', 'CENTRO DE SALUD LOS ROSALES', 1),
(4, 'DISTRITO 23D02', 'CENTRO DE SALUD SAN JACINTO', 1),
(5, 'DISTRITO 23D03', 'CENTRO DE SALUD VALLE HERMOSO', 1);
