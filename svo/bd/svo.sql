CREATE DATABASE IF NOT EXISTS sistema_ventas_online;
USE sistema_ventas_online;

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    existencias INT NOT NULL
);

INSERT INTO productos (nombre, precio, existencias) 
VALUES ('Laptop HP Pavilion', 12500.50, 15);