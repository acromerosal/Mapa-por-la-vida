import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration with default credentials provided by user
const rawUrl = process.env.SUPABASE_URL || "https://hgzymoalzyltwvfyttjh.supabase.co";
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_GzyAfmN4ZmiPO3RT4fad0A_nSi9I165";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface CitizenEvent {
  id: string;
  name: string;
  activityType: 'marcha' | 'cultural' | 'comunitaria' | 'recogida' | 'recorrido' | 'grafica_visual' | 'reunion' | 'cultural_evento' | 'olla_comunitaria';
  scheduledAt: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'reported';
  reportsCount: number;
  createdAt: string;
  likesCount?: number;
  externalUrl?: string;
}

const CATEGORY_DB_MAPPING: Record<string, 'marcha' | 'cultural' | 'comunitaria' | 'recogida'> = {
  recorrido: 'marcha',
  grafica_visual: 'cultural',
  reunion: 'comunitaria',
  cultural_evento: 'cultural',
  olla_comunitaria: 'comunitaria',
  marcha: 'marcha',
  cultural: 'cultural',
  comunitaria: 'comunitaria',
  recogida: 'recogida'
};

function parseEventFields(rawType: string, rawDescription: string) {
  let activityType = rawType as any;
  let description = rawDescription || "";
  let externalUrl = "";

  let clean = true;
  do {
    clean = true;
    
    const urlMatch = description.match(/\s*\[URL:(.*?)\]$/);
    if (urlMatch) {
      externalUrl = urlMatch[1];
      description = description.replace(/\s*\[URL:(.*?)\]$/, "");
      clean = false;
    }
    
    const typeMatch = description.match(/\s*\[T:([a-zA-Z0-9_]+)\]$/);
    if (typeMatch) {
      activityType = typeMatch[1];
      description = description.replace(/\s*\[T:[a-zA-Z0-9_]+\]$/, "");
      clean = false;
    }
  } while (!clean);

  return { activityType, description: description.trim(), externalUrl: externalUrl.trim() };
}

// In-memory / JSON persistence layer
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "events.json");
const LIKES_FILE = path.join(DB_DIR, "likes.json");

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function readLikes(): Record<string, number> {
  try {
    if (!fs.existsSync(LIKES_FILE)) {
      fs.writeFileSync(LIKES_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    const raw = fs.readFileSync(LIKES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading likes file", err);
    return {};
  }
}

function writeLikes(data: Record<string, number>) {
  try {
    fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to likes file", err);
  }
}

const REPORTS_IP_FILE = path.join(DB_DIR, "reports_by_ip.json");

function readReportsIP(): Record<string, string[]> {
  try {
    if (!fs.existsSync(REPORTS_IP_FILE)) {
      fs.writeFileSync(REPORTS_IP_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    const raw = fs.readFileSync(REPORTS_IP_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading reports IP file", err);
    return {};
  }
}

function writeReportsIP(data: Record<string, string[]>) {
  try {
    fs.writeFileSync(REPORTS_IP_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to reports IP file", err);
  }
}

// Global state for rate limiting in memory
// Key: IP, Value: Array of timestamps of successful posts
const ipSubmissionLogs: Record<string, number[]> = {};

// Default Seed events in Colombia
const seedEvents: CitizenEvent[] = [
  {
    id: "seed-1",
    name: "Movilización por Derechos Sociales",
    activityType: "marcha",
    scheduledAt: "2026-06-12T10:00:00.000Z",
    description: "Marcha ciudadana pacífica saliendo desde el Parque Nacional hacia la Plaza de Bolívar en Bogotá. Llevar carteles y camisetas blancas.",
    latitude: 4.59812,
    longitude: -74.07604,
    status: "approved",
    reportsCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "seed-2",
    name: "Festival de Arte y Tambores del Caribe",
    activityType: "cultural",
    scheduledAt: "2026-06-15T16:30:00.000Z",
    description: "Presentaciones folclóricas en vivo, rueda de cumbia y talleres gratuitos para niños y jóvenes en el Malecón del Río.",
    latitude: 11.01815,
    longitude: -74.79251,
    status: "approved",
    reportsCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "seed-3",
    name: "Siembra Colectiva - Bulevar del Río",
    activityType: "comunitaria",
    scheduledAt: "2026-06-14T08:00:00.000Z",
    description: "Jornada ciudadana de reforestación urbana y siembra de plantas ornamentales nativas. Patrocina colectivo ambiental de Cali.",
    latitude: 3.45415,
    longitude: -76.53601,
    status: "approved",
    reportsCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "seed-4",
    name: "Recogida de Juguetes y Útiles Escolares",
    activityType: "recogida",
    scheduledAt: "2026-06-10T09:00:00.000Z",
    description: "Punto de recolección de útiles escolares, cuadernos y juguetes didácticos para escuelas vulnerables de la comuna 13.",
    latitude: 6.27083,
    longitude: -75.56434,
    status: "approved",
    reportsCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "seed-5",
    name: "Feria del Libro Comunitario en San Pío",
    activityType: "cultural",
    scheduledAt: "2026-06-20T14:00:00.000Z",
    description: "Intercambio libre de libros, lectura de poesía de autores locales y micrófono abierto. ¡Trae tus libros para donar!",
    latitude: 7.11942,
    longitude: -73.11124,
    status: "approved",
    reportsCount: 0,
    createdAt: new Date().toISOString()
  }
];

function readDB(): CitizenEvent[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(seedEvents, null, 2));
      return seedEvents;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file", err);
    return seedEvents;
  }
}

function writeDB(data: CitizenEvent[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get all non-flagged events
  app.get("/api/events", async (req, res) => {
    try {
      const likes = readLikes();
      let changedLikes = false;

      // Try to read from Supabase first
      const { data, error } = await supabase
        .from("eventos_ciudadanos")
        .select("*")
        .neq("estado", "reported")
        .lt("conteo_reportes", 6)
        .order("creado_en", { ascending: false });

      if (error) {
        console.warn("[Supabase SDK] No se pudo obtener de Supabase (posiblemente la tabla aún no se ha creado con DATABASE_SCHEMA.sql). Usando base de datos JSON de respaldo.", error.message);
        const events = readDB();
        const visibleEvents = events.filter(e => e.status !== "reported" && e.reportsCount < 6).map(e => {
          if (likes[e.id] === undefined) {
            likes[e.id] = (e.name.length * 3) % 21 + 8;
            changedLikes = true;
          }
          const { activityType, description, externalUrl } = parseEventFields(e.activityType, e.description);
          return {
            ...e,
            activityType,
            description,
            externalUrl: externalUrl || e.externalUrl,
            likesCount: likes[e.id]
          };
        });

        if (changedLikes) {
          writeLikes(likes);
        }

        return res.json(visibleEvents);
      }

      // Map Supabase rows to CitizenEvent structure
      const mappedEvents: CitizenEvent[] = data.map((item: any) => {
        const id = item.id;
        if (likes[id] === undefined) {
          likes[id] = (item.nombre.length * 3) % 21 + 8;
          changedLikes = true;
        }

        const { activityType, description, externalUrl } = parseEventFields(item.tipo_actividad, item.descripcion);

        return {
          id: item.id,
          name: item.nombre,
          activityType,
          description,
          scheduledAt: item.fecha_hora,
          latitude: parseFloat(item.latitud),
          longitude: parseFloat(item.longitud),
          status: item.estado,
          reportsCount: item.conteo_reportes,
          createdAt: item.creado_en,
          likesCount: likes[id],
          externalUrl: externalUrl || undefined
        };
      });

      if (changedLikes) {
        writeLikes(likes);
      }

      res.json(mappedEvents);
    } catch (err) {
      console.error("[GetEvents Error] Error crítico, usando respaldo local:", err);
      try {
        const likes = readLikes();
        let changedLikes = false;
        const events = readDB();
        const visibleEvents = events.filter(e => e.status !== "reported" && e.reportsCount < 6).map(e => {
          if (likes[e.id] === undefined) {
            likes[e.id] = (e.name.length * 3) % 21 + 8;
            changedLikes = true;
          }
          const { activityType, description, externalUrl } = parseEventFields(e.activityType, e.description);
          return {
            ...e,
            activityType,
            description,
            externalUrl: externalUrl || e.externalUrl,
            likesCount: likes[e.id]
          };
        });

        if (changedLikes) {
          writeLikes(likes);
        }

        res.json(visibleEvents);
      } catch (backupErr) {
        res.status(500).json({ error: "No se pudieron obtener los eventos." });
      }
    }
  });

  // API Route: Create citizen event with strict rate limit and validation
  app.post("/api/events", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
      const now = Date.now();
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

      // Clean old timestamps for this IP past 2 hours
      if (!ipSubmissionLogs[ip]) {
        ipSubmissionLogs[ip] = [];
      }
      ipSubmissionLogs[ip] = ipSubmissionLogs[ip].filter(t => now - t < TWO_HOURS_MS);

      // Check Rate Limit (Maximum 5 pins in 2 hours)
      if (ipSubmissionLogs[ip].length >= 5) {
        return res.status(429).json({
          error: "Límite de seguridad alcanzado: Has creado el máximo de 5 pines permitidos en las últimas 2 horas para proteger la plataforma de spam."
        });
      }

      const { name, activityType, scheduledAt, description, latitude, longitude, externalUrl } = req.body;

      // Server-Side Field Validations
      if (!name || name.trim().length === 0 || name.length > 60) {
        return res.status(400).json({ error: "El nombre es obligatorio y debe tener máximo 60 caracteres." });
      }
      
      const mappedDbActivityType = CATEGORY_DB_MAPPING[activityType];
      if (!mappedDbActivityType) {
        return res.status(400).json({ error: "Tipo de actividad no válido." });
      }
      
      if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
        return res.status(400).json({ error: "La fecha y hora del evento no son válidas." });
      }
      if (!description || description.trim().length === 0 || description.length > 500) {
        return res.status(400).json({ error: "La descripción es obligatoria y debe tener máximo 500 caracteres." });
      }

      // Geo-Fencing Colombia Boundaries: Roughly Lat [-4.5, 13.5], Lng [-79.5, -66.8]
      const isValidLat = latitude >= -4.5 && latitude <= 13.5;
      const isValidLng = longitude >= -79.5 && longitude <= -66.8;
      if (!latitude || !longitude || !isValidLat || !isValidLng) {
        return res.status(400).json({ error: "La ubicación seleccionada debe encontrarse dentro del territorio de Colombia." });
      }

      // If it's a custom category key, store with tag suffix in description
      const needsTag = !["marcha", "cultural", "comunitaria", "recogida"].includes(activityType);
      let dbDescription = needsTag ? `${description.trim()} [T:${activityType}]` : description.trim();
      if (externalUrl && externalUrl.trim()) {
        dbDescription = `${dbDescription} [URL:${externalUrl.trim()}]`;
      }

      // Try inserting into Supabase
      const insertPayload = {
        nombre: name.trim(),
        tipo_actividad: mappedDbActivityType,
        descripcion: dbDescription,
        fecha_hora: new Date(scheduledAt).toISOString(),
        latitud: parseFloat(latitude),
        longitud: parseFloat(longitude),
        ip_creador: ip.includes(':') ? '127.0.0.1' : ip, // Standard valid IP for INET column
        estado: 'approved',
        conteo_reportes: 0,
        creado_en: new Date().toISOString()
      };

      let createdEvent: CitizenEvent;

      try {
        const { data, error } = await supabase
          .from("eventos_ciudadanos")
          .insert([insertPayload])
          .select();

        if (error) {
          throw new Error(error.message);
        }

        if (data && data[0]) {
          const item = data[0];
          const parsed = parseEventFields(item.tipo_actividad, item.descripcion);
          createdEvent = {
            id: item.id,
            name: item.nombre,
            activityType: parsed.activityType,
            description: parsed.description,
            scheduledAt: item.fecha_hora,
            latitude: parseFloat(item.latitud),
            longitude: parseFloat(item.longitud),
            status: item.estado,
            reportsCount: item.conteo_reportes,
            createdAt: item.creado_en,
            externalUrl: parsed.externalUrl || undefined
          };
          console.log("[Supabase] Evento guardado con éxito:", createdEvent.id);
        } else {
          throw new Error("No data returned from insert");
        }
      } catch (supabaseError: any) {
        console.warn("[Supabase Store Error] Redireccionando a persistencia local JSON:", supabaseError.message || supabaseError);
        // Fallback local persistence
        const db = readDB();
        const localEvent: CitizenEvent = {
          id: `event-${now}-${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          activityType,
          scheduledAt,
          description: description.trim(),
          latitude,
          longitude,
          status: "approved",
          reportsCount: 0,
          createdAt: new Date().toISOString(),
          externalUrl: externalUrl && externalUrl.trim() ? externalUrl.trim() : undefined
        };
        db.push(localEvent);
        writeDB(db);
        createdEvent = localEvent;
      }

      // Record successful post for rate limiting
      ipSubmissionLogs[ip].push(now);

      res.status(201).json({
        success: true,
        message: "¡Evento agregado exitosamente en el mapa!",
        event: createdEvent,
        remainingPins: 5 - ipSubmissionLogs[ip].length
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ocurrió un error en el servidor al intentar registrar el punto." });
    }
  });

  // API Route: Report/Flag an event to combat spam
  app.post("/api/events/:id/report", async (req, res) => {
    try {
      const { id } = req.params;
      const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();

      // Check IP reports logging to prevent single-person spamming
      const reportsIpMap = readReportsIP();
      if (!reportsIpMap[id]) {
        reportsIpMap[id] = [];
      }

      if (reportsIpMap[id].includes(ip)) {
        return res.status(400).json({ 
          error: "Ya registraste un reporte para esta publicación. Para proteger la libre expresión, solo se permite un reporte por persona/dispositivo." 
        });
      }

      // Save IP report state
      reportsIpMap[id].push(ip);
      writeReportsIP(reportsIpMap);

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUUID) {
        try {
          const { data, error } = await supabase
            .from("eventos_ciudadanos")
            .select("id, conteo_reportes")
            .eq("id", id)
            .single();

          if (!error && data) {
            const nextCount = (data.conteo_reportes || 0) + 1;
            const nextStatus = nextCount >= 6 ? 'reported' : 'approved';

            const { error: updateError } = await supabase
              .from("eventos_ciudadanos")
              .update({
                conteo_reportes: nextCount,
                estado: nextStatus
              })
              .eq("id", id);

            if (!updateError) {
              return res.json({
                success: true,
                message: "El evento ha sido reportado exitosamente. Revisaremos el contenido inmediatamente.",
                reportsCount: nextCount
              });
            }
          }
        } catch (supabaseReportErr) {
          console.warn("[Supabase Report Error] Intentando reporte local:", supabaseReportErr);
        }
      }

      // Fallback to local report
      const db = readDB();
      const eventIndex = db.findIndex(e => e.id === id);

      if (eventIndex === -1) {
        return res.status(404).json({ error: "Evento no encontrado." });
      }

      // Increment reports
      db[eventIndex].reportsCount += 1;
      if (db[eventIndex].reportsCount >= 6) {
        db[eventIndex].status = "reported"; // Auto hide after 6 distinct reports
      }

      writeDB(db);

      res.json({
        success: true,
        message: "El evento ha sido reportado exitosamente. Revisaremos el contenido inmediatamente.",
        reportsCount: db[eventIndex].reportsCount
      });
    } catch (err) {
      res.status(500).json({ error: "Error al registrar el reporte." });
    }
  });

  // API Route: Like an event to support community approval
  app.post("/api/events/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const likes = readLikes();
      if (likes[id] === undefined) {
        likes[id] = 10;
      }
      likes[id] += 1;
      writeLikes(likes);

      res.json({
        success: true,
        message: "¡Me gusta registrado!",
        likesCount: likes[id]
      });
    } catch (err) {
      res.status(500).json({ error: "Error al registrar el Me gusta." });
    }
  });

  // API Route: Get ALL events (including reported ones) for administration
  app.get("/api/admin/events", async (req, res) => {
    try {
      const likes = readLikes();
      let changedLikes = false;

      // Try to read from Supabase first
      const { data, error } = await supabase
        .from("eventos_ciudadanos")
        .select("*")
        .lt("conteo_reportes", 9999)
        .order("creado_en", { ascending: false });

      if (error) {
        console.warn("[Supabase Admin SDK] Fallback to JSON", error.message);
        const events = readDB().filter(e => e.reportsCount < 9999).map(e => {
          if (likes[e.id] === undefined) {
            likes[e.id] = (e.name.length * 3) % 21 + 8;
            changedLikes = true;
          }
          const { activityType, description, externalUrl } = parseEventFields(e.activityType, e.description);
          return {
            ...e,
            activityType,
            description,
            externalUrl: externalUrl || e.externalUrl,
            likesCount: likes[e.id]
          };
        });
        if (changedLikes) {
          writeLikes(likes);
        }
        return res.json(events);
      }

      const mappedEvents: CitizenEvent[] = data.map((item: any) => {
        const id = item.id;
        if (likes[id] === undefined) {
          likes[id] = (item.nombre.length * 3) % 21 + 8;
          changedLikes = true;
        }

        const { activityType, description, externalUrl } = parseEventFields(item.tipo_actividad, item.descripcion);

        return {
          id: item.id,
          name: item.nombre,
          activityType,
          description,
          scheduledAt: item.fecha_hora,
          latitude: parseFloat(item.latitud),
          longitude: parseFloat(item.longitud),
          status: item.estado,
          reportsCount: item.conteo_reportes,
          createdAt: item.creado_en,
          likesCount: likes[id],
          externalUrl: externalUrl || undefined
        };
      });

      if (changedLikes) {
        writeLikes(likes);
      }
      res.json(mappedEvents);
    } catch (err) {
      console.error("[GetAdminEvents Error] Fallback to local DB:", err);
      try {
        const likes = readLikes();
        let changedLikes = false;
        const events = readDB().filter(e => e.reportsCount < 9999).map(e => {
          if (likes[e.id] === undefined) {
            likes[e.id] = (e.name.length * 3) % 21 + 8;
            changedLikes = true;
          }
          const { activityType, description, externalUrl } = parseEventFields(e.activityType, e.description);
          return {
            ...e,
            activityType,
            description,
            externalUrl: externalUrl || e.externalUrl,
            likesCount: likes[e.id]
          };
        });
        if (changedLikes) {
          writeLikes(likes);
        }
        res.json(events);
      } catch (backupErr) {
        res.status(500).json({ error: "No se pudieron obtener los eventos de administración." });
      }
    }
  });

  // API Route: Republish a reported event (resets reports count to 0 and state to approved)
  app.post("/api/admin/events/:id/republish", async (req, res) => {
    try {
      const { id } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let supabaseSuccess = false;

      if (isUUID) {
        // Try Supabase first
        try {
          const { error } = await supabase
            .from("eventos_ciudadanos")
            .update({
              conteo_reportes: 0,
              estado: 'approved'
            })
            .eq("id", id);

          if (!error) {
            supabaseSuccess = true;
          }
        } catch (supabaseErr) {
          console.warn("[republish] Supabase error:", supabaseErr);
        }
      }

      // Also apply local update
      const db = readDB();
      const eventIndex = db.findIndex(e => e.id === id);
      let localSuccess = false;
      if (eventIndex !== -1) {
        db[eventIndex].reportsCount = 0;
        db[eventIndex].status = 'approved';
        writeDB(db);
        localSuccess = true;
      }

      if (supabaseSuccess || localSuccess) {
        return res.json({ 
          success: true, 
          message: "Evento republicado exitosamente.",
          republishedSupabase: supabaseSuccess,
          republishedLocal: localSuccess
        });
      }

      res.status(404).json({ error: "Evento no encontrado." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error de servidor al republicar." });
    }
  });

  // API Route: Permanently delete an event
  app.post("/api/admin/events/:id/delete", async (req, res) => {
    try {
      const { id } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let supabaseSuccess = false;

      if (isUUID) {
        // Try Supabase first using public UPDATE to bypass DELETE RLS denial
        try {
          const { error } = await supabase
            .from("eventos_ciudadanos")
            .update({
              conteo_reportes: 9999,
              estado: 'reported'
            })
            .eq("id", id);

          if (!error) {
            supabaseSuccess = true;
          }
        } catch (supabaseErr) {
          console.warn("[delete] Supabase soft-delete error:", supabaseErr);
        }
      }

      // Also apply local delete
      let db = readDB();
      const initialLength = db.length;
      const eventIndex = db.findIndex(e => e.id === id);
      let localSuccess = false;
      if (eventIndex !== -1) {
        // Filter out or flag
        db[eventIndex].reportsCount = 9999;
        db[eventIndex].status = 'reported';
        writeDB(db);
        localSuccess = true;
      } else {
        // In case it's stored directly locally with a legacy string pattern
        const originalLength = db.length;
        db = db.filter(e => e.id !== id);
        if (db.length < originalLength) {
          writeDB(db);
          localSuccess = true;
        }
      }

      if (supabaseSuccess || localSuccess) {
        return res.json({ 
          success: true, 
          message: "Evento eliminado permanentemente.",
          deletedSupabase: supabaseSuccess,
          deletedLocal: localSuccess
        });
      }

      res.status(404).json({ error: "Evento no encontrado en el mapa ni en la base de datos." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error de servidor al eliminar." });
    }
  });

  // Support developmental hot-rebuilding / routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Server] running at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
