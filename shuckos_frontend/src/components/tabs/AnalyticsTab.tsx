import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsTab() {
  const [revenue, setRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [conversionRate, setConversionRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, topRes, convRes] = await Promise.all([
        fetch('/api/orders/analytics/revenue'),
        fetch('/api/orders/analytics/top-products'),
        fetch('/api/analytics/conversion-rate')
      ]);
      const revData = await revRes.json();
      setRevenue(Array.isArray(revData) ? revData : (revData?.data || []));
      
      const topData = await topRes.json();
      setTopProducts(Array.isArray(topData) ? topData : (topData?.data || []));
      
      if (convRes.ok) {
        setConversionRate(await convRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={24} className="text-emerald-500" />
          Analíticas Locales (Aggregations)
        </h2>
        <button 
          onClick={fetchAnalytics}
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          Actualizar Datos
        </button>
      </div>

      {conversionRate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Tasa de Conversión General</h3>
            <p className="text-3xl font-bold text-gray-900">
              {(conversionRate.conversion_rate * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Visitas Totales: <span className="font-medium text-gray-900">{conversionRate.total_visits}</span></p>
            <p className="text-sm text-gray-500">Pedidos Totales: <span className="font-medium text-gray-900">{conversionRate.total_orders}</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Restaurant */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-500" />
              Ingresos por Restaurante
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">Cargando...</div>
          ) : revenue.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">No hay datos de ingresos</div>
          ) : (
            <div className="p-4 flex-1">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="restaurantName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `Q${value}`} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`Q${value.toFixed(2)}`, 'Ingresos']}
                    />
                    <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Productos Más Vendidos
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">Cargando...</div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">No hay datos de productos</div>
          ) : (
            <div className="p-4 flex-1">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalSold"
                      nameKey="_id"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value} unidades`, 'Vendidos']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
