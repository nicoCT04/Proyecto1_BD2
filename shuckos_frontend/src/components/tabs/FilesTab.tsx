import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, FileText, Download, Image, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function FilesTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setFileId(data.fileId);
        setSelectedFile(null);
        // Reset el input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          GridFS - Almacenamiento de Archivos
        </h2>
        <p className="text-gray-700 text-sm mb-3">
          Sistema de archivos distribuido de MongoDB para almacenar archivos grandes (&gt;16MB).
          Especialmente útil para imágenes de platillos, menús en PDF, y documentos de calidad.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-800">Colecciones</div>
            <div className="text-gray-600">fs.files + fs.chunks</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-800">Chunk Size</div>
            <div className="text-gray-600">255 KB</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-800">Uso Principal</div>
            <div className="text-gray-600">Imágenes de menú</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="font-semibold text-gray-800">Referencia</div>
            <div className="text-gray-600">menu_items.imageId</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-emerald-500" />
          Subir Imagen de Platillo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Sube una imagen que se almacenará en GridFS y podrá asociarse con items del menú.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar imagen (JPG, PNG, GIF, WebP o PDF)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            <Plus size={18} />
            {uploading ? 'Subiendo a GridFS...' : 'Subir a GridFS'}
          </button>
        </form>

        {fileId && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Image size={18} />
              ✅ Archivo subido exitosamente
            </h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">File ID:</span> <code className="bg-green-100 px-2 py-1 rounded">{fileId}</code></div>
              <div><span className="font-medium">URL de descarga:</span> <code className="bg-green-100 px-2 py-1 rounded text-xs">/api/files/download/{fileId}</code></div>
              <div className="pt-2">
                <p className="text-green-700 font-medium flex items-center gap-1">
                  <LinkIcon size={14} />
                  Para asociar con menu item:
                </p>
                <code className="block bg-green-100 p-2 rounded text-xs mt-1">
                  PUT /api/menu-items/{'{item_id}'}/image<br/>
                  Body: {`{"imageId": "${fileId}"}`}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Search size={20} className="text-blue-500" />
          Relación con Menu Items
        </h3>
         <p className="text-gray-600 text-sm mb-4">
           Los archivos subidos aquí se pueden asociar con items del menú. Ve a la tab <strong>"Menú"</strong> 
           para ver cuáles items tienen imagen asociada, o usa la tab <strong>"Demo Rúbrica"</strong> 
           para ver la demostración técnica completa de GridFS.
         </p>
         <div className="flex gap-3">
           <button 
             onClick={() => {
               const dashboard = document.querySelector('[data-tab="menu"]') as HTMLElement;
               dashboard?.click();
             }}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
           >
             <FileText size={16} />
             Ver Menu Items
           </button>
           <button 
             onClick={() => {
               const dashboard = document.querySelector('[data-tab="rubrica"]') as HTMLElement;
               dashboard?.click();
             }}
             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
           >
             <Search size={16} />
             Demo Técnica
           </button>
         </div>
      </div>
    </div>
  );
}
