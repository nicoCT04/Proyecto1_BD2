import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, RefreshCw, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function normalizeRevenue(raw: unknown): { restaurant: string; totalRevenue: number; totalOrders: number }[] {
  const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data ?? [];
  return arr.map((r: { restaurant?: string; totalRevenue?: number; totalOrders?: number }) => ({
    restaurant: r.restaurant ?? 'Sin nombre',
    totalRevenue: Number(r.totalRevenue) ?? 0,
    totalOrders: Number(r.totalOrders) ?? 0,
  }));
}

function normalizeTopProducts(raw: unknown): { product: string; totalQuantitySold: number; totalRevenue: number }[] {
  const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data ?? [];
  return arr
    .map((p: { product?: string; totalQuantitySold?: number; totalRevenue?: number }) => ({
      product: p.product ?? 'Producto',
      totalQuantitySold: Number(p.totalQuantitySold) ?? 0,
      totalRevenue: Number(p.totalRevenue) ?? 0,
    }))
    .slice(0, 12);
}

export default function AnalyticsTab() {
  const [revenue, setRevenue] = useState<{ restaurant: string; totalRevenue: number; totalOrders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ product: string; totalQuantitySold: number; totalRevenue: number }[]>([]);
  const [conversionRate, setConversionRate] = useState<{
    conversion_rate: number;
    total_visits: number;
    total_orders: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [revRes, topRes, convRes] = await Promise.all([
        fetch('/api/orders/analytics/revenue'),
        fetch('/api/orders/analytics/top-products'),
        fetch('/api/analytics/conversion-rate'),
      ]);
      const revData = await revRes.json();
      setRevenue(normalizeRevenue(revData));

      const topData = await topRes.json();
      setTopProducts(normalizeTopProducts(topData));

      if (convRes.ok) {
        const conv = await convRes.json();
        setConversionRate({
          conversion_rate: conv.conversion_rate ?? 0,
          total_visits: conv.total_visits ?? 0,
          total_orders: conv.total_orders ?? 0,
        });
      } else {
        setConversionRate(null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={28} className="text-emerald-500" />
          Analíticas
        </h2>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Cargando...' : 'Actualizar datos'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {conversionRate && (
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity size={28} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tasa de conversión</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(conversionRate.conversion_rate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-500">Visitas totales</p>
                <p className="text-xl font-semibold text-gray-900">{conversionRate.total_visits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Pedidos totales</p>
                <p className="text-xl font-semibold text-gray-900">{conversionRate.total_orders.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-500" />
              Ingresos por restaurante
            </h3>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-gray-400">Cargando...</div>
          ) : revenue.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">No hay datos de ingresos</div>
          ) : (
            <div className="p-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tickFormatter={(v) => `Q${v}`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis type="category" dataKey="restaurant" width={75} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: number, _name: string, props: { payload?: { totalOrders: number } }) => [
                        `Q${Number(value).toFixed(2)} · ${props.payload?.totalOrders ?? 0} pedidos`,
                        'Ingresos',
                      ]}
                    />
                    <Bar dataKey="totalRevenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Productos más vendidos
            </h3>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-gray-400">Cargando...</div>
          ) : topProducts.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">No hay datos de productos</div>
          ) : (
            <div className="p-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis type="category" dataKey="product" width={95} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: number, _name: string, props: { payload?: { totalRevenue: number } }) => [
                        `${value} unidades · Q${props.payload?.totalRevenue?.toFixed(2) ?? 0}`,
                        'Vendidos',
                      ]}
                    />
                    <Bar dataKey="totalQuantitySold" radius={[0, 4, 4, 0]} barSize={24}>
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
