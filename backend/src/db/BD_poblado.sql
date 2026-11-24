-- =====================================================
-- SCRIPT DE POBLADO DE DATOS (MIN. 20 REGISTROS POR TABLA)
-- Motor: PostgreSQL (DBeaver)
-- Contexto: Cafetería y Comida Típica Salvadoreña
-- =====================================================

BEGIN;

-- 1. BRANCH 
INSERT INTO branch (name, address, phone) VALUES
('Sucursal Centro Histórico', '4a Calle Oriente y 2a Av. Sur, San Salvador', '2221-1001'),
('Sucursal Escalón', 'Paseo General Escalón #4512, San Salvador', '2263-1002'),
('Sucursal Santa Elena', 'Blvd. Santa Elena, Plaza Madero, Antiguo Cuscatlán', '2243-1003'),
('Sucursal Merliot', 'Calle Chiltiupán, Jardines de Merliot, Santa Tecla', '2278-1004'),
('Sucursal San Benito', 'Blvd. del Hipódromo #320, Zona Rosa, San Salvador', '2224-1005'),
('Sucursal Los Héroes', 'Blvd. de los Héroes, Centro Comercial Metrocentro, SS', '2260-1006'),
('Sucursal Soyapango', 'Blvd. del Ejército Nacional Km 4.5, Soyapango', '2291-1007'),
('Sucursal Lourdes', 'Carretera a Santa Ana Km 24, Colón, La Libertad', '2318-1008'),
('Sucursal Santa Ana Centro', 'Av. Independencia Sur y 5a Calle Pte, Santa Ana', '2441-1009'),
('Sucursal Metrocentro Santa Ana', 'Av. Independencia Sur, C.C. Metrocentro, Santa Ana', '2440-1010'),
('Sucursal Sonsonate', 'Calle Obispo Marroquín, Barrio El Centro, Sonsonate', '2451-1011'),
('Sucursal San Miguel Centro', '2a Calle Poniente y 4a Av. Norte, San Miguel', '2661-1012'),
('Sucursal Roosevelt San Miguel', 'Av. Roosevelt Sur #810, San Miguel', '2660-1013'),
('Sucursal Usulután', 'Calle Grimaldi #14, Barrio El Calvario, Usulután', '2624-1014'),
('Sucursal La Unión', '3a Calle Oriente, Barrio El Centro, La Unión', '2604-1015'),
('Sucursal Chalatenango', '4a Calle Poniente, Barrio El Chile, Chalatenango', '2301-1016'),
('Sucursal Cojutepeque', 'Calle Dr. José María Peralta, Cojutepeque, Cuscatlán', '2372-1017'),
('Sucursal Zacatecoluca', 'Av. Juan Manuel Rodríguez, Zacatecoluca, La Paz', '2334-1018'),
('Sucursal Ahuachapán', '2a Av. Norte y Calle Gerardo Barrios, Ahuachapán', '2413-1019'),
('Sucursal San Vicente', '1a Calle Poniente, Frente a Parque Central, San Vicente', '2393-1020');

-- 2. EMPLOYEE 
INSERT INTO employee (branch_id, role, full_name, email, password_hash, monthly_salary, is_active, last_login) VALUES
(1, 'GERENTE', 'Carlos Daniel Martínez', 'cmartinez@tipicossv.com', '$2b$10$hash01', 950.00, TRUE, '2026-11-24 07:30:00'),
(1, 'CAJERO', 'Jaqueline Mendoza Cardamomo', 'jcardamomo@tipicossv.com', '$2b$10$hash02', 420.00, TRUE, '2026-11-24 07:45:00'),
(1, 'COCINERO', 'Leandro Andres Aquino', 'laquino@tipicossv.com', '$2b$10$hash03', 450.00, TRUE, '2026-11-24 06:50:00'),
(2, 'GERENTE', 'Ana Patricia López', 'alopez@tipicossv.com', '$2b$10$hash04', 980.00, TRUE, '2026-11-24 07:15:00'),
(2, 'BARISTA', 'Diego Alejandro Rivas', 'drivas@tipicossv.com', '$2b$10$hash05', 460.00, TRUE, '2026-11-24 07:20:00'),
(2, 'CAJERO', 'Sofía Guadalupe Martínez', 'smartinez@tipicossv.com', '$2b$10$hash06', 420.00, TRUE, '2026-11-24 08:00:00'),
(3, 'GERENTE', 'Luis Fernando Castillo', 'lcastillo@tipicossv.com', '$2b$10$hash07', 950.00, TRUE, '2026-11-24 07:10:00'),
(3, 'PUPUSERA', 'Marta Alicia Domínguez', 'mdominguez@tipicossv.com', '$2b$10$hash08', 440.00, TRUE, '2026-11-24 06:40:00'),
(4, 'CAJERO', 'Kevin Josué Ramírez', 'kramirez@tipicossv.com', '$2b$10$hash09', 410.00, TRUE, '2026-11-24 07:55:00'),
(4, 'BARISTA', 'Valeria Beatriz Gómez', 'vgomez@tipicossv.com', '$2b$10$hash10', 450.00, TRUE, '2026-11-24 07:35:00'),
(5, 'GERENTE', 'Roberto Carlos Pineda', 'rpineda@tipicossv.com', '$2b$10$hash11', 1050.00, TRUE, '2026-11-24 07:05:00'),
(5, 'CAJERO', 'Gabriela Nicole Ortiz', 'gortiz@tipicossv.com', '$2b$10$hash12', 430.00, TRUE, '2026-11-24 08:05:00'),
(6, 'COCINERO', 'Juan Antonio Morales', 'jmorales@tipicossv.com', '$2b$10$hash13', 450.00, TRUE, '2026-11-24 06:45:00'),
(7, 'CAJERO', 'Fátima del Carmen Cruz', 'fcruz@tipicossv.com', '$2b$10$hash14', 400.00, TRUE, '2026-11-24 08:10:00'),
(8, 'PUPUSERA', 'Merlin Rosmery Campos', 'mcampos@tipicossv.com', '$2b$10$hash15', 435.00, TRUE, '2026-11-24 06:30:00'),
(9, 'GERENTE', 'Héctor Mauricio Aguilar', 'haguilar@tipicossv.com', '$2b$10$hash16', 920.00, TRUE, '2026-11-24 07:25:00'),
(10, 'CAJERO', 'Daniela Alejandra Vides', 'dvides@tipicossv.com', '$2b$10$hash17', 410.00, TRUE, '2026-11-24 08:00:00'),
(11, 'BARISTA', 'Óscar Armando Zelaya', 'ozelaya@tipicossv.com', '$2b$10$hash18', 440.00, TRUE, '2026-11-24 07:40:00'),
(12, 'GERENTE', 'Claudia Verónica Portillo', 'cportillo@tipicossv.com', '$2b$10$hash19', 940.00, TRUE, '2026-11-24 07:15:00'),
(13, 'CAJERO', 'José Miguel Quintanilla', 'jquintanilla@tipicossv.com', '$2b$10$hash20', 415.00, FALSE, '2026-10-15 17:00:00');

-- 3. PAYROLL
INSERT INTO payroll (employee_id, period, fortnight, base_salary, isss, afp, isr) VALUES
(1,  '2026-11-01', 1, 475.00, 14.25, 34.44, 18.50),
(2,  '2026-11-01', 1, 210.00,  6.30, 15.23,  0.00),
(3,  '2026-11-01', 1, 225.00,  6.75, 16.31,  0.00),
(4,  '2026-11-01', 1, 490.00, 14.70, 35.53, 20.10),
(5,  '2026-11-01', 1, 230.00,  6.90, 16.68,  0.00),
(6,  '2026-11-01', 1, 210.00,  6.30, 15.23,  0.00),
(7,  '2026-11-01', 1, 475.00, 14.25, 34.44, 18.50),
(8,  '2026-11-01', 1, 220.00,  6.60, 15.95,  0.00),
(9,  '2026-11-01', 1, 205.00,  6.15, 14.86,  0.00),
(10, '2026-11-01', 1, 225.00,  6.75, 16.31,  0.00),
(11, '2026-11-01', 1, 525.00, 15.00, 38.06, 24.30),
(12, '2026-11-01', 1, 215.00,  6.45, 15.59,  0.00),
(13, '2026-11-01', 1, 225.00,  6.75, 16.31,  0.00),
(14, '2026-11-01', 1, 200.00,  6.00, 14.50,  0.00),
(15, '2026-11-01', 1, 217.50,  6.53, 15.77,  0.00),
(16, '2026-11-01', 1, 460.00, 13.80, 33.35, 16.80),
(17, '2026-11-01', 1, 205.00,  6.15, 14.86,  0.00),
(18, '2026-11-01', 1, 220.00,  6.60, 15.95,  0.00),
(19, '2026-11-01', 1, 470.00, 14.10, 34.08, 17.90),
(1,  '2026-10-01', 2, 475.00, 14.25, 34.44, 18.50);

-- 4. SUPPLIER 
INSERT INTO supplier (name, phone) VALUES
('Molinos de El Salvador S.A.', '2201-3301'),
('Qusos Petacones', '2345-8812'),
('Café Pacamara de Altura', '2430-5501'),
('Distribuidora La Constancia', '2271-0777'),
('Embutidos y Carnes San Jacinto', '2222-4510'),
('Verduras Frescas La Tiendona', '2221-9988'),
('Avícola Salvadoreña', '2209-6000'),
('Ingenio El Ángel (Azúcar)', '2319-4100'),
('Panadería y Repostería El Rosario', '2225-7412'),
('Empaques Biodegradables SV', '2264-1122'),
('Aceites y Mantecas El Dorado', '2294-3300'),
('Productos Nostálgicos Cuscatlán', '2288-5421'),
('Finca Santa Leticia Café', '2433-1920'),
('Quesería Artesanal Metapán', '2442-0891'),
('Jícaras y Bebidas Típicas', '2257-6632'),
('Distribuidora de Gas Tropigas', '2251-5151'),
('Salinas de Puerto El Triunfo', '2663-2104'),
('Frutas y Plátanos de Oriente', '2665-7740'),
('Chocolatería Artesanal Izalco', '2453-4012'),
('Especias y Condimentos El Comal', '2231-8090');

-- 5. PRODUCT 
INSERT INTO product (name, price, product_type) VALUES
-- PACKAGED
('Soda Kolashanpan Lata 355ml', 1.25, 'PACKAGED'),
('Soda SalvaCola Lata 355ml', 1.25, 'PACKAGED'),
('Agua Cristal Botella 600ml', 1.00, 'PACKAGED'),
('Jugo Petit Néctar Melocotón 330ml', 1.35, 'PACKAGED'),
('Café Molido Pacamara Bolsa 1lb', 8.50, 'PACKAGED'),
('Café Gourmet Bourbon Tostado 1lb', 7.75, 'PACKAGED'),
('Semita Alta de Piña Empacada (4 unid)', 3.25, 'PACKAGED'),
('Quesadilla Salvadoreña Artesanal Paquete', 3.75, 'PACKAGED'),
('Totopostes de Maíz Bolsa 250g', 2.00, 'PACKAGED'),
('Salpor de Arroz Bolsa 12 unid', 2.50, 'PACKAGED'),
('Dulce de Leche Artesanal Cajita', 2.25, 'PACKAGED'),
('Conserva de Coco Rayado Paquete', 1.75, 'PACKAGED'),
('Tamarindo Azucarado Bolsita', 1.00, 'PACKAGED'),
('Horchata en Polvo Instantánea 400g', 4.25, 'PACKAGED'),
('Cebada en Polvo Tradicional 400g', 4.00, 'PACKAGED'),
('Tableta de Chocolate Artesanal para Taza', 3.50, 'PACKAGED'),
('Alguashte Molido Frasco 150g', 2.75, 'PACKAGED'),
('Curtido Envasado Picante Frasco 16oz', 3.50, 'PACKAGED'),
('Salsa Roja Casera Frasco 12oz', 2.50, 'PACKAGED'),
('Platanitos Fritos Crujientes Bolsa 150g', 1.50, 'PACKAGED'),
-- PREPARED
('Pupusa Revuelta (Maíz)', 1.15, 'PREPARED'),
('Pupusa de Queso con Loroco (Maíz)', 1.25, 'PREPARED'),
('Pupusa de Frijol con Queso (Arroz)', 1.15, 'PREPARED'),
('Pupusa Loca Especial', 2.50, 'PREPARED'),
('Desayuno Típico Salvadoreño', 5.75, 'PREPARED'),
('Plátanos Fritos con Frijoles y Crema', 3.50, 'PREPARED'),
('Tamal de Elote Frito con Crema', 1.75, 'PREPARED'),
('Tamal de Gallina Criolla', 2.25, 'PREPARED'),
('Yuca Frita con Chicharrón y Pepesca', 4.50, 'PREPARED'),
('Pastelitos de Carne (Orden de 3)', 2.25, 'PREPARED'),
('Enchiladas Salvadoreñas (Orden de 2)', 2.50, 'PREPARED'),
('Nuegados de Yuca con Chilate', 3.00, 'PREPARED'),
('Empanadas de Plátano con Leche (Orden de 2)', 2.00, 'PREPARED'),
('Riguas con Queso Fresco y Crema', 2.75, 'PREPARED'),
('Atol de Elote Vaso 12oz', 1.75, 'PREPARED'),
('Atol Shuco Vaso 12oz', 1.50, 'PREPARED'),
('Horchata de Morro Vaso 16oz', 1.75, 'PREPARED'),
('Fresco de Ensalada Vaso 16oz', 1.75, 'PREPARED'),
('Café Americano de Altura 12oz', 2.00, 'PREPARED'),
('Café Capuchino Artesanal 12oz', 2.85, 'PREPARED');

-- 6. PACKAGED_PRODUCT 
INSERT INTO packaged_product (product_id, supplier_id, unit_cost) VALUES
(1,  4, 0.55),
(2,  4, 0.55),
(3,  4, 0.35),
(4,  4, 0.65),
(5,  3, 4.80),
(6, 13, 4.20),
(7,  9, 1.75),
(8,  9, 2.00),
(9, 12, 0.95),
(10, 9, 1.20),
(11, 12, 1.10),
(12, 12, 0.80),
(13, 12, 0.45),
(14, 15, 2.20),
(15, 15, 2.05),
(16, 19, 1.85),
(17, 20, 1.30),
(18, 12, 1.75),
(19, 12, 1.20),
(20, 18, 0.70);

-- 7. SUPPLY 
INSERT INTO supply (supplier_id, name, unit) VALUES
(1,  'Harina de Maíz Nixtamalizada', 'G'),
(1,  'Harina de Arroz para Pupusas', 'G'),
(2,  'Quesillo Especial para Pupusas', 'G'),
(2,  'Crema Pura Salvadoreña', 'ML'),
(14, 'Queso Fresco Duro Blandito', 'G'),
(5,  'Chicharrón Molido Preparado', 'G'),
(6,  'Loroco Fresco Limpio', 'G'),
(6,  'Repollo Blanco Fresco', 'G'),
(6,  'Tomate de Cocina Maduro', 'G'),
(18, 'Plátano Maduro Seleccionado', 'UNIT'),
(7,  'Huevos Frescos de Granja', 'UNIT'),
(1,  'Frijol Rojo de Seda Cocido', 'G'),
(3,  'Café en Grano Tostado Espresso', 'G'),
(2,  'Leche Entera Pasteurizada', 'ML'),
(8,  'Azúcar Blanca Refinada', 'G'),
(11, 'Aceite Vegetal de Cocina', 'ML'),
(18, 'Yuca Fresca Pelada', 'G'),
(6,  'Elote Tierno Desgranado', 'G'),
(15, 'Semilla de Morro Molida (Horchata)', 'G'),
(8,  'Dulce de Panelas (Atado)', 'G');

-- 8. RECIPE 
INSERT INTO recipe (product_id, name, description) VALUES
(21, 'Receta Pupusa Revuelta Maíz', 'Masa de maíz rellena de chicharrón molido, frijoles refritos y quesillo.'),
(22, 'Receta Pupusa Queso con Loroco', 'Masa de maíz rellena de quesillo derretido y flor de loroco fresca.'),
(23, 'Receta Pupusa Frijol con Queso Arroz', 'Masa de harina de arroz con frijol molido y quesillo.'),
(24, 'Receta Pupusa Loca', 'Pupusa grande con todos los ingredientes disponibles de la plancha.'),
(25, 'Receta Desayuno Típico', 'Dos huevos al gusto, frijoles fritos, plátano maduro, crema y queso fresco.'),
(26, 'Receta Plátanos Fritos', 'Plátano maduro frito acompañado de frijoles volteados y crema pura.'),
(27, 'Receta Tamal de Elote Frito', 'Tamal dulce de elote tierno dorado en plancha con crema.'),
(28, 'Receta Tamal de Gallina', 'Masa de maíz colada con recaudo, pollo, papa y aceituna en hoja de huerta.'),
(29, 'Receta Yuca Frita con Chicharrón', 'Trozos de yuca frita crujiente con curtido, salsa y trozos de chicharrón.'),
(30, 'Receta Pastelitos de Carne', 'Empanaditas de masa de maíz con achiote rellenas de carne picada y verduras.'),
(31, 'Receta Enchiladas Salvadoreñas', 'Tortilla frita crujiente con frijoles, curtido, huevo duro y queso rallado.'),
(32, 'Receta Nuegados con Chilate', 'Buñuelos de yuca bañados en miel de panela acompañados de chilate simple.'),
(33, 'Receta Empanadas de Plátano', 'Masa de plátano maduro rellena de poleada de leche y espolvoreada con azúcar.'),
(34, 'Receta Riguas con Queso', 'Tortitas de elote tierno asadas en hoja de huerta con queso fresco y crema.'),
(35, 'Receta Atol de Elote', 'Bebida caliente espesa elaborada con elote tierno, leche, azúcar y canela.'),
(36, 'Receta Atol Shuco', 'Atol tradicional de maíz fermentado con frijoles negros, alguashte y chile.'),
(37, 'Receta Horchata de Morro', 'Refresco tradicional de semilla de morro, cacao, maní, canela y leche.'),
(38, 'Receta Fresco de Ensalada', 'Bebida refrescante de marañón con frutas finamente picadas.'),
(39, 'Receta Café Americano', 'Un cafecito (rikito, rikito) una sonrisita (bonita, bonita) un abracito (calientito, calientito) una llamadita (bonita, bonita) un rayito de sol (brillantito, brillantito)'),
(40, 'Receta Café Capuchino', 'Espresso de café de altura con leche entera vaporizada y espuma cremosa.');

-- 9. RECIPE_DETAIL 
INSERT INTO recipe_detail (recipe_id, supply_id, quantity_used) VALUES
(1,  1,  120.000),
(1,  3,   45.000),
(1,  6,   35.000),
(2,  1,  120.000),
(2,  3,   50.000),
(2,  7,   20.000),
(3,  2,  120.000),
(3,  12,  40.000),
(4,  1,  180.000),
(5,  11,   2.000),
(5,  10,   1.000),
(6,  10,   1.500),
(7,  18, 150.000),
(8,  1,  140.000),
(9,  17, 250.000),
(12, 17, 200.000),
(15, 18, 180.000),
(17, 19,  35.000),
(19, 13,  18.000),
(20, 14, 180.000);

-- 10. BRANCH_SUPPLY_INVENTORY 
INSERT INTO branch_supply_inventory (branch_id, supply_id, quantity, min_stock) VALUES
(1, 1,  25000.000, 5000.000),
(1, 2,  15000.000, 3000.000),
(1, 3,  18000.000, 4000.000),
(1, 4,   8000.000, 2000.000),
(1, 5,   6000.000, 1500.000),
(1, 6,  12000.000, 3000.000),
(1, 7,   4500.000, 1000.000),
(1, 8,  10000.000, 2500.000),
(1, 9,   9000.000, 2000.000),
(1, 10,   150.000,   30.000),
(2, 1,  22000.000, 5000.000),
(2, 3,  16500.000, 4000.000),
(2, 11,   360.000,   60.000),
(2, 12, 14000.000, 3000.000),
(2, 13,  8500.000, 2000.000),
(2, 14, 20000.000, 5000.000),
(3, 15, 15000.000, 3000.000),
(3, 16, 18000.000, 4000.000),
(3, 17, 12000.000, 2500.000),
(3, 18, 10000.000, 2000.000);

-- 11. BRANCH_PACKAGED_INVENTORY 
INSERT INTO branch_packaged_inventory (branch_id, product_id, stock, min_stock) VALUES
(1,  1, 120, 24),
(1,  2,  96, 24),
(1,  3, 144, 36),
(1,  4,  72, 18),
(1,  5,  30,  8),
(1,  6,  25,  8),
(1,  7,  40, 10),
(1,  8,  35, 10),
(1,  9,  50, 12),
(1, 10,  45, 12),
(2, 11,  60, 15),
(2, 12,  55, 15),
(2, 13,  80, 20),
(2, 14,  30, 10),
(2, 15,  28, 10),
(2, 16,  40, 10),
(3, 17,  32,  8),
(3, 18,  25,  8),
(3, 19,  30,  8),
(3, 20,  90, 20);

-- 12. INVENTORY_MOVEMENT 
INSERT INTO inventory_movement (branch_id, employee_id, supply_id, product_id, movement_type, quantity, created_at) VALUES
(1, 1,  1,    NULL, 'IN',         10000.000, '2026-11-20 08:00:00'),
(1, 1,  3,    NULL, 'IN',          5000.000, '2026-11-20 08:05:00'),
(1, 3,  1,    NULL, 'OUT',        -2400.000, '2026-11-20 14:00:00'),
(1, 3,  7,    NULL, 'ADJUSTMENT',  -150.000, '2026-11-20 18:00:00'),
(2, 4,  13,   NULL, 'IN',          3000.000, '2026-11-21 08:30:00'),
(2, 5,  14,   NULL, 'OUT',        -1800.000, '2026-11-21 15:00:00'),
(3, 7,  17,   NULL, 'IN',          6000.000, '2026-11-21 09:00:00'),
(3, 8,  18,   NULL, 'OUT',        -1500.000, '2026-11-22 13:00:00'),
(2, 4,  11,   NULL, 'IN',           120.000, '2026-11-22 08:15:00'),
(1, 1,  4,    NULL, 'OUT',        -1000.000, '2026-11-22 19:00:00'),
(1, 2,  NULL, 1,    'IN',            48.000, '2026-11-20 09:10:00'),
(1, 2,  NULL, 1,    'OUT',          -15.000, '2026-11-20 17:30:00'),
(1, 2,  NULL, 3,    'IN',            72.000, '2026-11-21 09:15:00'),
(1, 1,  NULL, 5,    'ADJUSTMENT',    -1.000, '2026-11-21 18:45:00'),
(2, 6,  NULL, 7,    'IN',            20.000, '2026-11-22 07:45:00'),
(2, 6,  NULL, 8,    'OUT',           -8.000, '2026-11-22 16:20:00'),
(3, 7,  NULL, 14,   'IN',            15.000, '2026-11-23 09:00:00'),
(3, 7,  NULL, 20,   'OUT',          -12.000, '2026-11-23 16:00:00'),
(1, 2,  NULL, 2,    'OUT',          -10.000, '2026-11-24 12:30:00'),
(2, 6,  NULL, 11,   'OUT',           -5.000, '2026-11-24 13:15:00');

-- 13. PURCHASE
INSERT INTO purchase (branch_id, supplier_id, employee_id, document_num, payment_terms, status, issue_date, due_date, subtotal, tax, total) VALUES
(1,  1,  1,  'CCF-00101', 'CREDIT', 'RECORDED', '2026-11-01', '2026-12-01', 100.00, 13.00, 113.00),
(1,  2,  1,  'CCF-00102', 'CREDIT', 'RECORDED', '2026-11-02', '2026-12-02', 200.00, 26.00, 226.00),
(1,  3,  1,  'CCF-00103', 'CREDIT', 'RECORDED', '2026-11-03', '2026-12-03', 150.00, 19.50, 169.50),
(1,  4,  1,  'CCF-00104', 'CREDIT', 'RECORDED', '2026-11-04', '2026-12-04', 300.00, 39.00, 339.00),
(2,  5,  4,  'CCF-00105', 'CREDIT', 'RECORDED', '2026-11-05', '2026-12-05', 180.00, 23.40, 203.40),
(2,  6,  4,  'FCF-00201', 'CASH',   'RECORDED', '2026-11-06', NULL,          80.00, 10.40,  90.40),
(2,  7,  4,  'CCF-00106', 'CREDIT', 'RECORDED', '2026-11-07', '2026-12-07', 120.00, 15.60, 135.60),
(3,  8,  7,  'CCF-00107', 'CREDIT', 'RECORDED', '2026-11-08', '2026-12-08',  90.00, 11.70, 101.70),
(3,  9,  7,  'CCF-00108', 'CREDIT', 'RECORDED', '2026-11-09', '2026-12-09', 140.00, 18.20, 158.20),
(3,  10, 7,  'FCF-00202', 'CASH',   'RECORDED', '2026-11-10', NULL,          60.00,  7.80,  67.80),
(4,  11, 9,  'CCF-00109', 'CREDIT', 'RECORDED', '2026-11-11', '2026-12-11', 110.00, 14.30, 124.30),
(5,  12, 11, 'CCF-00110', 'CREDIT', 'RECORDED', '2026-11-12', '2026-12-12', 250.00, 32.50, 282.50),
(5,  13, 11, 'CCF-00111', 'CREDIT', 'RECORDED', '2026-11-13', '2026-12-13', 210.00, 27.30, 237.30),
(6,  14, 13, 'FCF-00203', 'CASH',   'RECORDED', '2026-11-14', NULL,          95.00, 12.35, 107.35),
(7,  15, 14, 'CCF-00112', 'CREDIT', 'RECORDED', '2026-11-15', '2026-12-15', 130.00, 16.90, 146.90),
(8,  16, 15, 'FCF-00204', 'CASH',   'RECORDED', '2026-11-16', NULL,          70.00,  9.10,  79.10),
(9,  17, 16, 'CCF-00113', 'CREDIT', 'RECORDED', '2026-11-17', '2026-12-17',  50.00,  6.50,  56.50),
(10, 18, 17, 'FCF-00205', 'CASH',   'RECORDED', '2026-11-18', NULL,          85.00, 11.05,  96.05),
(11, 19, 18, 'CCF-00114', 'CREDIT', 'RECORDED', '2026-11-19', '2026-12-19', 160.00, 20.80, 180.80),
(12, 20, 19, 'CCF-00115', 'CREDIT', 'VOID',     '2026-11-20', '2026-12-20',  40.00,  5.20,  45.20);

-- 14. PURCHASE_DETAIL 
INSERT INTO purchase_detail (purchase_id, supply_id, packaged_product_id, quantity, unit_cost, line_subtotal) VALUES
(1,  1,    NULL, 100.000, 1.00, 100.00),
(2,  3,    NULL,  50.000, 4.00, 200.00),
(3,  NULL, 5,     31.250, 4.80, 150.00),
(4,  NULL, 1,    545.455, 0.55, 300.00),
(5,  6,    NULL,  45.000, 4.00, 180.00),
(6,  7,    NULL,  16.000, 5.00,  80.00),
(7,  11,   NULL, 600.000, 0.20, 120.00),
(8,  15,   NULL,  90.000, 1.00,  90.00),
(9,  NULL, 7,     80.000, 1.75, 140.00),
(10, 8,    NULL,  60.000, 1.00,  60.00),
(11, 16,   NULL,  55.000, 2.00, 110.00),
(12, NULL, 9,    263.158, 0.95, 250.00),
(13, NULL, 6,     50.000, 4.20, 210.00),
(14, 5,    NULL,  19.000, 5.00,  95.00),
(15, NULL, 14,    59.091, 2.20, 130.00),
(16, 17,   NULL,  70.000, 1.00,  70.00),
(17, 12,   NULL,  50.000, 1.00,  50.00),
(18, 10,   NULL, 340.000, 0.25,  85.00),
(19, NULL, 16,    86.486, 1.85, 160.00),
(20, NULL, 17,    30.769, 1.30,  40.00);

-- 15. ACCOUNT_PAYABLE 
INSERT INTO account_payable (purchase_id, supplier_id, total_amount, pending_balance, due_date, status) VALUES
(1,  1,  113.00,   0.00, '2026-12-01', 'PAID'),
(2,  2,  226.00, 100.00, '2026-12-02', 'PARTIAL'),
(3,  3,  169.50, 169.50, '2026-12-03', 'PENDING'),
(4,  4,  339.00, 139.00, '2026-12-04', 'PARTIAL'),
(5,  5,  203.40,   0.00, '2026-12-05', 'PAID'),
(6,  6,   90.40,   0.00, '2026-11-06', 'PAID'),
(7,  7,  135.60, 135.60, '2026-12-07', 'PENDING'),
(8,  8,  101.70,  51.70, '2026-12-08', 'PARTIAL'),
(9,  9,  158.20, 158.20, '2026-12-09', 'PENDING'),
(10, 10,  67.80,   0.00, '2026-11-10', 'PAID'),
(11, 11, 124.30, 124.30, '2026-12-11', 'PENDING'),
(12, 12, 282.50,  82.50, '2026-12-12', 'PARTIAL'),
(13, 13, 237.30, 237.30, '2026-12-13', 'PENDING'),
(14, 14, 107.35,   0.00, '2026-11-14', 'PAID'),
(15, 15, 146.90, 146.90, '2026-12-15', 'PENDING'),
(16, 16,  79.10,   0.00, '2026-11-16', 'PAID'),
(17, 17,  56.50,  56.50, '2026-12-17', 'PENDING'),
(18, 18,  96.05,   0.00, '2026-11-18', 'PAID'),
(19, 19, 180.80, 100.00, '2026-12-19', 'PARTIAL'),
(20, 20,  45.20,  45.20, '2026-12-20', 'PENDING');

-- 16. SUPPLIER_PAYMENT (20 pagos cuadrados exactamente con total_amount - pending_balance)
INSERT INTO supplier_payment (account_payable_id, employee_id, method, reference, amount, paid_at) VALUES
(1,  1,  'TRANSFERENCIA', 'TRF-BAC-9001',  60.00, '2026-11-05 10:00:00'),
(1,  1,  'TRANSFERENCIA', 'TRF-BAC-9002',  53.00, '2026-11-10 10:05:00'),
(2,  1,  'TRANSFERENCIA', 'TRF-BAC-9003', 100.00, '2026-11-12 11:30:00'),
(2,  1,  'TRANSFERENCIA', 'TRF-BAC-9004',  26.00, '2026-11-23 09:00:00'),
(4,  1,  'CHEQUE',        'CHQ-00451',    100.00, '2026-11-14 14:00:00'),
(4,  1,  'TRANSFERENCIA', 'TRF-BAC-9005', 100.00, '2026-11-18 09:45:00'),
(5,  4,  'TRANSFERENCIA', 'TRF-AGR-8812', 150.00, '2026-11-12 15:20:00'),
(5,  4,  'TRANSFERENCIA', 'TRF-AGR-8813',  53.40, '2026-11-15 15:25:00'),
(6,  4,  'EFECTIVO',      'REC-CAJA-01',   90.40, '2026-11-06 10:15:00'),
(8,  7,  'TRANSFERENCIA', 'TRF-DAV-7741',  35.00, '2026-11-19 16:00:00'),
(8,  7,  'EFECTIVO',      'REC-CAJA-06',   15.00, '2026-11-21 11:20:00'),
(10, 7,  'EFECTIVO',      'REC-CAJA-02',   67.80, '2026-11-10 11:00:00'),
(12, 11, 'TRANSFERENCIA', 'TRF-BAC-9010', 100.00, '2026-11-20 10:30:00'),
(12, 11, 'TRANSFERENCIA', 'TRF-BAC-9015',  80.00, '2026-11-22 14:15:00'),
(12, 11, 'TRANSFERENCIA', 'TRF-BAC-9021',  20.00, '2026-11-23 16:10:00'),
(14, 13, 'EFECTIVO',      'REC-CAJA-03',  107.35, '2026-11-14 09:30:00'),
(16, 15, 'EFECTIVO',      'REC-CAJA-04',   79.10, '2026-11-16 13:00:00'),
(18, 17, 'EFECTIVO',      'REC-CAJA-05',   96.05, '2026-11-18 12:10:00'),
(19, 18, 'TRANSFERENCIA', 'TRF-AGR-8890',  60.80, '2026-11-23 15:40:00'),
(19, 18, 'TRANSFERENCIA', 'TRF-AGR-8895',  20.00, '2026-11-24 10:00:00');

-- 17. CASH_REGISTER 
INSERT INTO cash_register (branch_id, name) VALUES
(1,  'Caja Principal 01'),
(1,  'Caja Express 02'),
(2,  'Caja Principal 01'),
(2,  'Caja Terraza 02'),
(3,  'Caja Principal 01'),
(4,  'Caja Principal 01'),
(5,  'Caja Principal 01'),
(5,  'Caja Barista 02'),
(6,  'Caja Principal 01'),
(7,  'Caja Principal 01'),
(8,  'Caja Principal 01'),
(9,  'Caja Principal 01'),
(10, 'Caja Principal 01'),
(11, 'Caja Principal 01'),
(12, 'Caja Principal 01'),
(13, 'Caja Principal 01'),
(14, 'Caja Principal 01'),
(15, 'Caja Principal 01'),
(16, 'Caja Principal 01'),
(17, 'Caja Principal 01');

-- 18. CASH_SESSION 
INSERT INTO cash_session (cash_register_id, employee_id, status, opened_at, closed_at, opening_amount, expected_cash, expected_card, expected_digital, declared_cash, declared_card, declared_digital, notes) VALUES
(1,  2,  'CLOSED', '2026-11-23 07:00:00', '2026-11-23 15:00:00', 100.00, 345.50, 210.00, 45.00, 345.50, 210.00, 45.00, 'Cuadre exacto turno matutino'),
(2,  1,  'CLOSED', '2026-11-23 15:00:00', '2026-11-23 21:00:00', 100.00, 280.00, 195.25, 30.00, 279.50, 195.25, 30.00, 'Diferencia mínima de $0.50'),
(3,  6,  'CLOSED', '2026-11-23 07:00:00', '2026-11-23 15:00:00', 150.00, 420.00, 380.50, 65.00, 420.00, 380.50, 65.00, 'Sin novedades'),
(4,  4,  'CLOSED', '2026-11-23 14:00:00', '2026-11-23 21:30:00', 100.00, 310.75, 290.00, 40.00, 310.75, 290.00, 40.00, 'Cierre nocturno OK'),
(5,  7,  'CLOSED', '2026-11-23 07:30:00', '2026-11-23 16:00:00', 100.00, 265.00, 310.00, 50.00, 265.00, 310.00, 50.00, 'Todo cuadrado'),
(6,  9,  'CLOSED', '2026-11-23 08:00:00', '2026-11-23 17:00:00', 100.00, 230.00, 150.00, 25.00, 230.00, 150.00, 25.00, 'Turno normal'),
(7,  12, 'CLOSED', '2026-11-23 07:30:00', '2026-11-23 16:30:00', 150.00, 390.00, 450.00, 85.00, 390.00, 450.00, 85.00, 'Alta afluencia almuerzo'),
(8,  11, 'CLOSED', '2026-11-23 12:00:00', '2026-11-23 20:00:00', 100.00, 190.00, 220.00, 35.00, 190.00, 220.00, 35.00, 'Turno barra café'),
(9,  13, 'CLOSED', '2026-11-23 08:00:00', '2026-11-23 18:00:00', 100.00, 315.00, 180.00, 20.00, 315.00, 180.00, 20.00, 'Cuadre completo'),
(10, 14, 'CLOSED', '2026-11-23 08:00:00', '2026-11-23 18:00:00', 100.00, 295.00, 140.00, 15.00, 295.00, 140.00, 15.00, 'Cierre sin observaciones'),
(1,  2,  'OPEN',   '2026-11-24 07:00:00', NULL,                  100.00, 185.50, 120.00, 25.00, NULL,   NULL,   NULL,  'Turno activo martes'),
(3,  6,  'OPEN',   '2026-11-24 07:00:00', NULL,                  150.00, 240.00, 210.50, 40.00, NULL,   NULL,   NULL,  'Turno activo Escalón'),
(5,  7,  'OPEN',   '2026-11-24 07:30:00', NULL,                  100.00, 160.00, 190.00, 30.00, NULL,   NULL,   NULL,  'Turno activo Santa Elena'),
(6,  9,  'OPEN',   '2026-11-24 08:00:00', NULL,                  100.00, 145.00,  95.00, 15.00, NULL,   NULL,   NULL,  'Turno activo Merliot'),
(7,  12, 'OPEN',   '2026-11-24 07:30:00', NULL,                  150.00, 220.00, 260.00, 55.00, NULL,   NULL,   NULL,  'Turno activo San Benito'),
(11, 15, 'OPEN',   '2026-11-24 07:00:00', NULL,                  100.00, 175.00,  80.00, 10.00, NULL,   NULL,   NULL,  'Turno activo Lourdes'),
(12, 16, 'OPEN',   '2026-11-24 07:30:00', NULL,                  100.00, 210.00, 130.00, 20.00, NULL,   NULL,   NULL,  'Turno activo Santa Ana'),
(13, 17, 'OPEN',   '2026-11-24 08:00:00', NULL,                  100.00, 195.00, 150.00, 18.00, NULL,   NULL,   NULL,  'Turno activo Metro SA'),
(14, 18, 'OPEN',   '2026-11-24 07:30:00', NULL,                  100.00, 180.00,  90.00, 12.00, NULL,   NULL,   NULL,  'Turno activo Sonsonate'),
(15, 19, 'OPEN',   '2026-11-24 07:30:00', NULL,                  100.00, 230.00, 145.00, 22.00, NULL,   NULL,   NULL,  'Turno activo San Miguel');

-- 19. CASH_MOVEMENT 
INSERT INTO cash_movement (cash_session_id, employee_id, movement_type, description, amount, created_at) VALUES
(1,  2,  'IN',  'Refuerzo de sencillo monedas y billetes de $1', 50.00, '2026-11-23 09:15:00'),
(1,  2,  'OUT', 'Compra urgente de bolsas de hielo', 6.50, '2026-11-23 11:30:00'),
(2,  1,  'OUT', 'Pago de garrafones de agua purificada', 9.00, '2026-11-23 16:20:00'),
(3,  6,  'IN',  'Ingreso de cambio para turno de almuerzo', 60.00, '2026-11-23 11:45:00'),
(3,  6,  'OUT', 'Compra de limones y cilantro fresco', 8.25, '2026-11-23 13:10:00'),
(4,  4,  'OUT', 'Pago de taxi envío documentos contables', 5.00, '2026-11-23 17:00:00'),
(5,  7,  'IN',  'Refuerzo de caja chica', 40.00, '2026-11-23 10:00:00'),
(6,  9,  'OUT', 'Compra de servilletas de emergencia', 7.50, '2026-11-23 14:15:00'),
(7,  12, 'OUT', 'Pago de propina repartidor externo', 4.00, '2026-11-23 13:45:00'),
(8,  11, 'IN',  'Apertura adicional cambio barista', 30.00, '2026-11-23 12:15:00'),
(9,  13, 'OUT', 'Compra de carbón para plancha', 12.00, '2026-11-23 10:30:00'),
(10, 14, 'OUT', 'Compra de detergente y cloro', 6.75, '2026-11-23 15:00:00'),
(11, 2,  'IN',  'Ingreso de sencillo matutino', 40.00, '2026-11-24 08:30:00'),
(11, 2,  'OUT', 'Compra de pan francés fresco', 5.50, '2026-11-24 09:45:00'),
(12, 6,  'OUT', 'Compra de hojas de huerta para tamales', 10.00, '2026-11-24 10:15:00'),
(13, 7,  'IN',  'Refuerzo de billetes de baja denominación', 50.00, '2026-11-24 09:00:00'),
(14, 9,  'OUT', 'Pago de fumigación preventiva local', 25.00, '2026-11-24 11:00:00'),
(15, 12, 'OUT', 'Compra de hielo en cubos', 6.00, '2026-11-24 12:10:00'),
(16, 15, 'OUT', 'Compra de leña seca para comal', 15.00, '2026-11-24 08:45:00'),
(17, 16, 'IN',  'Refuerzo de caja sucursal Santa Ana', 45.00, '2026-11-24 09:20:00');

-- 20. CUSTOMER (20 Clientes Registrados)
INSERT INTO customer (full_name, email, phone, address, password_hash) VALUES
('Alejandro José Meléndez', 'amelendez@gmail.com', '7845-1101', 'Col. Escalón, Calle La Mascota #12, SS', '$2b$10$cust01'),
('Beatriz Elena Sandoval', 'bsandoval@hotmail.com', '7123-2202', 'Residencial La Gloria, Mejicanos', '$2b$10$cust02'),
('César Augusto Menjívar', 'cmenjivar@hotmail.com', '7923-1103', 'Col. Miramonte, Calle Toluca #45', '$2b$10$cust03'),
('Diana Carolina Orellana', 'dorellana@gmail.com', '7654-1104', 'Ciudad Merliot, Jardines de la Libertad #8', '$2b$10$cust04'),
('Ernesto Vladimir Ramos', 'eramos@yahoo.com', '7123-1105', 'Col. San Benito, Pasaje 2 #19', '$2b$10$cust05'),
('Fátima del Rosario Alfaro', 'falfaro@gmail.com', '7456-1106', 'Santa Tecla, Col. Utila #32', '$2b$10$cust06'),
('Gerardo Antonio Solórzano', 'gsolorzano@outlook.com', '7890-1107', 'Antiguo Cuscatlán, Calle Principal #10', '$2b$10$cust07'),
('Hazel Stefany Monterrosa', 'hmonterrosa@gmail.com', '7234-1108', 'Col. Médica, Diagonal Dr. Arturo Romero #50', '$2b$10$cust08'),
('Iván Mauricio Cornejo', 'icornejo@gmail.com', '7567-1109', 'Soyapango, Urb. Bosques del Río Pol. B #4', '$2b$10$cust09'),
('Jessica Lorena Campos', 'jcampos@hotmail.com', '7345-1110', 'Planes de Renderos, Km 7.5 Casa #3', '$2b$10$cust10'),
('Kevin Alexander Molina', 'kmolina@gmail.com', '7678-1111', 'Mejicanos, Col. Zacamil Edificio 12 Apto 4', '$2b$10$cust11'),
('Laura Cristina Villalta', 'lvillalta@gmail.com', '7901-1112', 'Santa Ana, Col. El Palmar #22', '$2b$10$cust12'),
('Manuel de Jesús Pineda', 'mpineda@outlook.com', '7012-1113', 'San Miguel, Col. Ciudad Jardín #14', '$2b$10$cust13'),
('Natalia Sofía Guevara', 'nguevara@gmail.com', '7834-1114', 'Col. Flor Blanca, 45 Av. Sur #112', '$2b$10$cust14'),
('Orlando Javier Escobar', 'oescobar@gmail.com', '7745-1115', 'Lourdes Colón, Res. Campos Verdes #67', '$2b$10$cust15'),
('Paola Andrea Serrano', 'pserrano@gmail.com', '7612-1116', 'San Salvador, Col. Layco #89', '$2b$10$cust16'),
('Rafael Enrique Barahona', 'rbarahona@hotmail.com', '7523-1117', 'Sonsonate, Col. Sensunapán #11', '$2b$10$cust17'),
('Sandra Marisol Chicas', 'schicas@gmail.com', '7434-1118', 'Usulután, Barrio El Calvario #5', '$2b$10$cust18'),
('Tomás Eduardo Alvarado', 'talvarado@gmail.com', '7312-1119', 'Olocuilta, Barrio El Centro #28', '$2b$10$cust19'),
('Valeria Isabel Fuentes', 'vfuentes@gmail.com', '7298-1120', 'Juayúa, Barrio Santa Lucía #9', '$2b$10$cust20');

-- 21. CUSTOMER_ORDER (25 pedidos: 20 con crédito fiscal y 5 normales; subtotal + tax = total)
INSERT INTO customer_order (branch_id, customer_id, employee_id, invoice_type, status, created_at, subtotal, tax, total) VALUES
(1, 1, 3, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '5 days', 10.00, 1.30, 11.30),
(2, 2, 4, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '5 days', 20.00, 2.60, 22.60),
(3, 3, 3, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '4 days', 15.00, 1.95, 16.95),
(4, 4, 4, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '4 days', 30.00, 3.90, 33.90),
(5, 5, 8, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '4 days', 25.00, 3.25, 28.25),
(6, 6, 8, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '3 days', 40.00, 5.20, 45.20),
(7, 7, 11, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '3 days', 12.00, 1.56, 13.56),
(8, 8, 8, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '3 days', 18.00, 2.34, 20.34),
(9, 9, 11, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '2 days', 22.00, 2.86, 24.86),
(10, 10, 15, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '2 days', 35.00, 4.55, 39.55),
(11, 11, 11, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '2 days', 14.00, 1.82, 15.82),
(12, 12, 15, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '1 day', 16.00, 2.08, 18.08),
(13, 13, 18, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '1 day', 28.00, 3.64, 31.64),
(14, 14, 15, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '1 day', 50.00, 6.50, 56.50),
(15, 15, 15, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '12 hours', 10.00, 1.30, 11.30),
(16, 16, 18, 'TAX_CREDIT', 'DELIVERED', NOW() - INTERVAL '10 hours', 20.00, 2.60, 22.60),
(17, 17, 18, 'TAX_CREDIT', 'PAID', NOW() - INTERVAL '8 hours', 30.00, 3.90, 33.90),
(18, 18, 18, 'TAX_CREDIT', 'PAID', NOW() - INTERVAL '6 hours', 15.00, 1.95, 16.95),
(19, 19, 3, 'TAX_CREDIT', 'IN_PREPARATION', NOW() - INTERVAL '4 hours', 25.00, 3.25, 28.25),
(20, 20, 4, 'TAX_CREDIT', 'PAID', NOW() - INTERVAL '2 hours', 40.00, 5.20, 45.20),
(1, NULL, 3, 'NORMAL', 'DELIVERED', NOW() - INTERVAL '1 hour', 5.00, 0.65, 5.65),
(2, NULL, 4, 'NORMAL', 'DELIVERED', NOW() - INTERVAL '45 minutes', 8.00, 1.04, 9.04),
(3, NULL, 8, 'NORMAL', 'PAID', NOW() - INTERVAL '30 minutes', 6.00, 0.78, 6.78),
(10, NULL, 15, 'NORMAL', 'IN_PREPARATION', NOW() - INTERVAL '15 minutes', 10.00, 1.30, 11.30),
(17, NULL, 18, 'NORMAL', 'DELIVERED', NOW() - INTERVAL '5 minutes', 4.00, 0.52, 4.52);

-- 22. ORDER_DETAIL (Todos los 25 pedidos tienen detalle y suman exactamente su subtotal)
INSERT INTO order_detail (order_id, product_id, quantity, unit_price) VALUES
(1,  21, 10, 1.00), -- 10.00
(2,  26,  2, 5.50), -- 11.00
(2,  37,  2, 2.50), -- 5.00
(2,  34,  1, 4.00), -- 4.00  -> Total 20.00
(3,  22, 10, 1.15), -- 11.50
(3,  34,  1, 3.50), -- 3.50  -> Total 15.00
(4,  40,  4, 6.50), -- 26.00
(4,  34,  1, 4.00), -- 4.00  -> Total 30.00
(5,  29,  5, 4.25), -- 21.25
(5,  35,  2, 1.875),-- 3.75  -> Total 25.00
(6,  21, 20, 1.00), -- 20.00
(6,  25, 10, 1.10), -- 11.00
(6,   1,  6, 1.50), -- 9.00  -> Total 40.00
(7,  27,  6, 2.00), -- 12.00
(8,  39,  6, 2.50), -- 15.00
(8,  38,  1, 3.00), -- 3.00  -> Total 18.00
(9,  30,  8, 2.75), -- 22.00
(10, 24, 10, 2.50), -- 25.00
(10, 16,  5, 2.00), -- 10.00 -> Total 35.00
(11, 28,  8, 1.75), -- 14.00
(12, 31,  8, 1.50), -- 12.00
(12, 32,  2, 2.00), -- 4.00  -> Total 16.00
(13, 26,  4, 5.50), -- 22.00
(13, 39,  3, 2.00), -- 6.00  -> Total 28.00
(14, 40,  6, 6.50), -- 39.00
(14, 25,  2, 5.50), -- 11.00 -> Total 50.00
(15, 21, 10, 1.00), -- 10.00
(16, 25,  2, 5.75), -- 11.50
(16,  5,  1, 8.50), -- 8.50  -> Total 20.00
(17, 24, 12, 2.50), -- 30.00
(18, 32,  5, 3.00), -- 15.00
(19, 29,  4, 4.50), -- 18.00
(19, 37,  4, 1.75), -- 7.00  -> Total 25.00
(20, 25,  4, 5.75), -- 23.00
(20,  5,  2, 8.50), -- 17.00 -> Total 40.00
(21, 31,  2, 2.50), -- 5.00
(22, 33,  4, 2.00), -- 8.00
(23, 39,  3, 2.00), -- 6.00
(24, 24,  4, 2.50), -- 10.00
(25, 39,  2, 2.00); -- 4.00

-- 23. PAYMENT (25 pagos correspondientes a los 25 pedidos)
INSERT INTO payment (order_id, cash_session_id, method, gateway_reference, amount, status, paid_at) VALUES
(1, 1, 'CASH', NULL, 11.30, 'APPROVED', NOW() - INTERVAL '5 days'),
(2, 3, 'CARD', 'AUTH-BAC-8801', 22.60, 'APPROVED', NOW() - INTERVAL '5 days'),
(3, 4, 'CHIVO_WALLET', 'CHV-99102', 16.95, 'APPROVED', NOW() - INTERVAL '4 days'),
(4, 5, 'CARD', 'AUTH-AGR-8802', 33.90, 'APPROVED', NOW() - INTERVAL '4 days'),
(5, 6, 'TRANSFER', 'TRF-365-001', 28.25, 'APPROVED', NOW() - INTERVAL '4 days'),
(6, 7, 'CARD', 'AUTH-DAV-8803', 45.20, 'APPROVED', NOW() - INTERVAL '3 days'),
(7, 8, 'CASH', NULL, 13.56, 'APPROVED', NOW() - INTERVAL '3 days'),
(8, 9, 'BITCOIN', 'LN-INV-5541', 20.34, 'APPROVED', NOW() - INTERVAL '3 days'),
(9, 10, 'CASH', NULL, 24.86, 'APPROVED', NOW() - INTERVAL '2 days'),
(10, 11, 'CASH', NULL, 39.55, 'APPROVED', NOW() - INTERVAL '2 days'),
(11, 12, 'CARD', 'AUTH-BAC-8804', 15.82, 'APPROVED', NOW() - INTERVAL '2 days'),
(12, 13, 'CASH', NULL, 18.08, 'APPROVED', NOW() - INTERVAL '1 day'),
(13, 14, 'CARD', 'AUTH-CUS-8805', 31.64, 'APPROVED', NOW() - INTERVAL '1 day'),
(14, 15, 'TRANSFER', 'TRF-365-002', 56.50, 'APPROVED', NOW() - INTERVAL '1 day'),
(15, 16, 'CHIVO_WALLET', 'CHV-99103', 11.30, 'APPROVED', NOW() - INTERVAL '12 hours'),
(16, 17, 'CARD', 'AUTH-BAC-8806', 22.60, 'APPROVED', NOW() - INTERVAL '10 hours'),
(17, 18, 'CASH', NULL, 33.90, 'APPROVED', NOW() - INTERVAL '8 hours'),
(18, 19, 'CARD', 'AUTH-AGR-8807', 16.95, 'APPROVED', NOW() - INTERVAL '6 hours'),
(19, 16, 'CASH', NULL, 28.25, 'APPROVED', NOW() - INTERVAL '4 hours'),
(20, 17, 'CARD', 'AUTH-DAV-8808', 45.20, 'APPROVED', NOW() - INTERVAL '2 hours'),
(21, 16, 'CASH', NULL, 5.65, 'APPROVED', NOW() - INTERVAL '1 hour'),
(22, 17, 'CASH', NULL, 9.04, 'APPROVED', NOW() - INTERVAL '45 minutes'),
(23, 18, 'CHIVO_WALLET', 'CHV-99104', 6.78, 'APPROVED', NOW() - INTERVAL '30 minutes'),
(24, 19, 'CASH', NULL, 11.30, 'APPROVED', NOW() - INTERVAL '15 minutes'),
(25, 20, 'CASH', NULL, 4.52, 'APPROVED', NOW() - INTERVAL '5 minutes');

-- 24. INVOICE (25 facturas emitidas para los 25 pedidos)
INSERT INTO invoice (order_id, issued_at) VALUES
(1, NOW() - INTERVAL '5 days'),
(2, NOW() - INTERVAL '5 days'),
(3, NOW() - INTERVAL '4 days'),
(4, NOW() - INTERVAL '4 days'),
(5, NOW() - INTERVAL '4 days'),
(6, NOW() - INTERVAL '3 days'),
(7, NOW() - INTERVAL '3 days'),
(8, NOW() - INTERVAL '3 days'),
(9, NOW() - INTERVAL '2 days'),
(10, NOW() - INTERVAL '2 days'),
(11, NOW() - INTERVAL '2 days'),
(12, NOW() - INTERVAL '1 day'),
(13, NOW() - INTERVAL '1 day'),
(14, NOW() - INTERVAL '1 day'),
(15, NOW() - INTERVAL '12 hours'),
(16, NOW() - INTERVAL '10 hours'),
(17, NOW() - INTERVAL '8 hours'),
(18, NOW() - INTERVAL '6 hours'),
(19, NOW() - INTERVAL '4 hours'),
(20, NOW() - INTERVAL '2 hours'),
(21, NOW() - INTERVAL '1 hour'),
(22, NOW() - INTERVAL '45 minutes'),
(23, NOW() - INTERVAL '30 minutes'),
(24, NOW() - INTERVAL '15 minutes'),
(25, NOW() - INTERVAL '5 minutes');

-- 25. TAX_CREDIT_NOTE (20 comprobantes de crédito fiscal para los pedidos 1..20)
INSERT INTO tax_credit_note (order_id, nit, nrc, institution_name, business_line, address) VALUES
(1, '0614-120390-101-2', '123456-7', 'Inversiones Cuscatlán S.A. de C.V.', 'Servicios de Consultoría', 'Col. Escalón, San Salvador'),
(2, '0614-240585-102-5', '234567-8', 'Bufete Legal Asociados', 'Servicios Jurídicos', 'Paseo General Escalón, San Salvador'),
(3, '0614-180992-103-1', '345678-9', 'Tech Solutions El Salvador', 'Desarrollo de Software', 'Santa Elena, Antiguo Cuscatlán'),
(4, '0614-051188-104-8', '456789-0', 'Constructora del Pacífico', 'Ingeniería Civil', 'Ciudad Merliot, Santa Tecla'),
(5, '0614-300195-105-4', '567890-1', 'Clínica Médica San Lucas', 'Servicios de Salud', 'Santa Tecla, La Libertad'),
(6, '0614-140782-106-9', '678901-2', 'Agencia Creativa Naranja', 'Publicidad y Mercadeo', 'Col. San Benito, San Salvador'),
(7, '0614-220891-107-3', '789012-3', 'Importadora Automotriz SV', 'Venta de Repuestos', 'Blvd. de los Héroes, San Salvador'),
(8, '0614-090487-108-6', '890123-4', 'Arquitectos Urbanos S.A.', 'Diseño Arquitectónico', 'Antiguo Cuscatlán, La Libertad'),
(9, '0614-191293-109-0', '901234-5', 'Transportes y Logística Carga', 'Transporte de Carga', 'Carretera a Los Planes, San Salvador'),
(10, '0614-270684-110-7', '112233-4', 'AeroServicios Comalapa', 'Logística Aeroportuaria', 'Olocuilta, La Paz'),
(11, '0614-110289-111-1', '223344-5', 'Textiles e Hilados de Oriente', 'Manufactura Textil', 'Soyapango, San Salvador'),
(12, '0614-031094-112-5', '334455-6', 'Distribuidora Ferretera Norte', 'Comercio al por Mayor', 'Apopa, San Salvador'),
(13, '0614-160586-113-9', '445566-7', 'Agroindustria Valle Verde', 'Producción Agrícola', 'Lourdes Colón, La Libertad'),
(14, '0210-280981-114-2', '556677-8', 'Beneficio Exportador Occidente', 'Exportación de Café', 'Santa Ana, Santa Ana'),
(15, '0210-150390-115-6', '667788-9', 'Laboratorios Clínicos Santa Ana', 'Análisis Clínicos', 'Av. Independencia, Santa Ana'),
(16, '0315-071183-116-0', '778899-1', 'Naviera y Aduanas Acajutla', 'Servicios Aduanales', 'Sonsonate, Sonsonate'),
(17, '1217-210488-117-4', '889900-2', 'Hospital Privado San Miguel', 'Servicios Hospitalarios', 'San Miguel, San Miguel'),
(18, '1217-100892-118-8', '990011-3', 'Comercializadora Oriental S.A.', 'Distribución de Consumo', 'Av. Roosevelt, San Miguel'),
(19, '1123-250185-119-1', '102030-4', 'Camaronera Bahía de Jiquilisco', 'Acuicultura', 'Usulután, Usulután'),
(20, '0307-130691-120-5', '203040-5', 'Hostal y Tours Ruta de las Flores', 'Turismo y Hotelería', 'Juayúa, Sonsonate');

COMMIT;