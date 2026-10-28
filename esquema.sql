-- Esquema de la base de datos del proyecto ARINC 429
-- Ejecutar este archivo en MySQL para crear la base de datos y la tabla.

CREATE DATABASE IF NOT EXISTS avionics_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE avionics_db;

-- Registros de envíos de instrumentos.
-- id: identificador único autoincremental.
-- instrumento: nombre del instrumento seleccionado.
-- valor: valor registrado para el instrumento.
-- maximo / minimo: límites configurados para ese instrumento.
-- fecha_creacion: fecha y hora asignadas automáticamente al insertar.
CREATE TABLE IF NOT EXISTS envios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    instrumento VARCHAR(100) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    maximo DECIMAL(10, 2) NOT NULL,
    minimo DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
