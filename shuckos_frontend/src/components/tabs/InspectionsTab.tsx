import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, X, Store, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectionsTab() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    restaurant: '',
    foodHandling: 80,
    surfaceCleanliness: 80,
    staffHygiene: 80,
    observations: '',
    inspectionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      setRestaurants(data);
    } catch (e) { console.error(e); }
  };

  const fetchInspections = async (restId: string) => {
    if (!restId) { setInspections([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections/restaurant/${restId}`);
      const data = await res.json();
      setInspections(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);
  useEffect(() => { fetchInspections(selectedRestaurant); }, [selectedRestaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const overallScore = Math.round((Number(formData.foodHandling) + Number(formData.surfaceCleanliness) + Number(formData.staffHygiene)) / 3);
    
    const payload = {
      restaurant: formData.restaurant || selectedRestaurant,
      overallScore,
      scores: {
        foodHandling: Number(formData.foodHandling),
        surfaceCleanliness: Number(formData.surfaceCleanliness),
        staffHygiene: Number(formData.staffHygiene)
      },
      observations: formData.observations,
      inspectionDate: new Date(formData.inspectionDate)
    };

    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchInspections(selectedRestaurant || formData.restaurant);
        if (formData.restaurant) setSelectedRestaurant(formData.restaurant);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-emerald-500" size={24} />
          <h3 className="text-lg font-medium text-gray-900">Inspecciones Sanitarias</h3>
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
            Nueva Inspección
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No hay inspecciones para mostrar.</td></tr>
              ) : inspections.map((insp) => (
                <tr key={insp._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(insp.inspectionDate), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${insp.overallScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {insp.overallScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div>Manejo: {insp.scores?.foodHandling}</div>
                    <div>Limpieza: {insp.scores?.surfaceCleanliness}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{insp.observations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                Registrar Inspección Manual
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manipulación</label>
                  <input type="number" min="0" max="100" value={formData.foodHandling} onChange={(e) => setFormData({...formData, foodHandling: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Limpieza</label>
                  <input type="number" min="0" max="100" value={formData.surfaceCleanliness} onChange={(e) => setFormData({...formData, surfaceCleanliness: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Higiene</label>
                  <input type="number" min="0" max="100" value={formData.staffHygiene} onChange={(e) => setFormData({...formData, staffHygiene: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inspección</label>
                <input type="datetime-local" value={formData.inspectionDate} onChange={(e) => setFormData({...formData, inspectionDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm h-24" placeholder="Notas sobre la calidad..."></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Inspección</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
