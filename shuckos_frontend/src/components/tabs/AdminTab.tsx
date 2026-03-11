import React, { useState } from 'react';
import { Database, List, PlusCircle } from 'lucide-react';

export default function AdminTab() {
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [indexesData, setIndexesData] = useState<{
    indexes?: Record<string, { name: string; keys: Record<string, unknown>; type: string }[]>;
    message?: string;
  } | null>(null);
  const [loadingIndexes, setLoadingIndexes] = useState(false);
  const [creatingIndexes, setCreatingIndexes] = useState(false);

  const fetchIndexes = async () => {
    setLoadingIndexes(true);
    setIndexesData(null);
    try {
      const res = await fetch('/api/admin/list-indexes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Error');
      setIndexesData(data);
    } catch (err) {
      console.error(err);
      setIndexesData({ message: err instanceof Error ? err.message : 'Error al listar índices' });
    } finally {
      setLoadingIndexes(false);
    }
  };

  const createIndexes = async () => {
    setCreatingIndexes(true);
    try {
      const res = await fetch('/api/admin/create-indexes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Error');
      alert(data.message || 'Índices creados correctamente');
      fetchIndexes();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error al crear índices');
    } finally {
      setCreatingIndexes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <List size={20} className="text-amber-500" />
          Índices de MongoDB
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Verifica si los índices (texto, 2dsphere, multikey, etc.) están creados. Si faltan, créalos para que búsqueda por texto, geoespacial y por tags funcionen.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={fetchIndexes}
            disabled={loadingIndexes}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <List size={16} />
            {loadingIndexes ? 'Cargando...' : 'Ver índices'}
          </button>
          <button
            onClick={createIndexes}
            disabled={creatingIndexes}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <PlusCircle size={16} />
            {creatingIndexes ? 'Creando...' : 'Crear índices'}
          </button>
        </div>
        {indexesData && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            {indexesData.message && !indexesData.indexes && (
              <div className="p-4 text-amber-700 bg-amber-50">{indexesData.message}</div>
            )}
            {indexesData.indexes && (
              <div className="p-4 max-h-80 overflow-y-auto space-y-4">
                {Object.entries(indexesData.indexes).map(([coll, idxList]) => (
                  <div key={coll}>
                    <div className="font-semibold text-gray-800 mb-1">{coll}</div>
                    <ul className="text-sm space-y-1 text-gray-600">
                      {(idxList as { name: string; type?: string; keys: Record<string, unknown> }[]).map((idx, i) => (
                        <li key={i} className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">
                            {idx.name}
                          </span>
                          {idx.type && (
                            <span className="text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              {idx.type}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Database size={20} className="text-purple-500" />
          Operaciones de Base de Datos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Genera datos de prueba para todas las colecciones o reinicia la base de datos.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={async () => {
              setLoadingSeed(true);
              try {
                const res = await fetch('/api/admin/seed-full-dataset', { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || data.detail || 'Error');
                alert(data.message || 'Dataset generado correctamente');
              } catch (err) {
                console.error(err);
                alert(err instanceof Error ? err.message : 'Error al generar documentos');
              } finally {
                setLoadingSeed(false);
              }
            }}
            disabled={loadingSeed || loadingReset}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loadingSeed ? 'Generando...' : 'Generar Dataset Completo'}
          </button>

          <button
            onClick={async () => {
              if (!confirm('¿Estás seguro de que deseas eliminar todos los datos?')) return;
              setLoadingReset(true);
              try {
                const res = await fetch('/api/admin/reset-database', { method: 'DELETE' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || data.detail || 'Error');
                alert(data.message || 'Base de datos reiniciada');
              } catch (err) {
                console.error(err);
                alert(err instanceof Error ? err.message : 'Error al reiniciar base de datos');
              } finally {
                setLoadingReset(false);
              }
            }}
            disabled={loadingSeed || loadingReset}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loadingReset ? 'Reiniciando...' : 'Reiniciar Base de Datos'}
          </button>
        </div>
      </div>
    </div>
  );
}
