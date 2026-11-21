-- =====================================================
-- Cafetería y Comida Típica
-- Motor: PostgreSQL (DBeaver)
-- =====================================================

SET search_path TO public;

-- =====================================================
-- LIMPIEZA PREVIA
-- =====================================================
--DROP TABLE IF EXISTS planilla CASCADE;
--DROP TABLE IF EXISTS empleado CASCADE;
--DROP TABLE IF EXISTS movimiento_caja CASCADE;
--DROP TABLE IF EXISTS credito_fiscal CASCADE;
--DROP TABLE IF EXISTS factura CASCADE;
--DROP TABLE IF EXISTS pago CASCADE;
--DROP TABLE IF EXISTS detalle_pedido CASCADE;
--DROP TABLE IF EXISTS pedido CASCADE;
--DROP TABLE IF EXISTS sesion_caja CASCADE;
--DROP TABLE IF EXISTS caja CASCADE;
--DROP TABLE IF EXISTS cliente CASCADE;
--DROP TABLE IF EXISTS pago_proveedor CASCADE;
--DROP TABLE IF EXISTS cuenta_por_pagar CASCADE;
--DROP TABLE IF EXISTS detalle_compra CASCADE;
--DROP TABLE IF EXISTS compra CASCADE;
--DROP TABLE IF EXISTS movimiento_inventario CASCADE;
--DROP TABLE IF EXISTS inventario_sucursal_empaquetado CASCADE;
--DROP TABLE IF EXISTS inventario_sucursal_insumo CASCADE;
--DROP TABLE IF EXISTS receta_detalle CASCADE;
--DROP TABLE IF EXISTS receta CASCADE;
--DROP TABLE IF EXISTS insumo CASCADE;
--DROP TABLE IF EXISTS producto_empaquetado CASCADE;
--DROP TABLE IF EXISTS producto CASCADE;
--DROP TABLE IF EXISTS proveedor CASCADE;
--DROP TABLE IF EXISTS sucursal CASCADE;

-- =====================================================
-- SUCURSALES
-- =====================================================
CREATE TABLE sucursal (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL UNIQUE,
    direccion  VARCHAR(250) NOT NULL,
    telefono   VARCHAR(20),
    creada_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMPLEADOS Y PLANILLA QUINCENAL
-- =====================================================
CREATE TABLE empleado (
    id               SERIAL PRIMARY KEY,
    sucursal_id      INT NOT NULL REFERENCES sucursal(id),
    cargo            VARCHAR(50) NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    correo           VARCHAR(150) NOT NULL UNIQUE,
    password_hash    TEXT NOT NULL,
    salario_mensual  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (salario_mensual >= 0),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso    TIMESTAMP
);

CREATE TABLE planilla (
    id               SERIAL PRIMARY KEY,
    empleado_id      INT NOT NULL REFERENCES empleado(id),
    periodo          DATE NOT NULL,
    quincena         SMALLINT NOT NULL CHECK (quincena IN (1, 2)),
    salario_base     NUMERIC(10,2) NOT NULL CHECK (salario_base >= 0),
    isss             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (isss >= 0),
    afp              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (afp >= 0),
    isr              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (isr >= 0),
    descuento_total  NUMERIC(10,2) GENERATED ALWAYS AS (isss + afp + isr) STORED,
    salario_neto     NUMERIC(10,2) GENERATED ALWAYS AS (salario_base - isss - afp - isr) STORED,
    UNIQUE (empleado_id, periodo, quincena)
);

-- =====================================================
-- PROVEEDORES
-- =====================================================
CREATE TABLE proveedor (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    telefono  VARCHAR(20)
);

-- =====================================================
-- PRODUCTOS (catálogo centralizado)
-- =====================================================
CREATE TABLE producto (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    precio         NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    tipo_producto  VARCHAR(12) NOT NULL
                   CHECK (tipo_producto IN ('EMPAQUETADO', 'PREPARADO'))
);

CREATE TABLE producto_empaquetado (
    producto_id   INT PRIMARY KEY REFERENCES producto(id) ON DELETE CASCADE,
    proveedor_id  INT NOT NULL REFERENCES proveedor(id),
    costo         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (costo >= 0)
);

-- =====================================================
-- INSUMOS Y RECETAS
-- =====================================================
CREATE TABLE insumo (
    id             SERIAL PRIMARY KEY,
    proveedor_id   INT NOT NULL REFERENCES proveedor(id),
    nombre         VARCHAR(100) NOT NULL,
    unidad_medida  VARCHAR(20) NOT NULL
);

CREATE TABLE receta (
    id           SERIAL PRIMARY KEY,
    producto_id  INT NOT NULL UNIQUE REFERENCES producto(id) ON DELETE CASCADE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT
);

CREATE TABLE receta_detalle (
    receta_id       INT NOT NULL REFERENCES receta(id) ON DELETE CASCADE,
    insumo_id       INT NOT NULL REFERENCES insumo(id),
    cantidad_usada  NUMERIC(12,3) NOT NULL CHECK (cantidad_usada > 0),
    PRIMARY KEY (receta_id, insumo_id)
);

-- =====================================================
-- INVENTARIO POR SUCURSAL
-- =====================================================
CREATE TABLE inventario_sucursal_insumo (
    sucursal_id   INT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    insumo_id     INT NOT NULL REFERENCES insumo(id) ON DELETE CASCADE,
    cantidad      NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    stock_minimo  NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    PRIMARY KEY (sucursal_id, insumo_id)
);

CREATE TABLE inventario_sucursal_empaquetado (
    sucursal_id   INT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    producto_id   INT NOT NULL REFERENCES producto_empaquetado(producto_id) ON DELETE CASCADE,
    stock         INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo  INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    PRIMARY KEY (sucursal_id, producto_id)
);

-- =====================================================
-- MOVIMIENTOS DE INVENTARIO
-- =====================================================
CREATE TABLE movimiento_inventario (
    id               SERIAL PRIMARY KEY,
    sucursal_id      INT NOT NULL REFERENCES sucursal(id),
    empleado_id      INT NOT NULL REFERENCES empleado(id),
    insumo_id        INT REFERENCES insumo(id),
    producto_id      INT REFERENCES producto_empaquetado(producto_id),
    tipo_movimiento  VARCHAR(10) NOT NULL
                     CHECK (tipo_movimiento IN ('ENTRADA', 'AJUSTE', 'SALIDA')),
    cantidad         NUMERIC(12,3) NOT NULL CHECK (cantidad <> 0),
    fecha            TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(insumo_id, producto_id) = 1)
);

-- =====================================================
-- COMPRAS A PROVEEDORES Y CUENTAS POR PAGAR
-- =====================================================
CREATE TABLE compra (
    id                 SERIAL PRIMARY KEY,
    sucursal_id        INT NOT NULL REFERENCES sucursal(id),
    proveedor_id       INT NOT NULL REFERENCES proveedor(id),
    empleado_id        INT NOT NULL REFERENCES empleado(id),
    numero_documento   VARCHAR(60),
    condicion_pago     VARCHAR(10) NOT NULL DEFAULT 'CONTADO'
                       CHECK (condicion_pago IN ('CONTADO', 'CREDITO')),
    estado             VARCHAR(12) NOT NULL DEFAULT 'REGISTRADA'
                       CHECK (estado IN ('REGISTRADA', 'ANULADA')),
    fecha_emision      DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento  DATE,
    subtotal           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    iva                NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (iva >= 0),
    total              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    CHECK (subtotal + iva = total)
);

CREATE TABLE detalle_compra (
    id                       SERIAL PRIMARY KEY,
    compra_id                INT NOT NULL REFERENCES compra(id) ON DELETE CASCADE,
    insumo_id                INT REFERENCES insumo(id),
    producto_empaquetado_id  INT REFERENCES producto_empaquetado(producto_id),
    cantidad                 NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
    costo_unitario           NUMERIC(10,2) NOT NULL CHECK (costo_unitario >= 0),
    subtotal_linea           NUMERIC(10,2) NOT NULL CHECK (subtotal_linea >= 0),
    CHECK (num_nonnulls(insumo_id, producto_empaquetado_id) = 1)
);

CREATE TABLE cuenta_por_pagar (
    id                 SERIAL PRIMARY KEY,
    compra_id          INT NOT NULL UNIQUE REFERENCES compra(id) ON DELETE CASCADE,
    proveedor_id       INT NOT NULL REFERENCES proveedor(id),
    monto_total        NUMERIC(10,2) NOT NULL CHECK (monto_total >= 0),
    saldo_pendiente    NUMERIC(10,2) NOT NULL CHECK (saldo_pendiente >= 0),
    fecha_vencimiento  DATE,
    estado             VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE'
                       CHECK (estado IN ('PENDIENTE', 'PARCIAL', 'PAGADA')),
    CHECK (saldo_pendiente <= monto_total)
);

CREATE TABLE pago_proveedor (
    id                   SERIAL PRIMARY KEY,
    cuenta_por_pagar_id  INT NOT NULL REFERENCES cuenta_por_pagar(id) ON DELETE CASCADE,
    empleado_id          INT NOT NULL REFERENCES empleado(id),
    metodo               VARCHAR(30) NOT NULL,
    referencia           VARCHAR(100),
    monto                NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CAJA Y FLUJOS (APERTURA, CIERRE Y CUADRE POR TURNO)
-- =====================================================
CREATE TABLE caja (
    id           SERIAL PRIMARY KEY,
    sucursal_id  INT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    nombre       VARCHAR(60) NOT NULL,
    UNIQUE (sucursal_id, nombre)
);

CREATE TABLE sesion_caja (
    id                  SERIAL PRIMARY KEY,
    caja_id             INT NOT NULL REFERENCES caja(id),
    empleado_id         INT NOT NULL REFERENCES empleado(id),
    estado              VARCHAR(10) NOT NULL DEFAULT 'ABIERTA'
                        CHECK (estado IN ('ABIERTA', 'CERRADA')),
    fecha_apertura      TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_cierre        TIMESTAMP,
    monto_apertura      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (monto_apertura >= 0),
    efectivo_esperado   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (efectivo_esperado >= 0),
    tarjeta_esperado    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tarjeta_esperado >= 0),
    digital_esperado    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (digital_esperado >= 0),
    efectivo_declarado  NUMERIC(10,2) CHECK (efectivo_declarado >= 0),
    tarjeta_declarado   NUMERIC(10,2) CHECK (tarjeta_declarado >= 0),
    digital_declarado   NUMERIC(10,2) CHECK (digital_declarado >= 0),
    observaciones       TEXT
);

CREATE TABLE movimiento_caja (
    id              SERIAL PRIMARY KEY,
    sesion_caja_id  INT NOT NULL REFERENCES sesion_caja(id) ON DELETE CASCADE,
    empleado_id     INT NOT NULL REFERENCES empleado(id),
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    concepto        VARCHAR(200) NOT NULL,
    monto           NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    fecha           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CLIENTES
-- =====================================================
CREATE TABLE cliente (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL UNIQUE,
    telefono       VARCHAR(20),
    direccion      VARCHAR(250),
    password_hash  TEXT NOT NULL
);

-- =====================================================
-- PEDIDOS, PAGOS Y FACTURACIÓN (IVA 13% + CCF)
-- =====================================================
CREATE TABLE pedido (
    id            SERIAL PRIMARY KEY,
    sucursal_id   INT NOT NULL REFERENCES sucursal(id),
    cliente_id    INT REFERENCES cliente(id),
    empleado_id   INT REFERENCES empleado(id),
    tipo_factura  VARCHAR(15) NOT NULL DEFAULT 'NORMAL'
                  CHECK (tipo_factura IN ('NORMAL', 'CREDITO_FISCAL')),
    estado        VARCHAR(15) NOT NULL DEFAULT 'CARRITO'
                  CHECK (estado IN ('CARRITO', 'PAGADO', 'EN_PREPARACION',
                                    'ENTREGADO', 'CANCELADO')),
    fecha         TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    iva           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (iva >= 0),
    total         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    CHECK (subtotal + iva = total)
);

CREATE TABLE detalle_pedido (
    pedido_id        INT NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    producto_id      INT NOT NULL REFERENCES producto(id),
    cantidad         INT NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    PRIMARY KEY (pedido_id, producto_id)
);

CREATE TABLE pago (
    id                   SERIAL PRIMARY KEY,
    pedido_id            INT NOT NULL REFERENCES pedido(id),
    sesion_caja_id       INT REFERENCES sesion_caja(id),
    metodo               VARCHAR(20) NOT NULL
                         CHECK (metodo IN ('EFECTIVO', 'TARJETA', 'BITCOIN',
                                           'CHIVO_WALLET', 'TRANSFERENCIA')),
    referencia_pasarela  VARCHAR(100),
    monto                NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    estado               VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE'
                         CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    fecha                TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE factura (
    correlativo  SERIAL PRIMARY KEY,
    pedido_id    INT NOT NULL UNIQUE REFERENCES pedido(id),
    fecha        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE credito_fiscal (
    pedido_id           INT PRIMARY KEY REFERENCES pedido(id) ON DELETE CASCADE,
    nit                 VARCHAR(20)  NOT NULL,
    nrc                 VARCHAR(20)  NOT NULL,
    nombre_institucion  VARCHAR(150) NOT NULL,
    giro                VARCHAR(150),
    direccion           VARCHAR(250)
);