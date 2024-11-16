// backend/models/orderModel.js

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  qty: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  priceHT: { 
    type: Number, 
    required: true,
    min: 0 
  },
  taxAmount: { 
    type: Number, 
    required: true,
    min: 0 
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal']
    },
    paymentResult: {
      id: { type: String, sparse: true },
      status: { type: String, enum: ['pending', 'completed', 'failed'] },
      email: { type: String, trim: true }
    },
    totalHT: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalTax: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      index: true
    },
    paidAt: Date,
    deliveredAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes optimisés
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Calcul automatique des totaux
orderSchema.pre('save', function(next) {
  if (this.isModified('orderItems')) {
    // Calcul du total HT et des taxes
    this.totalHT = +this.orderItems.reduce((sum, item) => 
      sum + (item.priceHT * item.qty), 0
    ).toFixed(2);
    
    this.totalTax = +this.orderItems.reduce((sum, item) => 
      sum + (item.taxAmount * item.qty), 0
    ).toFixed(2);

    // Calcul des frais de livraison (gratuit si totalHT > 100)
    this.shippingPrice = this.totalHT > 100 ? 0 : 10;

    // Total final
    this.totalPrice = +(this.totalHT + this.totalTax + this.shippingPrice).toFixed(2);
  }
  next();
});

export default mongoose.model("Order", orderSchema);
