import express from 'express';
import resumeRouter from './routes/resume.route';
import userRouter from './routes/user.route';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());

mongoose.connect(process.env.MONGODB_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as any)
    .then(() => console.log('Database connected!'))
    .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/resume', resumeRouter);
app.use('/users', userRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});