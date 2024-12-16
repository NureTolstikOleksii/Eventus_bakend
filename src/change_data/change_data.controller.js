import { Router } from 'express';
import { ChangeDataService } from './change_data.service.js';

const router = Router();
const changeDataService = new ChangeDataService();

// Зміна паролю замовника
router.put('/update_user_password', async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateUserPassword(req.db, req.session.userId, oldPassword, newPassword, confirmPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
});

// Зміна паролю постачальника
router.put('/update_provider_password', async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateProviderPassword(req.db, req.session.userId, oldPassword, newPassword, confirmPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update provider password', error: error.message });
    }
});

// Зміна імені замовника
router.put('/update_user_name', async (req, res) => {
    const { newName } = req.body;

    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateUserName(req.db, req.session.userId, newName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user name', error: error.message });
    }
});

// Зміна типу послуг постачальника
router.put('/update_service_category', async (req, res) => {
    const { newCategory } = req.body;

    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateServiceCategory(req.db, req.session.userId, newCategory);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update service category', error: error.message });
    }
});

// Зміна назви організації постачальника
router.put('/update_organization_name', async (req, res) => {
    const { newOrganizationName } = req.body;

    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateOrganizationName(req.db, req.session.userId, newOrganizationName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update organization name', error: error.message });
    }
});

// Зміна електронної пошти замовника
router.put('/update_user_email', async (req, res) => {
    const { newEmail } = req.body;

    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateUserEmail(req.db, req.session.userId, newEmail);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update email', error: error.message });
    }
});

// Зміна контактної інформації постачальника
router.put('/update_provider_contact_info', async (req, res) => {
    const { newPhone, newEmail } = req.body;

    if (!req.session.userId || req.session.userRole !== 'provider') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateProviderContactInfo(req.db, req.session.userId, newPhone, newEmail);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update contact information', error: error.message });
    }
});

// Зміна контактної інформації замовника
router.put('/update_user_contact_info', async (req, res) => {
    const { newPhone, newEmail } = req.body;

    if (!req.session.userId || req.session.userRole !== 'customer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await changeDataService.updateUserContactInfo(req.db, req.session.userId, newPhone, newEmail);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update contact information', error: error.message });
    }
});


export const changeDataRouter = router;
