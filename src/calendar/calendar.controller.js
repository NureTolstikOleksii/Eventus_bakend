import { Router } from 'express';
import { CalendarService } from './calendar.service.js';

const router = Router();
const calendarService = new CalendarService();

// Route to get all timeslots in a calendar
router.get('/:calendarId/timeslots', async (req, res) => {
    try {
        const { calendarId } = req.params;
        const timeslots = await calendarService.getTimeslots(req.db, calendarId);
        res.status(200).json({ message: 'Timeslots fetched successfully', timeslots });
    } catch (error) {
        console.error('Error fetching timeslots:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to add a new calendar
router.post('/add', async (req, res) => {
    try {
        const { providerId } = req.body;
        if (!providerId) {
            return res.status(400).json({ message: 'Provider ID is required' });
        }
        const calendar = await calendarService.addCalendar(req.db, providerId);
        res.status(201).json({ message: 'Calendar added successfully', calendar });
    } catch (error) {
        console.error('Error adding calendar:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to add a timeslot to a calendar
router.post('/:calendarId/timeslots/add', async (req, res) => {
    try {
        const { calendarId } = req.params;
        const { date, time, status } = req.body;
        if (!date || !time) {
            return res.status(400).json({ message: 'Date and time are required' });
        }
        const timeslot = await calendarService.addTimeslot(req.db, calendarId, date, time, status || 'available');
        res.status(201).json({ message: 'Timeslot added successfully', timeslot });
    } catch (error) {
        console.error('Error adding timeslot:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to delete a timeslot from a calendar
router.delete('/timeslots/:timeslotId', async (req, res) => {
    try {
        const { timeslotId } = req.params;
        await calendarService.deleteTimeslot(req.db, timeslotId);
        res.status(200).json({ message: 'Timeslot deleted successfully' });
    } catch (error) {
        console.error('Error deleting timeslot:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to get calendar ID by provider ID
router.get('/provider/:providerId', async (req, res) => {
    try {
        const { providerId } = req.params;
        if (!providerId) {
            return res.status(400).json({ message: 'Provider ID is required' });
        }
        const calendarId = await calendarService.getCalendarIdByProvider(req.db, providerId);
        if (!calendarId) {
            return res.status(404).json({ message: 'Calendar not found for the given provider' });
        }
        res.status(200).json({ message: 'Calendar ID fetched successfully', calendarId });
    } catch (error) {
        console.error('Error fetching calendar ID:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


export const calendarRouter = router;
