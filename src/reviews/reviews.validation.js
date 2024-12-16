/**
 * Validate review data for creating or updating a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function validateReviewData(req, res, next) {
    const { rating, comment } = req.body;

    // Check if rating is provided and is a number within range
    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    // Check if comment is provided, is a string, and meets minimum length
    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
        return res.status(400).json({ error: 'Comment must be a string with at least 3 characters' });
    }

    next();
}
