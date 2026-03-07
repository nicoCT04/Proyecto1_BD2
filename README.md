# Plataforma Analítica para Evaluación de Inversión Gastronómica

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

> Sistema de gestión y análisis de datos para restaurantes de shukos basado en MongoDB Atlas

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Equipo de Desarrollo](#-equipo-de-desarrollo)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Modelo de Datos](#-modelo-de-datos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Documentación de la API](#-documentación-de-la-api)
- [Índices y Optimización](#-índices-y-optimización)
- [Transacciones Implementadas](#-transacciones-implementadas)
- [Agregaciones y Analítica](#-agregaciones-y-analítica)
- [Escalabilidad (Sharding)](#-escalabilidad-sharding)
- [Puntos Extra Implementados](#-puntos-extra-implementados)
- [Video Demostrativo](#-video-demostrativo)

---

## 📝 Descripción del Proyecto

Este proyecto desarrolla un **Sistema de Gestión de Pedidos y Reseñas de Restaurantes** utilizando MongoDB como base de datos documental. La plataforma está diseñada para facilitar la toma de decisiones basada en datos en el sector gastronómico, específicamente para restaurantes de shukos.

### Problema a Resolver

En muchas ciudades, los restaurantes de shukos operan de manera informal o con poca digitalización, lo que dificulta:

- ✅ Evaluar el desempeño en ventas
- ✅ Medir la satisfacción de los clientes
- ✅ Supervisar la calidad e higiene del servicio
- ✅ Identificar oportunidades de mejora

### Solución Propuesta

Un backend funcional que permite:

- Gestionar restaurantes, menús, pedidos y reseñas
- Almacenar y consultar datos geoespaciales
- Generar reportes y KPIs analíticos
- Controlar inspecciones de calidad sanitaria
- Analizar comportamiento de usuarios y tasas de conversión

---

## 👥 Equipo de Desarrollo

### Roles y Responsabilidades

| Nombre | Carné | Rol |
|--------|-------|-----|
| **Nicolás Concuá** | 23197 | Arquitecto de Modelo de Datos |
| **Esteban Cárcamo** | 23016 | Especialista en Consultas y Analítica |
| **Ernesto Ascencio** | 23009 | Ingeniero de Consistencia y Escalabilidad |

**Curso:** CC3089 - Base de Datos 2  
**Docente:** Mario Barrientos  
**Fecha:** Marzo 2026

---

## 🚀 Características Principales

### Funcionalidades Implementadas

#### ✅ Operaciones CRUD Completas
- **Creación:** Documentos embebidos y referenciados
- **Lectura:** Consultas multi-colección con lookups, filtros, proyecciones, ordenamiento, skip y limit
- **Actualización:** Documentos individuales y múltiples
- **Eliminación:** Documentos individuales y múltiples

#### ✅ Manejo de Archivos (GridFS)
- Almacenamiento de archivos grandes (imágenes, documentos)
- Carga, descarga y eliminación de archivos
- Colección con más de 50,000 documentos

#### ✅ Agregaciones
- **Simples:** count, distinct, etc.
- **Complejas:** Pipelines de agregación con múltiples etapas
- Análisis de ingresos, productos más vendidos, promedios de calificación

#### ✅ Manejo de Arrays
- Operaciones `$push`, `$pull`, `$addToSet`
- Actualización de elementos en arrays embebidos
- Filtrado y manipulación de listas

#### ✅ Documentos Embebidos y Referencias
- Diseño híbrido optimizado
- Items de pedidos embebidos
- Referencias entre colecciones relacionadas

#### ✅ Índices Diversos
- **Simples:** campos únicos
- **Compuestos:** múltiples campos
- **Multikey:** arrays
- **Geoespaciales:** 2dsphere para ubicaciones
- **Texto:** búsqueda full-text

#### ✅ Transacciones Multi-documento
- Garantía de consistencia en operaciones críticas
- Atomicidad en creación de pedidos y reseñas
- Rollback automático en caso de error

---

## 🏗 Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────┐
│         FastAPI Backend             │
│   (Python 3.14, Uvicorn)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         PyMongo Driver              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       MongoDB Atlas Cluster         │
│   (M0 Free Tier / Shared)          │
└─────────────────────────────────────┘
```

### Estructura del Proyecto

```
shuckos_backend/
├── app/
│   ├── main.py                 # Punto de entrada de la API
│   ├── database.py             # Configuración de conexión
│   ├── routes/                 # Endpoints de la API
│   │   ├── admin.py           # Administración y seeds
│   │   ├── analytics.py       # KPIs y reportes
│   │   ├── files.py           # Manejo de GridFS
│   │   ├── inspection.py      # Inspecciones de calidad
│   │   ├── menu_items.py      # Gestión de menú
│   │   ├── orders.py          # Pedidos
│   │   ├── restaurant.py      # Restaurantes
│   │   ├── reviews.py         # Reseñas
│   │   ├── users.py           # Usuarios
│   │   └── visits.py          # Visitas a restaurantes
│   ├── schemas/               # Validaciones Pydantic
│   │   ├── menu_schema.py
│   │   ├── order_schema.py
│   │   ├── restaurant_schema.py
│   │   ├── review_schema.py
│   │   └── user_schema.py
│   ├── services/              # Lógica de negocio
│   │   ├── analytics_service.py
│   │   ├── inspection_service.py
│   │   ├── menu_item_service.py
│   │   ├── order_service.py
│   │   ├── restaurant_service.py
│   │   ├── review_service.py
│   │   ├── user_service.py
│   │   └── visit_service.py
│   └── utils/                 # Utilidades
│       ├── explain_helper.py  # Análisis de consultas
│       ├── index_creator.py   # Creación de índices
│       └── seed_data.py       # Generación de datos
├── requirements.txt
└── README.md
```

---

## 🗄 Modelo de Datos

### Colecciones Principales

El sistema utiliza un diseño documental con 7 colecciones principales:

#### 1. **restaurants**
Almacena información de restaurantes con datos geoespaciales y métricas agregadas.

```json
{
  "_id": ObjectId,
  "name": "string",
  "description": "string",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "address": {
    "street": "string",
    "zone": "string",
    "city": "string"
  },
  "contact": {
    "phone": "string",
    "email": "string"
  },
  "averageRating": "number",
  "averageCleanliness": "number",
  "averagePriceQuality": "number",
  "totalReviews": "number",
  "isActive": "boolean",
  "createdAt": "date"
}
```

#### 2. **users**
Gestiona usuarios del sistema con roles diferenciados.

```json
{
  "_id": ObjectId,
  "name": "string",
  "email": "string (unique)",
  "phone": "string",
  "role": "client | inspector | admin",
  "homeLocation": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "isActive": "boolean",
  "createdAt": "date"
}
```

#### 3. **orders**
Registra pedidos con items embebidos y ubicación del usuario.

```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "restaurantId": ObjectId,
  "items": [
    {
      "productName": "string",
      "quantity": "number",
      "price": "number",
      "subtotal": "number"
    }
  ],
  "userLocation": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "totalAmount": "number",
  "status": "pending | completed | cancelled",
  "paymentMethod": "string",
  "orderDate": "date",
  "visitId": ObjectId
}
```

#### 4. **reviews**
Almacena reseñas con criterios desglosados.

```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "restaurantId": ObjectId,
  "orderId": ObjectId,
  "ratings": {
    "taste": "number",
    "cleanliness": "number",
    "priceQuality": "number",
    "service": "number"
  },
  "overallRating": "number",
  "comment": "string",
  "verifiedPurchase": "boolean",
  "createdAt": "date"
}
```

#### 5. **quality_inspections**
Registra inspecciones sanitarias realizadas por inspectores.

```json
{
  "_id": ObjectId,
  "restaurantId": ObjectId,
  "inspectorId": ObjectId,
  "inspectionDate": "date",
  "scores": {
    "foodHandling": "number",
    "surfaceCleanliness": "number",
    "staffHygiene": "number"
  },
  "overallScore": "number",
  "observations": "string",
  "nextInspectionDate": "date"
}
```

#### 6. **menu_items**
Catálogo de productos por restaurante.

```json
{
  "_id": ObjectId,
  "restaurantId": ObjectId,
  "name": "string",
  "description": "string",
  "category": "string",
  "ingredients": ["array"],
  "price": "number",
  "currency": "string",
  "timesOrdered": "number",
  "isAvailable": "boolean",
  "createdAt": "date"
}
```

#### 7. **restaurant_visits**
Rastrea visitas de usuarios para análisis de conversión.

```json
{
  "_id": ObjectId,
  "restaurantId": ObjectId,
  "userId": ObjectId,
  "visitDate": "date",
  "source": "search | ad | organic | referral",
  "device": "mobile | desktop | tablet",
  "createdAt": "date"
}
```

### Justificación: Embedding vs Referencing

#### ✅ Embedding (Documentos Embebidos)
Se utilizó para:
- **Items en orders:** Los productos del pedido no tienen sentido fuera del contexto del pedido
- **Ratings en reviews:** Los criterios de evaluación son parte integral de la reseña
- **Scores en inspections:** Las puntuaciones específicas pertenecen a la inspección
- **Address, location y contact:** Datos estructurados que siempre se consultan juntos

**Ventajas:**
- Consulta en una sola operación
- Mejor rendimiento de lectura
- Consistencia histórica (precios al momento de la compra)

#### ✅ Referencing (Referencias)
Se utilizó para:
- Relaciones **uno-a-muchos** (restaurante → pedidos, usuario → reseñas)
- Entidades independientes que crecen ilimitadamente
- Prevención de duplicación excesiva
- Mantenimiento de consistencia global

**Ventajas:**
- Escalabilidad
- Evita superar el límite de 16MB por documento
- Facilita actualizaciones centralizadas
- Reduce duplicación de datos

---

## 🔧 Instalación y Configuración

### Prerrequisitos

- Python 3.10 o superior
- MongoDB Atlas (cuenta gratuita)
- Git

### Pasos de Instalación

#### 1. Clonar el repositorio

```bash
git clone https://github.com/nicoCT04/Proyecto1_BD2.git
cd Proyecto1_BD2/shuckos_backend
```

#### 2. Crear entorno virtual

```bash
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

#### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Nota:** Reemplazar `<usuario>`, `<password>`, `<cluster>` y `<database>` con tus credenciales de MongoDB Atlas.

#### 5. Inicializar la base de datos

##### Crear índices

```bash
curl -X GET http://127.0.0.1:8000/admin/create-indexes
```

##### Generar datos de prueba (50,000+ documentos)

```bash
curl -X POST http://127.0.0.1:8000/admin/seed-full-dataset
```

#### 6. Ejecutar el servidor

```bash
cd app
uvicorn main:app --reload
```

El servidor estará disponible en: **http://127.0.0.1:8000**

---

## 📚 Documentación de la API

### Acceso a la Documentación Interactiva

FastAPI genera automáticamente documentación interactiva:

- **Swagger UI:** http://127.0.0.1:8000/swagger
- **ReDoc:** http://127.0.0.1:8000/documentation

### Endpoints Principales

#### 🏠 Restaurantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/restaurants/` | Crear restaurante |
| GET | `/restaurants/` | Listar restaurantes (con filtros) |
| GET | `/restaurants/{id}` | Obtener restaurante por ID |
| GET | `/restaurants/nearby` | Buscar restaurantes cercanos (geoespacial) |

#### 👤 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/users/` | Crear usuario |
| GET | `/users/` | Listar usuarios |
| GET | `/users/{id}` | Obtener usuario por ID |

#### 🍔 Menú

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/menu-items/` | Crear producto |
| GET | `/menu-items/` | Listar productos |
| GET | `/menu-items/restaurant/{id}` | Menú de un restaurante |

#### 🛒 Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/orders/` | Crear pedido (transacción) |
| GET | `/orders/` | Listar pedidos (con filtros) |
| GET | `/orders/{id}` | Obtener pedido por ID |
| GET | `/orders/analytics/revenue` | Análisis de ingresos |
| GET | `/orders/analytics/top-products` | Productos más vendidos |
| GET | `/orders/analytics/average-ticket` | Ticket promedio |

#### ⭐ Reseñas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/reviews/` | Crear reseña (transacción) |
| GET | `/reviews/` | Listar reseñas |
| GET | `/reviews/restaurant/{id}` | Reseñas de un restaurante |
| DELETE | `/reviews/{id}` | Eliminar reseña |

#### 🔍 Inspecciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/inspections/` | Registrar inspección |
| GET | `/inspections/restaurant/{id}` | Inspecciones de un restaurante |

#### 👁️ Visitas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/visits/` | Registrar visita |
| GET | `/visits/restaurant/{id}` | Visitas de un restaurante |

#### 📊 Analítica

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/analytics/conversion-rate` | Tasa de conversión visitas → pedidos |

#### 📁 Archivos (GridFS)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/files/upload` | Subir archivo |
| GET | `/files/download/{file_id}` | Descargar archivo |
| DELETE | `/files/{file_id}` | Eliminar archivo |

#### 🔧 Administración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/create-indexes` | Crear todos los índices |
| POST | `/admin/seed-full-dataset` | Generar 50,000+ documentos |
| DELETE | `/admin/reset-database` | Limpiar toda la base de datos |

---

## 🔍 Índices y Optimización

### Índices Implementados

El sistema cuenta con índices estratégicos para optimizar consultas y agregaciones:

#### 1. **restaurants**

```javascript
// Geoespacial 2dsphere
db.restaurants.createIndex({ "location": "2dsphere" })

// Índice simple en nombre
db.restaurants.createIndex({ "name": 1 })

// Índice descendente en calificación
db.restaurants.createIndex({ "averageRating": -1 })

// Índice en estado
db.restaurants.createIndex({ "isActive": 1 })
```

#### 2. **users**

```javascript
// Índice único en email
db.users.createIndex({ "email": 1 }, { unique: true })

// Índice en rol
db.users.createIndex({ "role": 1 })

// Geoespacial en ubicación del usuario
db.users.createIndex({ "homeLocation": "2dsphere" })
```

#### 3. **orders**

```javascript
// Índice en restaurante
db.orders.createIndex({ "restaurantId": 1 })

// Índice en usuario
db.orders.createIndex({ "userId": 1 })

// Índice en fecha
db.orders.createIndex({ "orderDate": -1 })

// Índice compuesto para análisis
db.orders.createIndex({ "restaurantId": 1, "orderDate": -1 })

// Índice en estado
db.orders.createIndex({ "status": 1 })
```

#### 4. **reviews**

```javascript
// Índice en restaurante
db.reviews.createIndex({ "restaurantId": 1 })

// Índice en fecha
db.reviews.createIndex({ "createdAt": -1 })

// Índice compuesto
db.reviews.createIndex({ "restaurantId": 1, "createdAt": -1 })
```

#### 5. **menu_items**

```javascript
// Índice en restaurante
db.menu_items.createIndex({ "restaurantId": 1 })

// Índice en categoría
db.menu_items.createIndex({ "category": 1 })

// Índice multikey en ingredientes
db.menu_items.createIndex({ "ingredients": 1 })

// Índice de texto para búsqueda
db.menu_items.createIndex({ "name": "text", "description": "text" })
```

### Validación con explain()

Ejemplo de análisis de rendimiento:

```javascript
// Consulta sin índice
db.orders.find({ restaurantId: ObjectId("...") }).explain("executionStats")

// Resultado:
// - executionTimeMillis: 150ms
// - totalDocsExamined: 50000
// - indexUsed: false

// Después de crear índice
db.orders.createIndex({ "restaurantId": 1 })

// Resultado mejorado:
// - executionTimeMillis: 2ms
// - totalDocsExamined: 45
// - indexUsed: true (restaurantId_1)
```

---

## 🔐 Transacciones Implementadas

MongoDB soporta transacciones multi-documento para garantizar consistencia ACID. El sistema implementa transacciones en operaciones críticas:

### 1. Registro de Pedido

**Operaciones atómicas:**
1. Insertar documento en `orders`
2. Actualizar `timesOrdered` en `menu_items`
3. Actualizar métricas en `restaurants`
4. Asociar con `restaurant_visits`

```python
# Pseudocódigo
with session.start_transaction():
    orders.insert_one(order_data, session=session)
    menu_items.update_many(
        {"_id": {"$in": item_ids}},
        {"$inc": {"timesOrdered": quantities}},
        session=session
    )
    restaurants.update_one(
        {"_id": restaurant_id},
        {"$inc": {"totalSales": total_amount}},
        session=session
    )
    session.commit_transaction()
```

### 2. Creación de Reseña

**Operaciones atómicas:**
1. Insertar documento en `reviews`
2. Actualizar `averageRating`, `totalReviews` en `restaurants`
3. Recalcular promedios de limpieza y precio-calidad

```python
with session.start_transaction():
    reviews.insert_one(review_data, session=session)
    restaurants.update_one(
        {"_id": restaurant_id},
        {
            "$set": {
                "averageRating": new_avg,
                "averageCleanliness": new_cleanliness,
                "averagePriceQuality": new_price_quality
            },
            "$inc": {"totalReviews": 1}
        },
        session=session
    )
    session.commit_transaction()
```

### 3. Inspección de Calidad

**Operaciones atómicas:**
1. Insertar documento en `quality_inspections`
2. Actualizar indicador global de calidad en `restaurants`

### Beneficios

- ✅ **Atomicidad:** Todas las operaciones se completan o ninguna
- ✅ **Consistencia:** Los datos agregados siempre reflejan el estado real
- ✅ **Rollback automático:** En caso de error, se revierten todos los cambios

---

## 📊 Agregaciones y Analítica

### Agregaciones Simples

#### Count
```python
# Contar total de pedidos
total_orders = db.orders.count_documents({})

# Contar pedidos por restaurante
restaurant_orders = db.orders.count_documents({"restaurantId": restaurant_id})
```

#### Distinct
```python
# Obtener categorías únicas de productos
categories = db.menu_items.distinct("category")

# Obtener fuentes de tráfico
sources = db.restaurant_visits.distinct("source")
```

### Agregaciones Complejas (Pipelines)

#### 1. Ingresos Totales por Restaurante

```javascript
db.orders.aggregate([
  {
    $match: {
      status: "completed",
      orderDate: {
        $gte: ISODate("2026-01-01"),
        $lte: ISODate("2026-12-31")
      }
    }
  },
  {
    $group: {
      _id: "$restaurantId",
      totalRevenue: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 },
      avgTicket: { $avg: "$totalAmount" }
    }
  },
  {
    $lookup: {
      from: "restaurants",
      localField: "_id",
      foreignField: "_id",
      as: "restaurant"
    }
  },
  {
    $unwind: "$restaurant"
  },
  {
    $project: {
      restaurantName: "$restaurant.name",
      totalRevenue: 1,
      orderCount: 1,
      avgTicket: { $round: ["$avgTicket", 2] }
    }
  },
  {
    $sort: { totalRevenue: -1 }
  }
])
```

#### 2. Productos Más Vendidos

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productName",
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: "$items.subtotal" }
    }
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 }
])
```

#### 3. Tasa de Conversión por Restaurante

```javascript
db.restaurant_visits.aggregate([
  {
    $lookup: {
      from: "orders",
      let: { visitId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$visitId", "$$visitId"] }
          }
        }
      ],
      as: "orders"
    }
  },
  {
    $group: {
      _id: "$restaurantId",
      totalVisits: { $sum: 1 },
      totalOrders: {
        $sum: {
          $cond: [{ $gt: [{ $size: "$orders" }, 0] }, 1, 0]
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      totalVisits: 1,
      totalOrders: 1,
      conversionRate: {
        $multiply: [
          { $divide: ["$totalOrders", "$totalVisits"] },
          100
        ]
      }
    }
  },
  { $sort: { conversionRate: -1 } }
])
```

#### 4. Ranking de Restaurantes por Calificación

```javascript
db.restaurants.aggregate([
  { $match: { isActive: true } },
  {
    $project: {
      name: 1,
      averageRating: 1,
      totalReviews: 1,
      averageCleanliness: 1,
      location: 1
    }
  },
  { $sort: { averageRating: -1, totalReviews: -1 } },
  { $limit: 20 }
])
```

### Manejo de Arrays

#### $push - Agregar elementos
```python
# Agregar ingrediente a un producto
db.menu_items.update_one(
    {"_id": product_id},
    {"$push": {"ingredients": "nuevo ingrediente"}}
)
```

#### $pull - Eliminar elementos
```python
# Eliminar ingrediente específico
db.menu_items.update_one(
    {"_id": product_id},
    {"$pull": {"ingredients": "ingrediente_no_deseado"}}
)
```

#### $addToSet - Agregar sin duplicar
```python
# Agregar categoría única
db.menu_items.update_one(
    {"_id": product_id},
    {"$addToSet": {"tags": "vegetariano"}}
)
```

---

## 🌐 Escalabilidad (Sharding)

### Propuesta de Shard Keys

Para soportar crecimiento horizontal, se proponen las siguientes estrategias de fragmentación:

#### 1. Colección: orders

**Shard Key Compuesta:**
```javascript
sh.shardCollection("db.orders", { "restaurantId": 1, "orderDate": 1 })
```

**Justificación:**
- Distribuye pedidos entre restaurantes
- Segmenta por fecha (análisis temporal)
- Alta cardinalidad
- Evita hotspots

#### 2. Colección: reviews

**Shard Key:**
```javascript
sh.shardCollection("db.reviews", { "restaurantId": 1, "createdAt": 1 })
```

**Justificación:**
- Compatible con análisis de evolución de calificaciones
- Distribución uniforme

#### 3. Colección: restaurant_visits

**Shard Key:**
```javascript
sh.shardCollection("db.restaurant_visits", { "restaurantId": 1, "visitDate": 1 })
```

**Justificación:**
- Facilita cálculo de tasa de conversión
- Soporta análisis de tráfico temporal

### Configuración de Sharding

```javascript
// Habilitar sharding en la base de datos
sh.enableSharding("shukos_db")

// Fragmentar colecciones
sh.shardCollection("shukos_db.orders", { "restaurantId": 1, "orderDate": 1 })
sh.shardCollection("shukos_db.reviews", { "restaurantId": 1, "createdAt": 1 })
sh.shardCollection("shukos_db.restaurant_visits", { "restaurantId": 1, "visitDate": 1 })
```

---

## ⭐ Puntos Extra Implementados

### ✅ Operaciones Bulk (BulkWrite)

Implementado en la generación masiva de datos:

```python
# Inserción masiva de 50,000+ documentos
bulk_operations = []
for i in range(50000):
    bulk_operations.append(
        InsertOne(generate_document())
    )
    
    if len(bulk_operations) == 1000:
        db.collection.bulk_write(bulk_operations, ordered=False)
        bulk_operations = []
```

**Beneficio:** Reduce drásticamente el tiempo de inserción de datos.

### ✅ Frontend/HCI (Interfaz Amigable)

*[Opcional - Completar si implementaron frontend]*

- Framework utilizado: React / Vue / Angular
- Características:
  - Dashboard interactivo
  - Visualización de KPIs
  - Mapas geoespaciales
  - CRUD completo de entidades

### ✅ Análisis con explain()

Implementado en endpoint específico:

```
GET /orders/analytics/explain/{restaurant_id}
```

Retorna estadísticas de ejecución de consultas para validar uso de índices.

---

## 📹 Video Demostrativo

🎥 **Link al video (máximo 10 minutos):**

[Insertar link de YouTube/Drive aquí]

**Contenido del video:**
1. Introducción al proyecto (30s)
2. Demostración de operaciones CRUD (2min)
3. Consultas con agregaciones complejas (2min)
4. Manejo de GridFS (1min)
5. Transacciones y consistencia (1.5min)
6. Análisis de índices con explain() (1min)
7. Generación de KPIs (1min)
8. Conclusiones (1min)

---

## 🧪 Testing

### Probar Endpoints con cURL

#### Crear Restaurante
```bash
curl -X POST "http://127.0.0.1:8000/restaurants/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shukos El Sabor",
    "description": "Los mejores shukos de la zona",
    "location": {
      "type": "Point",
      "coordinates": [-90.5069, 14.6349]
    },
    "address": {
      "street": "5ta Avenida",
      "zone": "Zona 1",
      "city": "Guatemala"
    },
    "contact": {
      "phone": "12345678",
      "email": "contacto@shukossabor.com"
    }
  }'
```

#### Crear Pedido
```bash
curl -X POST "http://127.0.0.1:8000/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ObjectId válido",
    "restaurantId": "ObjectId válido",
    "items": [
      {
        "productName": "Shuko Clásico",
        "quantity": 2,
        "price": 25.0
      }
    ],
    "totalAmount": 50.0,
    "paymentMethod": "efectivo"
  }'
```

---

## 📈 KPIs Disponibles

El sistema genera los siguientes indicadores:

| KPI | Descripción | Endpoint |
|-----|-------------|----------|
| **Ingresos Totales** | Ventas por restaurante/período | `/orders/analytics/revenue` |
| **Ticket Promedio** | Monto promedio por pedido | `/orders/analytics/average-ticket` |
| **Productos Top** | Más vendidos | `/orders/analytics/top-products` |
| **Calificación Promedio** | Rating por restaurante | `/restaurants/{id}` |
| **Tasa de Conversión** | Visitas → Pedidos | `/analytics/conversion-rate` |
| **Limpieza Promedio** | Score sanitario | `/restaurants/{id}` |

---

## 🛠 Tecnologías Utilizadas

- **Base de Datos:** MongoDB Atlas (M0 Free Tier)
- **Backend:** FastAPI 0.109+
- **Driver:** PyMongo 4.6+
- **Servidor:** Uvicorn
- **Validación:** Pydantic
- **Gestión de Archivos:** GridFS
- **Geoespacial:** GeoJSON + 2dsphere indexes

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para el curso **CC3089 Base de Datos 2** de la Universidad del Valle de Guatemala.

---

## 👨‍💻 Contacto

**Universidad del Valle de Guatemala**  
Facultad de Ingeniería  
Departamento de Ciencias de la Computación

- Nicolás Concuá - 23197
- Esteban Cárcamo - 23016
- Ernesto Ascencio - 23009

---

## 📚 Referencias

- [MongoDB Documentation](https://docs.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [GeoJSON Specification](https://geojson.org/)

---

<div align="center">
  <p><strong>Universidad del Valle de Guatemala</strong></p>
  <p>Base de Datos 2 | Semestre I 2026</p>
</div>
