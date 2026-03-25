import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";

// ── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  const { page = 1, limit = 20, active } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (active !== undefined) filter.isActive = active === "true";

  let users, total;
  try {
    [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);
  } catch {
    return next(new HttpError("Failed to fetch users.", 500));
  }

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users,
  });
};

// GET /api/admin/users/:id
export const getUserById = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.id).select("-password").populate("wishlist", "name price");
  } catch {
    return next(new HttpError("Invalid user ID.", 400));
  }

  if (!user) return next(new HttpError("User not found.", 404));

  let orders;
  try {
    orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10);
  } catch {
    orders = [];
  }

  res.json({ user, recentOrders: orders });
};

// PATCH /api/admin/users/:id/status
export const setUserStatus = async (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new HttpError("isActive must be a boolean.", 400));
  }

  let user;
  try {
    user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, select: "-password" }
    );
  } catch {
    return next(new HttpError("Invalid user ID.", 400));
  }

  if (!user) return next(new HttpError("User not found.", 404));

  res.json({ user });
};

// ── Orders ───────────────────────────────────────────────────────────────────

// GET /api/admin/orders
export const getAllOrders = async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (status) filter.status = status;

  let orders, total;
  try {
    [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
  } catch {
    return next(new HttpError("Failed to fetch orders.", 500));
  }

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    orders,
  });
};

// ── Stats ────────────────────────────────────────────────────────────────────

// GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      ordersByStatus,
      revenueResult,
      topProducts,
      revenueByDay,
    ] = await Promise.all([
      // User counts
      User.countDocuments(),
      User.countDocuments({ isActive: true }),

      // Product count
      Product.countDocuments(),

      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Total revenue from delivered orders
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // Top 5 products by units sold (from delivered orders)
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name:      { $first: "$items.name" },
            unitsSold: { $sum: "$items.quantity" },
            revenue:   { $sum: { $multiply: [{ $ifNull: ["$items.discountPrice", "$items.price"] }, "$items.quantity"] } },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),

      // Daily revenue for the last 30 days
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Reshape ordersByStatus into a plain object
    const orderStatusMap = ordersByStatus.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    res.json({
      users: { total: totalUsers, active: activeUsers },
      products: { total: totalProducts },
      orders: {
        byStatus: orderStatusMap,
        total: Object.values(orderStatusMap).reduce((s, n) => s + n, 0),
      },
      revenue: {
        total: revenueResult[0]?.total ?? 0,
        last30Days: revenueByDay,
      },
      topProducts,
    });
  } catch (err) {
    return next(new HttpError(err.message || "Failed to fetch stats.", 500));
  }
};
