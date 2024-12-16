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

export const profileRouter = router;
