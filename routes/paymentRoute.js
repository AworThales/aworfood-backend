import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { stripeCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";

const paymentRoute = express.Router();

paymentRoute
    .route("/payment/checkout_session")
    .post(isAuthenticatedUser, stripeCheckoutSession)

    paymentRoute.post(
        "/payment/webhook",
        express.raw({ type: "application/json" }), // required for signature verification
        stripeWebhook
      );


export default paymentRoute;