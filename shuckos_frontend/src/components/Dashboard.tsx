import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Store,
  UtensilsCrossed,
  ShoppingCart,
  Star,
  BarChart3,
  Database,
  Activity,
  Terminal,
  Trash2,
  PieChart,
  ShieldCheck,
  Eye,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

// Tabs
import UsersTab from './tabs/UsersTab';
import RestaurantsTab from './tabs/RestaurantsTab';
import MenuItemsTab from './tabs/MenuItemsTab';
import OrdersTab from './tabs/OrdersTab';
import ReviewsTab from './tabs/ReviewsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AdminTab from './tabs/AdminTab';
import AtlasChartsTab from './tabs/AtlasChartsTab';
import InspectionsTab from './tabs/InspectionsTab';
import VisitsTab from './tabs/VisitsTab';
import FilesTab from './tabs/FilesTab';
import RubricaDemoTab from './tabs/RubricaDemoTab';

// Module-level variable to track index creation across Strict Mode re-mounts
let globalIndexesRequested = false;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [logs, setLogs] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost'
      ? `ws://localhost:8000/ws/logs`
      : `${protocol}//${window.location.host}/ws/logs`;

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setSocket(newSocket);
      // Solo pedimos los índices una vez en todo el ciclo de vida de la página
      if (!globalIndexesRequested) {
        globalIndexesRequested = true;
        // Esperamos 100ms extra para dar tiempo a Strict Mode y a otras tareas a estabilizarse
        setTimeout(() => {
          fetch('/api/admin/create-indexes')
            .then(res => res.json())
            .then(data => console.log("Init indexes trigger:", data))
            .catch(err => console.error("Error init indexes:", err));
        }, 100);
      }
    };

    newSocket.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        setLogs(prev => [...prev, log]);
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => {
      // Clean closure of the socket on unmount
      if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
        newSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const showDemoRubrica = import.meta.env.VITE_SHOW_DEMO_RUBRICA === 'true';
  const tabs = [
    ...(showDemoRubrica ? [{ id: 'rubrica', label: 'Demo Rubrica', icon: CheckCircle2, component: RubricaDemoTab }] : []),
    { id: 'users', label: 'Usuarios', icon: Users, component: UsersTab },
    { id: 'restaurants', label: 'Restaurantes', icon: Store, component: RestaurantsTab },
    { id: 'menu', label: 'Menú', icon: UtensilsCrossed, component: MenuItemsTab },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, component: OrdersTab },
    { id: 'reviews', label: 'Reseñas', icon: Star, component: ReviewsTab },
    { id: 'inspections', label: 'Inspecciones', icon: ShieldCheck, component: InspectionsTab },
    { id: 'visits', label: 'Visitas', icon: Eye, component: VisitsTab },
    { id: 'files', label: 'Archivos', icon: FileText, component: FilesTab },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3, component: AnalyticsTab },
    { id: 'atlas-charts', label: 'Atlas Charts', icon: PieChart, component: AtlasChartsTab },
    { id: 'admin', label: 'Admin', icon: Database, component: AdminTab },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || RestaurantsTab;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shukos MVP</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-emerald-500" />
            <span>API Conectada</span>
          </div>
          <p>MongoDB Atlas (vía FastAPI)</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <ActiveComponent />
        </main>
      </div>

      {/* Right Pane: MongoDB Query Log */}
      <div className="w-96 bg-slate-950 text-slate-300 flex flex-col border-l border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Terminal size={18} />
            <h3>MongoDB Query Log</h3>
          </div>
          <button
            onClick={clearLogs}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Limpiar logs"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center mt-10">
              Esperando consultas a la base de datos...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center flex-wrap gap-1">
                  <span className="text-emerald-400 font-semibold">{log.collection}.{log.method}</span>
                  <span className="text-slate-500 text-[10px]">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</span>
                </div>
                {log.indexUsed && log.indexUsed.length > 0 && (
                  <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-800 flex flex-wrap gap-1">
                    <span className="text-slate-500 text-[10px]">Índice:</span>
                    {log.indexUsed.map((idx: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                        {idx}
                      </span>
                    ))}
                  </div>
                )}
                <div className="p-3 space-y-2">
                  {log.query && log.query !== '{}' && (
                    <div>
                      <span className="text-slate-500 block mb-1">Query:</span>
                      <pre className="text-blue-300 whitespace-pre-wrap break-all">{log.query}</pre>
                    </div>
                  )}
                  {log.doc && log.doc !== 'undefined' && (
                    <div>
                      <span className="text-slate-500 block mb-1">Doc/Update:</span>
                      <pre className="text-orange-300 whitespace-pre-wrap break-all">{log.doc}</pre>
                    </div>
                  )}
                  {log.options && log.options !== 'undefined' && log.options !== '{}' && (
                    <div>
                      <span className="text-slate-500 block mb-1">Options:</span>
                      <pre className="text-purple-300 whitespace-pre-wrap break-all">{log.options}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
