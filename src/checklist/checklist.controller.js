import { Router } from 'express';
import { ChecklistService } from './checklist.service.js';

const router = Router();
const checklistService = new ChecklistService();

router.post('/createNote', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { note } = req.body; 
        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing in session' });
        }

        if (!note || note.trim() === '') {
            return res.status(400).json({ message: 'Note cannot be empty' });
        }

        const result = await checklistService.addNote(req.db, userId, note);

        return res.status(201).json({ message: 'Note added successfully', checklist: result });
    } catch (error) {
        console.error('Error creating note:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/getNotes', async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing in session' });
        }

        const notes = await checklistService.getNotes(req.db, userId);

        return res.status(200).json({ message: 'Notes fetched successfully', notes });
    } catch (error) {
        console.error('Error fetching notes:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/deleteNote/:checklist_id', async (req, res) => {
    try {
        const userId = req.session.userId;
        const checklistId = parseInt(req.params.checklist_id);

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing in session' });
        }

        if (!checklistId) {
            return res.status(400).json({ message: 'Checklist ID is missing or invalid' });
        }

        const result = await checklistService.deleteNote(req.db, userId, checklistId);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Note not found or does not belong to the user' });
        }

        return res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export const checklistRouter = router;
