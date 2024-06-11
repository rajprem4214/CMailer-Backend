import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';



const upload = multer({ storage: multer.memoryStorage() });

export const uploadResume = [
    upload.single('resume'),
    async (req: express.Request, res: express.Response) => {
        if (!req.file || !req.body.jobDescription) {
            res.status(400).send('No file uploaded or job description provided');
            return;
        }
        const dataBuffer = req.file.buffer;
        const data = await pdfParse(dataBuffer);
        const resumeText = data.text;
        const jobDescription = req.body.jobDescription;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a Cold Email Generator who uses resume and job description to create to-the-point cold emails template. Generate multiple templates and return an array of templates.' },
                { role: 'user', content: `Resume:\n${resumeText}` },
                { role: 'user', content: `Job Description:\n${jobDescription}` },
                // { role: 'assistant', content: 'Based on the provided resume and job description, here is a suggested email template:' }
            ],
        });

        res.json({ text: resumeText, emailTemplate: response.choices[0] });
    },
];