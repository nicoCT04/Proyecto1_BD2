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

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

router.post('/admin/seed-full-dataset', async (req, res) => {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/seed-full-dataset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (e) {
    console.error('Seed proxy error:', e);
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
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/reset-database`, {
      method: 'DELETE',
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (e) {
    console.error('Reset proxy error:', e);
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
