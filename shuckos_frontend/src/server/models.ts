import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  createdAt: { type: Date, default: Date.now }
});
UserSchema.index({ location: '2dsphere' }); // Geo index

export const User = mongoose.model<IUser>('User', UserSchema);

export interface IRestaurant extends Document {
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  tags: string[];
  rating: number;
}

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  tags: [String], // Array for multikey index
  rating: { type: Number, default: 0 }
});
RestaurantSchema.index({ name: 'text', description: 'text' }); // Text index
RestaurantSchema.index({ tags: 1 }); // Multikey index
RestaurantSchema.index({ location: '2dsphere' }); // Geo index

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export interface IMenuItem extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  price: number;
  category: string;
}

const MenuItemSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String }
});
MenuItemSchema.index({ restaurant: 1, category: 1 }); // Compound index

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  items: {
    menuItem: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[]; // Embedded documents
  totalAmount: number;
  status: string;
  orderDate: Date;
}

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'delivered', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});
OrderSchema.index({ user: 1, orderDate: -1 }); // Compound index
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});
ReviewSchema.index({ restaurant: 1, rating: -1 }); // Compound index

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

export interface IVisit extends Document {
  restaurant: mongoose.Types.ObjectId;
  timestamp: Date;
  ip: string;
}

const VisitSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  timestamp: { type: Date, default: Date.now },
  ip: String
});

export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);

export interface IQualityInspection extends Document {
  restaurant: mongoose.Types.ObjectId;
  inspectorId: mongoose.Types.ObjectId;
  inspectionDate: Date;
  scores: {
    foodHandling: number;
    surfaceCleanliness: number;
    staffHygiene: number;
  };
  overallScore: number;
  observations: string;
  nextInspectionDate: Date;
}

const QualityInspectionSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User' },
  inspectionDate: { type: Date, default: Date.now },
  scores: {
    foodHandling: Number,
    surfaceCleanliness: Number,
    staffHygiene: Number
  },
  overallScore: Number,
  observations: String,
  nextInspectionDate: Date
});
QualityInspectionSchema.index({ restaurant: 1, inspectionDate: -1 });

export const QualityInspection = mongoose.model<IQualityInspection>('QualityInspection', QualityInspectionSchema);

