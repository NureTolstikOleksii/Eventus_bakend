export class ServicesService {
    // Существующий метод для получения информации о услуге
    async getServiceDetails(db, serviceId) {
        try {
            const query = `
                SELECT 
                    s.service_id, 
                    s.name AS service_name, 
                    s.description, 
                    s.photo_url, 
                    s.price, 
                    p.name AS provider_name, 
                    sc.name AS category_name,
                    p.rating
                FROM Service s
                JOIN Provider p ON s.provider_id = p.provider_id
                JOIN Service_Category sc ON s.category_id = sc.category_id
                WHERE s.service_id = ?
            `;
            const result = await db.get(query, [serviceId]);

            if (!result) {
                throw new Error('Service not found');
            }

            return result;
        } catch (error) {
            throw new Error('Failed to retrieve service details: ' + error.message);
        }
    }

    // Метод для получения отзывов об услуге с проверкой на отсутствие отзывов
    async getServiceReviews(db, serviceId) {
        try {
            const query = `
                SELECT 
                    r.review_id, 
                    r.rating, 
                    r.comment, 
                    r.review_date, 
                    u.name AS user_name
                FROM Review r
                JOIN Provider u ON r.user_id = u.provider_id
                WHERE r.service_id = ?
            `;
            const reviews = await db.all(query, [serviceId]);

            if (!reviews || reviews.length === 0) {
                return { message: 'No reviews found for this service' };
            }

            return reviews;
        } catch (error) {
            throw new Error('Failed to retrieve service reviews: ' + error.message);
        }
    }
    
    // Метод для получения календаря услуги
    async getServiceCalendar(db, serviceId) {
        try {
            const query = `
                SELECT 
                    t.date, 
                    t.time, 
                    t.status 
                FROM Timeslot t
                JOIN Calendar c ON t.calendar_id = c.calendar_id
                JOIN Service s ON c.provider_id = s.provider_id
                WHERE s.service_id = ?
            `;
            const timeslots = await db.all(query, [serviceId]);

            if (!timeslots || timeslots.length === 0) {
                return { message: 'No available timeslots for this service' };
            }

            return timeslots;
        } catch (error) {
            throw new Error('Failed to retrieve service calendar: ' + error.message);
        }
    }

    // Метод для получения отзывов о поставщике
    async getProviderReviews(db, providerId) {
    try {
        const query = `
            SELECT 
                r.review_id, 
                r.rating, 
                r.comment, 
                r.review_date, 
                c.name AS customer_name
            FROM Review r
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.provider_id = ?
        `;
        const reviews = await db.all(query, [providerId]);

        return reviews || [];
    } catch (error) {
        throw new Error('Ошибка при получении отзывов о поставщике: ' + error.message);
    }

    
    }

    // Метод для получения полного текста отзыва
    async getFullReview(db, reviewId) {
        try {
            const query = `
            SELECT 
                r.review_id, 
                r.rating, 
                r.comment, 
                r.review_date, 
                c.name AS customer_name
            FROM Review r
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.review_id = ?
        `;
        const review = await db.get(query, [reviewId]);

        return review || null;
        } catch (error) {
        throw new Error('Ошибка при получении полного текста отзыва: ' + error.message);
     }
    }


    // Метод для получения пакетов услуг поставщика
    async getProviderPackages(db, providerId) {
    try {
        const query = `
            SELECT 
                pp.package_id, 
                pp.name AS package_name, 
                pp.description, 
                pp.price, 
                GROUP_CONCAT(s.name) AS included_services
            FROM Package pp
            JOIN Service_Package sp ON pp.package_id = sp.package_id
            JOIN Service s ON sp.service_id = s.service_id
            WHERE pp.provider_id = ?
            GROUP BY pp.package_id
        `;
        const packages = await db.all(query, [providerId]);

        return packages || [];
    } catch (error) {
        throw new Error('Ошибка при получении пакетов услуг: ' + error.message);
    }
    }

    //addService

    async addService(db, serviceData) {
        try {
            const query = `
                INSERT INTO Service (name, description, photo_url, price, location_id, provider_id, category_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                serviceData.name,
                serviceData.description,
                serviceData.photo_url,
                serviceData.price,
                serviceData.location_id,
                serviceData.provider_id,
                serviceData.category_id,
            ];
            const result = await db.run(query, params);
    
            if (!result) {
                throw new Error('Failed to add service');
            }
    
            return { message: 'Service added successfully', serviceId: result.lastID };
        } catch (error) {
            throw new Error('Failed to add service: ' + error.message);
        }
    }
    
    //confirmDeleteService

    async confirmDeleteService(db, serviceId) {
        try {
            const query = `
                SELECT COUNT(*) AS activeOrders 
                FROM Orders 
                WHERE service_id = ? AND status = 'active'
            `;
            const result = await db.get(query, [serviceId]);
    
            if (result.activeOrders > 0) {
                return { canDelete: false, message: 'Service has active orders and cannot be deleted' };
            }
    
            return { canDelete: true, message: 'Service can be deleted' };
        } catch (error) {
            throw new Error('Failed to confirm service deletion: ' + error.message);
        }
    }

    //deleteService

    async deleteService(db, serviceId) {
        try {
            const query = `DELETE FROM Service WHERE service_id = ?`;
            const result = await db.run(query, [serviceId]);
    
            if (result.changes === 0) {
                throw new Error('Service not found');
            }
    
            return { message: 'Service deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete service: ' + error.message);
        }
    }
    
    
    
}
