/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Filter, 
  AlertTriangle, 
  Menu, 
  X, 
  ChevronRight, 
  Info, 
  CheckCircle, 
  Compass, 
  HeartHandshake, 
  Target,
  ShieldAlert,
  Database,
  Share2,
  Facebook,
  Instagram,
  ExternalLink
} from 'lucide-react';
import { CitizenEvent, ActivityType } from './types';

// Category definitions customized for the Campaign "Me la juego por la vida"
const getCategoryDetails = (type: ActivityType) => {
  switch (type) {
    case 'recorrido':
      return {
        label: 'Recorrido',
        color: '#FF4500', // Naranja Intenso
        bgClass: 'bg-[#FF4500] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#FF4500]',
        description: 'Caminatas, recorridos territoriales y marchas activas por la vida.'
      };
    case 'grafica_visual':
      return {
        label: 'Gráfica y visual',
        color: '#DC2626', // Carmesí / Rojo
        bgClass: 'bg-[#DC2626] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#DC2626]',
        description: 'Pintura mural, afiches, esténcil, pancartas y expresión artística.'
      };
    case 'reunion':
      return {
        label: 'Reunión',
        color: '#D97706', // Amarillo Ámbar / Mostaza
        bgClass: 'bg-[#D97706] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#D97706]',
        description: 'Asambleas de base, tertulias, diálogos locales y encuentros organizativos.'
      };
    case 'cultural_evento':
      return {
        label: 'Evento cultural',
        color: '#10B981', // Verde Esmeralda
        bgClass: 'bg-[#10B981] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#10B981]',
        description: 'Festivales, conciertos, obras de teatro, lectura y actos artísticos.'
      };
    case 'olla_comunitaria':
      return {
        label: 'Olla comunitaria',
        color: '#8B5CF6', // Morado Eléctrico
        bgClass: 'bg-[#8B5CF6] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#8B5CF6]',
        description: 'Cocina popular solidaria, ollas colectivas e integración comunitaria.'
      };
    case 'marcha':
      return {
        label: 'Marchas y Movilizaciones',
        color: '#FF4500', // Naranja Intenso
        bgClass: 'bg-[#FF4500] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#FF4500]',
        description: 'Concentraciones y marchas pacíficas ciudadanas en espacio público.'
      };
    case 'cultural':
      return {
        label: 'Conciertos y Eventos Culturales',
        color: '#FFB800', // Amarillo Mostaza
        bgClass: 'bg-[#FFB800] text-[#1E3A8A] border-2 border-[#1E3A8A]',
        textClass: 'text-[#FFB800]',
        description: 'Conciertos, exposiciones, tertulias y arte callejero comunitario.'
      };
    case 'comunitaria':
      return {
        label: 'Pedagogía y Organización',
        color: '#1A42CA', // Azul Real Eléctrico
        bgClass: 'bg-[#1A42CA] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#1A42CA]',
        description: 'Asambleas de base, foros ciudadanos y pedagogía territorial.'
      };
    case 'recogida':
      return {
        label: 'Puntos de Recogida de Material',
        color: '#1A42CA', // Azul Real Eléctrico
        bgClass: 'bg-[#1A42CA] text-white border-2 border-[#1E3A8A]',
        textClass: 'text-[#1A42CA]',
        description: 'Puntos de acopio, entrega de material de campaña o firmas.'
      };
  }
};

const ActivityLinkPreview: React.FC<{ url?: string; activityType: ActivityType; name: string }> = ({ url, activityType, name }) => {
  if (!url) return null;

  const isInstagram = url.toLowerCase().includes('instagram.com') || url.toLowerCase().includes('instagr.am');
  const isFacebook = url.toLowerCase().includes('facebook.com') || url.toLowerCase().includes('fb.watch') || url.toLowerCase().includes('fb.com');

  // Elegant visual representations based on category type
  const getImagePlaceholder = () => {
    switch (activityType) {
      case 'recorrido':
        return 'https://images.unsplash.com/photo-1551632811-561730d1e4a6?auto=format&fit=crop&w=400&q=80'; // hiking / group walking
      case 'grafica_visual':
        return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80'; // art / painting / stencil
      case 'reunion':
        return 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80'; // meeting / community asamblea
      case 'cultural_evento':
        return 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80'; // concert / culture
      case 'olla_comunitaria':
        return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80'; // kitchen / cooking pot
      case 'marcha':
        return 'https://images.unsplash.com/photo-1571210862729-78a53d3936a9?auto=format&fit=crop&w=400&q=80'; // peaceful manifestation
      case 'cultural':
        return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80'; // cultural theater
      case 'comunitaria':
        return 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400&q=80'; // assembly education
      case 'recogida':
        return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80'; // material supply
      default:
        return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=400&q=80';
    }
  };

  const imageSrc = getImagePlaceholder();

  if (isInstagram) {
    return (
      <div className="border border-[#1E3A8A]/35 bg-gradient-to-tr from-[#fdf497] via-[#fdf497] to-[#d6249f] p-0.5 mt-3 shadow-md">
        <div className="bg-white p-3 font-sans space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#fdd017] via-[#e2062c] to-[#9b26b6] flex items-center justify-center shrink-0">
              <Instagram className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#1E3A8A] tracking-wider">Publicación de Instagram</span>
          </div>
          <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border border-slate-200">
            <img src={imageSrc} referrerPolicy="no-referrer" alt={name} className="w-full h-full object-cover filter brightness-95" />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-none uppercase">
              PRECARGA VISTA
            </div>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 block text-center text-[9.5px] font-black uppercase bg-gradient-to-r from-[#8a3ab9] to-[#e95950] text-white border border-[#1E3A8A] transition hover:brightness-105 active:translate-x-[0.5px] active:translate-y-[0.5px]"
          >
            ABRIR EN INSTAGRAM ↗
          </a>
        </div>
      </div>
    );
  }

  if (isFacebook) {
    return (
      <div className="border border-[#1E3A8A]/35 bg-[#1877F2]/15 p-0.5 mt-3 shadow-md">
        <div className="bg-white p-3 font-sans space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
              <Facebook className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#1E3A8A] tracking-wider">Publicación de Facebook</span>
          </div>
          <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border border-slate-200">
            <img src={imageSrc} referrerPolicy="no-referrer" alt={name} className="w-full h-full object-cover filter brightness-95" />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-none uppercase">
              PRECARGA VISTA
            </div>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 block text-center text-[9.5px] font-black uppercase bg-[#1877F2] text-white border border-[#1E3A8A] transition hover:brightness-105 active:translate-x-[0.5px] active:translate-y-[0.5px]"
          >
            ABRIR EN FACEBOOK ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#1E3A8A] bg-slate-50 p-2.5 mt-3 shadow-[1.5px_1.5px_0px_#1E3A8A] flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-none bg-emerald-50 border border-[#1E3A8A]/40 flex items-center justify-center">
          <ExternalLink className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-left">
          <span className="block text-[8.5px] font-black text-[#1E3A8A]/60 uppercase tracking-widest leading-none mb-1">ENLACE OFICIAL</span>
          <span className="block text-[10px] font-bold text-[#1E3A8A] truncate max-w-[130px]">{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
        </div>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="py-1 px-3 bg-white hover:bg-[#1E3A8A]/5 text-[#1E3A8A] font-black text-[9px] uppercase border border-[#1E3A8A] shrink-0 inline-block text-center transition"
      >
        VISITAR ↗
      </a>
    </div>
  );
};

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Core App States
  const [events, setEvents] = useState<CitizenEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CitizenEvent | null>(null);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);
  
  // Track which events have been reported by this client
  const [reportedEventIds, setReportedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('reported_event_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Custom Secret Admin Mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const [adminInputCode, setAdminInputCode] = useState('');
  const [adminEvents, setAdminEvents] = useState<CitizenEvent[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sidebar and UI states
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'admin'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Form input capture variables (without rounded styling placeholders)
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ActivityType>('recorrido');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);

  // Synchronous global callback for the "Usar para evento" button in user location popup
  useEffect(() => {
    (window as any).__useMyLocationForEvent = (lat: number, lng: number) => {
      setFormLat(lat);
      setFormLng(lng);
      setActiveTab('create');
      setIsSidebarOpen(true);

      // Copy to temp marker as well
      if (mapRef.current) {
        const map = mapRef.current;
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
        }
        const tempIcon = L.divIcon({
          className: 'temp-marker-pulse',
          html: `
            <div class="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              <div class="absolute w-8 h-8 rounded-full bg-[#FF4500] opacity-35 animate-ping"></div>
              <div class="relative w-4 h-4 bg-[#FFB800] border-2 border-[#1E3A8A] rotate-45 shadow-md"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
        map.panTo([lat, lng]);
      }

      setGlobalSuccess('UBICACIÓN SELECCIONADA: Se han configurado tus coordenadas para un nuevo punto de acopio, marcha o evento.');
      setTimeout(() => setGlobalSuccess(null), 4000);

      // Close all popups
      if (mapRef.current) {
        mapRef.current.closePopup();
      }
    };

    return () => {
      delete (window as any).__useMyLocationForEvent;
    };
  }, []);

  // Instantly invalidate size of Map on sidebar toggle to prevent gray empty spaces and redraw viewport tiles
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Invalidate immediately so Leaflet begins adapting
    mapRef.current.invalidateSize();

    // Invalidate again at stages of the sliding transition (0.25s / 250ms tween)
    const timer1 = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 260);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isSidebarOpen]);

  // Geolocation trigger handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGlobalError('La geolocalización no está soportada por su navegador.');
      setTimeout(() => setGlobalError(null), 5000);
      return;
    }

    if (!mapRef.current) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const map = mapRef.current!;

        // Center map on user location
        map.setView([latitude, longitude], 14);

        // Remove previous user marker if exists
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Drop user location marker designed with campaign high-contrast style
        const userIcon = L.divIcon({
          className: 'user-marker-pulse',
          html: `
            <div class="relative w-10 h-10 flex items-center justify-center pointer-events-auto">
              <div class="absolute w-10 h-10 rounded-full bg-[#1A42CA] opacity-35 animate-ping"></div>
              <div class="relative w-8 h-8 rounded-full border-3 border-[#1E3A8A] bg-[#FFB800] text-[#1E3A8A] flex items-center justify-center shadow-lg">
                <svg class="w-4.5 h-4.5 fill-current text-[#1E3A8A]" viewBox="0 0 24 24">
                  <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const newUserMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        newUserMarker.bindPopup(`
          <div class="font-sans text-[#1E3A8A] bg-[#FAF9F6] p-3 text-center border-none w-[180px]">
            <div class="text-[10px] font-black uppercase text-[#1A42CA] tracking-wider mb-1">Tu ubicación</div>
            <p class="text-[11px] font-medium leading-tight mb-2">Te encuentras en este punto del territorio.</p>
            <button onclick="window.__useMyLocationForEvent(${latitude}, ${longitude})" class="w-full py-1 bg-[#FF4500] hover:bg-[#1A42CA] text-white border-2 border-[#1E3A8A] text-[9px] font-black uppercase tracking-wider rounded-none cursor-pointer transition">
              ¡USAR PARA EVENTO!
            </button>
          </div>
        `, { closeButton: false });

        newUserMarker.openPopup();

        userMarkerRef.current = newUserMarker;

        // Check if in Colombiabounds coordinates [-4.5, 13.5] & [-79.5, -66.8]
        const isInColombia = latitude >= -4.5 && latitude <= 13.5 && longitude >= -79.5 && longitude <= -66.8;
        if (!isInColombia) {
          setGlobalError('Se ubicó tu posición, pero se encuentra fuera de la cobertura geográfica de Colombia.');
          setTimeout(() => setGlobalError(null), 6000);
        } else {
          setGlobalSuccess('SISTEMA GPS: Te hemos ubicado con éxito en el mapa.');
          setTimeout(() => setGlobalSuccess(null), 4000);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error(error);
        setGlobalError(`ERROR GPS: No logramos acceder a su ubicación (${error.message}). Por favor verifique los permisos.`);
        setTimeout(() => setGlobalError(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fetch active points from express server database API
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('No se lograron jalar los eventos ciudadanos.');
      }
      const data: CitizenEvent[] = await response.json();
      setEvents(data);
    } catch (err: any) {
      setGlobalError(err.message || 'Error de sincronización con el servidor central.');
    }
  };

  // Setup Colombia coordinate maps
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered on Colombia geography (Lat: 4.5709, Lng: -74.2973)
    const initialViewCoords: L.LatLngExpression = [4.5709, -74.2973];
    const mapZoomScale = 6;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      doubleClickZoom: false // Disable double click zooming to support native pin dropping on dblclick
    }).setView(initialViewCoords, mapZoomScale);

    mapRef.current = map;

    // TileLayer - CartoDB Positron focuses high-contrast focus on our crimson/navy pins
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    // Zoom buttons with sharp brutalist borders
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create high-fidelity campaign clustering for tight markers
    const markersGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div class="relative w-10 h-10 flex items-center justify-center">
              <div class="absolute w-10 h-10 rounded-full bg-[#FF4500] opacity-30 animate-pulse"></div>
              <div class="relative w-8 h-8 rounded-full border-3 border-[#1E3A8A] bg-[#1A42CA] text-white font-black text-xs flex items-center justify-center shadow-[3px_3px_0px_rgba(30,58,138,0.35)] transform transition-transform hover:scale-110">
                ${count}
              </div>
            </div>
          `,
          className: 'custom-campaign-cluster',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
      }
    }).addTo(map);
    markersGroupRef.current = markersGroup;

    // Double Click map to drop temporary location pin
    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Colombia Boundary Geo-fencing coordinates
      const isInColombia = lat >= -4.5 && lat <= 13.5 && lng >= -79.5 && lng <= -66.8;
      
      if (!isInColombia) {
        setGlobalError('La zona seleccionada se encuentra fuera de los límites de Colombia.');
        setTimeout(() => setGlobalError(null), 5000);
        return;
      }

      setFormLat(lat);
      setFormLng(lng);
      setActiveTab('create');
      setIsSidebarOpen(true);
      
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      // Temporary marker icon designed with campaign high contrast
      const tempIcon = L.divIcon({
        className: 'temp-marker-pulse',
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center pointer-events-none">
            <div class="absolute w-8 h-8 rounded-full bg-[#FF4500] opacity-35 animate-ping"></div>
            <div class="relative w-4 h-4 bg-[#FFB800] border-2 border-[#1E3A8A] rotate-45 shadow-md"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const newTempMarker = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
      tempMarkerRef.current = newTempMarker;
      
      map.panTo([lat, lng]);
    });

    fetchEvents();

    return () => {
      map.remove();
    };
  }, []);

  // Update registered pin markers
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const renderList = events.filter(e => filterType === 'all' || e.activityType === filterType);

    renderList.forEach(event => {
      const detail = getCategoryDetails(event.activityType);
      const isPast = new Date(event.scheduledAt).getTime() < Date.now();
      const markerColor = isPast ? '#64748B' : detail.color; // Muted grey if past
      
      // Marker layout designed to reflect Campaign core guidelines:
      // Perfect circle with border Azul Real (#1E3A8A), center Amarillo/Naranja/Gris, enclosing the 8-pointed star.
      const customIcon = L.divIcon({
        className: 'custom-animated-pin',
        html: `
          <div class="relative w-9 h-9 flex items-center justify-center cursor-pointer group">
            <div class="absolute w-9 h-9 rounded-full opacity-35" style="background-color: ${markerColor}; ${isPast ? '' : 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;'}"></div>
            <div class="relative w-7 h-7 rounded-full border-3 border-[#1E3A8A] flex items-center justify-center shadow-[3px_3px_0px_rgba(30,58,138,0.35)] transform transition-all group-hover:scale-125" style="background-color: ${markerColor}">
              <!-- 8-pointed star of the campaign -->
              <svg class="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      const dateStr = new Date(event.scheduledAt).toLocaleDateString('es-CO', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = new Date(event.scheduledAt).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const getPopupImagePlaceholder = (type: string) => {
        switch (type) {
          case 'recorrido': return 'https://images.unsplash.com/photo-1551632811-561730d1e4a6?auto=format&fit=crop&w=400&q=80';
          case 'grafica_visual': return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80';
          case 'reunion': return 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80';
          case 'cultural_evento': return 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80';
          case 'olla_comunitaria': return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80';
          case 'marcha': return 'https://images.unsplash.com/photo-1571210862729-78a53d3936a9?auto=format&fit=crop&w=400&q=80';
          case 'cultural': return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80';
          case 'comunitaria': return 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400&q=80';
          case 'recogida': return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80';
          default: return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=400&q=80';
        }
      };

      let linkPreviewHTML = '';
      if (event.externalUrl) {
        const urlLower = event.externalUrl.toLowerCase();
        const isInsta = urlLower.includes('instagram.com') || urlLower.includes('instagr.am');
        const isFace = urlLower.includes('facebook.com') || urlLower.includes('fb.watch') || urlLower.includes('fb.com');
        const imgUrl = getPopupImagePlaceholder(event.activityType);

        if (isInsta) {
          linkPreviewHTML = `
            <div class="border border-[#1E3A8A]/35 bg-gradient-to-tr from-[#fdf497] via-[#fdf497] to-[#d6249f] p-[2px] mt-2.5" style="border: 1px solid rgba(30, 58, 138, 0.35); padding: 2px; margin-top: 10px;">
              <div class="bg-white p-2.5 space-y-1.5 text-left" style="background-color: white; padding: 10px;">
                <div class="flex items-center gap-1.5 border-b border-slate-100 pb-1.5" style="display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 6px;">
                  <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-2 inline-block text-[#1E3A8A]" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span class="text-[9px]" style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #1E3A8A; letter-spacing: 0.05em; line-height: 1;">POST DE INSTAGRAM</span>
                </div>
                <div class="relative overflow-hidden" style="position: relative; height: 90px; width: 100%; border: 1px solid #e2e8f0; background-color: #f1f5f9; overflow: hidden; margin-bottom: 6px;">
                  <img src="${imgUrl}" alt="Instagram Preview" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <a 
                  href="${event.externalUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="display: block; width: 100%; text-align: center; font-size: 8.5px; font-weight: 900; text-transform: uppercase; padding: 6px 10px; background: linear-gradient(135deg, #8a3ab9, #e95950); color: white; border: 1px solid #1E3A8A; text-decoration: none !important;"
                >
                  ABRIR EN INSTAGRAM ↗
                </a>
              </div>
            </div>
          `;
        } else if (isFace) {
          linkPreviewHTML = `
            <div class="border border-[#1E3A8A]/35 bg-[#1877F2]/15 p-[2px] mt-2.5" style="border: 1px solid rgba(30, 58, 138, 0.35); background-color: rgba(24, 119, 242, 0.15); padding: 2px; margin-top: 10px;">
              <div class="bg-white p-2.5 space-y-1.5 text-left" style="background-color: white; padding: 10px;">
                <div class="flex items-center gap-1.5 border-b border-slate-100 pb-1.5" style="display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 6px;">
                  <svg class="w-3.5 h-3.5 fill-current inline-block text-[#1E3A8A]" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  <span class="text-[9px]" style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #1E3A8A; letter-spacing: 0.05em; line-height: 1;">POST DE FACEBOOK</span>
                </div>
                <div class="relative overflow-hidden" style="position: relative; height: 90px; width: 100%; border: 1px solid #e2e8f0; background-color: #f1f5f9; overflow: hidden; margin-bottom: 6px;">
                  <img src="${imgUrl}" alt="Facebook Preview" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <a 
                  href="${event.externalUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="display: block; width: 100%; text-align: center; font-size: 8.5px; font-weight: 900; text-transform: uppercase; padding: 6px 10px; background-color: #1877F2; color: white; border: 1px solid #1E3A8A; text-decoration: none !important;"
                >
                  ABRIR EN FACEBOOK ↗
                </a>
              </div>
            </div>
          `;
        } else {
          linkPreviewHTML = `
            <div class="border border-[#1E3A8A] bg-slate-50 p-2 mt-2.5" style="border: 1px solid #1E3A8A; background-color: #f8fafc; padding: 8px; margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 6px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; max-width: 130px;">
                <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-2 inline-block text-[#1E3A8A]" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <span style="display: block; font-size: 7.5px; font-weight: 900; color: #1E3A8A; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1;">WEB</span>
                  <span style="display: block; font-size: 8.5px; font-weight: 700; color: #1E3A8A; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${event.externalUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </div>
              </div>
              <a 
                href="${event.externalUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="display: inline-block; font-size: 8px; font-weight: 900; text-transform: uppercase; padding: 4px 8px; background-color: white; color: #1E3A8A; border: 1px solid #1E3A8A; text-decoration: none !important;"
              >
                VER ↗
              </a>
            </div>
          `;
        }
      }

      // Emulate high-contrast campaign popups: Solid Royal Blue (#1A42CA) or Slate (#64748B) header if past,
      // cream soft background body with integrated candidate category color star, and Naranja Intenso signature closure.
      const popupHTML = `
        <div class="font-sans text-[#1E3A8A] bg-[#FAF9F6] w-[260px] border-none overflow-hidden relative">
          
          <!-- Cabecera Azul Real Sólido / Gris de evento finalizado -->
          <div class="px-4 py-3 text-white flex flex-col relative overflow-hidden" style="background-color: ${isPast ? '#475569' : '#1A42CA'}">
            <!-- Background star pattern -->
            <div class="absolute right-2 top-2 opacity-20 text-[#FFB800]">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
              </svg>
            </div>
            
            <span class="inline-block text-[8px] font-black uppercase tracking-wider text-[#FFB800] mb-0.5">
              ${isPast ? 'FINALIZADO — ' : ''}${detail.label.toUpperCase()}
            </span>
            <h3 class="text-xs font-black uppercase leading-tight tracking-tight text-white pr-6">
              ${event.name}
            </h3>
          </div>
          
          <!-- Cuerpo Crema Suave -->
          <div class="p-3.5 space-y-3">
            
            <!-- Integración Isotipo Circular del Candidato y Fecha/Hora Geométrica -->
            <div class="flex items-center gap-3 bg-white p-2 border border-[#1E3A8A]/10 shadow-sm">
              <!-- Estrella de Categoría en Color de Categoría -->
              <div class="relative w-10 h-10 flex items-center justify-center shrink-0 border-2 border-[#1E3A8A]" style="background-color: ${detail.color};">
                <svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
                </svg>
              </div>
 
              <!-- Fecha y Hora Geométrica -->
              <div class="space-y-0.5 text-[10.5px] font-mono text-[#1E3A8A] font-extrabold uppercase">
                <div class="flex items-center gap-1">
                  <span class="text-[8px] opacity-65 font-black">DIA:</span> <span class="capitalize">${dateStr}</span>
                </div>
                <div class="flex items-center gap-1 text-[#FF4500]">
                  <span class="text-[8px] opacity-65 font-black">HORA:</span> <span>${timeStr} HS</span>
                </div>
              </div>
            </div>
 
            <!-- Descripción Detallada -->
            <p class="text-[11px] leading-relaxed text-[#1E3A8A]/90 p-2.5 bg-white border-l-3 font-semibold italic" style="border-left-color: ${detail.color};">
              "${event.description}"
            </p>

            <!-- Previsualización de Enlace Opcional -->
            ${linkPreviewHTML}
 
            <!-- Cierre: Eslogan "Me la juego por la vida" -->
            <div class="pt-2 border-t border-[#1E3A8A]/15 text-center flex flex-col gap-2">
              <span class="inline-block text-[10.5px] font-black uppercase tracking-wider text-[#FF4500]">
                ★ ME LA JUEGO POR LA VIDA ★
              </span>
              
              <!-- Grid con botón de Apoyar y Compartir (Sin Emojis) -->
              <div class="grid grid-cols-2 gap-2">
                <!-- Likes Counter Support Button -->
                <button id="like-popup-btn-${event.id}" class="py-1.5 flex items-center justify-center gap-1 bg-[#FF4500] hover:bg-[#D03800] text-white font-black text-[9.5px] uppercase tracking-wide border-2 border-[#1E3A8A] shadow-[2px_2px_0px_#1E3A8A] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition">
                  <svg class="w-3 h-3 fill-current inline-block text-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <span class="text-white font-black">${event.likesCount || 0}</span> APOYAR
                </button>

                <!-- Share Button -->
                <button id="share-popup-btn-${event.id}" class="py-1.5 flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-[#1E3A8A] font-black text-[9.5px] uppercase tracking-wide border-2 border-[#1E3A8A] shadow-[2px_2px_0px_#1E3A8A] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition">
                  <svg class="w-3 h-3 fill-none stroke-current stroke-2 inline-block text-[#1E3A8A]" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13"/></svg>
                  COMPARTIR
                </button>
              </div>
            </div>
 
            <!-- Botón Moderación / Reportar Content (Sutil) -->
            <div class="text-center pt-2.5">
              <button id="report-popup-btn-${event.id}" class="text-[8.5px] font-black tracking-wide uppercase ${reportedEventIds.includes(event.id) ? 'text-orange-600 font-bold cursor-not-allowed' : 'text-slate-400 hover:text-red-600 underline cursor-pointer'} bg-transparent border-none transition" ${reportedEventIds.includes(event.id) ? 'disabled' : ''}>
                ${reportedEventIds.includes(event.id) ? '¡YA REPORTADO POR TI!' : `Reportar sospecha de spam (${event.reportsCount || 0}/6 reportes)`}
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHTML, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        setSelectedEvent(event);
        setIsSidebarOpen(true);

        setTimeout(() => {
          const reportBtn = document.getElementById(`report-popup-btn-${event.id}`);
          if (reportBtn) {
            reportBtn.onclick = (e) => {
              e.stopPropagation();
              if (reportedEventIds.includes(event.id)) return;
              handleReportEvent(event.id);
              marker.closePopup();
            };
          }

          const likeBtn = document.getElementById(`like-popup-btn-${event.id}`);
          if (likeBtn) {
            likeBtn.onclick = (e) => {
              e.stopPropagation();
              // Optimistically update inside popup
              const textSpan = likeBtn.querySelector('span');
              if (textSpan) {
                const cur = parseInt(textSpan.innerText, 10) || 0;
                textSpan.innerText = String(cur + 1);
              }
              handleLikeEvent(event.id);
            };
          }

          const shareBtn = document.getElementById(`share-popup-btn-${event.id}`);
          if (shareBtn) {
            shareBtn.onclick = (e) => {
              e.stopPropagation();
              handleShareEvent(event);
            };
          }
        }, 100);
      });

      marker.addTo(markersGroup);
    });
  }, [events, filterType]);

  // Form submit point registration
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLat || !formLng) {
      setGlobalError('COORDENADAS FALTANTES: Haz doble clic en el mapa de Colombia para fijar el pin de ubicación.');
      return;
    }

    if (!formName.trim()) {
      setGlobalError('CAMPO VACÍO: Especifica el nombre o iniciativa civil.');
      return;
    }

    if (!formDescription.trim()) {
      setGlobalError('CAMPO VACÍO: La descripción explicativa para la comunidad es obligatoria.');
      return;
    }

    if (!formDate || !formTime) {
      setGlobalError('FECHA INCOMPLETA: Selecciona el día y la hora de inicio.');
      return;
    }

    const compiledDateTime = new Date(`${formDate}T${formTime}`);
    if (isNaN(compiledDateTime.getTime())) {
      setGlobalError('FECHA INCORRECTA: El formato temporal ingresado no es válido.');
      return;
    }

    setLoading(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          activityType: formType,
          scheduledAt: compiledDateTime.toISOString(),
          description: formDescription,
          latitude: formLat,
          longitude: formLng,
          externalUrl: formExternalUrl,
        }),
      });

      const jsonResult = await response.json();

      if (!response.ok) {
        throw new Error(jsonResult.error || 'Ocurrió un error protegiendo el sistema.');
      }

      setGlobalSuccess(jsonResult.message || 'EVENTO REGISTRADO CORRECTAMENTE');
      setEvents(prev => [...prev, jsonResult.event]);

      // Flush fields
      setFormName('');
      setFormDescription('');
      setFormExternalUrl('');
      setFormDate('');
      setFormTime('');
      setFormLat(null);
      setFormLng(null);

      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }

      setActiveTab('view');
      setTimeout(() => setGlobalSuccess(null), 5000);
    } catch (err: any) {
      setGlobalError(err.message || 'Fallo de autenticación o filtro anti-spam.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Send Event report
  const handleReportEvent = async (id: string) => {
    if (reportedEventIds.includes(id)) {
      setGlobalError('Ya registraste un reporte para esta publicación. Para proteger la libre expresión, solo se permite un reporte por persona/dispositivo.');
      setTimeout(() => setGlobalError(null), 4000);
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}/report`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setGlobalSuccess('CONTENIDO EVALUADO: El reporte de sospecha de spam ha sido radicado. Requiere 6 reportes para moderación automática.');
        setTimeout(() => setGlobalSuccess(null), 4000);
        
        const updated = [...reportedEventIds, id];
        setReportedEventIds(updated);
        try {
          localStorage.setItem('reported_event_ids', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        
        fetchEvents();
      } else {
        setGlobalError(data.error || 'No se pudo subir la moderación.');
        // If the server confirms already reported, sync it locally as well
        if (data.error && (data.error.includes('Ya registraste') || data.error.includes('ya has'))) {
          const updated = [...reportedEventIds, id];
          setReportedEventIds(updated);
          try {
            localStorage.setItem('reported_event_ids', JSON.stringify(updated));
          } catch (e) {}
        }
      }
    } catch (err) {
      setGlobalError('Error de red al registrar el reporte.');
    }
  };

  // Send Event like
  const handleLikeEvent = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const response = await fetch(`/api/events/${id}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(prev => prev.map(evt => {
          if (evt.id === id) {
            return { ...evt, likesCount: data.likesCount };
          }
          return evt;
        }));
      }
    } catch (err) {
      console.error('Error liking event:', err);
    }
  };

  // Share Event details to Clipboard
  const handleShareEvent = (event: CitizenEvent) => {
    const text = `MAPA POR LA VIDA - INICIATIVA CIUDADANA
Iniciativa: ${event.name}
Categoria: ${getCategoryDetails(event.activityType).label.toUpperCase()}
Descripcion: ${event.description}
Ubicacion: Lat ${event.latitude.toFixed(5)}, Lng ${event.longitude.toFixed(5)}
Acceso: ${window.location.origin}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setGlobalSuccess('INFORMACION DE INICIATIVA COPIADA AL PORTAPAPELES.');
          setTimeout(() => setGlobalSuccess(null), 4000);
        })
        .catch(() => {
          setGlobalError('No se pudo copiar de forma automatica.');
        });
    } else {
      setGlobalSuccess(`INFORMACION: ${event.name}`);
      setTimeout(() => setGlobalSuccess(null), 3000);
    }
  };

  // Fetch ALL events for administration
  const fetchAdminEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setAdminEvents(data);
      }
    } catch (err) {
      console.error('Error fetching admin events:', err);
    }
  };

  // Run republish API for moderated items
  const handleRepublishEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/events/${id}/republish`, {
        method: 'POST'
      });
      if (response.ok) {
        setGlobalSuccess('CORRESPONSAL ADM: Evento republicado exitosamente.');
        setTimeout(() => setGlobalSuccess(null), 3000);
        fetchEvents();
        fetchAdminEvents();
      }
    } catch (err) {
      setGlobalError('Error al republicar el evento.');
    }
  };

  // Run permanent delete API for moderated items
  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/events/${id}/delete`, {
        method: 'POST'
      });
      if (response.ok) {
        setGlobalSuccess('CORRESPONSAL ADM: Evento eliminado permanentemente de los registros.');
        setTimeout(() => setGlobalSuccess(null), 3000);
        fetchEvents();
        fetchAdminEvents();
        if (selectedEvent?.id === id) {
          setSelectedEvent(null);
        }
        setDeleteConfirmId(null);
      }
    } catch (err) {
      setGlobalError('Error al eliminar permanentemente el evento.');
    }
  };

  // Keyboard monitoring to toggle Admin Mode when typing "1618"
  useEffect(() => {
    let typedStr = '';
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting forms inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      
      typedStr += e.key;
      if (typedStr.length > 10) {
        typedStr = typedStr.slice(-10);
      }
      
      if (typedStr.endsWith('1618')) {
        setIsAdminMode(prev => {
          const next = !prev;
          if (next) {
            setGlobalSuccess('MODO VEEDURÍA CRÍTICA: Panel de Administración Activado');
            fetchAdminEvents();
            setActiveTab('admin');
          } else {
            setGlobalSuccess('MODO VEEDURÍA CRÍTICA: Panel Desactivado');
            if (activeTab === 'admin') {
              setActiveTab('view');
            }
          }
          setTimeout(() => setGlobalSuccess(null), 3500);
          return next;
        });
        typedStr = '';
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab]);

  // Handle manual code entry for mobile support
  const handleAdminCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminInputCode === '1618') {
      setIsAdminMode(true);
      setAdminInputCode('');
      setShowAdminCodeModal(false);
      setGlobalSuccess('MODO VEEDURÍA CRÍTICA: Panel de Administración Activado');
      setTimeout(() => setGlobalSuccess(null), 3500);
      fetchAdminEvents();
      setActiveTab('admin');
    } else {
      setGlobalError('CÓDIGO INCORRECTO: Acceso denegado de corresponsal.');
      setTimeout(() => setGlobalError(null), 3000);
    }
  };

  // Anytime admin mode is active and filter or active tab is view, let's keep things in sync
  useEffect(() => {
    if (isAdminMode) {
      fetchAdminEvents();
    }
  }, [isAdminMode]);

  const panToEvent = (event: CitizenEvent) => {
    if (!mapRef.current) return;
    setSelectedEvent(event);
    mapRef.current.setView([event.latitude, event.longitude], 12);
    
    const elementsGroup = markersGroupRef.current;
    if (elementsGroup) {
      elementsGroup.eachLayer((layer: any) => {
        if (layer.getLatLng) {
          const coords = layer.getLatLng();
          if (Math.abs(coords.lat - event.latitude) < 0.0001 && Math.abs(coords.lng - event.longitude) < 0.0001) {
            layer.openPopup();
          }
        }
      });
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div id="wrapper-app" className="flex flex-col h-screen w-screen bg-[#F59E0B]/5 overflow-hidden font-sans antialiased text-[#1E3A8A]">
      
      {/* SOLID HEADER (ME LA JUEGO POR LA VIDA BRAND STYLE) */}
      <header id="header-bar" className="h-20 px-6 bg-[#1E3A8A] border-b-4 border-[#1E3A8A] flex items-center justify-between text-white shadow-[0_4px_0_#FF4500] z-40 relative">
        <div className="flex items-center gap-4">
          {/* Brutalist Colombian ribbon with 8-pointed star */}
          <div className="flex flex-col w-3.5 h-12 overflow-hidden border-2 border-white shrink-0 shadow-sm relative">
            <div className="h-1/2 bg-[#FFB800]"></div>
            <div className="h-1/4 bg-[#1E3A8A]"></div>
            <div className="h-1/4 bg-[#FF4500]"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none text-white">
              ME LA JUEGO <span className="text-[#FFB800]">POR LA VIDA</span>
            </h1>
            <p className="text-[9.5px] text-[#FFB800] font-black tracking-wider uppercase font-mono mt-0.5 flex items-center gap-1">
               IVÁN CEPEDA X AIDA QUILCUÉ — MAPA POR LA VIDA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdminMode && (
            <button
              onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#1E3A8A] border-2 border-white text-white text-[11px] font-black uppercase tracking-wider rounded-none shadow-[2px_2px_0_#ffffff] hover:shadow-[1px_1px_0_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] transition duration-100 cursor-pointer animate-pulse"
            >
              <Database className="w-4 h-4" />
              PostGIS & Security WAF
            </button>
          )}

          <button 
            id="toggle-sidebar-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#EA580C] border-2 border-[#1E3A8A] text-[#1E3A8A] hover:text-white text-[11px] font-black uppercase tracking-wider rounded-none shadow-[3px_3px_0_#1E3A8A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition duration-100 cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
            <span className="hidden sm:inline">{isSidebarOpen ? 'CERRAR CONTROL' : 'ABRIR CONTROL'}</span>
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTROLLER */}
      <div id="main-container" className="flex-1 flex flex-row relative overflow-hidden">

        {/* NOTIFICATIONS CONTAINER */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pointer-events-auto bg-[#EA580C] text-white border-4 border-[#1E3A8A] rounded-none p-4 shadow-[6px_6px_0_#1E3A8A] flex items-start gap-4"
              >
                <ShieldAlert className="w-6 h-6 text-white shrink-0" />
                <div className="text-[11px] font-mono leading-relaxed">
                  <div className="font-black text-sm uppercase tracking-tight mb-1 text-white">RESTRICCIÓN DE AUDITORÍA</div>
                  {globalError}
                </div>
              </motion.div>
            )}

            {globalSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pointer-events-auto bg-[#F59E0B] text-[#1E3A8A] border-4 border-[#1E3A8A] rounded-none p-4 shadow-[6px_6px_0_#1E3A8A] flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-[#EA580C] shrink-0" />
                <div className="text-[11px] font-mono leading-relaxed">
                  <div className="font-black text-sm uppercase tracking-tight mb-1 text-[#1E3A8A]">SISTEMA NOTIFICACIÓN</div>
                  {globalSuccess}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TECHNICAL ARCHITECTS MODAL FOR PG SQL & WAF */}
        <AnimatePresence>
          {showTechnicalSpecs && (
            <div className="fixed inset-0 bg-[#1E3A8A]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border-4 border-[#1E3A8A] rounded-none p-6 max-w-xl w-full shadow-[10px_10px_0_#EA580C] flex flex-col relative"
              >
                <button 
                  onClick={() => setShowTechnicalSpecs(false)}
                  className="absolute top-4 right-4 bg-white hover:bg-[#EA580C] text-[#1E3A8A] hover:text-white border-2 border-[#1E3A8A] p-1 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-4 border-b-2 border-[#1E3A8A] pb-3">
                  <Database className="w-6 h-6 text-[#EA580C]" />
                  <h3 className="text-lg font-black uppercase tracking-tight">PostgreSQL / SIG & Firewall Config</h3>
                </div>

                <div className="space-y-4 font-mono text-[10.5px] leading-relaxed overflow-y-auto max-h-[380px] pr-2">
                  <p className="text-xs font-sans font-bold text-[#1E3A8A]">
                    Esquema técnico e integración SIG con sistemas territoriales de Colombia:
                  </p>
                  
                  <div className="bg-[#1E3A8A] text-white p-3.5 border-l-4 border-[#EA580C]">
                    <span className="text-[#F59E0B] font-bold block mb-1">-- POSTGRESQL + POSTGIS SCHEMA</span>
                    CREATE EXTENSION IF NOT EXISTS postgis;<br/>
                    CREATE TYPE tipo_actividad AS ENUM ('marcha', 'cultural', 'comunitaria', 'recogida');<br/>
                    <br/>
                    CREATE TABLE eventos_ciudadanos (<br/>
                    &nbsp;&nbsp;id UUID PRIMARY KEY DEFAULT gen_random_uuid(),<br/>
                    &nbsp;&nbsp;nombre VARCHAR(60) NOT NULL,<br/>
                    &nbsp;&nbsp;tipo tipo_actividad NOT NULL,<br/>
                    &nbsp;&nbsp;desc VARCHAR(500) NOT NULL,<br/>
                    &nbsp;&nbsp;geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography<br/>
                    &nbsp;&nbsp;) STORED,<br/>
                    &nbsp;&nbsp;ip_creador INET NOT NULL,<br/>
                    &nbsp;&nbsp;reportes INTEGER DEFAULT 0<br/>
                    );
                  </div>

                  <div className="bg-[#F59E0B]/10 border-2 border-[#1E3A8A] text-[#1E3A8A] p-3">
                    <span className="text-[#EA580C] font-extrabold block mb-1">🔐 FIREWALL & COHERENCIA GEOPOLÍTICA</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Geo-Fencing:</strong> validación de coordenadas Lat [-4.5, 13.5] & Lng [-79.5, -66.8] (límites geográficos colombianos).</li>
                      <li><strong>Control IP:</strong> Restricción estricta de 5 registros máximos en una ventana temporal deslizante de 2 horas.</li>
                      <li><strong>Moderación:</strong> Autoocultamiento sistémico inmediato al acumular 3 reportes ciudadanos.</li>
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setShowTechnicalSpecs(false)}
                  className="mt-5 w-full py-2.5 bg-[#1E3A8A] hover:bg-[#EA580C] text-white font-black uppercase text-xs tracking-wider rounded-none border-2 border-[#1E3A8A] transition cursor-pointer"
                >
                  ENTENDIDO, REGRESAR AL MAPA
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MAP STYLIZATION GRID OVERLAY & COMPONENT */}
        <div id="map-canvas-container" className="flex-1 h-full w-full relative z-10 bg-[#1E3A8A]/10 border-b-4 md:border-b-0 border-[#1E3A8A]">
          
          {/* Subtle map digital dots aesthetic */}
          <div className="map-grid-overlay"></div>

          {/* Actual Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10 relative"></div>

          {/* FLOATING ACTION GEOLOCATION BUTTON (ME LA JUEGO POR LA VIDA BRUTALIST STYLE) */}
          <div className="absolute bottom-12 sm:bottom-auto sm:top-4 left-4 z-20">
            <button
              onClick={handleLocateUser}
              disabled={isLocating}
              className="px-4 py-3 bg-[#FF4500] hover:bg-[#1A42CA] text-white border-3 border-[#1E3A8A] font-black text-xs uppercase tracking-wider rounded-none shadow-[4px_4px_0px_#1E3A8A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition duration-150 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              title="Centrar mapa en mi posición GPS"
            >
              {isLocating ? (
                <>
                  <div className="w-4.5 h-4.5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rastreando GPS...</span>
                </>
              ) : (
                <>
                  <Target className="w-4.5 h-4.5 animate-pulse text-[#FFB800]" />
                  <span>📍 Ubicar Mi Posición</span>
                </>
              )}
            </button>
          </div>

          {/* FLOATING LEGEND FOR QUICK MAP INSTRUCTIONS (HIGH CONTRAST) */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:block">
            <div className="bg-white text-[#1E3A8A] border-3 border-[#1E3A8A] shadow-[4px_4px_0_#FF4500] p-4 max-w-sm rounded-none">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Compass className="w-5 h-5 text-[#FF4500] animate-spin-slow" />
                <h4 className="text-xs font-black uppercase tracking-wider">Instrucción de Mapeo Ciudadano</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-[#1E3A8A]/95 font-medium">
                Haz <strong className="text-[#FF4500]">doble clic</strong> en cualquier coordenada exacta en el mapa de Colombia para cargar su ubicación, fijar el pin y proceder a registrar la actividad.
              </p>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOR EVENT ACTIONING && BOLD TYPOGRAPHY DETAILS */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              id="sidebar-overlay"
              initial={{ x: '100%', opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 1 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white text-[#1E3A8A] z-30 shadow-[-8px_0_0_rgba(30,58,138,0.2)] border-l-4 border-[#1E3A8A] flex flex-col md:relative"
            >
              
              {/* BRAND CAMPAIGN CONTEMPORARY HEADER WITH INTEGRATED PORTRAIT */}
              <div className="px-5 py-6 bg-[#1E3A8A] border-b-4 border-[#FF4500] text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 transform translate-x-4 -translate-y-4 opacity-10">
                  {/* Huge decorative 8-pointed star in background */}
                  <svg className="w-48 h-48 fill-current text-[#FFB800]" viewBox="0 0 24 24">
                    <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
                  </svg>
                </div>
 
                <div className="flex items-center gap-4 relative z-10">
                  {/* Campaign Star Badge instead of character portrait */}
                  <div className="relative w-16 h-16 bg-[#FFB800] border-4 border-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#FF4500]">
                    <svg className="w-10 h-10 fill-current text-white drop-shadow-[2px_2px_0px_rgba(255,69,0,0.6)]" viewBox="0 0 24 24">
                      <path d="M12,0 L14.8,6.8 L21.2,4 L18.4,10.8 L24,12 L18.4,13.2 L21.2,20 L14.8,17.2 L12,24 L9.2,17.2 L2.8,20 L5.6,13.2 L0,12 L5.6,10.8 L2.8,4 L9.2,6.8 Z" />
                    </svg>
                  </div>
 
                  <div>
                    <h1 className="text-3.5xl font-black uppercase tracking-tighter leading-[0.8] text-white">
                      ME LA JUEGO<br />
                      <span className="text-[#FFB800]">POR LA VIDA</span>
                    </h1>
                    <p className="text-[9px] leading-tight uppercase font-black tracking-wide text-[#FFB800] mt-1.5 flex flex-col">
                      <span className="whitespace-nowrap sm:text-[10px] text-[8.5px]">★ IVÁN CEPEDA X AIDA QUILCUÉ</span>
                      <span className="text-white font-mono text-[8px] tracking-widest mt-0.5">MAPA POR LA VIDA</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* TABS SELECTOR (FLAT SQUARE BRUTALIST STYLE WITH CAMPAIGN SPECS) */}
               <div className={`grid ${isAdminMode ? 'grid-cols-3 text-[10px]' : 'grid-cols-2 text-xs'} bg-[#FFB800]/10 border-b-2 border-[#1E3A8A] font-black uppercase tracking-wider text-center`}>
                <button
                  id="tab-view-btn"
                  onClick={() => setActiveTab('view')}
                  className={`py-3.5 transition border-r-2 border-[#1E3A8A] cursor-pointer ${
                    activeTab === 'view' 
                      ? 'bg-white text-[#FF4500] border-b-4 border-b-[#FF4500]' 
                      : 'text-[#1E3A8A]/70 hover:bg-[#1E3A8A]/5'
                  }`}
                >
                  📍 REPORTES ({events.length})
                </button>
                <button
                  id="tab-create-btn"
                  onClick={() => {
                    setActiveTab('create');
                    if (!formLat) {
                      setGlobalError('REGISTRAR PUNTO: Haz clic directamente en el mapa para capturar las coordenadas de latitud/longitud.');
                      setTimeout(() => setGlobalError(null), 6000);
                    }
                  }}
                  className={`py-3.5 transition cursor-pointer ${
                    activeTab === 'create' 
                      ? 'bg-white text-[#FF4500] border-b-4 border-b-[#FF4500]' 
                      : 'text-[#1E3A8A]/70 hover:bg-[#1E3A8A]/5'
                  }`}
                >
                  ✚ NUEVO PUNTO
                </button>
                {isAdminMode && (
                  <button
                    id="tab-admin-btn"
                    onClick={() => {
                      setActiveTab('admin');
                      fetchAdminEvents();
                    }}
                    className={`py-3.5 transition border-l-2 border-[#1E3A8A] cursor-pointer ${
                      activeTab === 'admin' 
                        ? 'bg-white text-red-600 border-b-4 border-b-red-600' 
                        : 'text-red-900 bg-red-100/60 hover:bg-red-100'
                    }`}
                  >
                    ⚙️ MODERAR ({adminEvents.length})
                  </button>
                )}
              </div>

              {/* SIDEBAR CONTAINER BODY */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">
                
                {/* SELECTOR 1: CURRENT CITIZEN EVENT LIST */}
                {activeTab === 'view' && (
                  <div className="space-y-5">
                    
                    {/* BOLD BRUTALIST PILL FILTER */}
                    <div>
                      <h2 className="text-[10px] font-black uppercase tracking-wider text-[#1E3A8A] mb-2.5 flex items-center gap-1">
                        Categorías en Territorio <span className="text-[#FF4500]">★</span>
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'all' 
                              ? 'bg-[#1E3A8A] text-white shadow-[2px_2px_0_rgba(30,58,138,0.3)]' 
                              : 'bg-white text-[#1E3A8A] hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-current bg-transparent inline-block"></span> Todos
                        </button>
                        <button
                          onClick={() => setFilterType('recorrido')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'recorrido' 
                              ? 'bg-[#FF4500] text-white shadow-[2px_2px_0_rgba(255,69,0,0.3)]' 
                              : 'bg-white text-[#FF4500] hover:bg-orange-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] border border-[#1E3A8A] inline-block"></span> Recorrido
                        </button>
                        <button
                          onClick={() => setFilterType('grafica_visual')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'grafica_visual' 
                              ? 'bg-[#DC2626] text-white shadow-[2px_2px_0_rgba(220,38,38,0.3)]' 
                              : 'bg-white text-[#DC2626] hover:bg-red-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-[#1E3A8A] inline-block"></span> Gráfica y visual
                        </button>
                        <button
                          onClick={() => setFilterType('reunion')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'reunion' 
                              ? 'bg-[#D97706] text-white shadow-[2px_2px_0_rgba(217,119,6,0.3)]' 
                              : 'bg-white text-[#D97706] hover:bg-amber-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] border border-[#1E3A8A] inline-block"></span> Reunión
                        </button>
                        <button
                          onClick={() => setFilterType('cultural_evento')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'cultural_evento' 
                              ? 'bg-[#10B981] text-white shadow-[2px_2px_0_rgba(16,185,129,0.3)]' 
                              : 'bg-white text-[#10B981] hover:bg-emerald-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-[#1E3A8A] inline-block"></span> Evento cultural
                        </button>
                        <button
                          onClick={() => setFilterType('olla_comunitaria')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'olla_comunitaria' 
                              ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0_rgba(139,92,246,0.3)]' 
                              : 'bg-white text-[#8B5CF6] hover:bg-purple-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] border border-[#1E3A8A] inline-block"></span> Olla comunitaria
                        </button>
                        <button
                          onClick={() => setFilterType('recogida')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'recogida' 
                              ? 'bg-[#1A42CA] text-white shadow-[2px_2px_0_rgba(26,66,202,0.3)]' 
                              : 'bg-white text-[#1A42CA] hover:bg-blue-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1A42CA] border border-[#1E3A8A] inline-block"></span> Acopio
                        </button>
                        <button
                          onClick={() => setFilterType('comunitaria')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'comunitaria' 
                              ? 'bg-[#1A42CA] text-white shadow-[2px_2px_0_rgba(26,66,202,0.3)]' 
                              : 'bg-white text-[#1A42CA] hover:bg-blue-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1A42CA] border border-[#1E3A8A] inline-block"></span> Pedagogía
                        </button>
                        <button
                          onClick={() => setFilterType('marcha')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'marcha' 
                              ? 'bg-[#FF4500] text-white shadow-[2px_2px_0_rgba(255,69,0,0.3)]' 
                              : 'bg-white text-[#FF4500] hover:bg-orange-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] border border-[#1E3A8A] inline-block"></span> Marchas (Otros)
                        </button>
                        <button
                          onClick={() => setFilterType('cultural')}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#1E3A8A] rounded-none flex items-center gap-1.5 ${
                            filterType === 'cultural' 
                              ? 'bg-[#FFB800] text-[#1E3A8A] shadow-[2px_2px_0_rgba(255,184,0,0.3)]' 
                              : 'bg-white text-[#FFB800] hover:bg-amber-50 border-[#1E3A8A]'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] border border-[#1E3A8A] inline-block"></span> Cultural (Otros)
                        </button>
                      </div>
                    </div>

                    {/* EVENT RESULTS CONTAINER */}
                    <div>
                      <div className="flex items-center justify-between border-b pb-2 mb-3 border-[#1E3A8A]/20">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">
                          Puntos Filtrados ({
                            events.filter(e => filterType === 'all' || e.activityType === filterType).length
                          })
                        </span>
                        
                        <span className="text-[9px] font-mono text-[#1E3A8A]/80 font-bold flex items-center gap-1">
                          <span className="text-[#EA580C]">★</span> Moderación Activa
                        </span>
                      </div>

                      <div className="space-y-3">
                        {events.filter(e => filterType === 'all' || e.activityType === filterType).length === 0 ? (
                          <div className="text-center py-10 bg-[#F59E0B]/5 border-2 border-dashed border-[#1E3A8A]/40 p-4">
                            <MapPin className="w-8 h-8 text-[#1E3A8A]/30 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-tight text-[#1E3A8A]">No hay registros vigentes</p>
                            <p className="text-[10px] text-[#1E3A8A]/80 mt-1">Haz doble clic en el territorio nacional sobre el mapa para activar un nuevo evento.</p>
                          </div>
                        ) : (
                          events
                            .filter(e => filterType === 'all' || e.activityType === filterType)
                            .map((event, index) => {
                              const detail = getCategoryDetails(event.activityType);
                              const isPast = new Date(event.scheduledAt).getTime() < Date.now();
                              return (
                                <div
                                  key={`${event.id || 'event'}-${index}`}
                                  onClick={() => panToEvent(event)}
                                  className={`p-4 rounded-none cursor-pointer text-left border-2 border-[#1E3A8A] transition duration-100 flex flex-col justify-between hover:bg-[#F59E0B]/5 hover:translate-x-1 hover:translate-y-1 relative shadow-[3px_3px_0_#1E3A8A] ${
                                    isPast ? 'bg-slate-50/95 text-slate-800' : 'bg-white'
                                  } ${
                                    selectedEvent?.id === event.id ? 'bg-[#F2F4FF] border-[#EA580C] border-2 shadow-[4px_4px_0_#1E3A8A]' : ''
                                  }`}
                                >
                                  {/* Color Accent Indicator Block */}
                                  <div 
                                    className="absolute left-0 top-0 bottom-0 w-1.5" 
                                    style={{ backgroundColor: isPast ? '#64748B' : detail.color }}
                                  />
                                  
                                  <div className="pl-2">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[#1E3A8A] flex items-center gap-1.5 flex-wrap">
                                        <span className="w-2 h-2 rounded-full border border-[#1E3A8A]/35 inline-block" style={{ backgroundColor: isPast ? '#64748B' : detail.color }} />
                                        {detail.label}
                                        {isPast && (
                                          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-slate-500 text-white leading-none">
                                            FINALIZADO
                                          </span>
                                        )}
                                      </span>
                                      
                                      <span className="text-[9.5px] text-[#EA580C] font-mono font-bold">
                                        {new Date(event.scheduledAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }).toUpperCase()}
                                      </span>
                                    </div>
                                    
                                    <h3 className={`text-sm font-black uppercase tracking-tight mb-1 line-clamp-1 leading-tight ${isPast ? 'text-slate-600' : 'text-[#1E3A8A]'}`}>
                                      {event.name}
                                    </h3>
                                    
                                    <p className={`text-[11px] line-clamp-2 leading-relaxed mb-3 font-medium ${isPast ? 'text-slate-600' : 'text-[#1E3A8A]/85'}`}>
                                      {event.description}
                                    </p>

                                    {event.externalUrl && selectedEvent?.id === event.id && (
                                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                                        <ActivityLinkPreview 
                                          url={event.externalUrl} 
                                          activityType={event.activityType} 
                                          name={event.name} 
                                        />
                                      </div>
                                    )}
 
                                    <div className="flex items-center justify-between text-[10.5px] font-mono text-[#1E3A8A] font-bold border-t border-dashed border-[#1E3A8A]/20 pt-2">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-[#1E3A8A]/50" />
                                        {new Date(event.scheduledAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }).toUpperCase()} HS
                                      </span>
 
                                      <span className="text-[#EA580C] font-black uppercase tracking-tight flex items-center gap-0.5 hover:underline text-xs">
                                        UBICAR ➔
                                      </span>
                                    </div>

                                    {/* Support and subtle reporting controls for each card */}
                                    <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-[#1E3A8A]/10">
                                      <button
                                        type="button"
                                        onClick={(e) => handleLikeEvent(event.id, e)}
                                        className="px-2 py-0.5 text-[8.5px] font-black uppercase bg-[#FF4500] hover:bg-[#D03800] text-white border border-[#1E3A8A] shadow-[1.5px_1.5px_0px_#1E3A8A] active:translate-x-[0.5px] active:translate-y-[0.5px] flex items-center gap-1 cursor-pointer transition"
                                      >
                                        ❤️ <span>{event.likesCount || 0}</span> APOYAR
                                      </button>

                                      <button
                                        type="button"
                                        disabled={reportedEventIds.includes(event.id)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReportEvent(event.id);
                                        }}
                                        className={`text-[8px] font-bold uppercase transition ${reportedEventIds.includes(event.id) ? 'text-orange-600 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:underline cursor-pointer'}`}
                                        title={reportedEventIds.includes(event.id) ? "Ya reportado por ti" : "Reportar sospecha de spam"}
                                      >
                                        {reportedEventIds.includes(event.id) ? 'REPORTADO' : `REPORTE (${event.reportsCount || 0}/6)`}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SELECTOR 2: BRUTALIST SIGN-UP EVENT FORM */}
                {activeTab === 'create' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-widest text-[#1E3A8A] mb-1 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-[#EA580C]" /> AGREGAR PUNTO AL MAPA
                      </h2>
                      <p className="text-[11px] text-[#1E3A8A]/80 leading-relaxed font-semibold">
                        Sube una acción colectiva sin registro ni burocracia comercial. Los datos cargados se desplegarán inmediatamente.
                      </p>
                    </div>

                    <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                      
                      {/* COORDENADAS DISPLAY */}
                      <div className="bg-[#F59E0B]/10 border-2 border-[#1E3A8A] p-4 space-y-2 rounded-none">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black tracking-widest text-[#1E3A8A] uppercase flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#EA580C]" /> COORDENADAS RASTREADAS
                          </label>
                          <span className="text-[8px] font-mono py-0.5 px-2 bg-white text-[#1E3A8A] border border-[#1E3A8A] font-black">
                            COLOMBIA
                          </span>
                        </div>

                        {formLat && formLng ? (
                          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono bg-white border border-[#1E3A8A]/30 p-2 text-[#1E3A8A]">
                            <div>
                              <span className="text-[8.5px] text-[#1E3A8A]/75 font-black block mb-0.5">LATITUD</span>
                              <span className="font-black">{formLat.toFixed(5)}</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] text-[#1E3A8A]/75 font-black block mb-0.5">LONGITUD</span>
                              <span className="font-black">{formLng.toFixed(5)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white border border-dashed border-[#EA580C]/40 p-2">
                            <p className="text-[10.5px] text-[#EA580C] leading-normal font-black uppercase">
                              ⚠️ NO SE REGISTRA UBICACIÓN
                            </p>
                            <p className="text-[9.5px] text-[#1E3A8A] font-bold mt-1">
                              Por favor selecciona un punto haciendo doble clic en el mapa de Colombia antes de enviar el formulario.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CATEGORY DROPDOWN */}
                      <div>
                        <label className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase mb-2">
                          CATEGORÍA DEL EVENTO
                        </label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as ActivityType)}
                          className="w-full p-3 border-2 border-[#1E3A8A] rounded-none outline-none font-sans text-xs font-bold text-[#1E3A8A] bg-white cursor-pointer focus:border-[#FF4500]"
                        >
                          <option value="recorrido">RECORRIDO</option>
                          <option value="grafica_visual">GRÁFICA Y VISUAL</option>
                          <option value="reunion">REUNIÓN</option>
                          <option value="cultural_evento">EVENTO CULTURAL</option>
                          <option value="olla_comunitaria">OLLA COMUNITARIA</option>
                          <option value="marcha">MARCHAS Y MOVILIZACIONES (OTROS)</option>
                          <option value="cultural">CONCIERTOS Y EVENTOS (OTROS)</option>
                          <option value="comunitaria">PEDAGOGÍA Y ORGANIZACIÓN (OTROS)</option>
                          <option value="recogida">PUNTOS DE RECOGIDA DE MATERIAL (OTROS)</option>
                        </select>
                      </div>

                      {/* INIT NAME INPUT */}
                      <div>
                        <label htmlFor="formName" className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase mb-1.5">
                          NOMBRE DE LA ACTIVIDAD (MÁX 60 CARACTERES)
                        </label>
                        <input
                          id="formName"
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          maxLength={60}
                          placeholder="Ej. Encuentro Ambiental Comuna 3"
                          className="w-full px-3 py-2.5 bg-white border-2 border-[#1E3A8A] focus:border-[#FF4500] text-[#1E3A8A] rounded-none text-xs outline-none font-bold"
                          required
                        />
                      </div>

                      {/* SCHEDULER DATE AND TIME inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="formDate" className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase mb-1.5">
                            DÍA PROGRAMADO
                          </label>
                          <input
                            id="formDate"
                            type="date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border-2 border-[#1E3A8A] focus:border-[#FF4500] text-[#1E3A8A] rounded-none text-xs focus:outline-none uppercase font-bold"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="formTime" className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase mb-1.5">
                            HORA (24H)
                          </label>
                          <input
                            id="formTime"
                            type="time"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#white] border-2 border-[#1E3A8A] focus:border-[#FF4500] text-[#1E3A8A] rounded-none text-xs focus:outline-none font-bold"
                            required
                          />
                        </div>
                      </div>

                      {/* TEXTAREA DESCRIPTION */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="formDescription" className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase">
                            DESCRIPCIÓN DE LA ACCIÓN (SINOPSIS)
                          </label>
                          <span className="text-[9.5px] text-[#1E3A8A]/70 font-mono font-bold">
                            {formDescription.length}/500
                          </span>
                        </div>
                        <textarea
                          id="formDescription"
                          rows={4}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          maxLength={500}
                          placeholder="Ingresa consignas, puntos de concentración específicos, elementos para llevar para la movilización y avisos comunitarios de interés público."
                          className="w-full px-3 py-2 bg-white border-2 border-[#1E3A8A] focus:border-[#FF4500] text-[#1E3A8A] rounded-none text-xs outline-none leading-relaxed resize-none font-medium text-slate-800"
                          required
                        />
                      </div>

                      {/* ENLACE EXTERNO DE LA ACTIVIDAD (VIBECODING MODE PREVIEW COMPATIBLE) */}
                      <div>
                        <label htmlFor="formExternalUrl" className="block text-[10px] font-black text-[#1E3A8A] tracking-widest uppercase mb-1.5">
                          ENLACE DE LA ACTIVIDAD (FCBK / INSTA / WEB - OPCIONAL)
                        </label>
                        <input
                          id="formExternalUrl"
                          type="url"
                          value={formExternalUrl}
                          onChange={(e) => setFormExternalUrl(e.target.value)}
                          placeholder="https://facebook.com/... o instagram.com/..."
                          className="w-full px-3 py-2.5 bg-white border-2 border-[#1E3A8A] focus:border-[#FF4500] text-[#1E3A8A] rounded-none text-xs outline-none font-bold placeholder-slate-400"
                        />
                        <p className="text-[9px] text-[#1E3A8A]/75 mt-1 font-semibold leading-normal">
                          Comparte el link directo para que los participantes visualicen el post en redes sociales o la página oficial.
                        </p>
                      </div>

                      {/* BRUTALIST SUBMIT BUTTON */}
                      <button
                        id="submit-event-btn"
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition duration-100 border-2 border-[#1E3A8A] shadow-[4px_4px_0_#1E3A8A] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer ${
                          loading 
                            ? 'bg-[#F1FAEE] text-[#1E3A8A] cursor-not-allowed shadow-none border-dashed' 
                            : 'bg-[#FF4500] hover:bg-[#1E3A8A] text-white font-black'
                        }`}
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></span>
                            AUDITANDO DIRECCIÓN IP...
                          </>
                        ) : (
                          <>
                            ¡JUGUÉMONOSLA JUNTOS!
                          </>
                        )}
                      </button>

                      {/* RATE LIMIT BANNER */}
                      <div className="p-3 bg-rose-50 border-2 border-[#1E3A8A] rounded-none flex items-start gap-2.5 text-[9.5px] text-[#1E3A8A] leading-normal font-semibold">
                        <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                        <div>
                          <strong>ALERTA DE SEGURIDAD SPAM:</strong> Para mitigar ataques coordinados contra la visibilidad del mapa político-social, guardamos logs de IP de forma totalmente cifrada e invisible. <strong className="text-[#EA580C]">Límite estricto de 5 envíos máximos cada 2 horas</strong>.
                        </div>
                      </div>

                    </form>
                  </div>
                )}
                
                {/* SELECTOR 3: ADMIN MODERACIÓN CONTROLS */}
                {activeTab === 'admin' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-widest text-red-600 mb-1 flex items-center gap-1.5">
                        ⚙️ PANEL DE MODERACIÓN
                      </h2>
                      <p className="text-[11px] text-[#1E3A8A]/80 leading-relaxed font-semibold">
                        Espacio de corresponsal para gestionar reportes de spam o reactivar publicaciones territoriales.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {adminEvents.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-[#1E3A8A]/30">
                          <p className="text-xs font-bold text-[#1E3A8A]/60 uppercase">NO SE REGISTRA NINGUNA PUBLICACIÓN</p>
                        </div>
                      ) : (
                        adminEvents.map((evt) => {
                          const isReported = evt.status === 'reported' || evt.reportsCount >= 6;
                          return (
                            <div 
                              key={evt.id} 
                              className={`p-3.5 border-2 rounded-none space-y-2.5 transition ${
                                isReported 
                                  ? 'bg-rose-50 border-red-500 shadow-[2.5px_2.5px_0_#EF4444]' 
                                  : 'bg-white border-[#1E3A8A] shadow-[2.5px_2.5px_0_#1E3A8A]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 border-b border-[#1E3A8A]/10 pb-1.5">
                                <span className="text-[8px] font-mono font-bold tracking-widest uppercase bg-[#1E3A8A] text-white px-1.5 py-0.5">
                                  {evt.activityType}
                                </span>
                                <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 border ${
                                  isReported 
                                    ? 'bg-red-500 text-white border-red-600' 
                                    : 'bg-[#FFB800]/10 text-[#EA580C] border-[#FFB800]'
                                }`}>
                                  {isReported ? '🚫 REPORTADO' : '✅ ACTIVO'}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-xs font-black uppercase tracking-tight text-[#1E3A8A]">
                                  {evt.name}
                                </h4>
                                <p className="text-[10px] text-slate-700 leading-normal line-clamp-2 mt-1 italic font-medium">
                                  "{evt.description}"
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-500">
                                <span>🗣️ REPORTES: {evt.reportsCount}/6</span>
                                <span>❤️ APOYOS: {evt.likesCount || 0}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E3A8A]/10">
                                <button
                                  type="button"
                                  onClick={() => handleRepublishEvent(evt.id)}
                                  className="w-full py-1 text-center bg-green-600 hover:bg-green-700 text-white text-[9px] font-black uppercase tracking-wider rounded-none transition border border-green-700 cursor-pointer shadow-[1px_1px_0_#1E3A8A] active:translate-x-[0.5px] active:translate-y-[0.5px]"
                                >
                                  🔄 REPUBLICAR
                                </button>
                                
                                {deleteConfirmId === evt.id ? (
                                  <div className="flex flex-col gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(evt.id)}
                                      className="w-full py-0.5 text-center bg-red-600 hover:bg-red-800 text-white text-[7.5px] font-black uppercase rounded-none transition border border-red-700 cursor-pointer animate-pulse"
                                    >
                                      ⚠️ CONFIRMAR ELIMINAR
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="w-full py-0.5 text-center bg-slate-300 hover:bg-slate-400 text-slate-800 text-[7.5px] font-black uppercase rounded-none transition border border-slate-400 cursor-pointer"
                                    >
                                      CANCELAR
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(evt.id)}
                                    className="w-full py-1 text-center bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-wider rounded-none transition border border-red-700 cursor-pointer shadow-[1px_1px_0_#1E3A8A] active:translate-x-[0.5px] active:translate-y-[0.5px]"
                                  >
                                    ❌ ELIMINAR
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* HIGH CONTRAST APP STATS PANEL */}
              <div className="px-5 py-4 bg-[#1E3A8A]/5 border-t-2 border-[#1E3A8A] flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r border-[#1E3A8A]/20 pr-4">
                    <span className="text-xl font-black text-[#1E3A8A] block tracking-tighter leading-none">
                      {events.filter(e => filterType === 'all' || e.activityType === filterType).length}
                    </span>
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#1E3A8A]/75">REGISTROS EN MAPA</label>
                  </div>
                  <div>
                    <span className="text-xl font-black text-[#FF4500] block tracking-tighter leading-none">
                      {events.reduce((acc, curr) => acc + (curr.likesCount || 0), 0)}
                    </span>
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#1E3A8A]/75">APOYOS REGISTRADOS</label>
                  </div>
                </div>
              </div>

              {/* FOOTER AUDITING */}
              <div 
                className="px-5 py-4 border-t-2 border-[#1E3A8A] bg-[#1E3A8A] text-center text-white select-none cursor-default"
                onClick={(e) => {
                  if (e.detail >= 5) {
                    setAdminInputCode('');
                    setShowAdminCodeModal(true);
                  }
                }}
              >
                <p className="text-[8.5px] tracking-wider font-extrabold uppercase text-white/80 leading-normal">
                  VEEDURÍA TERRITORIAL COLOMBIA ★ IVÁN CEPEDA X AIDA QUILCUÉ
                </p>
                <p className="text-[9.5px] tracking-widest font-black uppercase text-[#FFB800] mt-1">
                  © 2026 — MAPA POR LA VIDA
                </p>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* SECRET CORRESPONSAL CODE ENTRY MODAL */}
      <AnimatePresence>
        {showAdminCodeModal && (
          <div className="fixed inset-0 bg-[#1E3A8A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-[#1E3A8A] rounded-none p-5 max-w-sm w-full shadow-[6px_6px_0_#FF4500] flex flex-col relative"
            >
              <button 
                onClick={() => setShowAdminCodeModal(false)}
                className="absolute top-3 right-3 hover:bg-red-100 text-[#1E3A8A] p-0.5 transition cursor-pointer border border-[#1E3A8A]/30"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 mb-4">
                <span className="text-xl">⚙️</span>
                <h3 className="text-sm font-black uppercase tracking-tight text-[#1E3A8A]">Inspección de Registro</h3>
                <p className="text-[10px] text-[#1E3A8A]/80 leading-normal font-semibold">
                  Servicio de auditoría de registros territoriales.
                </p>
              </div>

              <form onSubmit={handleAdminCodeSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminInputCode}
                  onChange={(e) => setAdminInputCode(e.target.value)}
                  placeholder="Identificador"
                  maxLength={16}
                  className="w-full text-center px-3 py-2 border-2 border-[#1E3A8A] font-mono text-sm tracking-widest text-[#1E3A8A] rounded-none bg-white outline-none focus:border-[#FF4500] font-bold"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#1E3A8A] hover:bg-[#FF4500] text-white font-black text-xs uppercase tracking-wider rounded-none cursor-pointer border-2 border-[#1E3A8A] transition"
                >
                  ACCEDER
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
