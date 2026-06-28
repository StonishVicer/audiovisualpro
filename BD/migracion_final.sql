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
-- 6. Crear tablas para CHAT PERSISTENTE
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_rooms (
    id_room SERIAL PRIMARY KEY,
    id_proyecto INTEGER REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    nombre_room VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id_mensaje SERIAL PRIMARY KEY,
    id_room INTEGER REFERENCES chat_rooms(id_room) ON DELETE CASCADE,
    sender_type VARCHAR(10) CHECK (sender_type IN ('admin', 'client')),
    sender_id INTEGER NOT NULL,
    mensaje TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Índice para búsqueda rápida de mensajes por sala
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(id_room, timestamp);

COMMIT;
