export class RegisterService {
    // Регистрация пользователя
    async createAccount(db, name, email, password, phone_number, role = 0) {
        try {
            const result = await db.query(
                `INSERT INTO "User" (name, photo_url, email, password, phone_number, role) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING name, email`,
                [name, null, email, password, phone_number, role]
            );
            return { message: 'Account created successfully', ...result.rows[0] };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }

    async findUserByEmail(db, email) {
        try {
            const result = await db.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error fetching user by email: ' + error.message);
        }
    }

    // Регистрация поставщика
    async registerProvider(db, name, photo_url, email, password, company_name, service_category, role = 1) {
        try {
            const defaultRating = 0.0;
            const result = await db.query(
                `INSERT INTO "Provider" 
                 (name, photo_url, email, password, company_name, service_category, rating, role) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING name, email`,
                [name, photo_url || null, email, password, company_name, service_category, defaultRating, role]
            );
            return { message: 'Provider registered successfully', ...result.rows[0] };
        } catch (error) {
            throw new Error('Error inserting provider into database: ' + error.message);
        }
    }

    async findProviderByEmail(db, email) {
        try {
            const result = await db.query(`SELECT * FROM "Provider" WHERE email = $1`, [email]);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error fetching provider by email: ' + error.message);
        }
    }

    // Получение всех категорий услуг
    async getAllCategories(db) {
        try {
            const result = await db.query(`SELECT category_id AS id, name FROM "Service_Category"`);
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching categories from database: ' + error.message);
        }
    }
}
