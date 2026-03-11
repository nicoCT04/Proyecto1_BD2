import React, { useState } from 'react';
import { Database, Upload, FileText, Download, List, PlusCircle } from 'lucide-react';

export default function AdminTab() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState('');
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [indexesData, setIndexesData] = useState<{
    indexes?: Record<string, { name: string; keys: Record<string, unknown>; type: string }[]>;
    message?: string;
  } | null>(null);
  const [loadingIndexes, setLoadingIndexes] = useState(false);
  const [creatingIndexes, setCreatingIndexes] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Selecciona un archivo primero');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setFileId(data.file_id || data.fileId || data.id);
      alert('Archivo subido exitosamente a GridFS');
    } catch (err) {
      console.error(err);
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (!fileId) return alert('No hay ID de archivo');
    window.open(`/api/files/download/${fileId}`, '_blank');
  };

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
          <Database size={20} className="text-emerald-500" />
          Manejo de Archivos (GridFS)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50">
            <Upload size={32} className="text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Sube un archivo (ej. imagen del restaurante o menú en PDF) para almacenarlo en MongoDB GridFS.</p>
            
            <input 
              type="file" 
              onChange={handleFileChange}
              className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full"
            >
              {uploading ? 'Subiendo...' : 'Subir a GridFS'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Archivo Subido
            </h4>
            
            {fileId ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center mb-4 w-full break-all">
                  <span className="block text-xs font-semibold uppercase mb-1">File ID</span>
                  <span className="font-mono text-sm">{fileId}</span>
                </div>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full justify-center"
                >
                  <Download size={18} />
                  Descargar Archivo
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Sube un archivo para ver su ID y descargarlo.
              </div>
            )}
          </div>
        </div>
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
