import React, { useState } from 'react';
import { PieChart, ExternalLink, Info, Link as LinkIcon, Code } from 'lucide-react';

export default function AtlasChartsTab() {
  const [embedCode, setEmbedCode] = useState('');
  const [charts, setCharts] = useState<string[]>([]);

  const handleEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    let src = '';
    if (embedCode.includes('<iframe')) {
      const match = embedCode.match(/src="([^"]+)"/);
      if (match && match[1]) {
        src = match[1];
      } else {
        alert('No se pudo encontrar el atributo src en el código del iframe.');
        return;
      }
    } else if (embedCode.startsWith('http')) {
      src = embedCode;
    } else {
      alert('Por favor, ingresa una URL válida o el código del iframe.');
      return;
    }
    setCharts((prev) => [...prev, src]);
    setEmbedCode('');
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

      <div className="space-y-6">
        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <PieChart size={18} className="text-gray-500" />
            Charts cargados ({charts.length})
          </h3>
          {charts.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado
            </span>
          )}
        </div>

        {charts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center p-8">
            <div className="text-center text-gray-400 max-w-sm">
              <PieChart size={48} className="mx-auto mb-3 opacity-20" />
              <p>El chart aparecerá aquí una vez que ingreses una URL o código de inserción válido.</p>
            </div>
          </div>
        ) : (
          charts.map((src, index) => (
            <div
              key={`${src.slice(0, 40)}-${index}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Chart {index + 1}</span>
                <button
                  type="button"
                  onClick={() => setCharts((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Quitar
                </button>
              </div>
              <div className="p-4 min-h-[400px] bg-gray-50/50">
                <iframe
                  src={src}
                  className="w-full min-h-[400px] border-0 rounded-lg shadow-inner bg-white"
                  title={`MongoDB Atlas Chart ${index + 1}`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
