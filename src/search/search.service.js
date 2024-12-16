export class SearchService {
    // Метод для пошуку послуг за ключовим словом
    async searchServices(db, keyword) {
      try {
        const sqlQuery = 'SELECT * FROM Services WHERE name LIKE ? OR description LIKE ?';
        const paramsArray = [`%${keyword}%`, `%${keyword}%`];
  
        const results = await db.all(sqlQuery, paramsArray);
  
        return results;
      } catch (error) {
        throw new Error('Error searching services: ' + error.message);
      }
    }
  }
  
  export default new SearchService();