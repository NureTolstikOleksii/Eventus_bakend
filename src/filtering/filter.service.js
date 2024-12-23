export class FilterService {
    async filterFunction(db, filters = {}) {
        try {
            const {
                category_ids = [],
                rating = undefined,
                minPrice = undefined,
                maxPrice = undefined,
            } = filters;

            // Початковий SQL-запит із JOIN
            let query = `
                SELECT 
                    s.*, 
                    p.photo_url, 
                    pr.name AS provider_name
                    pr.provider_id
                FROM "Service" s
                LEFT JOIN "Photo" p ON s.service_id = p.service_id
                LEFT JOIN "Provider" pr ON s.provider_id = pr.provider_id
                WHERE 1=1
            `;
            const queryParams = [];

            // Фільтр за категоріями
            if (category_ids.length > 0) {
                const numericCategoryIds = category_ids.map(Number); // Перетворюємо в числа
                const placeholders = numericCategoryIds.map((_, index) => `$${queryParams.length + index + 1}`).join(', ');
                query += ` AND s."category_id" IN (${placeholders})`;
                queryParams.push(...numericCategoryIds);
            }

            // Фільтр за рейтингом (діапазон ±0.5)
            if (rating !== undefined && rating !== null) {
                const lowerBound = rating - 0.5;
                const upperBound = rating + 0.5;
                query += ` AND s."rating" BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`;
                queryParams.push(lowerBound, upperBound);
            }

            // Фільтр за мінімальною ціною
            if (minPrice !== undefined) {
                query += ` AND s."price" >= $${queryParams.length + 1}`;
                queryParams.push(minPrice);
            }

            // Фільтр за максимальною ціною
            if (maxPrice !== undefined) {
                query += ` AND s."price" <= $${queryParams.length + 1}`;
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
