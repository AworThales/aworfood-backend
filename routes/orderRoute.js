import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { createNewOrder, deleteOrder, getAllOrders, getOrderDetails, getSales, myOrders, updateOrder } from "../controllers/orderController.js";

const orderRouter = express.Router();


orderRouter.route("/orders/new").post(isAuthenticatedUser, createNewOrder)
orderRouter.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails)
orderRouter.route("/me/orders").get(isAuthenticatedUser, myOrders)

orderRouter
    .route("/admin/get_sales")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSales)

orderRouter
    .route("/admin/orders")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);  

// orderRouter
//     .route("/admin/orders/:id")
//     .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders)

orderRouter
    .route("/admin/orders/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder)

export default orderRouter;