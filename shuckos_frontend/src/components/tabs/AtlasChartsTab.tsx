import React, { useState } from 'react';
import { PieChart, ExternalLink, Info, Link as LinkIcon, Code } from 'lucide-react';

export default function AtlasChartsTab() {
  const [embedCode, setEmbedCode] = useState('');
  const [iframeSrc, setIframeSrc] = useState('');

  const handleEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract src from iframe code if user pasted the whole iframe
    if (embedCode.includes('<iframe')) {
      const match = embedCode.match(/src="([^"]+)"/);
      if (match && match[1]) {
        setIframeSrc(match[1]);
      } else {
        alert('No se pudo encontrar el atributo src en el código del iframe.');
      }
    } else if (embedCode.startsWith('http')) {
      // User pasted just the URL
      setIframeSrc(embedCode);
    } else {
      alert('Por favor, ingresa una URL válida o el código del iframe.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PieChart size={24} className="text-emerald-500" />
          MongoDB Atlas Charts
        </h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Code size={20} className="text-blue-500" />
              Integrar Chart Externo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Pega el código de inserción (iframe) o la URL pública generada desde tu panel de <strong>MongoDB Atlas Charts</strong> para visualizar tus dashboards en tiempo real.
            </p>
            
            <form onSubmit={handleEmbed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Iframe o URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={embedCode}
                    onChange={(e) => setEmbedCode(e.target.value)}
                    placeholder='<iframe src="https://charts.mongodb.com/..." ...></iframe>'
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!embedCode}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cargar Chart
              </button>
            </form>
          </div>

          <div className="w-full md:w-1/3 bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
              <Info size={18} />
              ¿Cómo obtener el código?
            </h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Ve a tu proyecto en MongoDB Atlas.</li>
              <li>Abre la pestaña <strong>Charts</strong>.</li>
              <li>Crea o selecciona un Dashboard.</li>
              <li>En el menú del Chart, haz clic en <strong>Embed Chart</strong>.</li>
              <li>Habilita el acceso no autenticado o por token.</li>
              <li>Copia el código del <strong>Iframe</strong> y pégalo aquí.</li>
            </ol>
            <a 
              href="https://www.mongodb.com/docs/charts/embedding-charts/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
            >
              Ver documentación <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <PieChart size={18} className="text-gray-500" />
            Visualización del Chart
          </h3>
          {iframeSrc && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado
            </span>
          )}
        </div>
        
        <div className="flex-1 bg-gray-50/50 p-4 flex items-center justify-center">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="w-full h-full min-h-[500px] border-0 rounded-lg shadow-inner bg-white"
              title="MongoDB Atlas Chart"
            />
          ) : (
            <div className="text-center text-gray-400 max-w-sm">
              <PieChart size={48} className="mx-auto mb-3 opacity-20" />
              <p>El chart aparecerá aquí una vez que ingreses una URL o código de inserción válido.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
