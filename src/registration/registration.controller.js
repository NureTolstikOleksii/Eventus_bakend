import { Router } from 'express';
import bcrypt from 'bcrypt';
import { RegisterService } from './registration.service.js';
import { EmailService } from '../email/email.service.js';

const router = Router();
const regService = new RegisterService();
const emailService = new EmailService();

// Валидация данных
const isValidName = (name) => /^[A-Za-z]+$/.test(name);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d._-]{8,128}$/.test(password);

// Регистрация пользователя
router.post('/customer', async (req, res) => {
    const { name, email, password, phone_number } = req.body;

    // Проверка на заполненность всех полей
    if (!name || !email || !password || !phone_number) {
        return res.status(400).json({
            message: 'Please enter all data.',
            missingFields: {
                name: !name ? 'Name is required' : undefined,
                email: !email ? 'Email is required' : undefined,
                password: !password ? 'Password is required' : undefined,
                phone_number: !phone_number ? 'Phone number is required' : undefined
            }
        });
    }

    // Проверка имени
    /*if (!isValidName(name)) {
        return res.status(400).json({ message: 'Name can only contain Latin letters.' });
    }*/

    // Проверка email
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Проверка пароля
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: 'Password must be 8-128 characters long, include at least one uppercase letter, one lowercase letter, one numeral, and may contain . _ -'
        });
    }

    try {
        // Проверка, не используется ли email уже
        const existingUser = await regService.findUserByEmail(req.db, email);
        if (existingUser) {
            return res.status(400).json({
                message: 'Email has already been used for another account. Use another email or sign in.'
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание аккаунта
        const result = await regService.createAccount(req.db, name, email, hashedPassword, phone_number);

        // Отправка подтверждающего email
        //await emailService.sendConfirmationEmail(email, name);

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create account', error: error.message });
    }
});

// Регистрация поставщика
router.post('/provider', async (req, res) => {
    const { name, email, password, company_name, service_category } = req.body;

    // Проверка на заполненность обязательных полей
    if (!name || !email || !password || !company_name || service_category === undefined) {
        return res.status(400).json({
            message: 'Please enter all data.',
            missingFields: {
                name: !name ? 'Name is required' : undefined,
                email: !email ? 'Email is required' : undefined,
                password: !password ? 'Password is required' : undefined,
                company_name: !company_name ? 'Company name is required' : undefined,
                service_category: service_category === undefined ? 'Service category is required' : undefined
            }
        });
    }

    // Проверка имени
   /* if (!isValidName(name)) {
        return res.status(400).json({ message: 'Name can only contain Latin letters.' });
    }*/

    // Проверка email
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Проверка пароля
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: 'Password must be 8-128 characters long, include at least one uppercase letter, one lowercase letter, one numeral, and may contain . _ -'
        });
    }

    try {
        // Проверка на существование поставщика с таким же email
        const existingProvider = await regService.findProviderByEmail(req.db, email);
        if (existingProvider) {
            return res.status(400).json({
                message: 'Email has already been used for another account. Use another email or sign in.'
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Регистрация поставщика
        const result = await regService.registerProvider(req.db, name, null, email, hashedPassword, company_name, service_category, 1);

        // Отправка подтверждающего email
        //await emailService.sendConfirmationEmail(email, name);

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to register provider', error: error.message });
    }
});

// Маршрут для получения всех категорий
router.get('/categories', async (req, res) => {
    try {
        const db = req.db; // Предполагаем, что объект базы данных передается через `req`
        const categories = await regService.getAllCategories(db); // Используем объект regService для вызова метода
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

export const regRouter = router;
