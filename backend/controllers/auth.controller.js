import mongoose from "mongoose"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import {JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async (req, res, next) => {
    const sessions = await mongoose.startSession();
    sessions.startTransaction();
    try {
        const { name, email, password } = req.body;
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("User already exists with this email");
            error.status = 400;
            throw error;
        }
        //if it actually exists then -->
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


  const newUsers = await User.create([{
    name,
    email,
    password: hashedPassword
}], { session: sessions });

        const token = JWT.sign(
            {
                userId: newUsers[0]._id,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
        );

        await sessions.commitTransaction();
        sessions.endSession();
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUsers[0],
                
            },
        });

    } catch (error) {
        await sessions.abortTransaction();
        sessions.endSession();
        next(error);
    }


}

export const signIn = async (req, res, next) => {
    try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    } 
    // if the user actually exists
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }
    //if password is valid
    const token = JWT.sign(
        {
            userId: user._id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
    );
    res.status(200).json({
        success: true,
        message: "User signed in successfully",
        data: {
            token,
            user,
        },
    });
    }catch (error)
    {
        next(error);
    }
}

export const signOut = (req, res, next) => {
    //implement signout logic
}