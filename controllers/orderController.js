import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create new Order  =>  /api/v1/orders/new
export const createNewOrder = catchAsyncErrors(async (req, res, next) => {
    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
    } = req.body;
  
    const order = await orderModel.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
      user: req.user._id,
    });
  
    res.status(200).json({
      order,
    });
  });


  // Get current user orders  =>  /api/v1/me/orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find({ user: req.user._id });
  
    res.status(200).json({
      orders,
    });
});
  
  // Get order details  =>  /api/v1/orders/:id
  export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id).populate(
      "user",
      "name email"
    );
  
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
  
    res.status(200).json({
      order,
    });
});


  // Get all orders - ADMIN  =>  /api/v1/admin/orders
export const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find();
  
    res.status(200).json({
      orders,
    });
});


// Update Order - ADMIN  =>  /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
  
    if (order?.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
    }
  
    let foodNotFound = false;
  
    // Update foods stock
    for (const item of order.orderItems) {
      const food = await foodModel.findById(item?.food?.toString());
      if (!food) {
        foodNotFound = true;
        break;
      }
      food.stock = food.stock - item.quantity;
      await food.save({ validateBeforeSave: false }); //don't validation when saving food
    }
  
    if (foodNotFound) {
      return next(
        new ErrorHandler("No Food found with one or more IDs.", 404)
      );
    }
  
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();
  
    await order.save();
  
    res.status(200).json({
      success: true,
    });
});


// Delete order  =>  /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }
  
    await order.deleteOne();
  
    res.status(200).json({
      success: true,
    });
});


async function getSalesData(startDate, endDate) {
  const salesData = await orderModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalSales: { $sum: "$totalAmount" },
        numOrders: { $sum: 1 },
        users: { $addToSet: "$user" },
      },
    },
    {
      $project: {
        _id: 1,
        totalSales: 1,
        numOrders: 1,
        numUsers: { $size: "$users" },
      },
    },
  ]);

  console.log(salesData);
  const salesMap = new Map();
  let totalSales = 0;
  let totalNumOrders = 0;

  salesData.forEach((entry) => {
    const date = entry?._id.date;
    const sales = entry?.totalSales;
    const numOrders = entry?.numOrders;
    const numUsers = entry?.numUsers;

    salesMap.set(date, { sales, numOrders, numUsers });

    totalSales += sales;
    totalNumOrders += numOrders;
  });

  const datesBetween = getDatesBetween(startDate, endDate);

  const finalSalesData = datesBetween.map((date) => {
    const data = salesMap.get(date) || {};
    return {
      date,
      sales: data.sales || 0,
      numOrders: data.numOrders || 0,
      numUsers: data.numUsers || 0,
    };
  });

  // Total unique users across the date range
  const uniqueUsers = await orderModel.distinct("user", {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const totalNumUsers = uniqueUsers.length;

  return { salesData: finalSalesData, totalSales, totalNumOrders, totalNumUsers };
}


function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}


export const getSales = catchAsyncErrors(async (req, res, next) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  startDate.setUTCHours(0, 0, 0, 0); // from 12am
  endDate.setUTCHours(23, 59, 59, 999); // to 11:59:59pm

  const {
    salesData,
    totalSales,
    totalNumOrders,
    totalNumUsers,
  } = await getSalesData(startDate, endDate);

  res.status(200).json({
    totalSales,
    totalNumOrders,
    totalNumUsers,
    sales: salesData,
  });
});
