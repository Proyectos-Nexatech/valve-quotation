-- ESQUEMA SQL PARA VALVEQUOTE EN SUPABASE

-- 1. TABLA DE CATÁLOGO TARIFARIO (Administrable por el personal)
CREATE TABLE catalogo_servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tipo_valvula TEXT NOT NULL, 
  servicio TEXT NOT NULL,      
  precio_base_cop NUMERIC NOT NULL,
  moneda TEXT DEFAULT 'COP'
);

-- 2. TABLA DE SOLICITUDES DE COTIZACIÓN (Lead Principal)
CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  folio TEXT UNIQUE, 
  cliente_nombre TEXT NOT NULL,
  cliente_empresa TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT,
  trm_usd_cop NUMERIC DEFAULT 4000, 
  estado TEXT DEFAULT 'pendiente', 
  iva_aplicado NUMERIC DEFAULT 19,
  descuento_global NUMERIC DEFAULT 0,
  notas_internas TEXT
);

-- 3. TABLA DE ITEMS POR SOLICITUD (Válvulas específicas)
CREATE TABLE items_solicitud (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  tipo_valvula TEXT NOT NULL,
  servicio TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  precio_unitario_cop NUMERIC, 
  especificaciones JSONB 
);

-- 4. CONFIGURACIÓN GLOBAL (IVA, etc.)
CREATE TABLE configuracion_global (
  id INTEGER PRIMARY KEY DEFAULT 1,
  iva_porcentaje NUMERIC DEFAULT 19,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- INSERCIÓN DE DATOS INICIALES PARA EL CATÁLOGO (Ejemplos)
INSERT INTO catalogo_servicios (tipo_valvula, servicio, precio_base_cop) VALUES
('PSV', 'Calibración y Certificación', 1500000),
('PSV', 'Mantenimiento Preventivo', 850000),
('Control', 'Diagnóstico y Calibración', 2200000),
('Manual', 'Prueba de Estanqueidad', 600000);
