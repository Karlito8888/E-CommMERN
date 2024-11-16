// backend/controllers/orderController.js

import { asyncHandler, TAX_RATE } from '../core/index.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const calcTotals = items => {
  const itemsHT = +items.reduce((sum, { priceHT, qty }) => sum + priceHT * qty, 0).toFixed(2);
  const shipping = +(itemsHT > 100 ? 0 : 10).toFixed(2);
  const tax = +(itemsHT * TAX_RATE).toFixed(2);
  
  return {
    itemsHT,
    shipping,
    tax,
    total: +(itemsHT + shipping + tax).toFixed(2)
  };
};

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems?.length) {
    return res.status(400).json({ message: 'Panier vide' });
  }

  const products = await Product.find({
    _id: { $in: orderItems.map(x => x.product) }
  }, 'name price priceHT stock').lean();

  const items = orderItems.map(item => {
    const product = products.find(p => p._id.toString() === item.product);
    if (!product) throw new Error(`Produit introuvable: ${item.product}`);
    if (product.stock < item.qty) throw new Error(`Stock insuffisant: ${product.name}`);

    return {
      product: product._id,
      name: product.name,
      qty: item.qty,
      price: product.price,
      priceHT: product.priceHT
    };
  });

  const { itemsHT, shipping, tax, total } = calcTotals(items);

  const order = await Order.create({
    user: req.user._id,
    orderItems: items,
    shippingAddress,
    paymentMethod,
    totalHT: itemsHT,
    shippingPrice: shipping,
    totalTax: tax,
    totalPrice: total,
    status: ORDER_STATUS.PENDING
  });

  await order.updateProductStock();
  res.status(201).json(order);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .lean()
    .cache(300);

  if (!order) {
    return res.status(404).json({ message: 'Commande introuvable' });
  }

  // Vérification des droits d'accès
  if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  res.json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .select('-__v')
    .sort('-createdAt')
    .lean()
    .cache(300);

  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!Object.values(ORDER_STATUS).includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Commande introuvable' });
  }

  order.status = status;
  if (status === ORDER_STATUS.PAID) order.paidAt = Date.now();
  if (status === ORDER_STATUS.DELIVERED) order.deliveredAt = Date.now();

  await order.save();
  res.json({ message: 'Statut mis à jour', status });
});

const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .select('-__v')
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean()
      .cache(300),
    Order.countDocuments().cache(300)
  ]);

  res.json({
    orders,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

const getStats = asyncHandler(async (req, res) => {
  const [totals, daily] = await Promise.all([
    Order.aggregate([{
      $group: {
        _id: null,
        orders: { $sum: 1 },
        sales: { $sum: '$totalPrice' },
        avg: { $avg: '$totalPrice' }
      }
    }]).cache(300),

    Order.aggregate([
      { $match: { status: ORDER_STATUS.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]).cache(300)
  ]);

  res.json({
    totals: totals[0] || { orders: 0, sales: 0, avg: 0 },
    daily
  });
});

export {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  getOrders,
  getStats
};
