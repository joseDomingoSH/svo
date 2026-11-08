CREATE DATABASE IF NOT EXISTS sistema_ventas_online;
USE sistema_ventas_online;

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    existencias INT NOT NULL,
    categoria_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

INSERT INTO categorias (nombre_categoria, descripcion) VALUES 
('Tecnología', 'Artículos de cómputo y gadgets'),
('Hogar', 'Electrodomésticos y accesorios');

INSERT INTO productos (nombre, precio, existencias, categoria_id) VALUES 
('Laptop HP Pavilion', 12500.50, 12, 1),
('Mouse Inalámbrico', 350.00, 30, 1),
('Licuadora 3 Velocidades', 899.00, 8, 2);