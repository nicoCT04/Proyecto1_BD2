import pymongo.monitoring
import asyncio
from datetime import datetime
from app.websocket_manager import manager
import json
from bson import ObjectId

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

def safe_stringify(obj):
    try:
        return json.dumps(obj, cls=CustomJSONEncoder)
    except Exception:
        return "[Error de serialización]"

class MongoCommandLogger(pymongo.monitoring.CommandListener):
    def started(self, event):
        # A command started
        command_name = event.command_name
        
        # Ignorar comandos internos ruidosos
        if command_name in ['ping', 'ismaster', 'hello', 'buildinfo', 'saslStart', 'saslContinue', 'getFreeMonitoringStatus']:
            return

        # Obtenemos el comando detallado
        command = event.command
        
        # Determinar colección
        collection_name = command.get(command_name)
        if not isinstance(collection_name, str):
            collection_name = str(collection_name)
            
        # Extraer query, doc, options de forma genérica
        query = command.get('filter', command.get('query', {}))
        doc = command.get('documents', command.get('updates', command.get('insert', {})))
        
        # Opciones varias que podemos querer ver
        options = {}
        if 'sort' in command: options['sort'] = command['sort']
        if 'limit' in command: options['limit'] = command['limit']
        if 'skip' in command: options['skip'] = command['skip']
        if 'pipeline' in command: options['pipeline'] = command['pipeline']

        log_entry = {
            "collection": collection_name,
            "method": command_name,
            "query": safe_stringify(query) if query else "{}",
            "doc": safe_stringify(doc) if doc else "undefined",
            "options": safe_stringify(options) if options else "{}",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        print(f"[MongoDB-API] {collection_name}.{command_name}")
        
        # Enviar el log entry async a los websockets
        if manager.loop is not None and manager.loop.is_running():
            try:
                loop = asyncio.get_running_loop()
                # Si estamos en el mismo thread (event loop de FastAPI), creamos la tarea normal
                loop.create_task(manager.broadcast(log_entry))
            except RuntimeError:
                # Si no hay event loop (estamos en un thread del ThreadPoolExecutor para rutas 'def')
                asyncio.run_coroutine_threadsafe(manager.broadcast(log_entry), manager.loop)

    def succeeded(self, event):
        pass

    def failed(self, event):
        pass
