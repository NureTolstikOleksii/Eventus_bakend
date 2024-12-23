export class ProfileService {
    // Получение профиля поставщика
    async getProviderProfile(db, providerId) {
        try {
            const query = `
                SELECT name, photo_url, company_name, rating 
                FROM "Provider"
                WHERE provider_id = $1
            `;
            const result = await db.query(query, [providerId]);

            if (result.rows.length === 0) {
                throw new Error('Provider profile not found');
            }

            const provider = result.rows[0];
            return {
                name: provider.name,
                photo_url: provider.photo_url,
                company_name: provider.company_name,
                rating: provider.rating,
            };
        } catch (error) {
            throw new Error('Failed to retrieve provider profile: ' + error.message);
        }
    }

    // Получение профиля клиента
    async getCustomerProfile(db, userId) {
        try {
            const query = `
                SELECT name, photo_url
                FROM "User"
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);

            if (result.rows.length === 0) {
                throw new Error('Customer profile not found');
            }

            const customer = result.rows[0];
            return {
                name: customer.name,
                photo_url: customer.photo_url,
            };
        } catch (error) {
            throw new Error('Failed to retrieve customer profile: ' + error.message);
        }
    }

    // Получение профиля поставщика для клиента
    async getProviderProfileForCustomer(db, providerId) {
        try {
            const query = `
                SELECT name, photo_url, rating 
                FROM "Provider"
                WHERE provider_id = $1
            `;
            const result = await db.query(query, [providerId]);

            if (result.rows.length === 0) {
                throw new Error('Provider profile not found');
            }

            const provider = result.rows[0];
            return {
                name: provider.name,
                photo_url: provider.photo_url,
                rating: provider.rating,
            };
        } catch (error) {
            throw new Error('Failed to retrieve provider profile for customer: ' + error.message);
        }
    }

    // Получение основной информации о клиенте
    async getCustomerBasicInfo(db, userId) {
        try {
            const query = `
                SELECT name, photo_url 
                FROM "User"
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);

            if (result.rows.length === 0) {
                throw new Error('Customer basic info not found');
            }

            return result.rows[0];
        } catch (error) {
            throw new Error('Failed to fetch customer basic info: ' + error.message);
        }
    }

    // Получение основной информации о поставщике
    async getProviderBasicInfo(db, providerId) {
        try {
            const query = `
                SELECT name, photo_url, company_name, rating
                FROM "Provider"
                WHERE provider_id = $1
            `;
            const result = await db.query(query, [providerId]);

            if (result.rows.length === 0) {
                throw new Error('Provider not found');
            }

            const provider = result.rows[0];
            return {
                name: provider.name,
                photo_url: provider.photo_url,
                company_name: provider.company_name,
                rating: provider.rating,
            };
        } catch (error) {
            throw new Error('Failed to fetch provider profile: ' + error.message);
        }
    }
    //Сповіщення постачальника
    async getProviderNotifications(db, providerId) {
        try {
            const query = `
                SELECT 
                    n.notification_id, 
                    n.text AS notification_text,
                    n.sent_at AS notification_time,
                    o.order_id,
                    o.date AS order_date,
                    u.name AS customer_name
                FROM "Notification" n
                INNER JOIN "Orders" o ON n.order_id = o.order_id
                INNER JOIN "Service" s ON o.service_id = s.service_id
                INNER JOIN "User" u ON o.user_id = u.user_id
                WHERE s.provider_id = $1
                ORDER BY n.sent_at DESC;
            `;
            const { rows } = await db.query(query, [providerId]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching provider notifications: ' + error.message);
        }
    }

    //замвдення 
    async getUserOrders(db, userId) {
        try {
            const query = `
                SELECT 
                    o.order_id,
                    o.name AS order_name,
                    o.date AS order_date,
                    o.total_price,
                    s.name AS service_name,
                    s.description AS service_description
                FROM "Orders" o
                INNER JOIN "Service" s ON o.service_id = s.service_id
                WHERE o.user_id = $1
                ORDER BY o.date DESC;
            `;
            const { rows } = await db.query(query, [userId]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching user orders: ' + error.message);
        }
    }
    
}    
