import Order from "../models/orderModel.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

// CREATE A NEW ORDER
export const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, deliveryDate } = req.body;
    if (!Array.isArray(items) || items.length) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }

    const normalizedPM =
      paymentMethod === "COD" ? "Cash on Delivery" : "online payment";

    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: Number(i.quantity),
      price: Number(i.price),
      imageUrl: i.imageUrl,
    }));

    const orderId = "ORD-${uuidv4()}";
    let newOrder;

    if (normalizedPM === "online payment") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: orderItems.map((o) => ({
          price_data: {
            currency: "inr",
            product_data: { name: o.name },
            unit_amount: Math.round(o.price * 100),
          },
          quantity: o.quantity,
        })),
        customer_email: customer.email,
        success_url: `${process.env.FRONTEND_URL}/myorders/verify?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
        metadata: { orderId },
      });
      newOrder = new order({
        orderId,
        user: req.user._id,
        customer,
        items: orderItems,
        shipping: 0,
        paymentMethod: normalizedPM,
        paymentStatus: "Unpaid",
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        notes,
        deliveryDate,
      });
      await newOrder.save();
      return res
        .status(201)
        .json({ order: newOrder, checkoutUrl: session.url });
    }
    //FOR COD ORDERS
    newOrder = new order({
      orderId,
      user: req.user._id,
      customer,
      items: orderItems,
      shipping: 0,
      paymentMethod: normalizedPM,
      paymentStatus: "paid",
      notes,
      deliveryDate,
    });
    await newOrder.save();
    res.status(201).json({ order: newOrder, checkoutUrl: null });
  } catch (err) {
    console.log("createOrder Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

//CONFIRM STRIPE PAYMENT
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id)
      return res.status(400).json({ message: "Session ID is required" });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findOneAndUpdate(
      { sessionId: session_id },
      { paymentStatus: "Paid" },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found for this session" });
      res.json(order);
    }
  } catch (err) {
    console.log("ConfirmPayment Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

//GET ALL ORDERS
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .json();
    res.json(orders);

  }
  catch(err) {
    console.log("GetAllOrders Error:", err);
    next(err);

  }
};

//GET ORDERS BY ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if(!order){
      return res.status(404).json({message: "Order not found"});
    }
    res.json(order);
  }
  catch{
    console.log("GetOrderById Error:", err);
    next(err);
  }
}
