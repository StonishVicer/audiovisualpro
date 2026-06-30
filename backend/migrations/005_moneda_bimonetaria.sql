--
-- ============================================
-- ARCHIVO: backend/migrations/005_moneda_bimonetaria.sql
-- MIGRACIÓN: Arquitectura Bimonetaria USD/VES
-- VERSIÓN: 2.2.0
-- ============================================
--
-- 📌 JUSTIFICACIÓN DE ARQUITECTURA
-- ================================
-- Venezuela opera con dos monedas (USD y VES) con tasas de cambio fluctuantes.
-- Los contratos se firman en USD pero los pagos pueden realizarse en VES.
-- Esta migración agrega el soporte bimonetario a todas las tablas financieras.
--
-- 🎯 PROBLEMA RESUELTO:
-- - Necesidad de registrar transacciones en ambas monedas.
-- - Reportes históricos precisos sin pérdida de valor por tasa de cambio.
-- - Trazabilidad de la tasa usada en cada operación.
--
-- 🏗️ SOLUCIÓN ARQUITECTÓNICA:
-- - Almacenar montos en ambas monedas (USD y VES) para evitar problemas de precisión.
-- - Tabla de tipos de cambio históricos para auditoría.
-- - Columna id_moneda para indicar la moneda original de la transacción.
--

BEGIN;

-- ── Tablas nuevas ──

CREATE TABLE IF NOT EXISTS monedas (
    id_moneda SERIAL PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE,
    simbolo VARCHAR(5),
    nombre VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS tipos_cambio (
    id_tipo_cambio SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    id_moneda_base INTEGER REFERENCES monedas(id_moneda),
    id_moneda_destino INTEGER REFERENCES monedas(id_moneda),
    valor DECIMAL(20,6) NOT NULL,
    fuente VARCHAR(50) DEFAULT 'Manual',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(fecha, id_moneda_base, id_moneda_destino)
);

-- ── Datos iniciales ──

INSERT INTO monedas (codigo, simbolo, nombre) VALUES
    ('USD', '$', 'Dólar Americano'),
    ('VES', 'Bs.', 'Bolívar Soberano')
ON CONFLICT (codigo) DO NOTHING;

-- Tasa placeholder inicial: 1 USD = 1 VES (debe actualizarse manualmente)
INSERT INTO tipos_cambio (fecha, id_moneda_base, id_moneda_destino, valor)
    SELECT CURRENT_DATE, m1.id_moneda, m2.id_moneda, 1.0
    FROM monedas m1, monedas m2
    WHERE m1.codigo = 'USD' AND m2.codigo = 'VES'
    AND NOT EXISTS (
        SELECT 1 FROM tipos_cambio
        WHERE fecha = CURRENT_DATE
        AND id_moneda_base = m1.id_moneda
        AND id_moneda_destino = m2.id_moneda
    );

-- ── Alteraciones a tablas financieras ──

-- Facturas
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS id_moneda INTEGER REFERENCES monedas(id_moneda) DEFAULT 1;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS monto_usd DECIMAL(14,2) DEFAULT 0;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS monto_ves DECIMAL(14,2) DEFAULT 0;

-- Gastos
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS id_moneda INTEGER REFERENCES monedas(id_moneda) DEFAULT 1;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS monto_usd DECIMAL(14,2) DEFAULT 0;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS monto_ves DECIMAL(14,2) DEFAULT 0;

-- Pagos Personal
ALTER TABLE pagos_personal ADD COLUMN IF NOT EXISTS id_moneda INTEGER REFERENCES monedas(id_moneda) DEFAULT 1;
ALTER TABLE pagos_personal ADD COLUMN IF NOT EXISTS monto_usd DECIMAL(14,2) DEFAULT 0;
ALTER TABLE pagos_personal ADD COLUMN IF NOT EXISTS monto_ves DECIMAL(14,2) DEFAULT 0;

-- ── Migrar datos existentes: asignar USD por defecto y copiar montos actuales ──

UPDATE facturas SET
    monto_usd = COALESCE(total, 0),
    monto_ves = COALESCE(total, 0) * 1.0
WHERE id_moneda IS NULL OR monto_usd IS NULL;

UPDATE gastos SET
    monto_usd = COALESCE(monto_gasto, 0),
    monto_ves = COALESCE(monto_gasto, 0) * 1.0
WHERE id_moneda IS NULL OR monto_usd IS NULL;

UPDATE pagos_personal SET
    monto_usd = COALESCE(monto_pagado, 0),
    monto_ves = COALESCE(monto_pagado, 0) * 1.0
WHERE id_moneda IS NULL OR monto_usd IS NULL;

COMMIT;
