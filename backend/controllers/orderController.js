// backend/controllers/orderControllers.js
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { APIError } from '../middlewares/errorMiddleware.js';
import PriceService from '../services/priceService.js';
import { logInfo } from '../utils/logger.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// Order Creation and Management
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems?.length) {
    throw new APIError('Aucun article dans la commande', 400);
  }

  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map(x => x._id) }
  });

  const dbOrderItems = orderItems.map(itemFromClient => {
    const matchingItemFromDB = itemsFromDB.find(
      itemFromDB => itemFromDB._id.toString() === itemFromClient._id
    );

    if (!matchingItemFromDB) {
      throw new APIError(`Produit non trouvé: ${itemFromClient._id}`, 404);
    }

    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price: matchingItemFromDB.price,
      _id: undefined
    };
  });

  const prices = PriceService.calculateOrderPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    ...prices
  });

  const createdOrder = await order.save();
  logInfo('Nouvelle commande créée', { 
    orderId: createdOrder._id,
    userId: req.user._id,
    total: prices.totalPrice
  });

  res.status(201).json({
    success: true,
    order: createdOrder
  });
});

// Obtenir toutes les commandes (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .sort('-createdAt');

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0
  );

  res.json({
    success: true,
    count: orders.length,
    totalAmount: PriceService.formatPrice(totalAmount),
    orders
  });
});

// Obtenir les commandes d'un utilisateur
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt');

  res.json({
    success: true,
    orders
  });
});

// Trouver une commande par ID
const findOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');

  if (!order) {
    throw new APIError('Commande non trouvée', 404);
  }

  res.json({
    success: true,
    order
  });
});

// Marquer une commande comme payée
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new APIError('Commande non trouvée', 404);
  }

  if (order.isPaid) {
    throw new APIError('Commande déjà payée', 400);
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  };

  const updatedOrder = await order.save();
  logInfo('Commande marquée comme payée', { 
    orderId: order._id,
    paymentId: req.body.id 
  });

  res.json({
    success: true,
    order: updatedOrder
  });
});

// Marquer une commande comme livrée
const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new APIError('Commande non trouvée', 404);
  }

  if (order.isDelivered) {
    throw new APIError('Commande déjà livrée', 400);
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  logInfo('Commande marquée comme livrée', { orderId: order._id });

  res.json({
    success: true,
    order: updatedOrder
  });
});

// Statistiques des commandes
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $facet: {
        totalOrders: [{ $count: 'count' }],
        totalSales: [
          { $match: { isPaid: true } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ],
        salesByDate: [
          { $match: { isPaid: true } },
          {
            $group: {
              _id: { 
                $dateToString: { 
                  format: '%Y-%m-%d', 
                  date: '$paidAt' 
                } 
              },
              total: { $sum: '$totalPrice' },
              totalHT: { $sum: '$itemsPrice' },
              totalTVA: { $sum: '$taxPrice' }
            }
          },
          { $sort: { '_id': -1 } },
          { $limit: 7 }
        ],
        taxStats: [
          {
            $group: {
              _id: '$taxRate',
              count: { $sum: 1 },
              totalHT: { $sum: '$itemsPrice' },
              totalTVA: { $sum: '$taxPrice' }
            }
          }
        ]
      }
    }
  ]);

  const formattedStats = {
    totalOrders: stats[0].totalOrders[0]?.count || 0,
    totalSales: PriceService.formatPrice(stats[0].totalSales[0]?.total || 0),
    salesByDate: stats[0].salesByDate.map(day => ({
      date: day._id,
      total: PriceService.formatPrice(day.total),
      totalHT: PriceService.formatPrice(day.totalHT),
      totalTVA: PriceService.formatPrice(day.totalTVA)
    })),
    taxStats: stats[0].taxStats.map(tax => ({
      rate: `${(tax._id * 100).toFixed(1)}%`,
      count: tax.count,
      totalHT: PriceService.formatPrice(tax.totalHT),
      totalTVA: PriceService.formatPrice(tax.totalTVA)
    }))
  };

  res.json({
    success: true,
    stats: formattedStats
  });
});

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  getOrderStats
};
