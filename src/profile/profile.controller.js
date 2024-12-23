import { Router } from 'express';
import { ProfileService } from './profile.service.js';

const router = Router();
const profileService = new ProfileService();

// Маршрут виходу з аккаунту для обох (вихід з сесії)
router.post('/logout', (req, res) => {
    if (req.session.userId) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Failed to log out' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.status(400).json({ message: 'No active session to log out' });
    }
});

// При вході постачальника в його аккаунт
router.get('/provider', async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Log in to start' });
    }

    try {
        const profile = await profileService.getProviderProfile(req.db, req.session.userId);
        if (!profile) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// При вході замовника в його аккаунт
router.get('/customer', async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Log in to start' });
    }

    try {
        const profile = await profileService.getCustomerProfile(req.db, req.session.userId);
        if (!profile) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Профіль постачалника для замовника
router.get('/providerForCustomer/:providerId', async (req, res) => {
    const { providerId } = req.query; 

    if (!providerId) {
        return res.status(400).json({ message: 'Provider ID is required' });
    }

    try {
        const profile = await profileService.getProviderProfileForCustomer(req.db, providerId);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// профіль замовника для замовника
router.get('/customer/profile', (req, res) => {
    console.log('Session data:', req.session); // Логування сесії

    // Перевірка сесії
    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Log in to access profile' });
    }

    // Повертаємо дані профілю із сесії
    res.status(200).json({
        name: req.session.name || 'Невідомий користувач',
        photo: req.session.photo || null,
    });
});

// профіль постачалника для постачалника
router.get('/provider/profile', async (req, res) => {
    try {
        if (!req.session.userId || req.session.userRole !== 'provider') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const profile = await profileService.getProviderBasicInfo(req.db, req.session.userId);

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Сповіщення постачальника
router.get('/notifications', async (req, res) => {
    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const notifications = await profileService.getProviderNotifications(req.db, req.session.userId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
});

export const profileRouter = router;
