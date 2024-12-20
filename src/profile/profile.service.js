export class ProfileService {
    // async getProviderProfile(db, providerId) {
    //     try {
    //         const query = `
    //             SELECT name, photo_url, company_name, rating 
    //             FROM Provider
    //             WHERE provider_id = ?
    //         `;
    //         const result = await db.get(query, [providerId]);

    //         if (!result) {
    //             throw new Error('Provider profile not found');
    //         }

    //         return {
    //             name: result.name,
    //             photo_url: result.photo_url,
    //             company_name: result.company_name,
    //             rating: result.rating
    //         };
    //     } catch (error) {
    //         throw new Error('Failed to retrieve provider profile: ' + error.message);
    //     }
    // }

    async getCustomerProfile(db, user_id) {
        try {
            const query = `
                SELECT name, photo_url
                FROM User
                WHERE user_id = ?
            `;
            const result = await db.get(query, [user_id]);

            if (!result) {
                throw new Error('Customer profile not found');
            }

            return {
                name: result.name,
                photo_url: result.photo_url
            };
        } catch (error) {
            throw new Error('Failed to retrieve customer profile: ' + error.message);
        }
    }

    //Метод для отримання профілю постачальника для замовника
    async getProviderProfileForCustomer(db, providerId) {
        try {
            const query = `
                SELECT name, photo_url, rating 
                FROM Provider
                WHERE provider_id = ?
            `;
            const result = await db.get(query, [providerId]);

            if (!result) {
                throw new Error('Provider profile not found');
            }

            return {
                name: result.name,
                photo_url: result.photo_url,
                company_name: result.company_name,
                rating: result.rating
            };
        } catch (error) {
            throw new Error('Failed to retrieve provider profile for customer: ' + error.message);
        }
    }

    async getCustomerBasicInfo(db, userId) {
        try {
            // Запит до бази даних для отримання лише імені
            const result = await db.query(
                'SELECT name, photo_url FROM User WHERE user_id = $1',
                [userId]
            );
            return result.rows[0]; // Повертаємо перший запис
        } catch (error) {
            throw new Error('Failed to fetch customer basic info');
        }
    }   
    
    // профіль постачалника для постачалника
    async getProviderProfile(userId) {
        try {
            const provider = await this.db.get(
                `SELECT name, photo_url, company_name, rating FROM Provider WHERE provider_id = $1`,
                [userId]
            );

            if (!provider) {
                throw new Error('Provider not found');
            }

            return {
                name: provider.name,
                photo_url: provider.photo_url,
                company_name: provider.company_name,
                rating: provider.rating,
            };
        } catch (error) {
            throw new Error(`Error fetching provider profile: ${error.message}`);
        }
    }
}
