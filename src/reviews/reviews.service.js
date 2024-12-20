import { connectToDatabase } from '../../database/database.js';

/**
 * Get all reviews for a specific service
 */
export async function getAllReviews(req, res) {
    const { serviceId } = req.query;

    if (!serviceId) {
        return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
        const db = await connectToDatabase();
        const result = await db.query(
            'SELECT * FROM "Review" WHERE service_id = $1',
            [serviceId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
}

/**
 * Add a new review
 */
export async function addReview(req, res) {
    const { rating, comment, service_id, user_id } = req.body;

    if (!rating || !comment || !service_id || !user_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const db = await connectToDatabase();
        await db.query(
            `
            INSERT INTO "Review" (rating, comment, review_date, service_id, user_id)
            VALUES ($1, $2, CURRENT_DATE, $3, $4)
            `,
            [rating, comment, service_id, user_id]
        );
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
}

/**
 * Update an existing review
 */
export async function updateReview(req, res) {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ error: 'Rating and comment are required' });
    }

    try {
        const db = await connectToDatabase();
        const result = await db.query(
            `
            UPDATE "Review" 
            SET rating = $1, comment = $2 
            WHERE review_id = $3
            `,
            [rating, comment, reviewId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
}

/**
 * Delete a review
 */
export async function deleteReview(req, res) {
    const { reviewId } = req.params;

    try {
        const db = await connectToDatabase();
        const result = await db.query(
            'DELETE FROM "Review" WHERE review_id = $1',
            [reviewId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
}
