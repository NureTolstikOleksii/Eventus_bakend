import { Router } from 'express';
import MainScreenService from './main_screen.service.js';

const router = Router();
const mainScreenService = new MainScreenService();

//Головний екран: іконки категорій
router.get('/main_screen/services_by_category/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    try {
        const result = await mainScreenService.getServicesByCategory(req.db, categoryName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve services by category', error: error.message });
    }
});

// Повернення усіх послуг постачальника
router.get('/main_screen/services/:providerId', async (req, res) => {
    const { providerId } = req.params;

    try {
        const result = await mainScreenService.getServicesByProvider(req.db, providerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve services', error: error.message });
    }
});

// Повернення усіх відгуків про послугу
router.get('/main_screen/reviews/:serviceId', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const result = await mainScreenService.getReviewsByService(req.db, serviceId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reviews', error: error.message });
    }
});

// Повернення топ послуг за рейтингом
router.get('/top_services', async (req, res) => {
    try {
        const result = await mainScreenService.getTopServices(req.db);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve top services', error: error.message });
    }
});

export const mainScreenRouter = router;
