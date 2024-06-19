import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import UserModel from '../models/UserModel';
import FormData from 'form-data';
import axios from 'axios';

dotenv.config();

let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = new OpenAI({ apiKey: OPENAI_API_KEY as string });
const BACKEND_PARSER_URL = process.env.BACKEND_PARSER_URL;

const upload = multer({ storage: multer.memoryStorage() });

export const uploadResume = [
    upload.single('resume'),
    async (req: express.Request, res: express.Response) => {
        try {

            const userEmail = req.body.email;
            const user = await UserModel.findOne({ email: userEmail });

            if (user.aiKeyUsage === 0) {
                res.status(400).send('Your free usage limit has been reached. Please use your own API key.');
                return;
            }

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

            user.aiKeyUsage = Math.max(0, (user.aiKeyUsage || 0) - 1);
            await user.save();

            res.json({ text: resumeText, emailTemplate: response.choices[0] });
        } catch (error) {
            res.status(500).send(`An error occurred: ${error}`);
        }
    },
];

export const generateEmailTemplates = [
    upload.single('file'),
    async (req: express.Request, res: express.Response) => {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });
            const response = await axios.post(`${BACKEND_PARSER_URL}/parse_resume`, formData)
            const resumeData = response.data;
            const rapidTemplates = generateRapidTemplates(resumeData);
            res.json({ rapidTemplates })

        } catch (error) {
            throw new Error('Error generating email templates');
        }
    }
];

function generateRapidTemplates(resumeData: any) {
    const degree = resumeData.degree ? resumeData.degree[0] : '[your degree]';
    const designation = resumeData.designation ? resumeData.designation[0] : '[your designation]';
    const companyName = resumeData.company_names ? resumeData.company_names[0] : '[your company]';
    const skills = resumeData.skills ? `${resumeData.skills[0]}, ${resumeData.skills[1]}, and ${resumeData.skills[2]}` : '[your skills]';
    const name = resumeData.name || '[Your Name]';
    const email = resumeData.email || '[your.email@example.com]';
    const mobileNumber = resumeData.mobile_number || '[your mobile number]';
    const totalExperience = resumeData.total_experience || '[your total experience]';

    const template1 = `Dear Hiring Manager,

    I am writing to express my interest in the open position at your company. I was excited to find that my academic background in ${degree} and my professional experience as a ${designation} at ${companyName} align perfectly with the job requirements.

    I have total experience of ${totalExperience} years in this industry.

    In my previous role at ${companyName}, I gained valuable experience in ${skills}, which I believe will be beneficial for this role.

    I am confident that my skills and experiences make me a strong candidate for this position. I am looking forward to the possibility of working at your esteemed organization.

    Sincerely,
    ${name};
    ${email}`;

    const template2 = `Dear Hiring Manager,

    I am applying for the open position at your company. With my degree in ${degree} and my role as a ${designation} at ${companyName}, I believe I am a good fit for this job.

    My experience at ${companyName} has equipped me with skills such as ${skills}, which are relevant for this role. I have total experience of ${totalExperience} years in this industry.

    I am eager to bring my skills and experiences to your esteemed organization.

    Best regards,
    ${name};
    ${email}`;

    const template3 = `Dear Hiring Manager,

    I am interested in the job opening at your company. My academic background in ${degree} and my professional experience as a ${designation} at ${companyName} make me a suitable candidate for this role.

    I have gained valuable skills such as ${skills} in my previous role at ${companyName}. I have total experience of ${totalExperience} years in this industry.

    I am excited about the opportunity to contribute to your organization.

    Yours sincerely,
    ${name};
    ${email}`;

    const template4 = `Dear Hiring Manager,

    I am applying for the job at your company. My degree in ${degree} and my role as a ${designation} at ${companyName} align with the job requirements.

    I have developed skills such as ${skills} during my time at ${companyName}, which I believe will be beneficial for this role. I have total experience of ${totalExperience} years in this industry.

    I am looking forward to the possibility of contributing to your esteemed organization.

    Kind regards,
    ${name};
    ${email}`;

    return [template1, template2, template3, template4];
}