create DATABASE veterinaria; 

USE veterinaria;

-- ========================================
-- TABLA: servicio
-- ========================================
INSERT INTO servicio (nombre, descripcion, precio, activo, imagen_url) VALUES
('BAÑO COMPLETO', 'INCLUYE CORTE DE UÑAS Y LIMPIEZA PROFUNDA', 40.00, true, 'bano.png'),
('VACUNACIÓN GENERAL', 'APLICACIÓN DE VACUNAS NECESARIAS PARA MANTENER LA SALUD DE TU MASCOTA', 60.00, true, 'vacunacion.jpg'),
('CONSULTA VETERINARIA', 'EVALUACIÓN GENERAL, DIAGNÓSTICO Y RECOMENDACIONES MÉDICAS', 50.00, true, 'consulta.jpg'),
('CORTE DE PELO', 'CORTE DE PELO PROFESIONAL SEGÚN RAZA Y ESTILO DESEADO', 35.00, true, 'peluqueria.png');

-- ========================================
-- TABLA: producto (9 productos)
-- ========================================
INSERT INTO producto (nombre, categoria, precio, stock, activo, url_imagen) VALUES
('PLATO ANTIDESLIZANTE', 'ACCESORIOS', 20.00, 25, true, 'plato.png'),
('JUGUETE PELOTA ANTIESTRÉS', 'JUGUETES', 12.50, 35, true, 'pelota.png'),
('COMIDA PREMIUM PARA PERRO 5KG', 'ALIMENTOS', 79.90, 15, true, 'comida_perro.png'),
('CORREA AJUSTABLE DE NYLON', 'ACCESORIOS', 18.00, 25, true, 'correa.png'),
('ARENA SANITARIA PARA GATOS 10KG', 'HIGIENE', 39.90, 18, true, 'arena_gato.png'),
('CAMA ACOLCHADA MEDIANA', 'ACCESORIOS', 95.00, 10, true, 'cama.png'),
('SNACKS DENTALES PARA PERROS', 'ALIMENTOS', 15.00, 40, true, 'snacks.png'),
('SHAMPOO PARA PERROS', 'HIGIENE', 25.90, 20, true, 'shampoo.jpg'),
('TRANSPORTADORA PEQUEÑA', 'ACCESORIOS', 120.00, 8, true, 'transportadora.png');

-- ========================================
-- TABLA: cita (solo servicios 1 a 4)
-- ========================================
INSERT INTO cita (fecha, motivo, estado, hora, mascota_id, servicio_id) VALUES
('2025-01-15', 'VACUNACIÓN ANUAL', 'COMPLETADA', '09:00:00', 1, 2),
('2025-01-15', 'CONSULTA POR VÓMITOS', 'COMPLETADA', '10:30:00', 2, 3),
('2025-01-16', 'BAÑO Y CORTE DE PELO', 'COMPLETADA', '14:00:00', 3, 1),
('2025-01-17', 'CORTE DE PELO', 'COMPLETADA', '11:00:00', 4, 4),
('2025-01-18', 'REVISIÓN POST OPERATORIA', 'COMPLETADA', '09:30:00', 5, 3),
('2025-01-19', 'BAÑO COMPLETO', 'COMPLETADA', '15:00:00', 6, 1),
('2025-01-20', 'VACUNACIÓN ANTIRRÁBICA', 'COMPLETADA', '10:00:00', 7, 2),
('2025-01-21', 'CONSULTA GENERAL', 'COMPLETADA', '16:00:00', 8, 3),
('2025-01-22', 'CORTE DE PELO', 'COMPLETADA', '11:30:00', 9, 4),
('2025-01-23', 'BAÑO COMPLETO', 'COMPLETADA', '14:30:00', 10, 1),
('2025-01-24', 'CONSULTA GENERAL', 'COMPLETADA', '09:00:00', 11, 3),
('2025-01-25', 'VACUNACIÓN GENERAL', 'COMPLETADA', '10:30:00', 12, 2),
('2025-01-26', 'CONSULTA DERMATOLÓGICA', 'COMPLETADA', '15:30:00', 13, 3),
('2025-01-27', 'VACUNACIÓN TRIPLE', 'COMPLETADA', '11:00:00', 14, 2),
('2025-01-28', 'CORTE DE PELO', 'COMPLETADA', '16:30:00', 15, 4),
('2025-01-29', 'CONSULTA GENERAL', 'COMPLETADA', '09:30:00', 16, 3),
('2025-01-30', 'BAÑO COMPLETO', 'COMPLETADA', '08:00:00', 17, 1),
('2025-01-31', 'CONSULTA GENERAL', 'COMPLETADA', '14:00:00', 18, 3),
('2025-02-01', 'CONSULTA POR ALERGIA', 'COMPLETADA', '10:00:00', 19, 3),
('2025-02-02', 'VACUNACIÓN GENERAL', 'COMPLETADA', '12:00:00', 20, 2),
('2025-02-03', 'BAÑO COMPLETO', 'PENDIENTE', '15:00:00', 21, 1),
('2025-02-04', 'VACUNACIÓN GENERAL', 'PENDIENTE', '09:00:00', 22, 2),
('2025-02-05', 'CORTE DE PELO', 'PENDIENTE', '11:30:00', 23, 4),
('2025-02-06', 'CONSULTA GENERAL', 'PENDIENTE', '16:00:00', 24, 3),
('2025-02-07', 'CONSULTA GENERAL', 'PENDIENTE', '10:30:00', 25, 3);

-- ========================================
-- TABLA: venta
-- ========================================
INSERT INTO venta (cliente_id, fecha_venta, total, metodo_pago) VALUES
(1, '2025-01-10 10:30:00', 79.90, 'EFECTIVO'),
(2, '2025-01-11 14:20:00', 145.80, 'YAPE'),
(3, '2025-01-12 09:15:00', 95.00, 'PLIN'),
(4, '2025-01-13 16:45:00', 120.00, 'EFECTIVO'),
(5, '2025-01-14 11:30:00', 39.90, 'YAPE'),
(6, '2025-01-15 15:10:00', 107.40, 'PLIN'),
(7, '2025-01-16 10:00:00', 95.00, 'EFECTIVO'),
(8, '2025-01-17 13:25:00', 120.00, 'YAPE'),
(9, '2025-01-18 09:40:00', 73.00, 'PLIN'),
(10, '2025-01-19 17:15:00', 95.00, 'EFECTIVO'),
(11, '2025-01-20 12:30:00', 143.80, 'YAPE'),
(12, '2025-01-21 14:50:00', 95.00, 'PLIN'),
(13, '2025-01-22 10:20:00', 159.90, 'EFECTIVO'),
(14, '2025-01-23 16:00:00', 120.00, 'YAPE'),
(15, '2025-01-24 11:45:00', 120.00, 'PLIN'),
(16, '2025-01-25 09:30:00', 159.80, 'EFECTIVO'),
(17, '2025-01-26 15:20:00', 95.00, 'YAPE'),
(18, '2025-01-27 13:10:00', 120.00, 'PLIN'),
(19, '2025-01-28 10:50:00', 190.00, 'EFECTIVO'),
(20, '2025-01-29 14:30:00', 159.80, 'YAPE');

-- ========================================
-- TABLA: detalle_venta
-- ========================================
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1
(1, 3, 1, 79.90, 79.90),
-- Venta 2
(2, 5, 2, 39.90, 79.80),
(2, 8, 1, 25.90, 25.90),
(2, 1, 2, 20.00, 40.00),
-- Venta 3
(3, 6, 1, 95.00, 95.00),
-- Venta 4
(4, 9, 1, 120.00, 120.00),
-- Venta 5
(5, 5, 1, 39.90, 39.90),
-- Venta 6
(6, 7, 3, 15.00, 45.00),
(6, 2, 2, 12.50, 25.00),
(6, 8, 1, 25.90, 25.90),
(6, 1, 1, 20.00, 20.00),
-- Venta 7
(7, 6, 1, 95.00, 95.00),
-- Venta 8
(8, 9, 1, 120.00, 120.00),
-- Venta 9
(9, 4, 2, 18.00, 36.00),
(9, 7, 1, 15.00, 15.00),
(9, 2, 2, 12.50, 25.00),
-- Venta 10
(10, 6, 1, 95.00, 95.00),
-- Venta 11
(11, 3, 1, 79.90, 79.90),
(11, 1, 2, 20.00, 40.00),
(11, 8, 1, 25.90, 25.90),
-- Venta 12
(12, 6, 1, 95.00, 95.00),
-- Venta 13
(13, 5, 2, 39.90, 79.80),
(13, 9, 1, 120.00, 120.00),
-- Venta 14
(14, 9, 1, 120.00, 120.00),
-- Venta 15
(15, 9, 1, 120.00, 120.00),
-- Venta 16
(16, 3, 2, 79.90, 159.80),
-- Venta 17
(17, 6, 1, 95.00, 95.00),
-- Venta 18
(18, 9, 1, 120.00, 120.00),
-- Venta 19
(19, 6, 2, 95.00, 190.00),
-- Venta 20
(20, 3, 2, 79.90, 159.80);
