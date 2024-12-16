export class ChecklistService {
    async addNote(db, userId, note) {
        try {
            const result = await db.run(
                `
                INSERT INTO Checklist (note, user_id)
                VALUES (?, ?);
                `,
                [note, userId]
            );

            // Повертаємо дані про створений запис
            return {
                checklist_id: result.lastID,
                note,
                user_id: userId,
            };
        } catch (error) {
            console.error('Error in addNote:', error.message);
            throw error;
        }
    }

    async getNotes(db, userId) {
        try {
            // SQL-запит для отримання всіх записів користувача
            const notes = await db.all(
                `
                SELECT checklist_id, note
                FROM Checklist
                WHERE user_id = ?;
                `,
                [userId]
            );

            if (!notes || notes.length === 0) {
                return []; // Якщо записи відсутні
            }

            console.log('Notes fetched:', notes); // Для дебагу
            return notes;
        } catch (error) {
            console.error('Error in getNotes:', error.message);
            throw error;
        }
    }

    async deleteNote(db, userId, checklistId) {
        try {
            // SQL-запит для видалення запису
            const result = await db.run(
                `
                DELETE FROM Checklist
                WHERE checklist_id = ? AND user_id = ?;
                `,
                [checklistId, userId]
            );

            console.log('Delete result:', result); // Для дебагу
            return result;
        } catch (error) {
            console.error('Error in deleteNote:', error.message);
            throw error;
        }
    }
}
