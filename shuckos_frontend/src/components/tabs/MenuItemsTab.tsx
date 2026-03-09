import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Store } from 'lucide-react';

export default function MenuItemsTab() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetch('/api/restaurants/')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        if (data.length > 0) {
          setSelectedRestaurant(data[0]._id);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const fetchMenuItems = async (restId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menu-items/restaurant/${restId}`);
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return alert('Selecciona un restaurante');
    
    try {
      await fetch('/api/menu-items/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: selectedRestaurant,
          name,
          price: parseFloat(price),
          category
        })
      });
      setName('');
      setPrice('');
      setCategory('');
      fetchMenuItems(selectedRestaurant);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-500" />
          Agregar Artículo al Menú
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurante</label>
            <select 
              value={selectedRestaurant}
              onChange={e => setSelectedRestaurant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">Selecciona un restaurante...</option>
              {restaurants.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Platillo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Ej. Shucko Mixto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Q)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="25.00"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input 
              type="text" 
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Ej. Shuckos, Bebidas, Extras"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button 
              type="submit"
              disabled={!selectedRestaurant}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Guardar Artículo
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-gray-500" />
            Menú del Restaurante
          </h3>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {menuItems.length} artículos
          </span>
        </div>
        
        {!selectedRestaurant ? (
          <div className="p-8 text-center text-gray-500">Selecciona un restaurante para ver su menú</div>
        ) : loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : menuItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Este restaurante no tiene artículos en su menú</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-right">Precio</th>
                  <th className="px-6 py-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">Q{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{item._id.slice(-6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
