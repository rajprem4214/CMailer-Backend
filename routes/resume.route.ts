import express from 'express';
import { generateEmailTemplates, uploadResume } from '../controllers/resume.controller';

const router = express.Router();

router.post('/upload', uploadResume);
router.post('/rapidTemplates', generateEmailTemplates);

export default router;