import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, MapPin, Tag, Trash2, Edit, X, RefreshCw, Navigation } from 'lucide-react';

const GUATEMALA_CITY_LAT = 14.6349;
const GUATEMALA_CITY_LNG = -90.5069;
const DEFAULT_RADIUS_KM = 5;

export default function RestaurantsTab() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [lat, setLat] = useState('14.6349');
  const [lng, setLng] = useState('-90.5069');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTag, setSearchTag] = useState('');

  const [nearbyCenterLat, setNearbyCenterLat] = useState(String(GUATEMALA_CITY_LAT));
  const [nearbyCenterLng, setNearbyCenterLng] = useState(String(GUATEMALA_CITY_LNG));
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [nearbyResult, setNearbyResult] = useState<{
    resultados?: any[];
    total?: number;
    query?: { tipo: string; coordenadas?: number[]; radio_metros?: number };
    message?: string;
    error?: string;
  } | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [specialtyInput, setSpecialtyInput] = useState('');

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;

    // Convertir el string de tags de nuevo a un arreglo antes de enviar
    const processedData = {
      ...editingRestaurant,
      tags: typeof editingRestaurant.tags === 'string' 
        ? editingRestaurant.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : editingRestaurant.tags
    };

    try {
      const res = await fetch(`/api/restaurants/${editingRestaurant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingRestaurant(null);
        fetchRestaurants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkActivate = async () => {
    if (!confirm('¿Activar todos los restaurantes?')) return;
    try {
      const res = await fetch('/api/restaurants/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: {},
          update: { isActive: true, lastBulkUpdate: new Date().toISOString() }
        })
      });
      const data = await res.json();
      alert(`Activados: ${data.modified} restaurantes.`);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!confirm('¿Desactivar todos los restaurantes?')) return;
    try {
      const res = await fetch('/api/restaurants/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: {},
          update: { isActive: false, lastBulkUpdate: new Date().toISOString() }
        })
      });
      const data = await res.json();
      alert(`Desactivados: ${data.modified} restaurantes.`);
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

  const openEditModal = (restaurant: any) => {
    setEditingRestaurant({
      ...restaurant,
      tags: restaurant.tags?.join(', ') || ''
    });
    setSpecialtyInput('');
    setIsModalOpen(true);
  };

  const refetchEditingRestaurant = async () => {
    if (!editingRestaurant?._id) return;
    try {
      const res = await fetch(`/api/restaurants/${editingRestaurant._id}`);
      const data = await res.json();
      setEditingRestaurant({ ...data, tags: data.tags?.join(', ') || '' });
    } catch (err) {
      console.error(err);
    }
  };

  const addSpecialty = async () => {
    if (!editingRestaurant?._id || !specialtyInput.trim()) return;
    try {
      const res = await fetch(`/api/arrays/restaurants/${editingRestaurant._id}/specialties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty: specialtyInput.trim() }),
      });
      if (res.ok) {
        setSpecialtyInput('');
        await refetchEditingRestaurant();
      } else {
        const data = await res.json();
        alert(data.message || 'Error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeSpecialty = async (specialty: string) => {
    if (!editingRestaurant?._id) return;
    try {
      const res = await fetch(`/api/arrays/restaurants/${editingRestaurant._id}/specialties`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty }),
      });
      if (res.ok) await refetchEditingRestaurant();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearby = async () => {
    setNearbyLoading(true);
    setNearbyResult(null);
    try {
      const maxDistanceMeters = nearbyRadiusKm * 1000;
      const res = await fetch(
        `/api/restaurants/nearby?lat=${nearbyCenterLat}&lng=${nearbyCenterLng}&maxDistance=${maxDistanceMeters}`
      );
      const data = await res.json();
      setNearbyResult(data);
    } catch (err) {
      console.error(err);
      setNearbyResult({
        message: 'Error en búsqueda',
        error: String(err),
        resultados: [],
        total: 0
      });
    } finally {
      setNearbyLoading(false);
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Navigation size={20} className="text-red-500" />
          Índice Geoespacial (2dsphere) – Buscar Restaurantes Cercanos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Busca restaurantes en un radio configurable desde las coordenadas indicadas (por defecto Guatemala City).
        </p>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Latitud</label>
            <input
              type="number"
              step="any"
              value={nearbyCenterLat}
              onChange={e => setNearbyCenterLat(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Longitud</label>
            <input
              type="number"
              step="any"
              value={nearbyCenterLng}
              onChange={e => setNearbyCenterLng(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">Radio (km)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={nearbyRadiusKm}
              onChange={e => setNearbyRadiusKm(Number(e.target.value) || 5)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={fetchNearby}
            disabled={nearbyLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {nearbyLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Navigation size={16} />
                Buscar Cercanos
              </>
            )}
          </button>
        </div>
        {nearbyResult && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {nearbyResult.error ? (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                {nearbyResult.message}: {nearbyResult.error}. Crea los índices en Admin → create-indexes.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  {nearbyResult.query?.tipo} – {nearbyResult.total ?? 0} restaurantes en{' '}
                  {(nearbyResult.query?.radio_metros ?? 0) / 1000} km.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(nearbyResult.resultados ?? []).map((rest: any) => (
                    <div
                      key={rest._id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 hover:shadow-sm transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-900 truncate">{rest.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} />
                        <span className="font-mono">
                          [{rest.location?.coordinates?.join(', ')}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{rest.rating?.toFixed(1) ?? '0.0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Store size={18} className="text-gray-500" />
              Restaurantes
            </h3>
            <button
              onClick={handleBulkActivate}
              className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw size={14} />
              Activar Todos
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              Desactivar Todos
            </button>
          </div>
          
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
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(rest)}
                    className="text-gray-400 hover:text-indigo-500 p-1 bg-gray-50 rounded-md border border-gray-200"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rest._id)}
                    className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 rounded-md border border-gray-200"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-1 pr-16">{rest.name}</h4>
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

      {/* Edit Modal */}
      {isModalOpen && editingRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Edit size={20} className="text-indigo-600" />
                Editar Restaurante
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={editingRestaurant.name}
                  onChange={e => setEditingRestaurant({...editingRestaurant, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                  rows={2}
                  value={editingRestaurant.description}
                  onChange={e => setEditingRestaurant({...editingRestaurant, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades (arrays: $addToSet / $pull)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={e => setSpecialtyInput(e.target.value)}
                    placeholder="Ej: comida rápida"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <button type="button" onClick={addSpecialty} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingRestaurant.specialties ?? []).length === 0 ? (
                    <span className="text-gray-400 text-sm">Ninguna</span>
                  ) : (
                    (editingRestaurant.specialties ?? []).map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
                        {s}
                        <button type="button" onClick={() => removeSpecialty(s)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
