import bcrypt from 'bcryptjs';

export class LoginService {
    // Функция для входа пользователя (таблица User)
    async loginUser(db, email, password) {
        try {
            const result = await db.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
            const user = result.rows[0];

            if (user && bcrypt.compareSync(password, user.password)) {
                return user;
            }
            return null;
        } catch (error) {
            throw new Error('Error logging in user: ' + error.message);
        }
    }

    // Функция для входа поставщика (таблица Provider)
    async loginProvider(db, email, password) {
        try {
            const result = await db.query(`SELECT * FROM "Provider" WHERE email = $1`, [email]);
            const provider = result.rows[0];

            if (provider && bcrypt.compareSync(password, provider.password)) {
                return provider;
            }
            return null;
        } catch (error) {
            throw new Error('Error logging in provider: ' + error.message);
        }
    }
}
