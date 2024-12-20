export class ChecklistService {
    // Добавление новой записи в список
    async addNote(db, userId, note) {
        try {
            const result = await db.query(
                `
                INSERT INTO "Checklist" (note, user_id)
                VALUES ($1, $2)
                RETURNING checklist_id, note, user_id;
                `,
                [note, userId]
            );

            // Возвращаем данные о созданной записи
            return result.rows[0];
        } catch (error) {
            console.error('Error in addNote:', error.message);
            throw new Error('Failed to add note: ' + error.message);
        }
    }

    // Получение всех записей пользователя
    async getNotes(db, userId) {
        try {
            const result = await db.query(
                `
                SELECT checklist_id, note
                FROM "Checklist"
                WHERE user_id = $1;
                `,
                [userId]
            );

            // Если записей нет, возвращаем пустой массив
            return result.rows;
        } catch (error) {
            console.error('Error in getNotes:', error.message);
            throw new Error('Failed to fetch notes: ' + error.message);
        }
    }

    // Удаление записи по ID
    async deleteNote(db, userId, checklistId) {
        try {
            const result = await db.query(
                `
                DELETE FROM "Checklist"
                WHERE checklist_id = $1 AND user_id = $2
                RETURNING checklist_id;
                `,
                [checklistId, userId]
            );

            if (result.rowCount === 0) {
                throw new Error('Note not found or access denied');
            }

            return { message: 'Note deleted successfully', checklist_id: checklistId };
        } catch (error) {
            console.error('Error in deleteNote:', error.message);
            throw new Error('Failed to delete note: ' + error.message);
        }
    }
}
