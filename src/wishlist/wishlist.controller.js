import express from 'express';
import { connectToDatabase } from '../../database/database.js';

const router = express.Router();

// Отримати список бажань для користувача
router.get('/', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const db = await connectToDatabase();
        const wishlist = await db.all(
            `SELECT w.wishlist_id, w.added_date, s.name AS service_name, u.name AS provider_name
        FROM Wishlist w
        JOIN Service s ON w.service_id = s.service_id
        JOIN User u ON w.user_id = u.user_id
        WHERE w.user_id = ?;`, 
            [user_id]
        );
        res.status(200).json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// Додати елемент до списку бажань
router.post('/', async (req, res) => {
    const { user_id, service_id } = req.body;

    if (!user_id || !service_id) {
        return res.status(400).json({ error: 'User ID and Service ID are required' });
    }

    try {
        const db = await connectToDatabase();
        await db.run(
            'INSERT INTO Wishlist (added_date, user_id, service_id) VALUES (date("now"), ?, ?)',
            [user_id, service_id]
        );
        res.status(201).json({ message: 'Item added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
});

// Видалити елемент зі списку бажань
router.delete('/:wishlist_id', async (req, res) => {
    const { wishlist_id } = req.params;

    if (!wishlist_id) {
        return res.status(400).json({ error: 'Wishlist ID is required' });
    }

    try {
        const db = await connectToDatabase();
        const result = await db.run(
            'DELETE FROM Wishlist WHERE wishlist_id = ?',
            [wishlist_id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Wishlist item not found' });
        }

        res.status(200).json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
        console.error('Error deleting wishlist item:', error);
        res.status(500).json({ error: 'Failed to delete wishlist item' });
    }
});

export const wishlistRouter = router;
