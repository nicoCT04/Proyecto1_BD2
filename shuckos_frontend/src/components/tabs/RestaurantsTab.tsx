import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, MapPin, Tag, Trash2 } from 'lucide-react';

export default function RestaurantsTab() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [lat, setLat] = useState('14.6349');
  const [lng, setLng] = useState('-90.5069');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTag, setSearchTag] = useState('');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (searchTag) params.append('tag', searchTag);
      
      const res = await fetch(`/api/restaurants/?${params.toString()}`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery, searchTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/restaurants/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          location: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        })
      });
      setName('');
      setDescription('');
      setTags('');
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este restaurante?')) return;
    try {
      await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-500" />
          Crear Restaurante
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Ej. Shuckos El Chino"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
            <input 
              type="text" 
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="shuckos, mixtas, atol"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Los mejores shuckos de la zona 4..."
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input 
              type="number" 
              step="any"
              required
              value={lat}
              onChange={e => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input 
              type="number" 
              step="any"
              required
              value={lng}
              onChange={e => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Guardar Restaurante
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Store size={18} className="text-gray-500" />
            Restaurantes
          </h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Buscar por texto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="relative flex-1 sm:w-40">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Filtrar por tag..."
                value={searchTag}
                onChange={e => setSearchTag(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : restaurants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron restaurantes</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {restaurants.map(rest => (
              <div key={rest._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white relative group">
                <button 
                  onClick={() => handleDelete(rest._id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <h4 className="font-bold text-lg text-gray-900 mb-1 pr-6">{rest.name}</h4>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10">{rest.description}</p>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin size={14} />
                  <span className="font-mono">[{rest.location?.coordinates?.join(', ')}]</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {rest.tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium text-sm">{rest.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">ID: {rest._id.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
