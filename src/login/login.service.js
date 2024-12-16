import bcrypt from 'bcrypt';

export class LoginService {
    // Функция для входа пользователя (таблица User)
    async loginUser(db, email, password) {
        const user = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);
        if (user && bcrypt.compareSync(password, user.password)) {
            return user;
        }
        return null;
    }

    // Функция для входа поставщика (таблица Provider)
    async loginProvider(db, email, password) {
        const provider = await db.get(`SELECT * FROM Provider WHERE email = ?`, [email]);
        if (provider && bcrypt.compareSync(password, provider.password)) {
            return provider;
        }
        return null;
    }
}
