import { Router } from 'express';
import { ServicesService } from './services.service.js';

const router = Router();
const servicesService = new ServicesService();

// Маршрут для получения информации о конкретной услуге
router.get('/service/:serviceId', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const serviceDetails = await servicesService.getServiceDetails(req.db, serviceId);
        res.status(200).json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для получения отзывов об определённой услуге
router.get('/service/:serviceId/reviews', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const reviews = await servicesService.getServiceReviews(req.db, serviceId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для получения календаря услуги
router.get('/service/:serviceId/calendar', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const calendar = await servicesService.getServiceCalendar(req.db, serviceId);
        res.status(200).json(calendar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для получения отзывов о поставщике
router.get('/provider/:providerId/reviews', async (req, res) => {
    const { providerId } = req.params;

    try {
        const reviews = await servicesService.getProviderReviews(req.db, providerId);
        if (reviews.length === 0) {
            res.status(200).json({ message: 'Отзывы о поставщике отсутствуют.' });
        } else {
            res.status(200).json(reviews);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для получения полного текста отзыва
router.get('/review/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        const fullReview = await servicesService.getFullReview(req.db, reviewId);

        if (!fullReview) {
            res.status(404).json({ message: 'Отзыв не может быть загружен.' });
        } else {
            res.status(200).json(fullReview);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для получения пакетов услуг поставщика
router.get('/provider/:providerId/packages', async (req, res) => {
    const { providerId } = req.params;

    try {
        const packages = await servicesService.getProviderPackages(req.db, providerId);

        if (!packages || packages.length === 0) {
            res.status(200).json({ message: 'Нет доступных пакетов услуг.' });
        } else {
            res.status(200).json(packages);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Маршрут для добавления новой услуги
// services.controller.js (пример)
// services.controller.js

// Маршрут для добавления новой услуги
router.post('/', async (req, res) => {
    const {
        name,
        description,
        price,
        category_id,
        location_name,
        location_address,
    } = req.body;

    // Извлекаем provider_id из сессии или токена
    const provider_id = req.session?.provider_id || req.user?.provider_id;

    if (!provider_id) {
        return res.status(401).json({
            error: 'Provider ID not found. Please log in as a provider.',
        });
    }

    if (!name) {
        return res.status(400).json({
            error: 'Name is required.',
        });
    }

    try {
        // Проверяем, что провайдер существует (опционально)
        const providerCheckQuery = `
            SELECT provider_id 
            FROM "Provider" 
            WHERE provider_id = $1
        `;
        const providerCheckResult = await req.db.query(providerCheckQuery, [provider_id]);

        if (providerCheckResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Invalid provider_id. Provider does not exist.',
            });
        }

        // Найти или создать локацию
        let location_id = null;
        if (location_name && location_address) {
            location_id = await servicesService.findOrCreateLocation(
                req.db,
                location_name.trim(),
                location_address.trim()
            );
        }

        // Добавляем услугу
        const newService = await servicesService.addService(req.db, {
            name: name.trim(),
            description: description?.trim() || null,
            price: price || 0,
            provider_id,
            category_id: category_id || null,
            location_id,
        });

        return res.status(201).json(newService);
    } catch (error) {
        console.error('Error adding service:', error.message);
        return res.status(500).json({ error: error.message });
    }
});


  

// Маршрут для подтверждения удаления услуги
router.get('/:serviceId/confirm-delete', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const canDelete = await servicesService.confirmDeleteService(req.db, serviceId);
        res.status(200).json(canDelete);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Маршрут для удаления услуги
router.delete('/:serviceId', async (req, res) => {
    const { serviceId } = req.params;

    try {
        const deleteResult = await servicesService.deleteService(req.db, serviceId);
        res.status(200).json(deleteResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Маршрут для добавления нового пакета услуг
router.post('/provider/:providerId/packages', async (req, res) => {
    const { providerId } = req.params;
    // В body придут поля: photo_url, name, description, price, duration, services (и т.д.)
    const { photo_url, name, description, price, duration, services } = req.body;

    // Проверим минимум необходимые поля
    if (!name || !providerId) {
        return res.status(400).json({ error: 'Name and Provider ID are requir' });
    }

    try {
        const newPackage = await servicesService.addServicePackage(req.db, {
            provider_id: providerId,
            photo_url,
            name,
            description,
            price,
            duration,
            services,
        });
        res.status(201).json(newPackage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Маршрут для получения ВСЕХ услуг провайдера
router.get('/provider/:providerId/services', async (req, res) => {
    const { providerId } = req.params;
  
    try {
        const services = await servicesService.getServicesForProvider(req.db, providerId);
        
        if (!services || services.length === 0) {
            return res.status(200).json({ message: 'Нет услуг у данного провайдера.' });
        }
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });
  
// Маршрут для получения списка всех категорий (Service_Category)
router.get('/categories', async (req, res) => {
    try {
        // Вызываем метод из servicesService
        const categories = await servicesService.getAllCategories(req.db);
        // Отдаём массив категорий в ответ
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



export const servicesRouter = router;
