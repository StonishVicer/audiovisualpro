-- ============================================================
-- MIGRACIÓN FINAL - AudiovisualPro
-- Script idempotente: seguro para ejecutar múltiples veces
-- ============================================================

BEGIN;

-- ============================================================
-- 1. TABLA facturas: Renombrar columnas y agregar nuevas
-- ============================================================

-- Renombrar fecha_emision -> fecha_factura (si existe la columna vieja)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'facturas' AND column_name = 'fecha_emision'
    ) THEN
        ALTER TABLE facturas RENAME COLUMN fecha_emision TO fecha_factura;
    END IF;
END $$;

-- Renombrar monto_total -> total (si existe la columna vieja)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'facturas' AND column_name = 'monto_total'
    ) THEN
        ALTER TABLE facturas RENAME COLUMN monto_total TO total;
    END IF;
END $$;

-- Agregar numero_factura
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS numero_factura VARCHAR(50);

-- Agregar cliente_id
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS cliente_id INTEGER;

-- Agregar subtotal
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14,2) DEFAULT 0;

-- Agregar estado (VARCHAR)
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'PENDIENTE';

-- Agregar notas
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS notas TEXT;

-- Hacer id_estado_pago nullable
ALTER TABLE facturas ALTER COLUMN id_estado_pago DROP NOT NULL;

-- ============================================================
-- 2. Crear tabla factura_items
-- ============================================================

CREATE TABLE IF NOT EXISTS factura_items (
    id_item SERIAL PRIMARY KEY,
    factura_id INTEGER REFERENCES facturas(id_factura) ON DELETE CASCADE,
    descripcion VARCHAR(255),
    cantidad NUMERIC(10,2),
    precio_unitario NUMERIC(14,2)
);

-- ============================================================
-- 3. TABLA proyectos: Agregar columna fecha_fin
-- ============================================================

ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- ============================================================
-- 4. TABLA pagos_personal: Agregar columnas futuras
-- ============================================================

ALTER TABLE pagos_personal ADD COLUMN IF NOT EXISTS sueldo NUMERIC(14,2);
ALTER TABLE pagos_personal ADD COLUMN IF NOT EXISTS extra NUMERIC(14,2);

-- ============================================================
-- 5. Insertar usuario gestor por defecto (admin / admin123)
-- ============================================================

-- Hash bcrypt de 'admin123' con 10 rondas de salt
INSERT INTO gestor (usuario_gestor, pass_gestor, nombre_gestor)
SELECT 'admin',
       '$2b$10$a1JSf6BJEh3dSTYU8bSi3.kEHmyenH3z3F5/by4TFeG5og0.2rDei',
       'Administrador'
WHERE NOT EXISTS (
    SELECT 1 FROM gestor WHERE usuario_gestor = 'admin'
);

-- ============================================================
-- 6. Tablas para SISTEMA BIMONETARIO
-- ============================================================

CREATE TABLE IF NOT EXISTS monedas (
    id_moneda SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS tipos_cambio (
    id_tipo_cambio SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    id_moneda_base INTEGER NOT NULL REFERENCES monedas(id_moneda),
    id_moneda_destino INTEGER NOT NULL REFERENCES monedas(id_moneda),
    valor NUMERIC(14,4) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'Manual',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (fecha, id_moneda_base, id_moneda_destino)
);

INSERT INTO monedas (id_moneda, codigo, nombre, simbolo) VALUES
    (1, 'USD', 'Dolar estadounidense', '$'),
    (2, 'VES', 'Bolivar digital', 'Bs.')
ON CONFLICT (id_moneda) DO NOTHING;

-- ============================================================
-- 7. Constraints UNIQUE y datos maestros de catalogos
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tipos_proyecto_nombre') THEN
        ALTER TABLE tipos_proyecto ADD CONSTRAINT uq_tipos_proyecto_nombre UNIQUE (nombre_tipo);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_estados_proyecto_nombre') THEN
        ALTER TABLE estados_proyecto ADD CONSTRAINT uq_estados_proyecto_nombre UNIQUE (nombre_estado);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_roles_personal_nombre') THEN
        ALTER TABLE roles_personal ADD CONSTRAINT uq_roles_personal_nombre UNIQUE (nombre_rol);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tipos_recurso_nombre') THEN
        ALTER TABLE tipos_recurso ADD CONSTRAINT uq_tipos_recurso_nombre UNIQUE (nombre_tipo);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_categorias_gasto_nombre') THEN
        ALTER TABLE categorias_gasto ADD CONSTRAINT uq_categorias_gasto_nombre UNIQUE (nombre_categoria);
    END IF;
END $$;

INSERT INTO tipos_proyecto (nombre_tipo) VALUES
    ('Comercial'),('Corporativo'),('Eventos'),('Educativo'),('Documental'),('Ficcion'),('Otro')
ON CONFLICT (nombre_tipo) DO NOTHING;

INSERT INTO estados_proyecto (nombre_estado) VALUES
    ('En Progreso'),('Finalizado'),('Cancelado'),('En Espera')
ON CONFLICT (nombre_estado) DO NOTHING;

INSERT INTO roles_personal (nombre_rol) VALUES
    ('Director'),('Productor'),('Camarografo'),('Editor'),('Sonidista'),('Disenador Grafico'),('Asistente'),('Otro')
ON CONFLICT (nombre_rol) DO NOTHING;

INSERT INTO tipos_recurso (nombre_tipo) VALUES
    ('Camara'),('Iluminacion'),('Sonido'),('Postproduccion'),('Transporte'),('Otro')
ON CONFLICT (nombre_tipo) DO NOTHING;

INSERT INTO categorias_gasto (nombre_categoria) VALUES
    ('Transporte'),('Comida'),('Reservaciones'),('Materiales'),('Equipos'),('Personal'),('Otros')
ON CONFLICT (nombre_categoria) DO NOTHING;

-- ============================================================
-- 8. Columnas adicionales (clientes + personal)
-- ============================================================

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_identificacion VARCHAR(1) DEFAULT 'V';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS prefijo_telefono VARCHAR(5);
ALTER TABLE personal ADD COLUMN IF NOT EXISTS prefijo_telefono VARCHAR(5);
ALTER TABLE personal ADD COLUMN IF NOT EXISTS tipo_identificacion VARCHAR(1) DEFAULT 'V';
ALTER TABLE personal ALTER COLUMN cedula_personal TYPE VARCHAR(20);

COMMIT;
