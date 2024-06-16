import User from '../models/UserModel';
import express from 'express';

export const getUsers = async (req: express.Request, res: express.Response) => {
    const users = await User.find();
    res.json(users);
};

export const createUser = async (req: express.Request, res: express.Response) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
};

export const getUser = async (req: express.Request, res: express.Response) => {
    const user = await User.findById(req.params.id);
    res.json(user);
};

export const updateUser = async (req: express.Request, res: express.Response) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
};

export const getUserByEmail = async (req: express.Request, res: express.Response) => {
    const user = await User.findOne({ email: req.params.email });
    res.json(user);
};

export const updateAiKeyUsage = async (req: express.Request, res: express.Response) => {
    try {
        const { userEmail } = req.body;
        const user = await User.findOne({ email: userEmail });
  
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.aiKeyUsage = Math.max(0, (user.aiKeyUsage || 0) - 1);
        await user.save();

        res.status(200).send('aiKeyUsage updated successfully');
    } catch (error) {
        console.error('Error updating aiKeyUsage:', error);
        res.status(500).send('Internal server error');
    }
};