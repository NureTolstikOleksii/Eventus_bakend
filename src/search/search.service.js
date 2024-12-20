export class SearchService {
  // Метод для поиска услуг по ключевому слову
  async searchServices(db, keyword) {
      try {
          const sqlQuery = `
              SELECT * 
              FROM "Service" 
              WHERE name ILIKE $1 OR description ILIKE $2
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
