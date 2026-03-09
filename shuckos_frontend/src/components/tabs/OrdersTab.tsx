import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Clock, CheckCircle2, XCircle, ChefHat } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [orderItems, setOrderItems] = useState<{ menuItemId: string, quantity: number }[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
      setOrderItems([]); // Reset items when restaurant changes
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurant]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchMenuItems = async (restId: string) => {
    try {
      const res = await fetch(`/api/menu-items/restaurant/${restId}`);
      setMenuItems(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddItem = (menuItemId: string) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.menuItemId !== menuItemId);
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find(m => m._id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRestaurant || orderItems.length === 0) {
      return alert('Completa todos los campos y añade al menos un artículo');
    }

    const itemsToSave = orderItems.map(item => {
      const menuItem = menuItems.find(m => m._id === item.menuItemId);
      return {
        menuItem: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      };
    });

    try {
      await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: selectedUser,
          restaurant: selectedRestaurant,
          items: itemsToSave,
          totalAmount: calculateTotal(),
          status: 'pending'
        })
      });
      setSelectedUser('');
      setSelectedRestaurant('');
      setOrderItems([]);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'preparing': return <ChefHat size={16} className="text-blue-500" />;
      case 'delivered': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'preparing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-500" />
          Crear Nuevo Pedido
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Cliente)</label>
              <select 
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              >
                <option value="">Selecciona un usuario...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
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

            {selectedRestaurant && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Menú Disponible</h4>
                {menuItems.length === 0 ? (
                  <p className="text-xs text-gray-500">No hay artículos en el menú.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {menuItems.map(item => (
                      <div key={item._id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-emerald-600 font-medium">Q{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddItem(item._id)}
                          className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingCart size={16} className="text-gray-500" />
              Resumen del Pedido (Documentos Embebidos)
            </h4>
            
            <div className="flex-1 overflow-y-auto mb-4">
              {orderItems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  Agrega artículos del menú
                </div>
              ) : (
                <div className="space-y-2">
                  {orderItems.map(item => {
                    const menuItem = menuItems.find(m => m._id === item.menuItemId);
                    if (!menuItem) return null;
                    return (
                      <div key={item.menuItemId} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{menuItem.name}</p>
                          <p className="text-xs text-gray-500">Q{menuItem.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">Q{(menuItem.price * item.quantity).toFixed(2)}</span>
                          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                            <button type="button" onClick={() => handleRemoveItem(item.menuItemId)} className="px-2 text-gray-600 hover:bg-white rounded">-</button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => handleAddItem(item.menuItemId)} className="px-2 text-gray-600 hover:bg-white rounded">+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-700">Total a Pagar</span>
                <span className="text-xl font-bold text-emerald-600">Q{calculateTotal().toFixed(2)}</span>
              </div>
              <button 
                type="submit"
                disabled={orderItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-500" />
            Historial de Pedidos (Aggregation con $lookup)
          </h3>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {orders.length} pedidos
          </span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay pedidos registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">ID Pedido / Fecha</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Restaurante</th>
                  <th className="px-6 py-3">Artículos (Embebidos)</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-400 mb-1">{order._id.slice(-6)}</div>
                      <div className="text-xs font-medium text-gray-900">
                        {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.userDetails?.name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.restaurantDetails?.name || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      Q{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
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
