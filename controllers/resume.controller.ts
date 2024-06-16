import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = new OpenAI({ apiKey: OPENAI_API_KEY as string });

const upload = multer({ storage: multer.memoryStorage() });

export const uploadResume = [
    upload.single('resume'),
    async (req: express.Request, res: express.Response) => {
        try {
            if (!req.file || !req.body.jobDescription) {
                res.status(400).send('No file uploaded or job description provided');
                return;
            }
            if (req.body.apiKey) {
                OPENAI_API_KEY = req.body.apiKey;
                openai = new OpenAI({ apiKey: OPENAI_API_KEY as string });
            }
            const dataBuffer = req.file.buffer;
            const data = await pdfParse(dataBuffer);
            const resumeText = data.text;
            const jobDescription = req.body.jobDescription;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a Cold Email Generator specialized in crafting concise and effective cold email templates using the provided resume and job description. Generate multiple distinct templates and return them in a json. Do not add extra keys in json.' },
                    { role: 'user', content: `Resume:\n${resumeText}` },
                    { role: 'user', content: `Job Description:\n${jobDescription}` },
                ],
            });

            res.json({ text: resumeText, emailTemplate: response.choices[0] });
        } catch (error) {
            res.status(500).send(`An error occurred: ${error}`);
        }
    },
];