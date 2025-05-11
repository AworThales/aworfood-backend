import Stripe from "stripe";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import orderModel from "../models/orderModel.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOrderEmailTemplate } from "../utils/generateOrderEmailTemplate.js";
import userModel from "../models/userModel.js";


const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// Create a Stripe checkout session => /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {
    const body = req?.body;

    const line_items = body?.orderItems?.map((item) => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item?.name,
                    images: [item?.image],
                    metadata: {
                        foodId: item?.food,
                    },
                },
                unit_amount: Math.round(item?.price * 100),
            },
            quantity: item?.quantity,
            tax_rates: ["txr_1RFDwwBB6D3WggMoCWdHCr4I"],
        };
    });

    const shippingInfo = body?.shippingInfo;

    const shipping_rate = body?.itemsPrice >= 200
        ? "shr_1RFDANBB6D3WggMocNWUIHTH"
        : "shr_1RFDBIBB6D3WggMoowx3XYfx";

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
        cancel_url: `${process.env.FRONTEND_URL}`,
        customer_email: req?.user?.email,
        client_reference_id: req?.user?._id?.toString(),
        mode: "payment",
        metadata: {
            ...shippingInfo,
            itemsPrice: body?.itemsPrice,
        },
        shipping_options: [
            {
                shipping_rate,
            },
        ],
        line_items,
    });

    res.status(200).json({
        url: session.url,
    });
});


// const getOrderItems = async (line_items) => {
//     return new Promise((resolve, reject) => {
//         // initialize cart
//         let cartItems = [];

//         // get cart items
//         line_items?.data?.forEach( async (item) => {
//             const food = await stripe.products.retrieve(item?.price?.product);
//             const foodId = food?.metadata?.foodId;

//             console.log("=========================");
//             console.log("Item =>", item);
//             console.log("=========================");
//             console.log("food =>", food);

//             // add item to cart
//             cartItems.push({
//                 food: foodId,
//                 name: item?.name,
//                 price: item?.price?.unit_amount / 100,
//                 image: food?.images[0],
//                 quantity: item?.quantity,
//             });

//             // check if all items are added
//             if (cartItems.length === line_items?.data?.length) {
//                 resolve(cartItems);
//             }
//         });
//     });
// };

const getOrderItems = async (line_items) => {
    const cartItems = await Promise.all(
        line_items?.data?.map(async (item) => {
            const food = await stripe.products.retrieve(item?.price?.product);
            const foodId = food?.metadata?.foodId;

            // console.log("=========================");
            // console.log("Item =>", item);
            // console.log("=========================");
            // console.log("food =>", food);

            return {
                food: foodId,
                name: item?.description,
                price: item?.price?.unit_amount / 100,
                image: food?.images?.[0],
                quantity: item?.quantity,
            };
        })
    );
    return cartItems;
};


// create new order after payment => /api/v1/payment/webhook
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
    try {
      const signature = req.headers["stripe-signature"]; 
  
      const event = stripe.webhooks.constructEvent(
        req.rawBody, // Ensure `req.rawBody` is the raw buffer, not parsed JSON
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
  
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        // console.log("=========================");
        // console.log("Session: =>", session);
        // console.log("=========================");
        // TODO: Fulfill the order here (e.g., save order in DB)

        const line_items = await stripe.checkout.sessions.listLineItems(
            session.id
        );

        const orderItems = await getOrderItems(line_items);
        // console.log("=========================");
        // console.log("Order Items =>", orderItems);
        //  console.log("=========================");

        const user = session?.client_reference_id;

        const totalAmount = session?.amount_total / 100;
        const taxAmount = session?.total_details?.amount_tax / 100;
        const shippingAmount = session?.total_details?.amount_shipping / 100;
        const itemsPrice = session?.metadata?.itemsPrice;
        const shippingInfo = {
            address: session?.metadata?.address,
            city: session?.metadata?.city,
            zipCode: session?.metadata?.zipCode,
            country: session?.metadata?.country,
            phoneNo: session?.metadata?.phoneNo,
        };

        const paymentInfo = {
            id: session?.payment_intent,
            status: session?.payment_status,
        };

        const orderData = {
            shippingInfo,
            orderItems,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentInfo,
            paymentMethod: "Card",
            user,
        }

        console.log("Order Data =>", orderData);

        const createdOrder =await orderModel.create(orderData);
        console.log("Order created =>", createdOrder);
        // const message = generateOrderEmailTemplate(createdOrder);

        // Fetch full user from DB
        const userDoc = await userModel.findById(user); // 'user' is the ID

        // Optional: Check if user exists
        if (!userDoc) {
        console.error("User not found. Cannot send email.");
        return res.status(400).json({ success: false, message: "User not found." });
        }

        const message = generateOrderEmailTemplate(createdOrder, userDoc);

        console.log("user email =>", userDoc.email);

        const adminEmail = process.env.ADMIN_EMAIL;
        console.log("admin email =>", adminEmail);

        // const admins = await userModel.find({ role: "admin" }).select("email"); // or any condition
        // const adminEmail = admins.map(admin => admin.email);

         await sendEmail({
            email: userDoc?.email,
            cc: adminEmail,
            subject: `${userDoc?.name} 🛒 Order #${createdOrder._id} from AworFood`,
            message,
        });

        res.status(200).json({ 
            success: true, 
            message: `Order confirmation sent to your email: ${userDoc.email}`
         });
      }
  
    } catch (error) {
      console.log("=========================");
      console.log("Webhook Error =>", error.message);
      console.log("=========================");
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  