import express from 'express';
import { createOrder, confirmPayment, deleteOrder, getOrderById, getOrders, updateOrder } from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';

const orderRouter = express.Router();

//PROTECTED ROUTES
orderRouter.post('/', authMiddleware, createOrder);  
orderRouter.post('/confirm', authMiddleware, confirmPayment);

//multiple public routes
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrderById);
orderRouter.get('/:id', updateOrder);
orderRouter.delete('/:id', deleteOrder);

export default orderRouter;
