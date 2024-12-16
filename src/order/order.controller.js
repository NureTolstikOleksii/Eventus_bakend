import { Router } from 'express';
import { OrderService } from './order.service.js';

const router = Router();
const orderService = new OrderService();

router.post('/createOrder/:service_id', async (req, res) => {
    try {
        const userId = req.session.userId;
        const serviceId = parseInt(req.params.service_id);
        const specialRequests = req.body.special_requests;

        if (!userId || !serviceId) {
            return res.status(400).json({ message: 'User ID or Service ID is missing' });
        }

        const orderData = {
            user_id: userId,
            service_id: serviceId,
            special_requests: specialRequests,
        };

        const result = await orderService.createOrder(req.db, orderData);
        return res.status(201).json({ message: 'Order created successfully', order: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/orderPage/:service_id', async (req, res) => {
    try {
        const userId = req.session.userId; // ID користувача з сесії
        const serviceId = parseInt(req.params.service_id);

        if (!userId || !serviceId) {
            return res.status(400).json({ message: 'User ID or Service ID is missing' });
        }

        const orderPageData = await orderService.getOrderPage(req.db, userId, serviceId);
        return res.status(200).json({ message: 'Order page data fetched successfully', data: orderPageData });
    } catch (error) {
        console.error('Error fetching order page data:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/userOrders', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const userOrders = await orderService.getUserOrders(req.db, userId);

        return res.status(200).json({ message: 'User orders fetched successfully', orders: userOrders });
    } catch (error) {
        console.error('Error fetching user orders:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/providerOrders', async (req, res) => {
    try {
        const providerId = req.session.userId; // ID постачальника з сесії

        if (!providerId) {
            return res.status(400).json({ message: 'Provider ID is missing' });
        }

        const providerOrders = await orderService.getProviderOrders(req.db, providerId);

        return res.status(200).json({ message: 'Provider orders fetched successfully', orders: providerOrders });
    } catch (error) {
        console.error('Error fetching provider orders:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export const orderRouter = router;
