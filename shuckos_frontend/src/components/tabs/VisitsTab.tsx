import React, { useState, useEffect } from 'react';
import { Eye, Plus, X, Smartphone, Monitor, Tablet, Globe } from 'lucide-react';
import { format } from 'date-fns';

export default function VisitsTab() {
  const [visits, setVisits] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    restaurant: '',
    source: 'organic',
    device: 'desktop',
    ip: '192.168.1.1',
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      setRestaurants(data);
    } catch (e) { console.error(e); }
  };

  const fetchVisits = async (restId: string) => {
    if (!restId) { setVisits([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/restaurant/${restId}`);
      const data = await res.json();
      setVisits(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);
  useEffect(() => { fetchVisits(selectedRestaurant); }, [selectedRestaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      restaurant: formData.restaurant || selectedRestaurant,
      timestamp: new Date(formData.timestamp)
    };

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchVisits(selectedRestaurant || formData.restaurant);
        if (formData.restaurant) setSelectedRestaurant(formData.restaurant);
      }
    } catch (e) { console.error(e); }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone size={16} />;
      case 'tablet': return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Eye className="text-emerald-500" size={24} />
          <h3 className="text-lg font-medium text-gray-900">Registro de Visitas</h3>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedRestaurant} 
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm p-2"
          >
            <option value="">Todos los Restaurantes...</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <button 
            onClick={() => {
              setFormData({ ...formData, restaurant: selectedRestaurant });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            Registrar Visita
          </button>
        </div>
      </div>

      {loading && selectedRestaurant ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No hay tráfico para mostrar.</td></tr>
              ) : visits.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(v.timestamp), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getDeviceIcon(v.device)}
                      <span className="capitalize text-xs">{v.device}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize">{v.source}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{v.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Reutilizable */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Eye size={20} className="text-emerald-600" />
                Registrar Visita Manual
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Restaurante</label>
                <select 
                  required
                  value={formData.restaurant} 
                  onChange={(e) => setFormData({...formData, restaurant: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dispositivo</label>
                  <select 
                    value={formData.device} 
                    onChange={(e) => setFormData({...formData, device: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuente</label>
                  <select 
                    value={formData.source} 
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="organic">Organic</option>
                    <option value="search">Search</option>
                    <option value="ad">Ad</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe size={14} /> Dirección IP
                </label>
                <input type="text" value={formData.ip} onChange={(e) => setFormData({...formData, ip: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm font-mono" placeholder="192.168.1.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <input type="datetime-local" value={formData.timestamp} onChange={(e) => setFormData({...formData, timestamp: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Visita</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
