export class FilterService {
    async filterFunction(db, filters = {}) {
        try {
            const {
                category_ids = [],
                rating = undefined,
                minPrice = undefined,
                maxPrice = undefined,
            } = filters;

            // Початковий SQL-запит
            let query = `SELECT * FROM Service WHERE 1=1`;
            const queryParams = [];

            // Фільтр за категоріями
            if (category_ids.length > 0) {
                query += ` AND category_id IN (${category_ids.map(() => '?').join(', ')})`;
                queryParams.push(...category_ids);
            }

            // Фільтр за рейтингом
            if (rating !== undefined) {
                query += ` AND raiting >= ?`;
                queryParams.push(rating);
            }

            // Фільтр за мінімальною ціною
            if (minPrice !== undefined) {
                query += ` AND price >= ?`;
                queryParams.push(minPrice);
            }

            // Фільтр за максимальною ціною
            if (maxPrice !== undefined) {
                query += ` AND price <= ?`;
                queryParams.push(maxPrice);
            }

            const rows = await db.all(query, queryParams);
            return rows;
        } catch (error) {
            throw new Error(`Error filtering services: ${error.message}`);
        }
    }
}
