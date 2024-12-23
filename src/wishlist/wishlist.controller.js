import express from 'express';

const router = express.Router();

// Получить список желаний для пользователя
router.get('/get', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const db = req.db; // Используем базу данных из `req`
        console.log('Fetching wishlist for user_id:', user_id);

        const result = await db.query(
            `
            SELECT 
                w."wishlist_id", 
                w."added_date", 
                s."name" AS "service_name", 
                u."name" AS "provider_name",
                s."service_id"
            FROM "Wishlist" w
            JOIN "Service" s ON w."service_id" = s."service_id"
            JOIN "User" u ON w."user_id" = u."user_id"
            WHERE w."user_id" = $1
            `,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'No wishlist items found', wishlist: [] });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist', details: error.message });
    }
});

// Добавить элемент в список желаний
router.post('/', async (req, res) => {
    const { user_id, service_id } = req.body;

    if (!user_id || !service_id) {
        return res.status(400).json({ error: 'User ID and Service ID are required' });
    }

    try {
        const db = req.db; // Используем базу данных из `req`
        console.log('Adding item to wishlist:', { user_id, service_id });

        const result = await db.query(
            `
            INSERT INTO "Wishlist" (added_date, user_id, service_id) 
            VALUES (NOW(), $1, $2) 
            RETURNING wishlist_id
            `,
            [user_id, service_id]
        );

        res.status(201).json({ message: 'Item added to wishlist successfully', id: result.rows[0].wishlist_id });
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
});

// Удалить элемент из списка желаний
router.delete('/:wishlist_id', async (req, res) => {
    const { wishlist_id } = req.params;

    if (!wishlist_id) {
        return res.status(400).json({ error: 'Wishlist ID is required' });
    }

    try {
        const db = req.db; // Используем базу данных из `req`
        console.log('Deleting item from wishlist:', wishlist_id);

        const result = await db.query(
            `
            DELETE FROM "Wishlist" 
            WHERE "wishlist_id" = $1
            RETURNING "wishlist_id"
            `,
            [wishlist_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Wishlist item not found' });
        }

        res.status(200).json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
        console.error('Error deleting wishlist item:', error);
        res.status(500).json({ error: 'Failed to delete wishlist item' });
    }
});

export const wishlistRouter = router;
