export class CalendarService {
    // Fetch all timeslots for a given calendar
    async getTimeslots(db, calendarId) {
        const query = `
            SELECT * FROM "Timeslot" WHERE "calendar_id" = $1 ORDER BY "date", "time";
        `;
        const result = await db.query(query, [calendarId]);
        return result.rows;
    }

    // Add a new calendar for a provider
    async addCalendar(db, providerId) {
        const query = `
            INSERT INTO "Calendar" ("provider_id")
            VALUES ($1)
            RETURNING *;
        `;
        const result = await db.query(query, [providerId]);
        return result.rows[0];
    }

    // Add a timeslot to a calendar
    async addTimeslot(db, calendarId, date, time, status) {
        const query = `
            INSERT INTO "Timeslot" ("calendar_id", "date", "time", "status", "order_id")
            VALUES ($1, $2, $3, $4, NULL)
            RETURNING *;
        `;
        const result = await db.query(query, [calendarId, date, time, status]);
        return result.rows[0];
    }

    // Delete a timeslot by its ID
    async deleteTimeslot(db, timeslotId) {
        const query = `
            DELETE FROM "Timeslot" WHERE "timeslot_id" = $1;
        `;
        await db.query(query, [timeslotId]);
    }

    // Fetch the calendar ID by provider ID
    async getCalendarIdByProvider(db, providerId) {
        const query = `
            SELECT "calendar_id" FROM "Calendar" WHERE "provider_id" = $1;
        `;
        const result = await db.query(query, [providerId]);
        return result.rows.length > 0 ? result.rows[0].calendar_id : null;
    }   
}
