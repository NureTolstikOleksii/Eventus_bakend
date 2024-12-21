export class FilterService {
    async filterFunction(db, filters = {}) {
        try {
            const {
                category_ids = [],
                rating = undefined,
                minPrice = undefined,
                maxPrice = undefined,
            } = filters;

            // Начальный SQL-запрос
            let query = `SELECT * FROM "Service" WHERE 1=1`;
            const queryParams = [];

            // Фильтр по категориям
            if (category_ids.length > 0) {
                const numericCategoryIds = category_ids.map(Number); // Преобразуем в числа
                const placeholders = numericCategoryIds.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                query += ` AND "category_id" IN (${placeholders})`;
                queryParams.push(...numericCategoryIds);
            }

            // Фильтр по рейтингу, если он не null и не undefined
            if (rating !== undefined && rating !== null) {
                query += ` AND "rating" >= $${queryParams.length + 1}`;
                queryParams.push(rating);
            }

            // Фильтр по минимальной цене
            if (minPrice !== undefined) {
                query += ` AND "price" >= $${queryParams.length + 1}`;
                queryParams.push(minPrice);
            }

            // Фильтр по максимальной цене
            if (maxPrice !== undefined) {
                query += ` AND "price" <= $${queryParams.length + 1}`;
                queryParams.push(maxPrice);
            }

            console.log('Generated query:', query);
            console.log('Query params:', queryParams);

            const result = await db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw new Error(`Error filtering services: ${error.message}`);
        }
    }
}
