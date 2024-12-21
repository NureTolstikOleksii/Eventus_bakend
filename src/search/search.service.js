export class SearchService {
    // Метод для поиска услуг по ключевому слову с изображениями
    async searchServices(db, keyword) {
        try {
            const sqlQuery = `
                SELECT 
                    s.*,
                    p."photo_url"
                FROM "Service" s
                LEFT JOIN "Photo" p ON s."service_id" = p."service_id"
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
  