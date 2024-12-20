export class ServicesService {
    // Получение информации о услуге
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
                FROM "Service" s
                JOIN "Provider" p ON s.provider_id = p.provider_id
                JOIN "Service_Category" sc ON s.category_id = sc.category_id
                WHERE s.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                throw new Error('Service not found');
            }

            return result.rows[0];
        } catch (error) {
            throw new Error('Failed to retrieve service details: ' + error.message);
        }
    }

    // Получение отзывов об услуге
    async getServiceReviews(db, serviceId) {
        try {
            const query = `
                SELECT 
                    r.review_id, 
                    r.rating, 
                    r.comment, 
                    r.review_date, 
                    u.name AS user_name
                FROM "Review" r
                JOIN "User" u ON r.user_id = u.user_id
                WHERE r.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                return { message: 'No reviews found for this service' };
            }

            return result.rows;
        } catch (error) {
            throw new Error('Failed to retrieve service reviews: ' + error.message);
        }
    }

    // Получение календаря услуги
    async getServiceCalendar(db, serviceId) {
        try {
            const query = `
                SELECT 
                    t.date, 
                    t.time, 
                    t.status 
                FROM "Timeslot" t
                JOIN "Calendar" c ON t.calendar_id = c.calendar_id
                JOIN "Service" s ON c.provider_id = s.provider_id
                WHERE s.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                return { message: 'No available timeslots for this service' };
            }

            return result.rows;
        } catch (error) {
            throw new Error('Failed to retrieve service calendar: ' + error.message);
        }
    }

    // Получение пакетов услуг поставщика
    async getProviderPackages(db, providerId) {
        try {
            const query = `
                SELECT 
                    pp.package_id, 
                    pp.name AS package_name, 
                    pp.description, 
                    pp.price, 
                    array_agg(s.name) AS included_services
                FROM "Package" pp
                JOIN "Service_Package" sp ON pp.package_id = sp.package_id
                JOIN "Service" s ON sp.service_id = s.service_id
                WHERE pp.provider_id = $1
                GROUP BY pp.package_id
            `;
            const result = await db.query(query, [providerId]);

            return result.rows || [];
        } catch (error) {
            throw new Error('Failed to retrieve service packages: ' + error.message);
        }
    }

    // Добавление услуги
    async addService(db, serviceData) {
        try {
            const query = `
                INSERT INTO "Service" (name, description, photo_url, price, location_id, provider_id, category_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING service_id
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
            const result = await db.query(query, params);

            return { message: 'Service added successfully', serviceId: result.rows[0].service_id };
        } catch (error) {
            throw new Error('Failed to add service: ' + error.message);
        }
    }

    // Проверка возможности удаления услуги
    async confirmDeleteService(db, serviceId) {
        try {
            const query = `
                SELECT COUNT(*) AS active_orders 
                FROM "Orders" 
                WHERE service_id = $1 AND status = 'active'
            `;
            const result = await db.query(query, [serviceId]);

            if (parseInt(result.rows[0].active_orders, 10) > 0) {
                return { canDelete: false, message: 'Service has active orders and cannot be deleted' };
            }

            return { canDelete: true, message: 'Service can be deleted' };
        } catch (error) {
            throw new Error('Failed to confirm service deletion: ' + error.message);
        }
    }

    // Удаление услуги
    async deleteService(db, serviceId) {
        try {
            const query = `DELETE FROM "Service" WHERE service_id = $1 RETURNING service_id`;
            const result = await db.query(query, [serviceId]);

            if (result.rowCount === 0) {
                throw new Error('Service not found');
            }

            return { message: 'Service deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete service: ' + error.message);
        }
    }
}
