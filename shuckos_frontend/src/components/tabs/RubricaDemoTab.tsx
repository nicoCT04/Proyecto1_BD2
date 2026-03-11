import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Database, 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  List,
  MapPin,
  Type,
  Layers,
  GitBranch,
  BarChart3,
  Code,
  Play,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

interface DemoResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export default function RubricaDemoTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>('crud');
  const [results, setResults] = useState<Record<string, DemoResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const executeDemo = async (key: string, fn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    const startTime = performance.now();
    try {
      const data = await fn();
      const executionTime = performance.now() - startTime;
      setResults(prev => ({ 
        ...prev, 
        [key]: { success: true, data, executionTime } 
      }));
    } catch (error: any) {
      setResults(prev => ({ 
        ...prev, 
        [key]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const ResultDisplay = ({ resultKey }: { resultKey: string }) => {
    const result = results[resultKey];
    if (!result) return null;
    
    return (
      <div className={`mt-3 p-3 rounded-lg text-sm font-mono overflow-auto max-h-48 ${
        result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
      }`}>
        {result.executionTime && (
          <div className="text-xs text-gray-500 mb-2">
            Tiempo de ejecucion: {result.executionTime.toFixed(2)}ms
          </div>
        )}
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(result.data || result.error, null, 2)}
        </pre>
      </div>
    );
  };

  const DemoButton = ({ 
    label, 
    demoKey, 
    onClick, 
    color = 'emerald' 
  }: { 
    label: string; 
    demoKey: string; 
    onClick: () => void;
    color?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={loading[demoKey]}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all text-sm
        ${loading[demoKey] ? 'bg-gray-400' : `bg-${color}-600 hover:bg-${color}-700`}`}
    >
      {loading[demoKey] ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <Play size={16} />
      )}
      {label}
    </button>
  );

  const SectionHeader = ({ 
    id, 
    title, 
    points, 
    icon: Icon 
  }: { 
    id: string; 
    title: string; 
    points: number;
    icon: React.ElementType;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-emerald-400" />
        <span className="font-semibold">{title}</span>
        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
          {points} pts
        </span>
      </div>
      {expandedSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-bold mb-2">Demostracion de Rubrica - CC3089</h2>
        <p className="text-slate-300">
          Panel interactivo para demostrar cada criterio de evaluacion del proyecto.
          Haz clic en cada seccion para expandirla y ejecutar las demostraciones.
        </p>
      </div>

      {/* ========== INDICES (5 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="indices" title="Indices (Simples, Compuestos, Multikey, Geoespaciales, Texto)" points={5} icon={Layers} />
        
        {expandedSection === 'indices' && (
          <div className="p-6 space-y-6">
            {/* Crear Indices */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Database size={16} className="text-purple-500" />
                1. Crear Todos los Indices
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Crea indices simples, compuestos, geoespaciales, de texto y multikey en todas las colecciones.
              </p>
              <DemoButton 
                label="Crear Indices" 
                demoKey="createIndexes"
                onClick={() => executeDemo('createIndexes', async () => {
                  const res = await fetch('/api/admin/create-indexes');
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="createIndexes" />
            </div>

            {/* Listar Indices */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <List size={16} className="text-blue-500" />
                2. Listar Indices Creados
              </h4>
              <DemoButton 
                label="Ver Indices" 
                demoKey="listIndexes"
                onClick={() => executeDemo('listIndexes', async () => {
                  const res = await fetch('/api/admin/list-indexes');
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="listIndexes" />
            </div>

            {/* Busqueda Geoespacial */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                3. Indice Geoespacial (2dsphere) - Buscar Restaurantes Cercanos
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Busca restaurantes en un radio de 5km desde coordenadas de Guatemala City.
              </p>
              <DemoButton 
                label="Buscar Cercanos" 
                demoKey="geoSearch"
                onClick={() => executeDemo('geoSearch', async () => {
                  const res = await fetch('/api/restaurants/nearby?lat=14.6349&lng=-90.5069&maxDistance=5000');
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="geoSearch" />
            </div>

            {/* Busqueda de Texto */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Type size={16} className="text-orange-500" />
                4. Indice de Texto - Busqueda Full-Text
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Busca restaurantes usando busqueda de texto completo.
              </p>
              <DemoButton 
                label="Buscar 'shuko'" 
                demoKey="textSearch"
                onClick={() => executeDemo('textSearch', async () => {
                  const res = await fetch('/api/restaurants/search?q=shuko');
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="textSearch" />
            </div>

            {/* Indice Multikey */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Layers size={16} className="text-green-500" />
                5. Indice Multikey - Buscar por Ingrediente (Array)
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Busca menu items que contengan un ingrediente especifico usando indice multikey.
              </p>
              <DemoButton 
                label="Buscar con 'salchicha'" 
                demoKey="multikeySearch"
                onClick={() => executeDemo('multikeySearch', async () => {
                  const res = await fetch('/api/arrays/menu-items/by-ingredient/salchicha');
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="multikeySearch" />
            </div>
          </div>
        )}
      </div>

      {/* ========== CRUD (45 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="crud" title="Operaciones CRUD Completas" points={45} icon={Database} />
        
        {expandedSection === 'crud' && (
          <div className="p-6 space-y-6">
            {/* CREATE */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Edit size={16} className="text-emerald-500" />
                CREATE - Documentos Embebidos y Referenciados (10 pts)
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Crea un pedido con items embebidos y referencias a usuario/restaurante.
              </p>
              <DemoButton 
                label="Crear Pedido (Embebido + Referenciado)" 
                demoKey="createOrder"
                onClick={() => executeDemo('createOrder', async () => {
                  // Primero obtener un usuario y restaurante existentes
                  const usersRes = await fetch('/api/users/');
                  const users = await usersRes.json();
                  const restRes = await fetch('/api/restaurants/');
                  const restaurants = await restRes.json();
                  
                  if (!users.length || !restaurants.length) {
                    throw new Error('Necesitas crear usuarios y restaurantes primero');
                  }

                  const menuRes = await fetch(`/api/menu-items/restaurant/${restaurants[0]._id}`);
                  const menuItems = await menuRes.json();

                  const orderData = {
                    user: users[0]._id,
                    restaurant: restaurants[0]._id,
                    items: menuItems.slice(0, 2).map((m: any) => ({
                      menuItem: m._id,
                      name: m.name,
                      price: m.price,
                      quantity: 2
                    })),
                    totalAmount: menuItems.slice(0, 2).reduce((sum: number, m: any) => sum + m.price * 2, 0),
                    status: 'pending'
                  };

                  const res = await fetch('/api/orders/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                  });
                  return { 
                    message: 'Pedido creado exitosamente',
                    orderData,
                    response: await res.json(),
                    nota: 'Items EMBEBIDOS en el pedido, userId y restaurantId son REFERENCIAS'
                  };
                })}
              />
              <ResultDisplay resultKey="createOrder" />
            </div>

            {/* READ */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Search size={16} className="text-blue-500" />
                READ - Consultas Multi-coleccion con Filtros, Proyecciones, Sort, Skip, Limit (15 pts)
              </h4>
              <div className="space-y-3">
                <DemoButton 
                  label="Consulta con $lookup + Filtros + Sort + Skip + Limit" 
                  demoKey="readComplex"
                  onClick={() => executeDemo('readComplex', async () => {
                    // Consulta con todos los parametros
                    const res = await fetch('/api/orders/?limit=5&skip=0&status=pending');
                    const orders = await res.json();
                    return {
                      message: 'Consulta compleja ejecutada',
                      parametros: {
                        filtro: 'status=pending',
                        ordenamiento: 'orderDate DESC',
                        skip: 0,
                        limit: 5,
                        lookup: 'Se hace $lookup a restaurants collection'
                      },
                      resultados: orders,
                      total: orders.length
                    };
                  })}
                />
                <ResultDisplay resultKey="readComplex" />

                <DemoButton 
                  label="Ver Plan de Ejecucion (explain)" 
                  demoKey="explainQuery"
                  onClick={() => executeDemo('explainQuery', async () => {
                    const restRes = await fetch('/api/restaurants/');
                    const restaurants = await restRes.json();
                    if (!restaurants.length) throw new Error('No hay restaurantes');
                    
                    const res = await fetch(`/api/orders/explain/${restaurants[0]._id}`);
                    return res.json();
                  })}
                />
                <ResultDisplay resultKey="explainQuery" />
              </div>
            </div>

            {/* UPDATE */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Edit size={16} className="text-yellow-500" />
                UPDATE - Actualizar 1 y Varios Documentos (10 pts)
              </h4>
              <div className="space-y-3">
                <DemoButton 
                  label="Actualizar 1 Documento (Cambiar status de pedido)" 
                  demoKey="updateOne"
                  onClick={() => executeDemo('updateOne', async () => {
                    const ordersRes = await fetch('/api/orders/');
                    const orders = await ordersRes.json();
                    if (!orders.length) throw new Error('No hay pedidos');
                    
                    const res = await fetch(`/api/orders/${orders[0]._id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'preparing' })
                    });
                    return {
                      message: 'Documento actualizado',
                      orderId: orders[0]._id,
                      nuevoStatus: 'preparing',
                      response: await res.json()
                    };
                  })}
                />
                <ResultDisplay resultKey="updateOne" />

                <DemoButton 
                  label="Actualizar Varios Documentos (updateMany)" 
                  demoKey="updateMany"
                  onClick={() => executeDemo('updateMany', async () => {
                    const res = await fetch('/api/restaurants/', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        filter: { isActive: true },
                        update: { lastBulkUpdate: new Date().toISOString() }
                      })
                    });
                    return {
                      message: 'Multiples documentos actualizados',
                      operacion: 'updateMany',
                      filtro: '{ isActive: true }',
                      response: await res.json()
                    };
                  })}
                />
                <ResultDisplay resultKey="updateMany" />
              </div>
            </div>

            {/* DELETE */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Trash2 size={16} className="text-red-500" />
                DELETE - Eliminar 1 y Varios Documentos (10 pts)
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                La eliminacion de documentos se demuestra en las tabs de Restaurantes, Pedidos, Resenas, etc.
                Tambien existe deleteMany para eliminar multiples documentos.
              </p>
              <DemoButton 
                label="Ver Endpoint deleteMany (Solo muestra, no ejecuta)" 
                demoKey="deleteInfo"
                onClick={() => executeDemo('deleteInfo', async () => {
                  return {
                    message: 'Endpoints de eliminacion disponibles',
                    endpoints: {
                      deleteOne: 'DELETE /api/restaurants/{id}',
                      deleteMany: 'DELETE /api/restaurants/ con body { filter: { ... } }'
                    },
                    nota: 'Para no perder datos, esta demo solo muestra los endpoints disponibles'
                  };
                })}
              />
              <ResultDisplay resultKey="deleteInfo" />
            </div>
          </div>
        )}
      </div>

      {/* ========== GRIDFS Y 50K DOCS (5 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="gridfs" title="GridFS y Archivos + 50,000 Documentos" points={5} icon={FileText} />
        
        {expandedSection === 'gridfs' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">GridFS - Manejo de Archivos para Menu Items</h4>
              <p className="text-sm text-gray-600 mb-3">
                GridFS almacena imágenes de platillos y las relaciona con los items del menú mediante referencia.
              </p>
              <div className="space-y-3">
                <DemoButton 
                  label="Listar Menu Items con Imágenes (GridFS + Referencias)" 
                  demoKey="menuWithImages"
                  onClick={() => executeDemo('menuWithImages', async () => {
                    const res = await fetch('/api/menu-items/with-images');
                    const data = await res.json();
                    return {
                      explicacion: 'Menu items que tienen imagen almacenada en GridFS',
                      relacion: 'Campo imageId en menu_items referencia _id en GridFS (fs.files)',
                      endpoint: '/api/menu-items/with-images',
                      ...data
                    };
                  })}
                />
                <ResultDisplay resultKey="menuWithImages" />

                <DemoButton 
                  label="Listar Todos los Archivos en GridFS" 
                  demoKey="listFiles"
                  onClick={() => executeDemo('listFiles', async () => {
                    const res = await fetch('/api/files/');
                    const data = await res.json();
                    return {
                      ...data,
                      colecciones: {
                        'fs.files': 'Metadatos de archivos',
                        'fs.chunks': 'Chunks binarios (255KB cada uno)'
                      },
                      uso_casos: [
                        'Imágenes de platillos > 16MB',
                        'Menús en PDF',
                        'Certificados de calidad',
                        'Fotos de restaurantes'
                      ]
                    };
                  })}
                />
                <ResultDisplay resultKey="listFiles" />
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Demostración Completa: Subir Imagen y Asociar</h4>
              <p className="text-sm text-gray-600 mb-3">
                1. Sube una imagen → GridFS devuelve fileId<br/>
                2. Asocia fileId con un menu item → Crea referencia<br/>
                3. Ver resultado en /api/menu-items/with-images
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Para demo completa:</strong>
                </p>
                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                  <li>Ve a la tab "Archivos" y sube una imagen</li>
                  <li>Copia el fileId que se genera</li>
                  <li>Usa: PUT /api/menu-items/{'{menu_item_id}'}/image</li>
                  <li>Body: {`{"imageId": "tu_file_id"}`}</li>
                  <li>Regresa aquí y ejecuta "Menu Items con Imágenes"</li>
                </ol>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Generacion de 50,000+ Documentos (Bulk Operations)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Genera 50,000 visitas + pedidos + resenas usando bulk_write para demostracion.
              </p>
              <DemoButton 
                label="Generar Dataset Completo (50K+ docs)" 
                demoKey="seedData"
                onClick={() => executeDemo('seedData', async () => {
                  const res = await fetch('/api/admin/seed-full-dataset', { method: 'POST' });
                  return res.json();
                })}
              />
              <ResultDisplay resultKey="seedData" />
            </div>
          </div>
        )}
      </div>

      {/* ========== AGREGACIONES (15 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="aggregations" title="Agregaciones (Simples y Complejas)" points={15} icon={BarChart3} />
        
        {expandedSection === 'aggregations' && (
          <div className="p-6 space-y-6">
            {/* Simples */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Agregaciones Simples (5 pts) - count, distinct</h4>
              <div className="space-y-3">
                <DemoButton 
                  label="Count de Pedidos por Status" 
                  demoKey="countOrders"
                  onClick={() => executeDemo('countOrders', async () => {
                    const res = await fetch('/api/analytics/orders-count-by-status');
                    return res.json();
                  })}
                />
                <ResultDisplay resultKey="countOrders" />

                <DemoButton 
                  label="Distinct de Categorias de Menu" 
                  demoKey="distinctCategories"
                  onClick={() => executeDemo('distinctCategories', async () => {
                    const res = await fetch('/api/analytics/distinct-categories');
                    return res.json();
                  })}
                />
                <ResultDisplay resultKey="distinctCategories" />
              </div>
            </div>

            {/* Complejas */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Agregaciones Complejas (10 pts) - Pipelines</h4>
              <div className="space-y-3">
                <DemoButton 
                  label="Pipeline: Ingresos por Restaurante" 
                  demoKey="revenueAgg"
                  onClick={() => executeDemo('revenueAgg', async () => {
                    const res = await fetch('/api/orders/analytics/revenue');
                    const data = await res.json();
                    return {
                      pipeline: [
                        '{ $match: { status: "delivered" } }',
                        '{ $group: { _id: "$restaurantId", totalRevenue: { $sum: "$totalAmount" } } }',
                        '{ $lookup: { from: "restaurants", ... } }',
                        '{ $sort: { totalRevenue: -1 } }'
                      ],
                      resultados: data
                    };
                  })}
                />
                <ResultDisplay resultKey="revenueAgg" />

                <DemoButton 
                  label="Pipeline: Top Productos Vendidos" 
                  demoKey="topProducts"
                  onClick={() => executeDemo('topProducts', async () => {
                    const res = await fetch('/api/orders/analytics/top-products');
                    const data = await res.json();
                    return {
                      pipeline: [
                        '{ $unwind: "$items" }',
                        '{ $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } }',
                        '{ $sort: { totalSold: -1 } }',
                        '{ $limit: 10 }'
                      ],
                      resultados: data
                    };
                  })}
                />
                <ResultDisplay resultKey="topProducts" />

                <DemoButton 
                  label="Pipeline: Tasa de Conversion (Visitas -> Pedidos)" 
                  demoKey="conversionRate"
                  onClick={() => executeDemo('conversionRate', async () => {
                    const res = await fetch('/api/analytics/conversion-rate');
                    return res.json();
                  })}
                />
                <ResultDisplay resultKey="conversionRate" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== MANEJO DE ARRAYS (10 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="arrays" title="Manejo de Arrays ($push, $pull, $addToSet)" points={10} icon={List} />
        
        {expandedSection === 'arrays' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">$addToSet - Agregar sin Duplicados</h4>
              <DemoButton 
                label="Agregar Ingrediente con $addToSet" 
                demoKey="addToSet"
                onClick={() => executeDemo('addToSet', async () => {
                  const menuRes = await fetch('/api/menu-items/');
                  const items = await menuRes.json();
                  if (!items.length) throw new Error('No hay menu items');
                  
                  const res = await fetch(`/api/arrays/menu-items/${items[0]._id}/ingredients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ingredient: 'queso_extra' })
                  });
                  return {
                    operacion: '$addToSet',
                    menuItemId: items[0]._id,
                    ingrediente: 'queso_extra',
                    response: await res.json()
                  };
                })}
              />
              <ResultDisplay resultKey="addToSet" />
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">$push - Agregar al Array (permite duplicados)</h4>
              <DemoButton 
                label="Agregar Multiples Ingredientes con $push + $each" 
                demoKey="pushMultiple"
                onClick={() => executeDemo('pushMultiple', async () => {
                  const menuRes = await fetch('/api/menu-items/');
                  const items = await menuRes.json();
                  if (!items.length) throw new Error('No hay menu items');
                  
                  const res = await fetch(`/api/arrays/menu-items/${items[0]._id}/ingredients/multiple`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ingredients: ['tomate', 'cebolla', 'jalapeño'] })
                  });
                  return {
                    operacion: '$push con $each',
                    menuItemId: items[0]._id,
                    ingredientes: ['tomate', 'cebolla', 'jalapeño'],
                    response: await res.json()
                  };
                })}
              />
              <ResultDisplay resultKey="pushMultiple" />
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">$pull - Eliminar del Array</h4>
              <DemoButton 
                label="Eliminar Ingrediente con $pull" 
                demoKey="pullItem"
                onClick={() => executeDemo('pullItem', async () => {
                  const menuRes = await fetch('/api/menu-items/');
                  const items = await menuRes.json();
                  if (!items.length) throw new Error('No hay menu items');
                  
                  const res = await fetch(`/api/arrays/menu-items/${items[0]._id}/ingredients`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ingredient: 'queso_extra' })
                  });
                  return {
                    operacion: '$pull',
                    menuItemId: items[0]._id,
                    ingredienteEliminado: 'queso_extra',
                    response: await res.json()
                  };
                })}
              />
              <ResultDisplay resultKey="pullItem" />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Consultar por Elementos en Array</h4>
              <DemoButton 
                label="Buscar Items con Ingrediente Especifico" 
                demoKey="queryArray"
                onClick={() => executeDemo('queryArray', async () => {
                  const res = await fetch('/api/arrays/menu-items/by-ingredient/salchicha');
                  return {
                    consulta: '{ ingredients: "salchicha" }',
                    nota: 'Usa indice multikey para eficiencia',
                    resultados: await res.json()
                  };
                })}
              />
              <ResultDisplay resultKey="queryArray" />
            </div>
          </div>
        )}
      </div>

      {/* ========== DOCUMENTOS EMBEBIDOS (5 puntos) ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="embedded" title="Documentos Embebidos" points={5} icon={GitBranch} />
        
        {expandedSection === 'embedded' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Pedidos con Items Embebidos</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cada pedido tiene un array de items embebidos con nombre, precio y cantidad.
              </p>
              <DemoButton 
                label="Ver Estructura de Pedido (Items Embebidos)" 
                demoKey="embeddedOrder"
                onClick={() => executeDemo('embeddedOrder', async () => {
                  const res = await fetch('/api/orders/?limit=1');
                  const orders = await res.json();
                  if (!orders.length) throw new Error('No hay pedidos');
                  
                  return {
                    explicacion: 'Los items estan EMBEBIDOS dentro del documento del pedido',
                    estructura: {
                      _id: orders[0]._id,
                      userId: orders[0].userId + ' (REFERENCIA)',
                      restaurantId: orders[0].restaurantId + ' (REFERENCIA)',
                      items: orders[0].items?.map((i: any) => ({
                        ...i,
                        nota: 'EMBEBIDO - No es una referencia'
                      })),
                      totalAmount: orders[0].totalAmount,
                      status: orders[0].status
                    }
                  };
                })}
              />
              <ResultDisplay resultKey="embeddedOrder" />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Inspecciones con Detalles Embebidos</h4>
              <DemoButton 
                label="Ver Estructura de Inspeccion" 
                demoKey="embeddedInspection"
                onClick={() => executeDemo('embeddedInspection', async () => {
                  const res = await fetch('/api/inspections/');
                  const inspections = await res.json();
                  
                  return {
                    explicacion: 'Las inspecciones tienen detalles embebidos',
                    ejemplo: inspections[0] || {
                      nota: 'No hay inspecciones. Crea una en la tab Inspecciones.',
                      estructura_esperada: {
                        restaurantId: 'REFERENCIA',
                        inspectorId: 'REFERENCIA',
                        details: {
                          hygiene: 85,
                          foodQuality: 90,
                          serviceQuality: 88,
                          notes: 'EMBEBIDO - Subdocumento con detalles'
                        }
                      }
                    }
                  };
                })}
              />
              <ResultDisplay resultKey="embeddedInspection" />
            </div>
          </div>
        )}
      </div>

      {/* ========== TRANSACCIONES ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SectionHeader id="transactions" title="Transacciones Multi-documento (ACID)" points={0} icon={Code} />
        
        {expandedSection === 'transactions' && (
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600 mb-4">
              Las transacciones se usan automaticamente al crear pedidos, resenas e inspecciones
              para garantizar consistencia ACID.
            </p>
            
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Crear Resena (Con Transaccion)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Al crear una resena, se actualiza atomicamente el rating promedio del restaurante.
              </p>
              <DemoButton 
                label="Crear Resena (Transaccion Automatica)" 
                demoKey="transactionReview"
                onClick={() => executeDemo('transactionReview', async () => {
                  const usersRes = await fetch('/api/users/');
                  const users = await usersRes.json();
                  const restRes = await fetch('/api/restaurants/');
                  const restaurants = await restRes.json();
                  const ordersRes = await fetch('/api/orders/');
                  const orders = await ordersRes.json();
                  
                  if (!users.length || !restaurants.length) {
                    throw new Error('Necesitas usuarios y restaurantes');
                  }

                  // Buscar un pedido sin resena
                  const orderWithoutReview = orders.find((o: any) => o.status === 'delivered');
                  
                  const reviewData = {
                    user: users[0]._id,
                    restaurant: restaurants[0]._id,
                    order: orderWithoutReview?._id,
                    rating: 5,
                    comment: 'Excelente servicio! Los shukos estaban deliciosos.'
                  };

                  const res = await fetch('/api/reviews/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                  });

                  return {
                    mensaje: 'Resena creada con transaccion',
                    operaciones_atomicas: [
                      '1. Insertar resena en coleccion reviews',
                      '2. Actualizar averageRating del restaurante',
                      '3. Incrementar contador de resenas'
                    ],
                    garantia: 'Si alguna operacion falla, todas se revierten (rollback)',
                    response: await res.json()
                  };
                })}
              />
              <ResultDisplay resultKey="transactionReview" />
            </div>
          </div>
        )}
      </div>

      {/* Footer con resumen */}
      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">Resumen de Puntos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Indices</p>
            <p className="text-2xl font-bold text-emerald-600">5 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">CRUD</p>
            <p className="text-2xl font-bold text-emerald-600">45 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">GridFS + 50K</p>
            <p className="text-2xl font-bold text-emerald-600">5 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Agregaciones</p>
            <p className="text-2xl font-bold text-emerald-600">15 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Arrays</p>
            <p className="text-2xl font-bold text-emerald-600">10 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Embebidos</p>
            <p className="text-2xl font-bold text-emerald-600">5 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Modelo</p>
            <p className="text-2xl font-bold text-emerald-600">5 pts</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500">Documentacion</p>
            <p className="text-2xl font-bold text-emerald-600">10 pts</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between items-center">
          <span className="font-bold text-slate-700">TOTAL BASE:</span>
          <span className="text-3xl font-bold text-emerald-600">100 pts</span>
        </div>
      </div>
    </div>
  );
}
