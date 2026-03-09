import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function FilesTab() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // In a real scenario, you'd fetch the list of files from an endpoint.
    // Since we don't have a GET /files (list) endpoint in the spec,
    // this tab mainly demonstrates the upload functionality.
    setLoading(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Archivo subido exitosamente. ID: ${data.fileId}`);
        setSelectedFile(null);
      } else {
        alert('Error al subir archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este archivo?')) {
      try {
        await fetch(`/api/files/${id}`, { method: 'DELETE' });
        setFiles(files.filter(f => f._id !== id));
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Nuevo Archivo (GridFS)</h3>
        <form onSubmit={handleUpload} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Archivo
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald-50 file:text-emerald-700
                hover:file:bg-emerald-100 border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            <Plus size={18} />
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <p className="text-gray-500 text-sm">
           * La lista de archivos requiere un endpoint de listado en el backend para mostrarse aquí. Puedes usar el ID generado al subir para descargar el archivo mediante la API: <code>/api/files/download/:id</code>
         </p>
      </div>
    </div>
  );
}
