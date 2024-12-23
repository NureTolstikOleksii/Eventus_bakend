export class SearchService {
    // Метод для поиска услуг по ключевому слову с изображениями и именем поставщика
    async searchServices(db, keyword) {
        try {
            const sqlQuery = `
                SELECT 
                    s.*,
                    p."photo_url",
                    pr."name" AS provider_name
                    pr.provider_id
                FROM "Service" s
                LEFT JOIN "Photo" p ON s."service_id" = p."service_id"
                LEFT JOIN "Provider" pr ON s."provider_id" = pr."provider_id"
                WHERE s."name" ILIKE $1 OR s."description" ILIKE $2
            `;
            const paramsArray = [`%${keyword}%`, `%${keyword}%`];
  
            const result = await db.query(sqlQuery, paramsArray);
  
            return result.rows;
        } catch (error) {
            throw new Error('Error searching services: ' + error.message);
        }
    }
}
  
export default new SearchService();