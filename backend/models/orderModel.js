// backend/models/orderModel.js

import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: mongoose.Types.Decimal128, required: true }, // Utilisation de Decimal128 pour la précision
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // Champs de prix en Decimal128 pour éviter les erreurs d'arrondi
    itemsPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 0.0,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Utilitaire pour formater les champs Decimal128 avant envoi au client
orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Convertir les champs Decimal128 en chaînes pour les rendre lisibles
    ret.itemsPrice = ret.itemsPrice ? ret.itemsPrice.toString() : null;
    ret.taxPrice = ret.taxPrice ? ret.taxPrice.toString() : null;
    ret.shippingPrice = ret.shippingPrice ? ret.shippingPrice.toString() : null;
    ret.totalPrice = ret.totalPrice ? ret.totalPrice.toString() : null;
    return ret;
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

