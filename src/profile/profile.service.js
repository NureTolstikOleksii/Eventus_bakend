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
}
