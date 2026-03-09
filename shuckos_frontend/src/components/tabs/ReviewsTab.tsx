import React, { useState, useEffect } from 'react';
import { Star, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users/');
      setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants/');
      setRestaurants(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRestaurant) return alert('Selecciona usuario y restaurante');

    try {
      await fetch('/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: selectedUser,
          restaurant: selectedRestaurant,
          rating,
          comment
        })
      });
      setSelectedUser('');
      setSelectedRestaurant('');
      setRating(5);
      setComment('');
      fetchRestaurants(); // Refresh restaurants to see updated rating
      alert('Reseña guardada y rating actualizado (Aggregations)');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-500" />
          Dejar una Reseña
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select 
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            >
              <option value="">Selecciona un usuario...</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurante</label>
            <select 
              value={selectedRestaurant}
              onChange={e => setSelectedRestaurant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            >
              <option value="">Selecciona un restaurante...</option>
              {restaurants.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (1-5)</label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded-full transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                >
                  <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">{rating} estrellas</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="¡Los mejores shuckos que he probado!"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Publicar Reseña
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Star size={18} className="text-gray-500" />
            Restaurantes y sus Calificaciones
          </h3>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Actualizado vía Aggregation
          </span>
        </div>
        
        {restaurants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay restaurantes registrados</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {restaurants.map(rest => (
              <div key={rest._id} className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">{rest.name}</h4>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{rest.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    <span className="font-bold text-lg text-gray-900">{rest.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500 ml-1">/ 5.0</span>
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
