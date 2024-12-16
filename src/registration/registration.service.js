export class RegisterService {
    // регистрация замовника
    async createAccount(db, name, email, password, phone_number, role = 0) {
        try {
            await db.run(
                `INSERT INTO User (name, photo_url, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)`,
                [name, null, email, password, phone_number, role]
            );
            return { message: 'Account created successfully', name, email };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }

    async findUserByEmail(db, email) {
        const result = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);
        return result;
    }

    //регистрация постачальника
    async registerProvider(db, name, photo_url, email, password, company_name, service_category, role = 1) {
        try {
            const defaultRating = 0.0;
            await db.run(
                `INSERT INTO Provider (name, photo_url, email, password, company_name, service_category, rating, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, photo_url || null, email, password, company_name, service_category, defaultRating, role]
            );
            return { message: 'Provider registered successfully', name, email };
        } catch (error) {
            throw new Error('Error inserting provider into database: ' + error.message);
        }
    }

    async findProviderByEmail(db, email) {
        const result = await db.get(`SELECT * FROM Provider WHERE email = ?`, [email]);
        return result;
    }

     // Получение всех категорий услуг
     async getAllCategories(db) {
        try {
            const categories = await db.all(`SELECT category_id AS id, name FROM Service_Category`);
            return categories;
        } catch (error) {
            throw new Error('Error fetching categories from database: ' + error.message);
        }
    }
}
