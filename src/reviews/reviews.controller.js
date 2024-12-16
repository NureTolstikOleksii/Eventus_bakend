import express from 'express';
import { connectToDatabase } from '../../database/database.js';
import { validateReviewData } from './reviews.validation.js';

const router = express.Router();

// Get reviews by service ID
router.get('/', async (req, res) => {
    const { serviceId } = req.query;

    if (!serviceId) {
        return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
        const db = await connectToDatabase();
        const reviews = await db.all(
            'SELECT * FROM Review WHERE service_id = ?',
            serviceId
        );
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Add a new review
router.post('/', validateReviewData, async (req, res) => {
    const { rating, comment, service_id, user_id } = req.body;

    try {
        const db = await connectToDatabase();
        await db.run(
            'INSERT INTO Review (rating, comment, review_date, service_id, user_id) VALUES (?, ?, date("now"), ?, ?)',
            [rating, comment, service_id, user_id]
        );
        res.json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// Export the router
export const reviewsRouter = router;

