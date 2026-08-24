-- =====================================================
-- BASE DE DATOS: DF_BerryControl
-- EMPRESA: Arándanos del Sur (Vivero de plantas frutales)
-- =====================================================

IF DB_ID('DF_BerryControl') IS NULL CREATE DATABASE DF_BerryControl;
GO
USE DF_BerryControl;
GO



-- =====================================================
-- 1. DROP TABLAS (en orden inverso por FKs)
-- =====================================================
DROP TABLE IF EXISTS STOCK_MOVEMENT;
DROP TABLE IF EXISTS PRODUCTION_STAGE;
DROP TABLE IF EXISTS PRODUCTION_BATCH;
DROP TABLE IF EXISTS ORDER_DETAILS;
DROP TABLE IF EXISTS ORDERS;
DROP TABLE IF EXISTS SALE_DETAILS;
DROP TABLE IF EXISTS SALE;
DROP TABLE IF EXISTS PURCHASES_DETAILS;
DROP TABLE IF EXISTS PURCHASES;
DROP TABLE IF EXISTS PRODUCTS_SUPPLY;
DROP TABLE IF EXISTS PRODUCTS_SALE;
DROP TABLE IF EXISTS EMPLOYEE;
DROP TABLE IF EXISTS CUSTOMER;
DROP TABLE IF EXISTS SUPPLIER;
DROP TABLE IF EXISTS ROLES;
DROP TABLE IF EXISTS UBIGEO;
DROP TABLE IF EXISTS CATEGORY;
GO

-- =====================================================
-- 2. CREAR TABLAS
-- =====================================================

CREATE TABLE CATEGORY(
    category_id   INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(20)  NOT NULL,
    status        VARCHAR(20)  NOT NULL
);

CREATE TABLE UBIGEO(
    ubigeo_code INT          PRIMARY KEY,
    department  VARCHAR(100) NOT NULL,
    province    VARCHAR(100) NOT NULL,
    district    VARCHAR(100) NOT NULL
);



CREATE TABLE ROLES(
    role_id     INT IDENTITY(1,1) PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    description VARCHAR(200) NOT NULL
);

CREATE TABLE CUSTOMER(
    id_customer       INT IDENTITY(1,1) PRIMARY KEY,
    customer_name     NVARCHAR(50)  NOT NULL,
    customer_lastname NVARCHAR(60)  NOT NULL,
    customer_type     VARCHAR(20)   NOT NULL,
    document_type     CHAR(3)       NOT NULL,
    document_number   VARCHAR(15)   UNIQUE NOT NULL,
    email             VARCHAR(150)  UNIQUE NOT NULL,
    phone             CHAR(9)       NOT NULL,
    address           NVARCHAR(200) NOT NULL,
    status            BIT           NOT NULL DEFAULT 1,
    created_at        DATETIME2     DEFAULT GETDATE(),
    updated_at        DATETIME2     DEFAULT GETDATE(),
    deleted_at        DATETIME2     NULL,
    restored_at       DATETIME2     NULL,
    ubigeo_code       INT           NOT NULL,
    CONSTRAINT CHK_CUSTOMER_TYPE      CHECK (customer_type IN ('Natural', 'Empresa')),
    CONSTRAINT CHK_CUSTOMER_DOC_TYPE  CHECK (document_type IN ('DNI', 'RUC', 'CE')),
    CONSTRAINT CHK_CUSTOMER_PHONE     CHECK (LEN(phone) = 9),
    CONSTRAINT CHK_CUSTOMER_EMAIL     CHECK (email LIKE '%@%.%'),

    CONSTRAINT FK_CUSTOMER_UBIGEO FOREIGN KEY(ubigeo_code) REFERENCES UBIGEO(ubigeo_code)
);

CREATE TABLE EMPLOYEE(
    employee_id     INT IDENTITY(1,1) PRIMARY KEY,
    ubigeo_code     INT          NOT NULL,
    role_id         INT          NOT NULL,
    document_type   VARCHAR(12)  NOT NULL,
    document_number VARCHAR(50)  UNIQUE NOT NULL,
    name            VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    phone           CHAR(9)      NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    address         VARCHAR(200) NOT NULL,
    entry_date      DATE         NOT NULL,
    status          VARCHAR(10)  NOT NULL,
    password        VARCHAR(255) NOT NULL,
    created_at      DATETIME     DEFAULT GETDATE(),
    updated_at      DATETIME     DEFAULT GETDATE(),
    deleted_at      DATETIME     NULL,
    restored_at     DATETIME     NULL,
    CONSTRAINT FK_EMPLOYEE_UBIGEO FOREIGN KEY(ubigeo_code) REFERENCES UBIGEO(ubigeo_code),
    CONSTRAINT FK_EMPLOYEE_ROLE   FOREIGN KEY(role_id)     REFERENCES ROLES(role_id)
);

CREATE TABLE PRODUCTS_SALE(
    products_sale_id INT IDENTITY(1,1) PRIMARY KEY,
    product_name     VARCHAR(100)  NOT NULL,
    price            DECIMAL(10,2) NOT NULL,
    available_stock  INT           NOT NULL,
    unit_measurement VARCHAR(30)   NOT NULL,
    description      CHAR(255)     NOT NULL,
    created_at       DATETIME      DEFAULT GETDATE(),
    updated_at       DATETIME      DEFAULT GETDATE(),
    deleted_at       DATETIME      NULL,
    restored_at      DATETIME      NULL,
    category_id      INT           NOT NULL,
    CONSTRAINT CHK_PRODUCTS_SALE_PRICE        CHECK (price > 0),
    CONSTRAINT CHK_PRODUCTS_SALE_STOCK        CHECK (available_stock >= 0),
    CONSTRAINT CHK_PRODUCTS_SALE_UNIT         CHECK (unit_measurement IN ('UNIDAD', 'KG', 'LITRO', 'SACO', 'SOBRE', 'ROLLO')),

    CONSTRAINT FK_PRODUCTS_SALE_CATEGORY FOREIGN KEY(category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE PRODUCTS_SUPPLY(
    product_id       INT IDENTITY(1,1) PRIMARY KEY,
    product_name     VARCHAR(100)  NOT NULL,
    description      VARCHAR(MAX)  NOT NULL,
    price            DECIMAL(10,2) NOT NULL,
    available_stock  DECIMAL(10,2) NOT NULL,
    expiry_date      DATETIME      NOT NULL,
    unit_measurement VARCHAR(30)   NOT NULL,
    product_image    VARBINARY(MAX) NOT NULL,
    created_at       DATETIME      DEFAULT GETDATE(),
    updated_at       DATETIME      DEFAULT GETDATE(),
    deleted_at       DATETIME      NULL,
    restored_at      DATETIME      NULL,
    category_id      INT           NOT NULL,
    CONSTRAINT FK_PRODUCTS_SUPPLY_CATEGORY FOREIGN KEY(category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE SUPPLIER(
    supplier_id  INT IDENTITY(1,1) PRIMARY KEY,
    company_name VARCHAR(150)  NOT NULL,
    ruc          CHAR(11)      UNIQUE NOT NULL,
    phone        BIGINT        NOT NULL,
    email        VARCHAR(100)  UNIQUE NOT NULL,
    address      VARCHAR(200)  NOT NULL,
    status       BIT           NOT NULL DEFAULT 1,
    ubigeo_code  INT           NOT NULL,
    category_id  INT           NOT NULL,
    created_at   DATETIME      DEFAULT GETDATE(),
    updated_at   DATETIME      NULL,
    deleted_at   DATETIME      NULL,
    restored_at  DATETIME      NULL,
    CONSTRAINT CHK_SUPPLIER_RUC       CHECK (LEN(ruc) = 11),
    CONSTRAINT CHK_SUPPLIER_PHONE     CHECK (phone > 0),
    CONSTRAINT CHK_SUPPLIER_EMAIL     CHECK (email LIKE '%@%.%'),
    CONSTRAINT CHK_SUPPLIER_STATUS    CHECK (status IN (0, 1)),

    CONSTRAINT FK_SUPPLIER_UBIGEO   FOREIGN KEY(ubigeo_code) REFERENCES UBIGEO(ubigeo_code),
    CONSTRAINT FK_SUPPLIER_CATEGORY FOREIGN KEY(category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE PURCHASES(
    id_purchase    INT IDENTITY(1,1) PRIMARY KEY,
    supplier_id    INT           NOT NULL,
    employee_id    INT           NOT NULL,
    date_purchases DATETIME      NOT NULL,
    total_amount   DECIMAL(10,2) NOT NULL,
    status         VARCHAR(20)   NOT NULL,
    CONSTRAINT FK_PURCHASES_SUPPLIER FOREIGN KEY(supplier_id) REFERENCES SUPPLIER(supplier_id),
    CONSTRAINT FK_PURCHASES_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES EMPLOYEE(employee_id)
);

CREATE TABLE PURCHASES_DETAILS(
    id_purchases_detail INT IDENTITY(1,1) PRIMARY KEY,
    unit_price          DECIMAL(10,2) NOT NULL,
    amount_product      INT           NOT NULL,
    total_cost          DECIMAL(10,2) NOT NULL,
    product_id          INT           NOT NULL,
    id_purchase         INT           NOT NULL,
    CONSTRAINT FK_PURCHASES_DETAILS_PRODUCT  FOREIGN KEY(product_id)  REFERENCES PRODUCTS_SUPPLY(product_id),
    CONSTRAINT FK_PURCHASES_DETAILS_PURCHASE FOREIGN KEY(id_purchase) REFERENCES PURCHASES(id_purchase)
);

CREATE TABLE SALE(
    sale_id        INT IDENTITY(1,1) PRIMARY KEY,
    sale_date      DATETIME      NOT NULL,
    receipt_type   VARCHAR(20)   NOT NULL,
    payment_method VARCHAR(20)   NOT NULL,
    status         VARCHAR(20)   NOT NULL,
    total_cost     DECIMAL(10,2) NOT NULL,
    employee_id    INT           NOT NULL,
    id_customer    INT           NOT NULL,
    CONSTRAINT FK_SALE_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES EMPLOYEE(employee_id),
    CONSTRAINT FK_SALE_CUSTOMER FOREIGN KEY(id_customer) REFERENCES CUSTOMER(id_customer)
);

CREATE TABLE SALE_DETAILS(
    id_sale_detail   INT IDENTITY(1,1) PRIMARY KEY,
    unit_price       DECIMAL(10,2) NOT NULL,
    product_amount   INT           NOT NULL,
    subtotal_cost    DECIMAL(10,2) NOT NULL,
    products_sale_id INT           NOT NULL,
    sale_id          INT           NOT NULL,
    CONSTRAINT FK_SALE_DETAILS_PRODUCT FOREIGN KEY(products_sale_id) REFERENCES PRODUCTS_SALE(products_sale_id),
    CONSTRAINT FK_SALE_DETAILS_SALE    FOREIGN KEY(sale_id)          REFERENCES SALE(sale_id)
);

CREATE TABLE ORDERS(
    order_id           INT IDENTITY(1,1) PRIMARY KEY,
    order_date         DATETIME      NOT NULL,
    estimated_delivery DATE          NOT NULL,
    status             VARCHAR(20)   NOT NULL,
    notes              VARCHAR(MAX)  NOT NULL,
    total_estimated    DECIMAL(10,2) NOT NULL,
    created_at         DATETIME      DEFAULT GETDATE(),
    updated_at         DATETIME      DEFAULT GETDATE(),
    deleted_at         DATETIME      NULL,
    restored_at        DATETIME      NULL,
    employee_id        INT           NOT NULL,
    id_customer        INT           NOT NULL,
    CONSTRAINT FK_ORDERS_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES EMPLOYEE(employee_id),
    CONSTRAINT FK_ORDERS_CUSTOMER FOREIGN KEY(id_customer) REFERENCES CUSTOMER(id_customer)
);

CREATE TABLE ORDER_DETAILS(
    id_order_detail  INT IDENTITY(1,1) PRIMARY KEY,
    quantity         INT           NOT NULL,
    unit_price       DECIMAL(10,2) NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL,
    order_id         INT           NOT NULL,
    products_sale_id INT           NOT NULL,
    CONSTRAINT FK_ORDER_DETAILS_ORDER   FOREIGN KEY(order_id)         REFERENCES ORDERS(order_id),
    CONSTRAINT FK_ORDER_DETAILS_PRODUCT FOREIGN KEY(products_sale_id) REFERENCES PRODUCTS_SALE(products_sale_id)
);

CREATE TABLE PRODUCTION_BATCH(
    batch_id             INT IDENTITY(1,1) PRIMARY KEY,
    id_order_detail      INT          NOT NULL,
    products_sale_id     INT          NOT NULL,
    employee_id          INT          NOT NULL,
    quantity_initial     INT          NOT NULL,
    start_date           DATE         NOT NULL,
    estimated_ready_date DATE         NOT NULL,
    status               VARCHAR(20)  NOT NULL,
    observations         VARCHAR(500) NOT NULL,
    created_at           DATETIME     DEFAULT GETDATE(),
    updated_at           DATETIME     DEFAULT GETDATE(),
    CONSTRAINT FK_BATCH_ORDER_DETAIL FOREIGN KEY(id_order_detail)  REFERENCES ORDER_DETAILS(id_order_detail),
    CONSTRAINT FK_BATCH_PRODUCT      FOREIGN KEY(products_sale_id) REFERENCES PRODUCTS_SALE(products_sale_id),
    CONSTRAINT FK_BATCH_EMPLOYEE     FOREIGN KEY(employee_id)      REFERENCES EMPLOYEE(employee_id)
);

CREATE TABLE PRODUCTION_STAGE(
    stage_id     INT IDENTITY(1,1) PRIMARY KEY,
    stage_name   VARCHAR(30)  NOT NULL,
    quantity_in  INT          NOT NULL,
    quantity_lost INT         NOT NULL,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    observations VARCHAR(500) NOT NULL,
    employee_id  INT          NOT NULL,
    batch_id     INT          NOT NULL,
    CONSTRAINT FK_STAGE_EMPLOYEE FOREIGN KEY(employee_id) REFERENCES EMPLOYEE(employee_id),
    CONSTRAINT FK_STAGE_BATCH    FOREIGN KEY(batch_id)    REFERENCES PRODUCTION_BATCH(batch_id)
);

CREATE TABLE STOCK_MOVEMENT(
    movement        INT IDENTITY(1,1) PRIMARY KEY,
    movement_type   VARCHAR(20)   NOT NULL,
    movement_reason VARCHAR(100)  NOT NULL,
    quantity        DECIMAL(10,2) NOT NULL,
    stock_before    DECIMAL(10,2) NOT NULL,
    stock_after     DECIMAL(10,2) NOT NULL,
    comments        VARCHAR(500)  NOT NULL,
    movement_date   DATETIME      NOT NULL,
    created_at      DATETIME      DEFAULT GETDATE(),
    status          VARCHAR(20)   DEFAULT 'ACTIVO' NOT NULL, -- Agregado
    deleted_at      DATETIME      NULL,                      -- Agregado
    restored_at     DATETIME      NULL,                      -- Agregado
    employee_id      INT          NOT NULL,
    sale_id          INT          NULL, -- Sugerido NULL si no siempre hay venta
    batch_id         INT          NULL, -- Sugerido NULL si no siempre hay lote
    products_sale_id INT          NULL, -- Sugerido NULL si afecta suministro en vez de venta
    product_id       INT          NULL, -- Sugerido NULL si afecta venta en vez de suministro
    id_purchase      INT          NULL, -- Sugerido NULL si no siempre hay compra
    CONSTRAINT FK_STOCK_EMPLOYEE     FOREIGN KEY(employee_id)      REFERENCES EMPLOYEE(employee_id),
    CONSTRAINT FK_STOCK_SALE         FOREIGN KEY(sale_id)          REFERENCES SALE(sale_id),
    CONSTRAINT FK_STOCK_BATCH        FOREIGN KEY(batch_id)         REFERENCES PRODUCTION_BATCH(batch_id),
    CONSTRAINT FK_STOCK_PRODUCT_SALE FOREIGN KEY(products_sale_id) REFERENCES PRODUCTS_SALE(products_sale_id),
    CONSTRAINT FK_STOCK_PRODUCT_SUPPLY FOREIGN KEY(product_id)     REFERENCES PRODUCTS_SUPPLY(product_id),
    CONSTRAINT FK_STOCK_PURCHASE     FOREIGN KEY(id_purchase)      REFERENCES PURCHASES(id_purchase)
);
GO


-- =====================================================
-- =====================================================
-- 4. INSERT: CATEGORY
-- =====================================================
INSERT INTO CATEGORY (category_name, category_type, status) VALUES
('Semillas',      'INSUMO', 'ACTIVO'), 
('Fertilizantes', 'INSUMO', 'ACTIVO'), 
('Herramientas',  'INSUMO', 'ACTIVO'), 
('Insecticidas',  'INSUMO', 'ACTIVO'),
('Sustratos',     'INSUMO', 'ACTIVO'),
('Envases',       'INSUMO', 'ACTIVO'),
('Frutales',      'VENTA',  'ACTIVO'),
('Cítricos',      'VENTA',  'ACTIVO'),
('Más Plantas',   'VENTA',  'ACTIVO'); 

-- =====================================================
-- 5. INSERT: UBIGEO (datos iniciales de prueba)
-- =====================================================
INSERT INTO UBIGEO (ubigeo_code, department, province, district) VALUES
(150101, 'Lima',        'Lima',     'Lima Cercado'),
(150102, 'Lima',        'Lima',     'Breña'),
(150103, 'Lima',        'Lima',     'La Victoria'),
(150104, 'Lima',        'Lima',     'San Isidro'),
(150105, 'Lima',        'Lima',     'Surco'),
(150106, 'Lima',        'Lima',     'Barranco'),
(150107, 'Lima',        'Lima',     'Chorrillos'),
(150108, 'Lima',        'Lima',     'San Borja'),
(150109, 'Lima',        'Lima',     'Surquillo'),
(150110, 'Lima',        'Lima',     'Magdalena'),
(150111, 'Lima',        'Lima',     'Pueblo Libre'),
(150112, 'Lima',        'Lima',     'Jesús María'),
(150113, 'Lima',        'Lima',     'Lince'),
(150114, 'Lima',        'Lima',     'San Miguel'),
(150115, 'Lima',        'Lima',     'Ate'),
(150116, 'Lima',        'Lima',     'San Juan de Lurigancho'),
(150117, 'Lima',        'Lima',     'Comas'),
(150118, 'Lima',        'Lima',     'Los Olivos'),
(150119, 'Lima',        'Lima',     'Independencia'),
(150120, 'Lima',        'Lima',     'Rímac'),
(150122, 'Lima',        'Lima',     'Miraflores'),
(150301, 'Lima',        'Lima',     'Santa Anita'),
(150401, 'Lima',        'Lima',     'El Agustino'),
(070101, 'Callao',      'Callao',   'Bellavista'),
(070201, 'Callao',      'Callao',   'La Punta'),
(070301, 'Callao',      'Callao',   'La Perla'),
(070401, 'Callao',      'Callao',   'Carmen de la Legua'),
(080101, 'Cusco',       'Cusco',    'Wanchaq'),
(080201, 'Cusco',       'Cusco',    'San Sebastián'),
(080301, 'Cusco',       'Cusco',    'San Jerónimo'),
(080401, 'Cusco',       'Cusco',    'Saylla'),
(040101, 'Arequipa',    'Arequipa', 'Cayma'),
(040201, 'Arequipa',    'Arequipa', 'Cerro Colorado'),
(040301, 'Arequipa',    'Arequipa', 'Sachaca'),
(040401, 'Arequipa',    'Arequipa', 'Yanahuara'),
(130101, 'La Libertad', 'Trujillo', 'Víctor Larco'),
(130201, 'La Libertad', 'Trujillo', 'El Porvenir'),
(130301, 'La Libertad', 'Trujillo', 'Florencia de Mora'),
(130401, 'La Libertad', 'Trujillo', 'La Esperanza');

-- =====================================================
-- 6. INSERT: ROLES
-- =====================================================
INSERT INTO ROLES (role_name, status, description) VALUES
('Administrador',        'ACTIVO', 'Control total: configuración, usuarios, reportes globales'),
('Gerente Operaciones',  'ACTIVO', 'Ventas, clientes, proveedores, pedidos y operaciones'),
('Responsable Inventario', 'ACTIVO', 'Inventario, producción, insumos, movimientos y compras');

-- =====================================================
-- 7. INSERT: CUSTOMER
-- =====================================================
INSERT INTO CUSTOMER (customer_name, customer_lastname, customer_type, document_type, document_number, email, phone, address, status, ubigeo_code) VALUES
('Lucia',    'Sanchez',  'Natural', 'DNI', '78451236',    'lucia.sanchez@gmail.com',    '987654321', 'Av. Los Olivos 123',       1, 150101),
('Carlos',   'Ramirez',  'Natural', 'DNI', '74125896',    'carlos.ramirez@gmail.com',   '912345678', 'Jr. Lima 456',             1, 150102),
('Andrea',   'Torres',   'Natural', 'DNI', '75315984',    'andrea.torres@gmail.com',    '923456781', 'Av. Primavera 789',        1, 150103),
('Miguel',   'Castro',   'Empresa', 'RUC', '20547896321', 'miguel.castro@gmail.com',    '934567812', 'Calle Comercio 321',       1, 150104),
('Fernanda', 'Lopez',    'Natural', 'DNI', '79632514',    'fernanda.lopez@gmail.com',   '945678123', 'Av. Central 654',          1, 150105),
('Jorge',    'Perez',    'Natural', 'DNI', '74123698',    'jorge.perez@gmail.com',      '956781234', 'Jr. Las Flores 741',       0, 150106),
('Valeria',  'Mendoza',  'Natural', 'DNI', '78541236',    'valeria.mendoza@gmail.com',  '967812345', 'Av. Grau 852',             1, 150107),
('Kevin',    'Rojas',    'Empresa', 'RUC', '20698541237', 'kevin.rojas@gmail.com',      '978123456', 'Calle Norte 963',          1, 150108),
('Daniela',  'Gutierrez','Natural', 'DNI', '79874563',    'daniela.gutierrez@gmail.com','989234567', 'Av. Sur 159',              1, 150109),
('Luis',     'Vargas',   'Natural', 'DNI', '73698521',    'luis.vargas@gmail.com',      '991345678', 'Jr. Unión 753',            1, 150110),
('Camila',   'Navarro',  'Natural', 'DNI', '74589632',    'camila.navarro@gmail.com',   '902456789', 'Av. Libertad 951',         1, 150111),
('Sebastian','Flores',   'Empresa', 'RUC', '20478596325', 'sebastian.flores@gmail.com', '913567890', 'Calle Sol 357',            0, 150112),
('Mariana',  'Diaz',     'Natural', 'DNI', '78965412',    'mariana.diaz@gmail.com',     '924678901', 'Av. San Martín 258',       1, 150113),
('Ricardo',  'Herrera',  'Natural', 'DNI', '75412369',    'ricardo.herrera@gmail.com',  '935789012', 'Jr. Palmeras 456',         1, 150114),
('Paula',    'Silva',    'Natural', 'DNI', '76521498',    'paula.silva@gmail.com',      '946890123', 'Av. Arequipa 654',         1, 150115),
('Diego',    'Morales',  'Empresa', 'RUC', '20987456321', 'diego.morales@gmail.com',    '957901234', 'Calle Este 852',           1, 150116),
('Nicole',   'Reyes',    'Natural', 'DNI', '74123657',    'nicole.reyes@gmail.com',     '968012345', 'Av. Canadá 951',           1, 150117),
('Fabian',   'Cruz',     'Natural', 'DNI', '75236984',    'fabian.cruz@gmail.com',      '979123456', 'Jr. Los Pinos 753',        0, 150118),
('Tatiana',  'Ortega',   'Natural', 'DNI', '76325874',    'tatiana.ortega@gmail.com',   '980234567', 'Av. Javier Prado 357',     1, 150119),
('Alonso',   'Medina',   'Empresa', 'RUC', '20147896325', 'alonso.medina@gmail.com',    '991345679', 'Calle Industrial 159',     1, 150120);

-- =====================================================
-- 8. INSERT: EMPLOYEE
-- =====================================================
INSERT INTO EMPLOYEE (ubigeo_code, role_id, document_type, document_number, name, last_name, phone, email, address, entry_date, status, password) VALUES
(150122, 1, 'DNI', '78945612', 'Luis',     'Paredes',   '987111222', 'luis@empresa.com',     'Av Principal 111', '2025-01-10', 'ACTIVO', '123456'),
(070101, 2, 'DNI', '78945613', 'Ana',      'Rojas',     '987111223', 'ana@empresa.com',      'Av Principal 112', '2025-02-15', 'ACTIVO', '123456'),
(080101, 3, 'DNI', '78945614', 'Pedro',    'Castro',    '987111224', 'pedro@empresa.com',    'Av Principal 113', '2025-03-12', 'ACTIVO', '123456'),
(040101, 2, 'DNI', '78945615', 'Elena',    'Quispe',    '987111225', 'elena@empresa.com',    'Av Principal 114', '2025-04-18', 'ACTIVO', '123456'),
(130101, 3, 'DNI', '78945616', 'Mario',    'Vega',      '987111226', 'mario@empresa.com',    'Av Principal 115', '2025-05-05', 'ACTIVO', '123456'),
(150122, 3, 'DNI', '78945001', 'Julio',    'Fernandez', '911000001', 'julio@empresa.com',    'Av Empresa 101',   '2025-06-01', 'ACTIVO', '123456'),
(070101, 2, 'DNI', '78945002', 'Sandra',   'Martinez',  '911000002', 'sandra@empresa.com',   'Av Empresa 102',   '2025-06-02', 'ACTIVO', '123456'),
(080101, 3, 'DNI', '78945003', 'Raul',     'Pacheco',   '911000003', 'raul@empresa.com',     'Av Empresa 103',   '2025-06-03', 'ACTIVO', '123456'),
(040101, 2, 'DNI', '78945004', 'Carmen',   'Soto',      '911000004', 'carmen@empresa.com',   'Av Empresa 104',   '2025-06-04', 'ACTIVO', '123456'),
(130101, 2, 'DNI', '78945005', 'Bruno',    'Aguilar',   '911000005', 'bruno@empresa.com',    'Av Empresa 105',   '2025-06-05', 'ACTIVO', '123456'),
(150122, 3, 'DNI', '78945006', 'Noelia',   'Campos',    '911000006', 'noelia@empresa.com',   'Av Empresa 106',   '2025-06-06', 'ACTIVO', '123456'),
(070101, 2, 'DNI', '78945007', 'Victor',   'Luna',      '911000007', 'victor@empresa.com',   'Av Empresa 107',   '2025-06-07', 'ACTIVO', '123456'),
(080101, 3, 'DNI', '78945008', 'Melissa',  'Garcia',    '911000008', 'melissa@empresa.com',  'Av Empresa 108',   '2025-06-08', 'ACTIVO', '123456'),
(040101, 3, 'DNI', '78945009', 'Cristian', 'Perez',     '911000009', 'cristian@empresa.com', 'Av Empresa 109',   '2025-06-09', 'ACTIVO', '123456'),
(130101, 2, 'DNI', '78945010', 'Tatiana',  'Mendez',    '911000010', 'tatiana@empresa.com',  'Av Empresa 110',   '2025-06-10', 'ACTIVO', '123456'),
(150122, 1, 'DNI', '78945011', 'Oscar',    'Rivera',    '911000011', 'oscar@empresa.com',    'Av Empresa 111',   '2025-06-11', 'ACTIVO', '123456'),
(070101, 2, 'DNI', '78945012', 'Fiorella', 'Alva',      '911000012', 'fiorella@empresa.com', 'Av Empresa 112',   '2025-06-12', 'ACTIVO', '123456'),
(080101, 3, 'DNI', '78945013', 'Martin',   'Cordero',   '911000013', 'martin@empresa.com',   'Av Empresa 113',   '2025-06-13', 'ACTIVO', '123456'),
(040101, 1, 'DNI', '78945014', 'Karen',    'Rios',      '911000014', 'karen@empresa.com',    'Av Empresa 114',   '2025-06-14', 'ACTIVO', '123456'),
(130101, 2, 'DNI', '78945015', 'Edgar',    'Velasquez', '911000015', 'edgar@empresa.com',    'Av Empresa 115',   '2025-06-15', 'ACTIVO', '123456');

-- =====================================================
-- 9. INSERT: PRODUCTS_SALE (plantas del vivero)
-- =====================================================
INSERT INTO PRODUCTS_SALE (product_name, price, available_stock, unit_measurement, description, category_id) VALUES
-- Frutales (category_id = 7)
('Planta de Arándano',   35.00, 200, 'UNIDAD', 'Planta frutal de arándano certificada, alta producción        ', 7),
('Planta de Palto',      40.00, 150, 'UNIDAD', 'Planta de palto injertada variedad Hass, alta productividad   ', 7),
('Planta de Cerezo',     45.00,  80, 'UNIDAD', 'Planta de cerezo ideal para sierra, fruto dulce y jugoso      ', 7),
('Planta de Vid',        30.00, 120, 'UNIDAD', 'Planta de vid uva de mesa, variedad sin semilla exportación   ', 7),
('Planta de Frambuesa',  28.00, 100, 'UNIDAD', 'Planta de frambuesa remontante, doble campaña de producción   ', 7),
-- Cítricos (category_id = 8)
('Planta de Naranja',    25.00, 130, 'UNIDAD', 'Planta de naranja Valencia, jugosa y de alto rendimiento      ', 8),
('Planta de Mandarina',  28.00, 110, 'UNIDAD', 'Planta de mandarina Clementina, sin semilla y fácil pelado    ', 8),
('Planta de Limón',      20.00, 200, 'UNIDAD', 'Planta de limón sutil peruano, muy productivo y resistente    ', 8),
-- Más Plantas (category_id = 9)
('Planta de Chirimoya',  30.00,  60, 'UNIDAD', 'Planta de chirimoya variedad Lisa, fruto cremoso sin semilla  ', 9),
('Planta de Caqui',      30.00,  55, 'UNIDAD', 'Planta de caqui Rojo Brillante, dulce y de mercado premium    ', 9),
('Planta de Ciruelo',    30.00,  45, 'UNIDAD', 'Planta de ciruelo Santa Rosa, fruto rojo de alta producción   ', 9),
('Planta de Durazno',    32.00,  75, 'UNIDAD', 'Planta de durazno conservero, consumo fresco y agroindustria  ', 9),
('Planta de Granadilla', 22.00,  80, 'UNIDAD', 'Planta de granadilla dulce, variedad peruana seleccionada     ', 9),
('Planta de Lúcuma',     35.00,  70, 'UNIDAD', 'Planta de lúcuma Seda, fruto grande y cremoso alta demanda    ', 9),
('Planta de Mango',      38.00,  90, 'UNIDAD', 'Planta de mango Kent, variedad exportación fruto grande dulce ', 9),
('Planta de Níspero',    25.00,  65, 'UNIDAD', 'Planta de níspero japonés Mogi, fruto grande y dulce          ', 9),
('Planta de Pecana',     60.00,  30, 'UNIDAD', 'Planta de pecana Western injertada, alta productividad nuez   ', 9),
('Planta de Pera',       35.00,  50, 'UNIDAD', 'Planta de pera Beurre Bosc, pulpa fina ideal para sierra      ', 9),
('Planta de Pitahaya',   50.00,  40, 'UNIDAD', 'Planta de pitahaya amarilla, alta rentabilidad exportación    ', 9),
('Planta de Manzana',    33.00,  55, 'UNIDAD', 'Planta de manzana injertada, adaptada a climas de sierra      ', 9);

-- =====================================================
-- 10. INSERT: PRODUCTS_SUPPLY (insumos del vivero)
-- =====================================================
INSERT INTO PRODUCTS_SUPPLY (product_name, description, price, available_stock, expiry_date, unit_measurement, product_image, category_id) VALUES
('Semilla Arándano Biloxi',    'Semilla certificada para propagación de arándano',       80.00, 20, '2026-12-31', 'SOBRE',  0x1234, 1),
('Semilla de Frambuesa',       'Semilla seleccionada de alta tasa de germinación',       60.00, 15, '2026-10-31', 'SOBRE',  0x1234, 1),
('Fertilizante NPK 20-20-20',  'Fertilizante balanceado para etapa de crecimiento',      45.00, 50, '2027-06-30', 'KG',     0x1234, 2),
('Nitrato de Calcio',          'Nutrición foliar y radicular de alta calidad',           38.00, 40, '2027-03-15', 'KG',     0x1234, 2),
('Sulfato de Potasio',         'Mejora calidad del fruto y resistencia de la planta',    42.00, 35, '2027-05-01', 'KG',     0x1234, 2),
('Tijeras de Poda',            'Acero inoxidable, mango ergonómico antideslizante',      55.00, 30, '2030-01-01', 'UNIDAD', 0x1234, 3),
('Mochila Fumigadora 20L',     'Fumigadora manual de presión constante 20 litros',      120.00, 10, '2030-01-01', 'UNIDAD', 0x1234, 3),
('Pala de Trasplante',         'Pala metálica con mango de madera resistente',           35.00, 25, '2030-01-01', 'UNIDAD', 0x1234, 3),
('Insecticida Cipermetrina',   'Control de plagas masticadoras y picadoras',             30.00, 40, '2026-09-30', 'LITRO',  0x1234, 4),
('Fungicida Mancozeb',         'Control preventivo de hongos foliares',                  25.00, 45, '2026-08-15', 'KG',     0x1234, 4),
('Insecticida Orgánico Neem',  'Bioinsecticida natural sin residuos tóxicos',            28.00, 35, '2026-11-30', 'LITRO',  0x1234, 4),
('Sustrato Turba Rubia',       'Sustrato base para propagación de esquejes',             18.00, 60, '2027-01-31', 'SACO',   0x1234, 5),
('Perlita Agrícola',           'Mejora drenaje y aireación del sustrato',                15.00, 55, '2028-01-01', 'SACO',   0x1234, 5),
('Fibra de Coco',              'Sustrato orgánico con alta retención de humedad',        12.00, 70, '2027-06-01', 'SACO',   0x1234, 5),
('Humus de Lombriz',           'Abono orgánico enriquecido con microorganismos',         10.00, 80, '2027-03-01', 'SACO',   0x1234, 5),
('Maceta Negra 1L',            'Maceta plástica negra para propagación de esquejes',      1.50,500, '2030-01-01', 'UNIDAD', 0x1234, 6),
('Maceta Negra 3L',            'Maceta plástica negra para plantas medianas',             2.50,300, '2030-01-01', 'UNIDAD', 0x1234, 6),
('Bolsa de Vivero 5L',         'Bolsa de polietileno negro resistente a rayos UV',        0.80,600, '2030-01-01', 'UNIDAD', 0x1234, 6),
('Bandeja Almácigo 72 celdas', 'Bandeja para propagación de semillas y esquejes',         8.00, 80, '2030-01-01', 'UNIDAD', 0x1234, 6),
('Cinta de Injerto',           'Cinta elástica para injertos de precisión en vivero',     5.00,120, '2027-01-01', 'ROLLO',  0x1234, 6);

-- =====================================================
-- 11. INSERT: SUPPLIER
-- =====================================================
INSERT INTO SUPPLIER (company_name, ruc, phone, email, address, status, ubigeo_code, category_id) VALUES
('Semillas Andinas SAC',      '20111111111', 987100001, 'ventas@semillasandinas.com',   'Av Cañete 201',      1, 150122, 1),
('AgroSemillas Perú',         '20111111112', 987100002, 'ventas@agrosemillas.com',      'Av Lima 202',        1, 070101, 1),
('Fertilizantes del Sur SAC', '20111111113', 987100003, 'ventas@fertisur.com',          'Av Cusco 203',       1, 080101, 2),
('AgroFert Lima',             '20111111114', 987100004, 'ventas@agrofert.com',          'Av Lima 204',        1, 040101, 2),
('Nutrientes del Campo',      '20111111115', 987100005, 'ventas@nutrientes.com',        'Av Trujillo 205',    1, 130101, 2),
('Herramientas Agro SAC',     '20111111116', 987100006, 'ventas@herragro.com',          'Av Lima 206',        1, 150101, 3),
('ToolAgro Perú',             '20111111117', 987100007, 'ventas@toolagro.com',          'Av Lima 207',        1, 070201, 3),
('Equipos de Campo SAC',      '20111111118', 987100008, 'ventas@equiposcampo.com',      'Av Lima 208',        1, 080201, 3),
('BioControl Sur',            '20111111119', 987100009, 'ventas@biocontrol.com',        'Av Lima 209',        1, 040201, 4),
('Insecticidas Naturales SAC','20111111120', 987100010, 'ventas@insenat.com',           'Av Lima 210',        1, 130201, 4),
('AgroProtect Lima',          '20111111121', 987100011, 'ventas@agroprotect.com',       'Av Lima 211',        1, 150301, 4),
('Sustratos del Sur SAC',     '20111111122', 987100012, 'ventas@sustratosur.com',       'Av Lima 212',        1, 070301, 5),
('Turba y Coco Perú',         '20111111123', 987100013, 'ventas@turbacoco.com',         'Av Lima 213',        1, 080301, 5),
('AgroSustratos Lima',        '20111111124', 987100014, 'ventas@agrosustratos.com',     'Av Lima 214',        1, 040301, 5),
('Humus Natural SAC',         '20111111125', 987100015, 'ventas@humusnat.com',          'Av Lima 215',        1, 130301, 5),
('Envases Agrícolas SAC',     '20111111126', 987100016, 'ventas@envasesagro.com',       'Av Lima 216',        1, 150401, 6),
('Macetas y Bolsas Perú',     '20111111127', 987100017, 'ventas@macetasbolsas.com',     'Av Lima 217',        1, 070401, 6),
('PlastAgro SAC',             '20111111128', 987100018, 'ventas@plastagro.com',         'Av Lima 218',        0, 080401, 6),
('Contenedores del Sur',      '20111111129', 987100019, 'ventas@contenedores.com',      'Av Lima 219',        0, 040401, 6),
('AgroEnvases Lima',          '20111111130', 987100020, 'ventas@agroenvaseslima.com',   'Av Lima 220',        0, 130401, 6);

-- =====================================================
-- 12. INSERT: PURCHASES
-- =====================================================
INSERT INTO PURCHASES (supplier_id, employee_id, date_purchases, total_amount, status) VALUES
( 1,  1, '2026-01-10', 500.00, 'COMPLETADO'),
( 2,  2, '2026-01-12', 650.00, 'COMPLETADO'),
( 3,  3, '2026-01-14', 400.00, 'PENDIENTE'),
( 4,  4, '2026-01-16', 750.00, 'COMPLETADO'),
( 5,  5, '2026-01-18', 900.00, 'COMPLETADO'),
( 6,  6, '2026-01-20', 350.00, 'COMPLETADO'),
( 7,  7, '2026-01-22', 470.00, 'PENDIENTE'),
( 8,  8, '2026-01-24', 800.00, 'COMPLETADO'),
( 9,  9, '2026-01-26', 920.00, 'COMPLETADO'),
(10, 10, '2026-01-28', 610.00, 'COMPLETADO'),
(11, 11, '2026-02-01', 300.00, 'PENDIENTE'),
(12, 12, '2026-02-03', 550.00, 'COMPLETADO'),
(13, 13, '2026-02-05', 720.00, 'COMPLETADO'),
(14, 14, '2026-02-07', 410.00, 'COMPLETADO'),
(15, 15, '2026-02-09', 880.00, 'COMPLETADO'),
(16, 16, '2026-02-11', 990.00, 'PENDIENTE'),
(17, 17, '2026-02-13', 640.00, 'COMPLETADO'),
(18, 18, '2026-02-15', 530.00, 'COMPLETADO'),
(19, 19, '2026-02-17', 770.00, 'COMPLETADO'),
(20, 20, '2026-02-19', 860.00, 'COMPLETADO');

-- =====================================================
-- 13. INSERT: PURCHASES_DETAILS
-- =====================================================
INSERT INTO PURCHASES_DETAILS (unit_price, amount_product, total_cost, product_id, id_purchase) VALUES
(80.00,  5,  400.00,  1,  1),
(60.00,  8,  480.00,  2,  2),
(45.00, 10,  450.00,  3,  3),
(38.00,  8,  304.00,  4,  4),
(42.00, 12,  504.00,  5,  5),
(55.00,  5,  275.00,  6,  6),
(120.00, 3,  360.00,  7,  7),
(35.00, 10,  350.00,  8,  8),
(30.00, 15,  450.00,  9,  9),
(25.00, 20,  500.00, 10, 10),
(28.00, 10,  280.00, 11, 11),
(18.00, 20,  360.00, 12, 12),
(15.00, 25,  375.00, 13, 13),
(12.00, 30,  360.00, 14, 14),
(10.00, 40,  400.00, 15, 15),
(1.50, 200,  300.00, 16, 16),
(2.50, 100,  250.00, 17, 17),
(0.80, 500,  400.00, 18, 18),
(8.00,  40,  320.00, 19, 19),
(5.00, 100,  500.00, 20, 20);

-- =====================================================
-- 14. INSERT: SALE
-- =====================================================
INSERT INTO SALE (sale_date, receipt_type, payment_method, status, total_cost, employee_id, id_customer) VALUES
('2026-02-01', 'BOLETA',  'YAPE',     'COMPLETADO', 150.00,  1,  1),
('2026-02-02', 'FACTURA', 'EFECTIVO', 'COMPLETADO', 200.00,  2,  2),
('2026-02-03', 'BOLETA',  'TARJETA',  'COMPLETADO', 180.00,  3,  3),
('2026-02-04', 'FACTURA', 'PLIN',     'COMPLETADO', 250.00,  4,  4),
('2026-02-05', 'BOLETA',  'YAPE',     'COMPLETADO', 300.00,  5,  5),
('2026-02-06', 'FACTURA', 'EFECTIVO', 'COMPLETADO', 120.00,  6,  6),
('2026-02-07', 'BOLETA',  'PLIN',     'COMPLETADO', 220.00,  7,  7),
('2026-02-08', 'FACTURA', 'TARJETA',  'COMPLETADO', 280.00,  8,  8),
('2026-02-09', 'BOLETA',  'YAPE',     'COMPLETADO', 350.00,  9,  9),
('2026-02-10', 'FACTURA', 'EFECTIVO', 'COMPLETADO', 170.00, 10, 10),
('2026-02-11', 'BOLETA',  'PLIN',     'COMPLETADO', 160.00, 11, 11),
('2026-02-12', 'FACTURA', 'TARJETA',  'COMPLETADO', 260.00, 12, 12),
('2026-02-13', 'BOLETA',  'YAPE',     'COMPLETADO', 400.00, 13, 13),
('2026-02-14', 'FACTURA', 'EFECTIVO', 'COMPLETADO', 190.00, 14, 14),
('2026-02-15', 'BOLETA',  'PLIN',     'COMPLETADO', 310.00, 15, 15),
('2026-02-16', 'FACTURA', 'TARJETA',  'COMPLETADO', 210.00, 16, 16),
('2026-02-17', 'BOLETA',  'YAPE',     'COMPLETADO', 500.00, 17, 17),
('2026-02-18', 'FACTURA', 'EFECTIVO', 'COMPLETADO', 230.00, 18, 18),
('2026-02-19', 'BOLETA',  'PLIN',     'COMPLETADO', 240.00, 19, 19),
('2026-02-20', 'FACTURA', 'TARJETA',  'COMPLETADO', 450.00, 20, 20);

-- =====================================================
-- 15. INSERT: SALE_DETAILS
-- =====================================================
INSERT INTO SALE_DETAILS (unit_price, product_amount, subtotal_cost, products_sale_id, sale_id) VALUES
( 35.00, 4,  140.00,  1,  1),
( 40.00, 5,  200.00,  2,  2),
( 45.00, 4,  180.00,  3,  3),
( 30.00, 8,  240.00,  4,  4),
( 28.00, 10, 280.00,  5,  5),
( 25.00, 4,  100.00,  6,  6),
( 28.00, 7,  196.00,  7,  7),
( 20.00, 14, 280.00,  8,  8),
( 30.00, 11, 330.00,  9,  9),
( 30.00, 5,  150.00, 10, 10),
( 30.00, 5,  150.00, 11, 11),
( 32.00, 8,  256.00, 12, 12),
( 22.00, 18, 396.00, 13, 13),
( 35.00, 5,  175.00, 14, 14),
( 38.00, 8,  304.00, 15, 15),
( 25.00, 8,  200.00, 16, 16),
( 60.00, 8,  480.00, 17, 17),
( 35.00, 6,  210.00, 18, 18),
( 50.00, 4,  200.00, 19, 19),
( 33.00, 13, 429.00, 20, 20);

-- =====================================================
-- 16. INSERT: ORDERS
-- =====================================================
INSERT INTO ORDERS (order_date, estimated_delivery, status, notes, total_estimated, employee_id, id_customer) VALUES
('2026-03-01', '2026-03-03', 'PENDIENTE',   'Pedido urgente de arándanos',        150.00,  1,  1),
('2026-03-02', '2026-03-04', 'EN PROCESO',  'Paltos para proyecto agrícola',      200.00,  2,  2),
('2026-03-03', '2026-03-05', 'PENDIENTE',   'Pedido empresarial cerezos',         180.00,  3,  3),
('2026-03-04', '2026-03-06', 'COMPLETADO',  'Vides para viñedo familiar',         250.00,  4,  4),
('2026-03-05', '2026-03-07', 'EN PROCESO',  'Frambuesas campaña temporada',       300.00,  5,  5),
('2026-03-06', '2026-03-08', 'PENDIENTE',   'Naranjas para huerto casero',        120.00,  6,  6),
('2026-03-07', '2026-03-09', 'COMPLETADO',  'Mandarinas proyecto escolar',        220.00,  7,  7),
('2026-03-08', '2026-03-10', 'EN PROCESO',  'Limones para finca corporativa',     280.00,  8,  8),
('2026-03-09', '2026-03-11', 'PENDIENTE',   'Chirimoyas pedido especial',         350.00,  9,  9),
('2026-03-10', '2026-03-12', 'COMPLETADO',  'Caquis decoración jardín',           170.00, 10, 10),
('2026-03-11', '2026-03-13', 'EN PROCESO',  'Ciruelos pedido aniversario',        160.00, 11, 11),
('2026-03-12', '2026-03-14', 'PENDIENTE',   'Duraznos para conserva',             260.00, 12, 12),
('2026-03-13', '2026-03-15', 'COMPLETADO',  'Granadillas proyecto familiar',      400.00, 13, 13),
('2026-03-14', '2026-03-16', 'EN PROCESO',  'Lúcumas pedido premium',             190.00, 14, 14),
('2026-03-15', '2026-03-17', 'PENDIENTE',   'Mangos finca exportación',           310.00, 15, 15),
('2026-03-16', '2026-03-18', 'COMPLETADO',  'Nísperos jardín residencial',        210.00, 16, 16),
('2026-03-17', '2026-03-19', 'EN PROCESO',  'Pecanas proyecto agroindustrial',    500.00, 17, 17),
('2026-03-18', '2026-03-20', 'PENDIENTE',   'Peras huerto de sierra',             230.00, 18, 18),
('2026-03-19', '2026-03-21', 'COMPLETADO',  'Pitahayas cultivo exportación',      240.00, 19, 19),
('2026-03-20', '2026-03-22', 'EN PROCESO',  'Manzanas proyecto sierra norte',     450.00, 20, 20);

-- =====================================================
-- 17. INSERT: ORDER_DETAILS
-- =====================================================
INSERT INTO ORDER_DETAILS (quantity, unit_price, subtotal, order_id, products_sale_id) VALUES
( 4, 35.00,  140.00,  1,  1),
( 5, 40.00,  200.00,  2,  2),
( 4, 45.00,  180.00,  3,  3),
( 8, 30.00,  240.00,  4,  4),
(10, 28.00,  280.00,  5,  5),
( 4, 25.00,  100.00,  6,  6),
( 7, 28.00,  196.00,  7,  7),
(14, 20.00,  280.00,  8,  8),
(11, 30.00,  330.00,  9,  9),
( 5, 30.00,  150.00, 10, 10),
( 5, 30.00,  150.00, 11, 11),
( 8, 32.00,  256.00, 12, 12),
(18, 22.00,  396.00, 13, 13),
( 5, 35.00,  175.00, 14, 14),
( 8, 38.00,  304.00, 15, 15),
( 8, 25.00,  200.00, 16, 16),
( 8, 60.00,  480.00, 17, 17),
( 6, 35.00,  210.00, 18, 18),
( 4, 50.00,  200.00, 19, 19),
(13, 33.00,  429.00, 20, 20);

-- =====================================================
-- 18. INSERT: PRODUCTION_BATCH
-- =====================================================
INSERT INTO PRODUCTION_BATCH (id_order_detail, products_sale_id, employee_id, quantity_initial, start_date, estimated_ready_date, status, observations) VALUES
( 1,  1,  1,  4, '2026-03-01', '2026-03-15', 'EN PROCESO', 'Arándanos en etapa de enraizamiento'),
( 2,  2,  2,  5, '2026-03-02', '2026-03-20', 'EN PROCESO', 'Paltos en proceso de injerto'),
( 3,  3,  3,  4, '2026-03-03', '2026-03-18', 'PENDIENTE',  'Cerezos pendiente de materiales'),
( 4,  4,  4,  8, '2026-03-04', '2026-03-16', 'COMPLETADO', 'Vides injertadas y listas'),
( 5,  5,  5, 10, '2026-03-05', '2026-03-17', 'EN PROCESO', 'Frambuesas en fase de crecimiento'),
( 6,  6,  6,  4, '2026-03-06', '2026-03-19', 'PENDIENTE',  'Naranjas falta sustrato'),
( 7,  7,  7,  7, '2026-03-07', '2026-03-18', 'COMPLETADO', 'Mandarinas entregadas correctamente'),
( 8,  8,  8, 14, '2026-03-08', '2026-03-20', 'EN PROCESO', 'Limones en vivero fase 2'),
( 9,  9,  9, 11, '2026-03-09', '2026-03-22', 'PENDIENTE',  'Chirimoyas en espera de aprobación'),
(10, 10, 10,  5, '2026-03-10', '2026-03-21', 'COMPLETADO', 'Caquis finalizados sin observaciones'),
(11, 11, 11,  5, '2026-03-11', '2026-03-22', 'EN PROCESO', 'Ciruelos proceso normal de vivero'),
(12, 12, 12,  8, '2026-03-12', '2026-03-23', 'PENDIENTE',  'Duraznos falta material de injerto'),
(13, 13, 13, 18, '2026-03-13', '2026-03-24', 'COMPLETADO', 'Granadillas listas para entrega'),
(14, 14, 14,  5, '2026-03-14', '2026-03-25', 'EN PROCESO', 'Lúcumas trabajo continuo'),
(15, 15, 15,  8, '2026-03-15', '2026-03-26', 'PENDIENTE',  'Mangos pendiente aprobación cliente'),
(16, 16, 16,  8, '2026-03-16', '2026-03-27', 'COMPLETADO', 'Nísperos pedido terminado'),
(17, 17, 17,  8, '2026-03-17', '2026-03-28', 'EN PROCESO', 'Pecanas producción especial injerto'),
(18, 18, 18,  6, '2026-03-18', '2026-03-29', 'PENDIENTE',  'Peras esperando materiales sierra'),
(19, 19, 19,  4, '2026-03-19', '2026-03-30', 'COMPLETADO', 'Pitahayas sin observaciones'),
(20, 20, 20, 13, '2026-03-20', '2026-03-31', 'EN PROCESO', 'Manzanas pedido premium sierra');

-- =====================================================
-- 19. INSERT: PRODUCTION_STAGE
-- =====================================================
INSERT INTO PRODUCTION_STAGE (stage_name, quantity_in, quantity_lost, start_date, end_date, observations, employee_id, batch_id) VALUES
('Germinación',  4,  0, '2026-03-01', '2026-03-03', 'Sin pérdidas en germinación',         1,  1),
('Injerto',      5,  1, '2026-03-02', '2026-03-05', 'Pérdida mínima en injerto',            2,  2),
('Enraizamiento',4,  0, '2026-03-03', '2026-03-06', 'Enraizamiento correcto',               3,  3),
('Trasplante',   8,  1, '2026-03-04', '2026-03-07', 'Detalle menor en trasplante',          4,  4),
('Crecimiento',  10, 0, '2026-03-05', '2026-03-08', 'Crecimiento finalizado',               5,  5),
('Germinación',  4,  0, '2026-03-06', '2026-03-09', 'Proceso normal sin pérdidas',          6,  6),
('Injerto',      7,  1, '2026-03-07', '2026-03-10', 'Pérdida leve en injerto',              7,  7),
('Enraizamiento',14, 0, '2026-03-08', '2026-03-11', 'Sin errores en enraizamiento',         8,  8),
('Trasplante',   11, 0, '2026-03-09', '2026-03-12', 'Trasplante limpio sin daños',          9,  9),
('Crecimiento',  5,  1, '2026-03-10', '2026-03-13', 'Planta dañada por clima',             10, 10),
('Germinación',  5,  0, '2026-03-11', '2026-03-14', 'Todo correcto en germinación',        11, 11),
('Injerto',      8,  1, '2026-03-12', '2026-03-15', 'Pérdida regular en injerto',          12, 12),
('Enraizamiento',18, 0, '2026-03-13', '2026-03-16', 'Sin observaciones en enraizamiento',  13, 13),
('Trasplante',   5,  1, '2026-03-14', '2026-03-17', 'Detalle pequeño en trasplante',       14, 14),
('Crecimiento',  8,  0, '2026-03-15', '2026-03-18', 'Crecimiento correcto',                15, 15),
('Germinación',  8,  0, '2026-03-16', '2026-03-19', 'Producción estable sin pérdidas',     16, 16),
('Injerto',      8,  1, '2026-03-17', '2026-03-20', 'Pérdida menor en injerto pecana',     17, 17),
('Enraizamiento',6,  0, '2026-03-18', '2026-03-21', 'Buen enraizamiento de peras',         18, 18),
('Trasplante',   4,  0, '2026-03-19', '2026-03-22', 'Sin daños en trasplante pitahaya',    19, 19),
('Crecimiento',  13, 1, '2026-03-20', '2026-03-23', 'Manzana premium con pérdida leve',    20, 20);

-- =====================================================
-- 20. INSERT: STOCK_MOVEMENT
-- =====================================================
INSERT INTO STOCK_MOVEMENT (movement_type, movement_reason, quantity, stock_before, stock_after, comments, movement_date, employee_id, sale_id, batch_id, products_sale_id, product_id, id_purchase) VALUES
('SALIDA',  'Venta directa',         4,  200, 196, 'Venta arándano cliente 1',       '2026-04-01',  1,  1,  1,  1,  1,  1),
('SALIDA',  'Venta directa',         5,  150, 145, 'Venta palto cliente 2',          '2026-04-02',  2,  2,  2,  2,  2,  2),
('SALIDA',  'Venta directa',         4,   80,  76, 'Venta cerezo cliente 3',         '2026-04-03',  3,  3,  3,  3,  3,  3),
('SALIDA',  'Venta directa',         8,  120, 112, 'Venta vid cliente 4',            '2026-04-04',  4,  4,  4,  4,  4,  4),
('SALIDA',  'Venta directa',        10,  100,  90, 'Venta frambuesa cliente 5',      '2026-04-05',  5,  5,  5,  5,  5,  5),
('ENTRADA', 'Compra proveedor',      50,  130, 180, 'Reposición naranjas',           '2026-04-06',  6,  6,  6,  6,  6,  6),
('SALIDA',  'Venta directa',         7,  110, 103, 'Venta mandarina cliente 7',      '2026-04-07',  7,  7,  7,  7,  7,  7),
('SALIDA',  'Venta directa',        14,  200, 186, 'Venta limón cliente 8',          '2026-04-08',  8,  8,  8,  8,  8,  8),
('SALIDA',  'Venta directa',        11,   60,  49, 'Venta chirimoya cliente 9',      '2026-04-09',  9,  9,  9,  9,  9,  9),
('ENTRADA', 'Compra proveedor',      30,   55,  85, 'Reposición caquis',             '2026-04-10', 10, 10, 10, 10, 10, 10),
('SALIDA',  'Venta directa',         5,   45,  40, 'Venta ciruelo cliente 11',      '2026-04-11', 11, 11, 11, 11, 11, 11),
('ENTRADA', 'Compra proveedor',      40,   75, 115, 'Reposición duraznos',           '2026-04-12', 12, 12, 12, 12, 12, 12),
('SALIDA',  'Venta directa',        18,   80,  62, 'Venta granadilla cliente 13',   '2026-04-13', 13, 13, 13, 13, 13, 13),
('SALIDA',  'Venta directa',         5,   70,  65, 'Venta lúcuma cliente 14',       '2026-04-14', 14, 14, 14, 14, 14, 14),
('ENTRADA', 'Compra proveedor',      50,   90, 140, 'Reposición mangos',             '2026-04-15', 15, 15, 15, 15, 15, 15),
('SALIDA',  'Venta directa',         8,   65,  57, 'Venta níspero cliente 16',      '2026-04-16', 16, 16, 16, 16, 16, 16),
('SALIDA',  'Venta directa',         8,   30,  22, 'Venta pecana cliente 17',       '2026-04-17', 17, 17, 17, 17, 17, 17),
('ENTRADA', 'Compra proveedor',      30,   50,  80, 'Reposición peras',              '2026-04-18', 18, 18, 18, 18, 18, 18),
('SALIDA',  'Venta directa',         4,   40,  36, 'Venta pitahaya cliente 19',     '2026-04-19', 19, 19, 19, 19, 19, 19),
('ENTRADA', 'Compra proveedor',      60,   55, 115, 'Reposición manzanas',           '2026-04-20', 20, 20, 20, 20, 20, 20); 

Select * from CUSTOMER;



