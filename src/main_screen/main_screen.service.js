export default class MainScreenService {

    //Головний екран: іконки категорій
    async getServicesByCategory(db, categoryName) {
        try {
            // Перевірка наявності категорії
            const category = await db.get('SELECT * FROM Categories WHERE name = ?', [categoryName]);
            if (!category) {
                throw new Error('Category not found');
            }
    
            // Отримання послуг за категорією
            const services = await db.all('SELECT * FROM Services WHERE category = ?', [categoryName]);
            if (!services || services.length === 0) {
                throw new Error('No services found for the specified category');
            }
    
            return { message: 'Services retrieved successfully', data: services };
        } catch (error) {
            throw new Error('Error fetching services by category: ' + error.message);
        }
    }

    // Повернення усіх послуг постачальника
    async getServicesByProvider(db, providerId) {
        try {
            const services = await db.all('SELECT * FROM Service WHERE provider_id = ?', [providerId]);

            if (!services || services.length === 0) {
                throw new Error('No services found for the specified provider');
            }

            return { message: 'Services retrieved successfully', data: services };
        } catch (error) {
            throw new Error('Error fetching services by provider: ' + error.message);
        }
    }

    // Повернення усіх відгуків про послугу
    async getReviewsByService(db, serviceId) {
        try {
            const reviews = await db.all('SELECT * FROM Review WHERE service_id = ?', [serviceId]);

            if (!reviews || reviews.length === 0) {
                throw new Error('No reviews found for the specified service');
            }

            return { message: 'Reviews retrieved successfully', data: reviews };
        } catch (error) {
            throw new Error('Error fetching reviews for service: ' + error.message);
        }
    }

    // Повернення топ послуг за рейтингом
    async getTopServices(db) {
        const limit = 5; // Установлено значение по умолчанию 10
        try {
            const services = await db.all(
                'SELECT * FROM Service ORDER BY raiting DESC LIMIT ?', 
                [limit]
            );
    
            if (!services || services.length === 0) {
                throw new Error('No services found');
            }
    
            return { message: 'Top services retrieved successfully', data: services };
        } catch (error) {
            throw new Error('Error fetching top services: ' + error.message);
        }
    }
}
