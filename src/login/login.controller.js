import { Router } from 'express';
import { LoginService } from './login.service.js';

const router = Router();
const loginService = new LoginService();

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    try {
        let user = await loginService.loginUser(req.db, email, password);
        let role = 'customer';

        if (!user) {
            // Если в таблице User не найден, проверяем таблицу Provider
            user = await loginService.loginProvider(req.db, email, password);
            role = 'provider'; // Роль, если найден в Provider
        }

        if (!user) {
            // Если пользователь не найден ни в одной таблице
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Сохранение данных в сессии
        req.session.userId = user.user_id || user.provider_id;
        req.session.name = user.name;
        req.session.userRole = role;
        req.session.photo = user.photo_url;
        console.log('Session data:', req.session);

        res.status(200).json({ message: 'Login successful', role, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to log in', error: error.message });
    }
});

router.get('/getOrganization/:providerId', async (req, res) => {
    const { providerId } = req.params;

    try {
        const query = `SELECT "company_name" FROM "Provider" WHERE "provider_id" = $1`;
        const result = await req.db.query(query, [providerId]);

        if (result.rows.length > 0) {
            res.status(200).json({ organizationName: result.rows[0].organization_name });
        } else {
            res.status(404).json({ message: 'Provider not found' });
        }
    } catch (error) {
        console.error('Error fetching organization:', error.message);
        res.status(500).json({ message: 'Failed to fetch organization', error: error.message });
    }
});

export const loginRouter = router;
