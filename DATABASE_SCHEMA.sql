-- ====================================================================
-- PLATAFORMA DE MAPEO CIUDADANO COLOMBIA 2026
-- ESQUEMA DE BASE DE DATOS PARA POSTGRESQL / SUPABASE (CON POSTGIS)
-- ====================================================================

-- 1. Habilitar la extensión de PostGIS (Sistemas de Información Geográfica)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Definir Enums de Aplicación para mayor consistencia de datos (con bloque seguro si ya existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_actividad') THEN
        CREATE TYPE tipo_actividad AS ENUM ('marcha', 'cultural', 'comunitaria', 'recogida');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_moderacion') THEN
        CREATE TYPE estado_moderacion AS ENUM ('pending', 'approved', 'reported');
    END IF;
END $$;

-- 3. Crear la tabla principal de eventos ciudadanos geo-referenciados
CREATE TABLE IF NOT EXISTS eventos_ciudadanos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(60) NOT NULL,
    tipo_actividad tipo_actividad NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    
    -- Coordenadas crudas en formato WGS 84 (altamente legibles para API cliente)
    latitud NUMERIC(9, 6) NOT NULL,
    longitud NUMERIC(9, 6) NOT NULL,
    
    -- Columna geométrica PostGIS autogenerada para consultas de SIG rápidas
    -- Establece las coordenadas en POINT(longitude latitude) con SRID 4326 (WGS 84)
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography
    ) STORED,

    -- Campos de moderación de contenido y auditorías contra vandalismo
    ip_creador INET NOT NULL, -- IPv4 o IPv6 almacenados eficientemente
    estado estado_moderacion NOT NULL DEFAULT 'approved',
    conteo_reportes INTEGER NOT NULL DEFAULT 0,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Crear índices espaciales para búsquedas por proximidad ultra rápidas
CREATE INDEX IF NOT EXISTS idx_eventos_geom ON eventos_ciudadanos USING GIST (geom);

-- 5. Crear índices tradicionales para mitigar la latencia en queries recurrentes de la API
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos_ciudadanos (tipo_actividad);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos_ciudadanos (estado) WHERE estado = 'approved';
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_hora ON eventos_ciudadanos (fecha_hora);

-- 6. Crear la tabla de auditoría de envío para el sistema distributed Rate Limiter (Anti-Spam)
CREATE TABLE IF NOT EXISTS logs_solicitudes_ip (
    id BIGSERIAL PRIMARY KEY,
    ip_solicitante INET NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice compuesto para verificar velozmente envíos por IP en un rango de tiempo
CREATE INDEX IF NOT EXISTS idx_logs_ip_tiempo ON logs_solicitudes_ip (ip_solicitante, creado_en DESC);


-- ====================================================================
-- 7. REGLAS DE SEGURIDAD (RLS) PARA SUPABASE
-- Conceder permisos de lectura, creación y reporte público sobre las tablas
-- ====================================================================

ALTER TABLE eventos_ciudadanos ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_solicitudes_ip ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas viejas si ya existen para evitar conflictos en re-ejecución
DROP POLICY IF EXISTS "Permitir select público" ON eventos_ciudadanos;
DROP POLICY IF EXISTS "Permitir insert público" ON eventos_ciudadanos;
DROP POLICY IF EXISTS "Permitir update de reportes público" ON eventos_ciudadanos;
DROP POLICY IF EXISTS "Permitir insert de logs público" ON logs_solicitudes_ip;
DROP POLICY IF EXISTS "Permitir select de logs público" ON logs_solicitudes_ip;

-- Políticas para eventos_ciudadanos
CREATE POLICY "Permitir select público" ON eventos_ciudadanos
    FOR SELECT TO public USING (true);

CREATE POLICY "Permitir insert público" ON eventos_ciudadanos
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permitir update de reportes público" ON eventos_ciudadanos
    FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Políticas para logs_solicitudes_ip
CREATE POLICY "Permitir insert de logs público" ON logs_solicitudes_ip
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permitir select de logs público" ON logs_solicitudes_ip
    FOR SELECT TO public USING (true);


-- ====================================================================
-- EJEMPLOS DE CONSULTAS SOCIALES UTILES (DQL DE SIG):
-- ====================================================================

-- A. Obtener eventos que se encuentran a menos de 5 kilómetros de la ubicación de un ciudadano:
-- SELECT id, nombre, ST_Distance(geom, ST_MakePoint(-74.0760, 4.5981)::geography) AS distancia_metros
-- FROM eventos_ciudadanos
-- WHERE ST_DWithin(geom, ST_MakePoint(-74.0760, 4.5981)::geography, 5000) AND estado = 'approved';
