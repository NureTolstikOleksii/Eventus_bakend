export default class MainScreenService {
    // Головний екран: отримання послуг за категорією
    async getServicesByCategory(db, categoryName) {
        try {
            // Перевірка наявності категорії
            const categoryResult = await db.query(`SELECT * FROM "Categories" WHERE name = $1`, [categoryName]);
            const category = categoryResult.rows[0];

            if (!category) {
                throw new Error('Category not found');
            }

            // Отримання послуг за категорією
            const servicesResult = await db.query(`SELECT * FROM "Services" WHERE category = $1`, [categoryName]);
            const services = servicesResult.rows;

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
            const servicesResult = await db.query(`SELECT * FROM "Service" WHERE provider_id = $1`, [providerId]);
            const services = servicesResult.rows;

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
            const reviewsResult = await db.query(`SELECT * FROM "Review" WHERE service_id = $1`, [serviceId]);
            const reviews = reviewsResult.rows;

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
        const limit = 5; // Установлено значение по умолчанию
        try {
            const servicesResult = await db.query(
                `
                SELECT 
                    s.service_id, 
                    s.name, 
                    s.description, 
                    s.price, 
                    s.rating, 
                    p.photo_url,
                    pr.name AS provider_name
                    pr.provider_id
                FROM "Service" s
                LEFT JOIN "Photo" p ON s."service_id" = p."service_id"
                LEFT JOIN "Provider" pr ON s."provider_id" = pr."provider_id"
                ORDER BY s."rating" DESC
                LIMIT $1
                `,
                [limit]
            );
            const services = servicesResult.rows;
    
            if (!services || services.length === 0) {
                throw new Error('No services found');
            }
    
            return { message: 'Top services retrieved successfully', data: services };
        } catch (error) {
            throw new Error('Error fetching top services: ' + error.message);
        }
    }

    // Повернення топ пакетів за рейтингом
    async getTopPackages(db) {
        const limit = 5; // Установлено значение по умолчанию
        try {
            const packagesResult = await db.query(
                `
                SELECT 
                    sp.package_id, 
                    sp.name, 
                    sp.description, 
                    sp.price, 
                    sp.services, 
                    sp.duration, 
                    sp.provider_id, 
                    sp.photo_url,
                    pr.name AS provider_name
                FROM "Service_Package" sp
                LEFT JOIN "Provider" pr ON sp."provider_id" = pr."provider_id"
                ORDER BY sp.price DESC
                LIMIT $1
                `,
                [limit]
            );
            const packages = packagesResult.rows;

            if (!packages || packages.length === 0) {
                throw new Error('No packages found');
            }

            return { message: 'Top packages retrieved successfully', data: packages };
        } catch (error) {
            throw new Error('Error fetching top packages: ' + error.message);
        }
    }

}
