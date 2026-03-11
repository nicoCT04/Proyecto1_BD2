import { Router } from 'express';
import { User, Restaurant, MenuItem, Order, Review, Visit, QualityInspection } from './models.js';
import mongoose from 'mongoose';
import multer from 'multer';

const router = Router();

// --- Users ---
router.get('/users', async (req, res) => {
  const users = await User.find().limit(50);
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// --- Restaurants ---
router.get('/restaurants', async (req, res) => {
  const { search, tag, lat, lng, distance } = req.query;
  let query: any = {};
  
  if (search) {
    query.$text = { $search: search as string };
  }
  if (tag) {
    query.tags = tag;
  }
  if (lat && lng && distance) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
        $maxDistance: parseInt(distance as string)
      }
    };
  }

  const restaurants = await Restaurant.find(query).sort({ rating: -1 }).limit(20);
  res.json(restaurants);
});

router.get('/restaurants/nearby', async (req, res) => {
  const { lat, lng, distance = 5000 } = req.query;
  if (!lat || !lng) return res.status(400).send('lat and lng required');
  const restaurants = await Restaurant.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
        $maxDistance: parseInt(distance as string)
      }
    }
  }).limit(20);
  res.json(restaurants);
});

router.get('/restaurants/:id', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).send('Restaurant not found');
  res.json(restaurant);
});

router.post('/restaurants', async (req, res) => {
  const restaurant = new Restaurant(req.body);
  await restaurant.save();
  res.status(201).json(restaurant);
});

router.put('/restaurants/:id', async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(restaurant);
});

router.delete('/restaurants/:id', async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// --- Menu Items ---
router.get('/menu-items', async (req, res) => {
  const items = await MenuItem.find().limit(50);
  res.json(items);
});

router.get('/menu-items/restaurant/:restaurantId', async (req, res) => {
  const items = await MenuItem.find({ restaurant: req.params.restaurantId }).sort({ category: 1, price: 1 });
  res.json(items);
});

router.post('/menu-items', async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.status(201).json(item);
});

// --- Orders ---
router.post('/orders', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = new Order(req.body);
    await order.save({ session });
    
    // Simulate updating timesOrdered for menu items
    if (req.body.items && req.body.items.length > 0) {
       for (const item of req.body.items) {
           if (item.menuItem) {
               await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { timesOrdered: item.quantity || 1 } }, { session });
           }
       }
    }

    // Simulate updating restaurant metrics
    if (req.body.restaurant) {
      await Restaurant.findByIdAndUpdate(req.body.restaurant, { $inc: { totalSales: req.body.totalAmount || 0 } }, { session });
    }

    await session.commitTransaction();
    res.status(201).json(order);
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Order Transaction Error:', error);
    res.status(500).json({ error: 'Transaction failed', message: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/orders', async (req, res) => {
  const orders = await Order.aggregate([
    { $sort: { orderDate: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $lookup: {
        from: 'restaurants',
        localField: 'restaurant',
        foreignField: '_id',
        as: 'restaurantDetails'
      }
    },
    { $unwind: '$userDetails' },
    { $unwind: '$restaurantDetails' },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        status: 1,
        orderDate: 1,
        'userDetails.name': 1,
        'restaurantDetails.name': 1,
        items: 1
      }
    }
  ]);
  res.json(orders);
});

router.get('/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).send('Order not found');
  res.json(order);
});

router.get('/orders/analytics/revenue', async (req, res) => {
  const revenue = await Order.aggregate([
    { $match: { status: { $in: ['delivered', 'pending', 'completed'] } } },
    {
      $group: {
        _id: '$restaurant',
        totalRevenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        avgTicket: { $avg: '$totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant'
      }
    },
    { $unwind: '$restaurant' },
    {
      $project: {
        restaurantName: '$restaurant.name',
        totalRevenue: 1,
        orderCount: 1,
        avgTicket: 1
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
  res.json(revenue);
});

router.get('/orders/analytics/top-products', async (req, res) => {
  const topProducts = await Order.aggregate([
    { $match: { status: { $in: ['completed', 'delivered'] } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);
  res.json(topProducts);
});

router.get('/orders/analytics/average-ticket', async (req, res) => {
  const avgTicket = await Order.aggregate([
    { $match: { status: { $in: ['completed', 'delivered'] } } },
    {
      $group: {
        _id: null,
        averageTicketSize: { $avg: '$totalAmount' }
      }
    }
  ]);
  res.json(avgTicket[0] || { averageTicketSize: 0 });
});

// --- Reviews ---
router.get('/reviews', async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
  res.json(reviews);
});

router.get('/reviews/restaurant/:restaurantId', async (req, res) => {
  const reviews = await Review.find({ restaurant: req.params.restaurantId }).sort({ createdAt: -1 });
  res.json(reviews);
});

router.post('/reviews', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const review = new Review(req.body);
    await review.save({ session });
    
    const stats = await Review.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(req.body.restaurant) } },
      { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(req.body.restaurant, { 
          rating: stats[0].avgRating,
          averageRating: stats[0].avgRating,
          totalReviews: stats[0].count
      }, { session });
    }
    await session.commitTransaction();
    res.status(201).json(review);
  } catch(e) {
    await session.abortTransaction();
    res.status(500).json({error: 'Transaction failed'});
  } finally {
    session.endSession();
  }
});

router.delete('/reviews/:id', async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// --- Inspections ---
router.post('/inspections', async (req, res) => {
  const inspection = new QualityInspection(req.body);
  await inspection.save();
  // Simplified logic for updating restaurant stats
  if (req.body.overallScore) {
    await Restaurant.findByIdAndUpdate(req.body.restaurant, { averageCleanliness: req.body.overallScore });
  }
  res.status(201).json(inspection);
});

router.get('/inspections/restaurant/:id', async (req, res) => {
  const inspections = await QualityInspection.find({ restaurant: req.params.id }).sort({ inspectionDate: -1 });
  res.json(inspections);
});

// --- Visits ---
router.post('/visits', async (req, res) => {
  const visit = new Visit(req.body);
  await visit.save();
  res.status(201).json(visit);
});

router.get('/visits/restaurant/:id', async (req, res) => {
  const visits = await Visit.find({ restaurant: req.params.id }).sort({ timestamp: -1 });
  res.json(visits);
});

// --- Analytics (Global) ---
router.get('/analytics/conversion-rate', async (req, res) => {
  const conversionRate = await Visit.aggregate([
    {
      $lookup: {
        from: 'orders',
        let: { visitRestId: "$restaurant" },
        pipeline: [
          { $match: { $expr: { $eq: ["$restaurant", "$$visitRestId"] } } }
        ],
        as: "orders"
      }
    },
    {
      $group: {
        _id: "$restaurant",
        totalVisits: { $sum: 1 },
        totalOrders: { $sum: { $cond: [{ $gt: [{ $size: "$orders" }, 0] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        totalVisits: 1,
        totalOrders: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$totalVisits", 0] },
            0,
            { $multiply: [{ $divide: ["$totalOrders", "$totalVisits"] }, 100] }
          ]
        }
      }
    },
    { $sort: { conversionRate: -1 } }
  ]);
  res.json(conversionRate);
});

// --- Admin (Bulk & Indexes) ---
router.post('/admin/seed-visits', async (req, res) => {
  const count = await Visit.countDocuments();
  if (count >= 50000) return res.json({ message: 'Ya existen 50,000+ documentos' });
  
  const batchSize = 10000;
  for (let i = 0; i < 5; i++) {
    const batch = Array.from({ length: batchSize }).map((_, idx) => ({
      ip: `192.168.1.${idx % 255}`,
      timestamp: new Date(Date.now() - Math.random() * 10000000000)
    }));
    await Visit.insertMany(batch);
  }
  res.json({ message: '50,000 documentos insertados' });
});

const BATCH_SIZE = 2000;
const VISIT_COUNT = 20000;
const CONVERSION_RATE = 0.12;
const REVIEW_RATE = 0.35;
const INSPECTION_COUNT = 300;

const RESTAURANT_NAMES = [
  'La Mariscada', 'El Fogón', 'Sabor Oriental', 'Pizzería Roma', 'Tacos & Más',
  'Café Central', 'Sushi Bar', 'Parrilla del Sur', 'Vegetariano Verde', 'Dulce Tentación'
];

const MENU_CATEGORIES = ['Entradas', 'Platos fuertes', 'Postres', 'Bebidas', 'Ensaladas'];
const MENU_ITEMS_BY_CAT: Record<string, string[]> = {
  Entradas: ['Ceviche', 'Sopa del día', 'Bruschetta', 'Ensalada César', 'Empanadas'],
  'Platos fuertes': ['Pasta carbonara', 'Pollo al horno', 'Risotto', 'Parrillada', 'Pescado grill'],
  Postres: ['Flan', 'Brownie', 'Helado', 'Tiramisú', 'Cheesecake'],
  Bebidas: ['Limonada', 'Jugo natural', 'Café', 'Agua mineral', 'Cerveza'],
  Ensaladas: ['Ensalada griega', 'Ensalada mixta', 'Ensalada de quinoa', 'Caprese', 'Waldorf']
};

const REVIEW_COMMENTS = [
  'Muy bueno, volveré.', 'Excelente servicio.', 'Rico y abundante.',
  'Recomendado.', 'Buen ambiente y buena comida.'
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
}

router.post('/admin/seed-full-dataset', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ error: 'DB not connected' });

    const existingRestaurants = await Restaurant.find().limit(RESTAURANT_NAMES.length).lean();
    let restaurantIds: mongoose.Types.ObjectId[] = existingRestaurants.map((r: any) => r._id);

    if (restaurantIds.length === 0) {
      const toInsert = RESTAURANT_NAMES.map((name, i) => ({
        name,
        description: `Restaurante ${name} - especialidades de la casa`,
        location: { type: 'Point' as const, coordinates: [-90.5 + i * 0.01, 14.63 + i * 0.005] },
        tags: ['comida', 'local', 'variado'],
        rating: 0
      }));
      const inserted = await Restaurant.insertMany(toInsert);
      restaurantIds = inserted.map((r) => r._id);
    }

    let userIds: mongoose.Types.ObjectId[] = (await User.find().limit(30).lean()).map((u: any) => u._id);
    if (userIds.length < 15) {
      const base = Date.now().toString(36);
      const toInsert = Array.from({ length: 20 }, (_, i) => ({
        name: `Usuario Demo ${i + 1}`,
        email: `demo.${base}.${i}@example.com`,
        location: { type: 'Point' as const, coordinates: [-90.5 + Math.random() * 0.1, 14.6 + Math.random() * 0.1] },
        createdAt: randomDate(365)
      }));
      const inserted = await User.insertMany(toInsert);
      userIds = [...userIds, ...inserted.map((u) => u._id)];
    }

    const existingMenuCount = await MenuItem.countDocuments();
    if (existingMenuCount < restaurantIds.length * 5) {
      const menuDocs: any[] = [];
      for (const rid of restaurantIds) {
        for (const cat of MENU_CATEGORIES) {
          const names = MENU_ITEMS_BY_CAT[cat];
          for (let i = 0; i < 2; i++) {
            menuDocs.push({
              restaurant: rid,
              name: names[i % names.length] + ` ${cat}`,
              price: randomInt(25, 120),
              category: cat
            });
          }
        }
      }
      await MenuItem.insertMany(menuDocs);
    }

    let menuByRestaurant = await MenuItem.aggregate([
      { $group: { _id: '$restaurant', items: { $push: { _id: '$_id', name: '$name', price: '$price' } } } }
    ]);
    const restIdsWithoutMenu = restaurantIds.filter((rid) => !menuByRestaurant.some((g: any) => g._id.toString() === rid.toString()));
    if (restIdsWithoutMenu.length > 0) {
      const extraMenuDocs: any[] = [];
      for (const rid of restIdsWithoutMenu) {
        for (const cat of MENU_CATEGORIES.slice(0, 2)) {
          const names = MENU_ITEMS_BY_CAT[cat];
          extraMenuDocs.push({
            restaurant: rid,
            name: (names[0] || 'Plato') + ` ${cat}`,
            price: randomInt(25, 80),
            category: cat
          });
        }
      }
      await MenuItem.insertMany(extraMenuDocs);
      menuByRestaurant = await MenuItem.aggregate([
        { $group: { _id: '$restaurant', items: { $push: { _id: '$_id', name: '$name', price: '$price' } } } }
      ]);
    }
    const menuMap = new Map(menuByRestaurant.map((g: any) => [g._id.toString(), g.items]));
    const anyRestItems = menuByRestaurant.find((g: any) => g.items?.length)?.items || [];

    const visitOps: any[] = [];
    for (let i = 0; i < VISIT_COUNT; i++) {
      const restId = randomChoice(restaurantIds);
      visitOps.push({
        restaurant: restId,
        timestamp: randomDate(365),
        ip: `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}`
      });
      if (visitOps.length >= BATCH_SIZE) {
        await Visit.insertMany(visitOps);
        visitOps.length = 0;
      }
    }
    if (visitOps.length) await Visit.insertMany(visitOps);

    const totalOrders = Math.floor(VISIT_COUNT * CONVERSION_RATE);
    const orderDocs: any[] = [];
    for (let i = 0; i < totalOrders; i++) {
      const restId = randomChoice(restaurantIds);
      const userId = randomChoice(userIds);
      const itemsArr = menuMap.get(restId.toString()) || [];
      const numItems = Math.max(1, Math.min(3, itemsArr.length));
      const pool = itemsArr.length ? itemsArr : anyRestItems;
      const chosen = pool.length
        ? Array.from({ length: numItems }, () => pool[randomInt(0, pool.length - 1)])
        : [];
      if (chosen.length === 0) continue;
      const items = chosen.map((it: any) => ({
        menuItem: it._id,
        name: it.name,
        price: it.price,
        quantity: randomInt(1, 2)
      }));
      const totalAmount = items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
      orderDocs.push({
        user: userId,
        restaurant: restId,
        items,
        totalAmount,
        status: 'delivered',
        orderDate: randomDate(365)
      });
    }
    const insertedOrders = await Order.insertMany(orderDocs);
    const orderIds = insertedOrders.map((o) => o._id);
    const reviewCount = Math.floor(orderIds.length * REVIEW_RATE);
    const selectedOrders = [...orderIds].sort(() => Math.random() - 0.5).slice(0, reviewCount);
    const reviewsToInsert: any[] = [];
    const orderToUserRest = new Map<string, { user: mongoose.Types.ObjectId; restaurant: mongoose.Types.ObjectId }>();
    const ordersWithMeta = await Order.find(
      { _id: { $in: selectedOrders } },
      { user: 1, restaurant: 1 }
    ).lean();
    ordersWithMeta.forEach((o: any) => orderToUserRest.set(o._id.toString(), { user: o.user, restaurant: o.restaurant }));
    for (const oid of selectedOrders) {
      const meta = orderToUserRest.get(oid.toString());
      if (!meta) continue;
      reviewsToInsert.push({
        user: meta.user,
        restaurant: meta.restaurant,
        rating: randomInt(3, 5),
        comment: randomChoice(REVIEW_COMMENTS),
        createdAt: randomDate(180)
      });
    }
    if (reviewsToInsert.length) await Review.insertMany(reviewsToInsert);

    const inspectionsToInsert: any[] = [];
    for (let i = 0; i < INSPECTION_COUNT; i++) {
      const restId = randomChoice(restaurantIds);
      const inspectorId = randomChoice(userIds);
      const food = randomInt(6, 10);
      const surface = randomInt(6, 10);
      const staff = randomInt(6, 10);
      const overall = (food + surface + staff) / 3;
      inspectionsToInsert.push({
        restaurant: restId,
        inspectorId,
        inspectionDate: randomDate(365),
        scores: { foodHandling: food, surfaceCleanliness: surface, staffHygiene: staff },
        overallScore: Math.round(overall * 10) / 10,
        observations: 'Inspección rutinaria.',
        nextInspectionDate: randomDate(-90)
      });
    }
    await QualityInspection.insertMany(inspectionsToInsert);

    const ratingAgg = await Review.aggregate([
      { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    for (const r of ratingAgg) {
      await Restaurant.findByIdAndUpdate(r._id, {
        rating: Math.round(r.avgRating * 10) / 10
      });
    }

    const finalCounts = {
      restaurants: await Restaurant.countDocuments(),
      users: await User.countDocuments(),
      menuItems: await MenuItem.countDocuments(),
      visits: await Visit.countDocuments(),
      orders: await Order.countDocuments(),
      reviews: await Review.countDocuments(),
      inspections: await QualityInspection.countDocuments()
    };

    res.json({
      message: 'Dataset completo generado correctamente',
      ...finalCounts
    });
  } catch (e) {
    console.error('Seed error:', e);
    res.status(500).json({ error: 'Error al generar dataset', detail: String(e) });
  }
});

router.get('/admin/create-indexes', async (req, res) => {
  await User.syncIndexes();
  await Restaurant.syncIndexes();
  await Order.syncIndexes();
  await Review.syncIndexes();
  await MenuItem.syncIndexes();
  await Visit.syncIndexes();
  await QualityInspection.syncIndexes();
  res.json({ message: 'Índices sincronizados' });
});

router.delete('/admin/reset-database', async (req, res) => {
  try {
    if (!mongoose.connection.db) return res.status(500).json({ error: 'DB not connected' });
    const [orders, reviews, visits, inspections, menuItems, restaurants, users] = await Promise.all([
      Order.deleteMany({}),
      Review.deleteMany({}),
      Visit.deleteMany({}),
      QualityInspection.deleteMany({}),
      MenuItem.deleteMany({}),
      Restaurant.deleteMany({}),
      User.deleteMany({})
    ]);
    res.json({
      message: 'Base de datos reiniciada (borrado bulk)',
      deleted: {
        orders: orders.deletedCount,
        reviews: reviews.deletedCount,
        visits: visits.deletedCount,
        inspections: inspections.deletedCount,
        menuItems: menuItems.deletedCount,
        restaurants: restaurants.deletedCount,
        users: users.deletedCount
      }
    });
  } catch (e) {
    console.error('Reset error:', e);
    res.status(500).json({ error: 'Error al reiniciar base de datos', detail: String(e) });
  }
});

router.post('/admin/bulk-insert', async (req, res) => {
  const ops = req.body.items.map((item: any) => ({
    insertOne: { document: item }
  }));
  const result = await MenuItem.bulkWrite(ops);
  res.json(result);
});

// --- GridFS (File Upload) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/files/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  
  const db = mongoose.connection.db;
  if (!db) return res.status(500).send('DB not connected');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    metadata: { contentType: req.file.mimetype }
  });
  
  uploadStream.end(req.file.buffer);
  
  uploadStream.on('finish', () => {
    res.status(201).json({ fileId: uploadStream.id });
  });
});

router.get('/files/download/:id', async (req, res) => {
  const db = mongoose.connection.db;
  if (!db) return res.status(500).send('DB not connected');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  
  try {
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    downloadStream.pipe(res);
  } catch (err) {
    res.status(404).send('File not found');
  }
});

router.delete('/files/:id', async (req, res) => {
  const db = mongoose.connection.db;
  if (!db) return res.status(500).send('DB not connected');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  
  try {
    await bucket.delete(new mongoose.Types.ObjectId(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).send('File not found');
  }
});

export default router;
