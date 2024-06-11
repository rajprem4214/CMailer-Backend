import express from 'express';
import { uploadResume } from '../controllers/resume.controller';

const router = express.Router();

router.post('/upload', uploadResume);

export default router;