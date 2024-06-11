import express from 'express';
import resumeRouter from './routes/resume.route';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/resume', resumeRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});