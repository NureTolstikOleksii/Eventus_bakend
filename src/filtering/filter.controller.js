import { Router } from "express";
import { FilterService } from "./filter.service.js";

const router = Router();
const filterService = new FilterService();

router.post('/', async (req, res) => {
    try {
        const filters = req.body;
        const filteredServices = await filterService.filterFunction(req.db, filters); 
        res.status(200).json(filteredServices); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const result = await req.db.query('SELECT "category_id", "name" FROM "Service_Category"');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export const filterRouter = router;
