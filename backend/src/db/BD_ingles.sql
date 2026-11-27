-- =====================================================
-- Cafetería y Comida Típica
-- Motor: PostgreSQL (DBeaver)
-- =====================================================

SET search_path TO public;

-- =====================================================
-- LIMPIEZA PREVIA (descomentar solo para reiniciar)
-- =====================================================
-- DROP TABLE IF EXISTS payroll CASCADE;
-- DROP TABLE IF EXISTS employee CASCADE;
-- DROP TABLE IF EXISTS cash_movement CASCADE;
-- DROP TABLE IF EXISTS tax_credit_note CASCADE;
-- DROP TABLE IF EXISTS invoice CASCADE;
-- DROP TABLE IF EXISTS payment CASCADE;
-- DROP TABLE IF EXISTS order_detail CASCADE;
-- DROP TABLE IF EXISTS customer_order CASCADE;
-- DROP TABLE IF EXISTS cash_session CASCADE;
-- DROP TABLE IF EXISTS cash_register CASCADE;
-- DROP TABLE IF EXISTS customer CASCADE;
-- DROP TABLE IF EXISTS supplier_payment CASCADE;
-- DROP TABLE IF EXISTS account_payable CASCADE;
-- DROP TABLE IF EXISTS purchase_detail CASCADE;
-- DROP TABLE IF EXISTS purchase CASCADE;
-- DROP TABLE IF EXISTS inventory_movement CASCADE;
-- DROP TABLE IF EXISTS branch_packaged_inventory CASCADE;
-- DROP TABLE IF EXISTS inventory_branch_supply CASCADE;
-- DROP TABLE IF EXISTS recipe_detail CASCADE;
-- DROP TABLE IF EXISTS recipe CASCADE;
-- DROP TABLE IF EXISTS supply CASCADE;
-- DROP TABLE IF EXISTS packaged_product CASCADE;
-- DROP TABLE IF EXISTS product CASCADE;
-- DROP TABLE IF EXISTS supplier CASCADE;
-- DROP TABLE IF EXISTS branch CASCADE;

-- =====================================================
-- SUCURSALES
-- =====================================================
CREATE TABLE branch (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    address     VARCHAR(250) NOT NULL,
    phone       VARCHAR(20),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EMPLEADOS Y PLANILLA QUINCENAL
-- =====================================================
CREATE TABLE employee (
    id              SERIAL PRIMARY KEY,
    branch_id       INT NOT NULL REFERENCES branch(id),
    role            VARCHAR(50) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    monthly_salary  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (monthly_salary >= 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login      TIMESTAMP
);

CREATE TABLE payroll (
    id              SERIAL PRIMARY KEY,
    employee_id     INT NOT NULL REFERENCES employee(id),
    period          DATE NOT NULL, -- Primer día del mes
    fortnight       SMALLINT NOT NULL CHECK (fortnight IN (1, 2)),
    base_salary     NUMERIC(10,2) NOT NULL CHECK (base_salary >= 0),
    isss            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (isss >= 0),
    afp             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (afp >= 0),
    isr             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (isr >= 0),
    total_deduction NUMERIC(10,2) GENERATED ALWAYS AS (isss + afp + isr) STORED,
    net_salary      NUMERIC(10,2) GENERATED ALWAYS AS (base_salary - isss - afp - isr) STORED,
    UNIQUE (employee_id, period, fortnight)
);

-- =====================================================
-- PROVEEDORES
-- =====================================================
CREATE TABLE supplier (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    phone  VARCHAR(20)
);

-- =====================================================
-- PRODUCTOS (catálogo centralizado)
-- =====================================================
CREATE TABLE product (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    product_type  VARCHAR(12) NOT NULL
                  CHECK (product_type IN ('PACKAGED', 'PREPARED'))
);

CREATE TABLE packaged_product (
    product_id   INT PRIMARY KEY REFERENCES product(id) ON DELETE CASCADE,
    supplier_id  INT NOT NULL REFERENCES supplier(id),
    unit_cost    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0)
);

-- =====================================================
-- INSUMOS Y RECETAS
-- =====================================================
CREATE TABLE supply (
    id           SERIAL PRIMARY KEY,
    supplier_id  INT NOT NULL REFERENCES supplier(id),
    name         VARCHAR(100) NOT NULL,
    unit         VARCHAR(20) NOT NULL -- Ej. G, ML, UNIT
);

CREATE TABLE recipe (
    id           SERIAL PRIMARY KEY,
    product_id   INT NOT NULL UNIQUE REFERENCES product(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    description  TEXT
);

CREATE TABLE recipe_detail (
    recipe_id      INT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    supply_id      INT NOT NULL REFERENCES supply(id),
    quantity_used  NUMERIC(12,3) NOT NULL CHECK (quantity_used > 0),
    PRIMARY KEY (recipe_id, supply_id)
);

-- =====================================================
-- INVENTARIO POR SUCURSAL
-- =====================================================
CREATE TABLE branch_supply_inventory (
    branch_id  INT NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    supply_id  INT NOT NULL REFERENCES supply(id) ON DELETE CASCADE,
    quantity   NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock  NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    PRIMARY KEY (branch_id, supply_id)
);

CREATE TABLE branch_packaged_inventory (
    branch_id   INT NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES packaged_product(product_id) ON DELETE CASCADE,
    stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock   INT NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    PRIMARY KEY (branch_id, product_id)
);

-- =====================================================
-- MOVIMIENTOS DE INVENTARIO
-- =====================================================
CREATE TABLE inventory_movement (
    id             SERIAL PRIMARY KEY,
    branch_id      INT NOT NULL REFERENCES branch(id),
    employee_id    INT REFERENCES employee(id),
    supply_id      INT REFERENCES supply(id),
    product_id     INT REFERENCES packaged_product(product_id),
    movement_type  VARCHAR(10) NOT NULL
                   CHECK (movement_type IN ('IN', 'ADJUSTMENT', 'OUT')),
    quantity       NUMERIC(12,3) NOT NULL CHECK (quantity <> 0),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (num_nonnulls(supply_id, product_id) = 1) -- Afecta insumo o empaquetado
);

-- =====================================================
-- COMPRAS Y CUENTAS POR PAGAR
-- =====================================================
CREATE TABLE purchase (
    id              SERIAL PRIMARY KEY,
    branch_id       INT NOT NULL REFERENCES branch(id),
    supplier_id     INT NOT NULL REFERENCES supplier(id),
    employee_id     INT NOT NULL REFERENCES employee(id),
    document_num    VARCHAR(60),
    payment_terms   VARCHAR(10) NOT NULL DEFAULT 'CASH'
                    CHECK (payment_terms IN ('CASH', 'CREDIT')),
    status          VARCHAR(12) NOT NULL DEFAULT 'RECORDED'
                    CHECK (status IN ('RECORDED', 'VOID')),
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0), -- IVA 13%
    total           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    CHECK (subtotal + tax = total)
);

CREATE TABLE purchase_detail (
    id                  SERIAL PRIMARY KEY,
    purchase_id         INT NOT NULL REFERENCES purchase(id) ON DELETE CASCADE,
    supply_id           INT REFERENCES supply(id),
    packaged_product_id INT REFERENCES packaged_product(product_id),
    quantity            NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_cost           NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
    line_subtotal       NUMERIC(10,2) NOT NULL CHECK (line_subtotal >= 0),
    CHECK (num_nonnulls(supply_id, packaged_product_id) = 1)
);

CREATE TABLE account_payable (
    id               SERIAL PRIMARY KEY,
    purchase_id      INT NOT NULL UNIQUE REFERENCES purchase(id) ON DELETE CASCADE,
    supplier_id      INT NOT NULL REFERENCES supplier(id),
    total_amount     NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    pending_balance  NUMERIC(10,2) NOT NULL CHECK (pending_balance >= 0),
    due_date         DATE,
    status           VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'PARTIAL', 'PAID')),
    CHECK (pending_balance <= total_amount)
);

CREATE TABLE supplier_payment (
    id                  SERIAL PRIMARY KEY,
    account_payable_id  INT NOT NULL REFERENCES account_payable(id) ON DELETE CASCADE,
    employee_id         INT NOT NULL REFERENCES employee(id),
    method              VARCHAR(30) NOT NULL,
    reference           VARCHAR(100),
    amount              NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    paid_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CAJA Y TURNOS
-- =====================================================
CREATE TABLE cash_register (
    id         SERIAL PRIMARY KEY,
    branch_id  INT NOT NULL REFERENCES branch(id) ON DELETE CASCADE,
    name       VARCHAR(60) NOT NULL,
    UNIQUE (branch_id, name)
);

CREATE TABLE cash_session (
    id                SERIAL PRIMARY KEY,
    cash_register_id  INT NOT NULL REFERENCES cash_register(id),
    employee_id       INT NOT NULL REFERENCES employee(id),
    status            VARCHAR(10) NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN', 'CLOSED')),
    opened_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at         TIMESTAMP,
    opening_amount    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (opening_amount >= 0),
    expected_cash     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (expected_cash >= 0),
    expected_card     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (expected_card >= 0),
    expected_digital  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (expected_digital >= 0),
    declared_cash     NUMERIC(10,2) CHECK (declared_cash >= 0),
    declared_card     NUMERIC(10,2) CHECK (declared_card >= 0),
    declared_digital  NUMERIC(10,2) CHECK (declared_digital >= 0),
    notes             TEXT
);

CREATE TABLE cash_movement (
    id              SERIAL PRIMARY KEY,
    cash_session_id INT NOT NULL REFERENCES cash_session(id) ON DELETE CASCADE,
    employee_id     INT NOT NULL REFERENCES employee(id),
    movement_type   VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    description     VARCHAR(200) NOT NULL,
    amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CLIENTES
-- =====================================================
CREATE TABLE customer (
    id             SERIAL PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    phone          VARCHAR(20),
    address        VARCHAR(250),
    password_hash  TEXT NOT NULL
);

-- =====================================================
-- PEDIDOS, PAGOS Y FACTURACIÓN
-- =====================================================
CREATE TABLE customer_order (
    id            SERIAL PRIMARY KEY,
    branch_id     INT NOT NULL REFERENCES branch(id),
    customer_id   INT REFERENCES customer(id), -- NULL en venta rápida POS
    employee_id   INT REFERENCES employee(id),
    invoice_type  VARCHAR(15) NOT NULL DEFAULT 'NORMAL'
                  CHECK (invoice_type IN ('NORMAL', 'TAX_CREDIT')),
    status        VARCHAR(15) NOT NULL DEFAULT 'CART'
                  CHECK (status IN ('CART', 'PAID', 'IN_PREPARATION',
                                    'DELIVERED', 'CANCELLED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0), -- IVA 13%
    total         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    CHECK (subtotal + tax = total)
);

CREATE TABLE order_detail (
    order_id    INT NOT NULL REFERENCES customer_order(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES product(id),
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE payment (
    id                 SERIAL PRIMARY KEY,
    order_id           INT NOT NULL REFERENCES customer_order(id),
    cash_session_id    INT REFERENCES cash_session(id),
    method             VARCHAR(20) NOT NULL
                       CHECK (method IN ('CASH', 'CARD', 'BITCOIN',
                                         'CHIVO_WALLET', 'TRANSFER')),
    gateway_reference  VARCHAR(100),
    amount             NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    status             VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    paid_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice (
    correlative  SERIAL PRIMARY KEY,
    order_id     INT NOT NULL UNIQUE REFERENCES customer_order(id),
    issued_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tax_credit_note (
    correlative       SERIAL NOT NULL,
    order_id          INT PRIMARY KEY REFERENCES customer_order(id) ON DELETE CASCADE,
    issued_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    nit               VARCHAR(20)  NOT NULL,
    nrc               VARCHAR(20)  NOT NULL,
    institution_name  VARCHAR(150) NOT NULL,
    business_line     VARCHAR(150),
    address           VARCHAR(250),
    CONSTRAINT tax_credit_note_correlative_uq UNIQUE (correlative)
);