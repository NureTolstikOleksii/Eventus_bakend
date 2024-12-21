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
                const placeholders = category_ids.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                query += ` AND "category_id" IN (${placeholders})`;
                queryParams.push(...category_ids);
            }

            // Фильтр по рейтингу
            if (rating !== undefined) {
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

            const result = await db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw new Error(`Error filtering services: ${error.message}`);
        }
    }
}
