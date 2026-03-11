import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Store, Layers, Trash2, Tag } from 'lucide-react';

export default function MenuItemsTab() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientsMultiple, setIngredientsMultiple] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [searchIngredient, setSearchIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [arrayMsg, setArrayMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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
      setMenuItems(Array.isArray(data) ? data : []);
      if (selectedItem) {
        const next = (Array.isArray(data) ? data : []).find((m: any) => m._id === selectedItem._id);
        setSelectedItem(next ?? null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedItem = () => {
    if (!selectedItem?._id || !selectedRestaurant) return;
    fetch(`/api/menu-items/restaurant/${selectedRestaurant}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const next = list.find((m: any) => m._id === selectedItem._id);
        if (next) setSelectedItem(next);
      });
  };

  const showArrayMsg = (type: 'ok' | 'err', text: string) => {
    setArrayMsg({ type, text });
    setTimeout(() => setArrayMsg(null), 3000);
  };

  const addIngredient = async () => {
    if (!selectedItem?._id || !ingredientInput.trim()) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/${selectedItem._id}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: ingredientInput.trim() }),
      });
      const data = await res.json();
      showArrayMsg(res.ok ? 'ok' : 'err', data.message || (res.ok ? 'Agregado ($addToSet)' : 'Error'));
      if (res.ok) { setIngredientInput(''); refreshSelectedItem(); }
    } catch { showArrayMsg('err', 'Error de red'); }
  };

  const addMultipleIngredients = async () => {
    if (!selectedItem?._id || !ingredientsMultiple.trim()) return;
    const list = ingredientsMultiple.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/${selectedItem._id}/ingredients/multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: list }),
      });
      const data = await res.json();
      showArrayMsg(res.ok ? 'ok' : 'err', data.message || (res.ok ? 'Agregados ($push+$each)' : 'Error'));
      if (res.ok) { setIngredientsMultiple(''); refreshSelectedItem(); }
    } catch { showArrayMsg('err', 'Error de red'); }
  };

  const removeIngredient = async (ing: string) => {
    if (!selectedItem?._id) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/${selectedItem._id}/ingredients`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: ing }),
      });
      const data = await res.json();
      showArrayMsg(res.ok ? 'ok' : 'err', data.message || '');
      if (res.ok) refreshSelectedItem();
    } catch { showArrayMsg('err', 'Error de red'); }
  };

  const addTag = async () => {
    if (!selectedItem?._id || !tagInput.trim()) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/${selectedItem._id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagInput.trim() }),
      });
      const data = await res.json();
      showArrayMsg(res.ok ? 'ok' : 'err', data.message || (res.ok ? 'Tag agregado' : 'Error'));
      if (res.ok) { setTagInput(''); refreshSelectedItem(); }
    } catch { showArrayMsg('err', 'Error de red'); }
  };

  const removeTag = async (tag: string) => {
    if (!selectedItem?._id) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/${selectedItem._id}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
      const data = await res.json();
      showArrayMsg(res.ok ? 'ok' : 'err', data.message || '');
      if (res.ok) refreshSelectedItem();
    } catch { showArrayMsg('err', 'Error de red'); }
  };

  const searchByIngredient = async () => {
    if (!searchIngredient.trim()) return;
    try {
      const res = await fetch(`/api/arrays/menu-items/by-ingredient/${encodeURIComponent(searchIngredient.trim())}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data.items) ? data.items : []);
    } catch { setSearchResults([]); showArrayMsg('err', 'Error al buscar'); }
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
                  <th className="px-6 py-3">Imagen</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-right">Precio</th>
                  <th className="px-6 py-3">GridFS</th>
                  <th className="px-6 py-3">Arrays</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.imageId ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0OCA0OCIgdHJhbnNmb3JtPSJzY2FsZSgxLjUpIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iI2Y5ZmFmYiIgcng9IjgiLz48cGF0aCBkPSJtMTYgMjAgOCAxMCA4LTEwIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';
                            }}
                          />
                          <span className="text-xs text-green-600 font-medium">✓ Con imagen</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <span className="text-gray-400 text-xs">Sin img</span>
                          </div>
                          <span className="text-xs text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">Q{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {item.imageId ? (
                        <div className="text-xs">
                          <div className="font-mono text-gray-400 mb-1">ID: {item.imageId.slice(-6)}...</div>
                          <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Ver archivo
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(selectedItem?._id === item._id ? null : item)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${selectedItem?._id === item._id ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                      >
                        <Layers size={12} />
                        {selectedItem?._id === item._id ? 'Cerrar' : 'Gestionar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-violet-50/50 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Layers size={18} className="text-violet-500" />
              Ingredientes y tags — {selectedItem.name}
            </h3>
            <button type="button" onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700 text-sm">
              Cerrar
            </button>
          </div>
          {arrayMsg && (
            <div className={`px-4 py-2 text-sm ${arrayMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {arrayMsg.text}
            </div>
          )}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">$addToSet — Agregar ingrediente</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={e => setIngredientInput(e.target.value)}
                  placeholder="Ej: cebolla"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={addIngredient} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-2">$push + $each — Varios</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingredientsMultiple}
                  onChange={e => setIngredientsMultiple(e.target.value)}
                  placeholder="Ej: ajo, pimienta"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={addMultipleIngredients} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Ingredientes</p>
              <div className="flex flex-wrap gap-2">
                {(selectedItem.ingredients ?? []).length === 0 ? (
                  <span className="text-gray-400 text-sm">Ninguno</span>
                ) : (
                  (selectedItem.ingredients ?? []).map((ing: string) => (
                    <span key={ing} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      {ing}
                      <button type="button" onClick={() => removeIngredient(ing)} className="text-red-600 hover:text-red-800"><Trash2 size={12} /></button>
                    </span>
                  ))
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Tags</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Ej: vegetariano"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={addTag} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"><Tag size={14} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedItem.tags ?? []).length === 0 ? (
                  <span className="text-gray-400 text-sm">Ninguno</span>
                ) : (
                  (selectedItem.tags ?? []).map((t: string) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2 py-1 rounded text-sm">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-red-600 hover:text-red-800"><Trash2 size={12} /></button>
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buscar por ingrediente</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchIngredient}
                  onChange={e => setSearchIngredient(e.target.value)}
                  placeholder="Ej: salchicha"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button type="button" onClick={searchByIngredient} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Buscar
                </button>
              </div>
              {searchResults !== null && (
                <div className="mt-2 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay resultados</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {searchResults.map((m: any) => (
                        <li key={m._id} className="flex justify-between gap-2">
                          <span className="font-medium text-gray-800">{m.name}</span>
                          <span className="text-gray-500 truncate">{(m.ingredients ?? []).join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
