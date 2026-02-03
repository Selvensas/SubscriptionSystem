// subscription.controller.js

import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js'


// Helper function to calculate the date (move logic out of the model)
const calculateRenewalDate = (startDate, frequency) => {
    const renewalPeriods = {
        'Daily': 1,
        'Weekly': 7,
        'Monthly': 30,
        'Yearly': 365
    };
    
    // Create a new Date object to avoid modifying the original date
    const calculatedDate = new Date(startDate);
    
    // Add the days based on frequency (using a defensive 30-day default if needed)
    const daysToAdd = renewalPeriods[frequency] || 30; 
    calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);
    
    return calculatedDate;
};

export const createSubscription = async (req, res, next) => {
    try {
        const { startDate, frequency, ...rest } = req.body;

        // [Your existing calculation logic here...]
        const renewalDate = calculateRenewalDate(startDate, frequency);
        let status = 'Active';
        if (renewalDate <= new Date()) status = 'Expired';

        // Create the subscription in MongoDB
        const subscription = await Subscription.create({
            ...rest,
            startDate,
            frequency,
            renewalDate,
            status,
            user: req.user._id,
        });

        // 🛑 Trigger Workflow SAFELY
        // We use a try/catch specifically for the workflow so if it fails,
        // we still tell the user the subscription was created (optional choice).
        // OR we let it fail the whole request. Here is the standard way:
        
        // const { workflowRunId } = await workflowClient.trigger({
        //     url: `http://localhost:5500/api/v1/workflows/subscription/reminder`,
        //     body: {
        //         subscriptionId: subscription.id,
        //     },
        //     headers: {
        //         'content-type': 'application/json',
        //     },
        //     retries: 0,
        // });

        // Send ONE response at the very end
        res.status(201).json({ 
            success: true, 
            data: { subscription } 
        });

    } catch (error) {
        // This passes the error to your errorMiddleware.
        // Make sure you don't have any res.json() calls before this catch block!
        next(error); 
    }
}

export const getUserSubscriptions = async (req, res, next) => { 

    try{
        if(req.user.role === req.params.id){
            const error = new Error('You are not the owner');
            error.status = 401;
            throw error;
        }
        const subscriptions = await Subscription.find({user: req.params.id});
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
        
    }catch(error){
        next(error);
    }
}

export const deleteUserSubscription = async (req, res, next) => { 
    try{
        const subscription = await Subscription.findById(req.params.id);    
        if(!subscription){
            const error = new Error('Subscription not found');
            error.status = 404;
            throw error;
        }
        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error('You are not authorized to delete this subscription');
            error.status = 401;
            throw error;
        }
        await subscription.deleteOne();
        res.status(200).json({
            success: true,  
            message: 'Subscription deleted successfully',
        });
    }catch(error){
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.findById(req.params.id);
        if(!subscription){
            const error = new Error('Subscription not found');
            error.status = 404;
            throw error;
        }
        if(subscription.user.toString() !== req.user._id.toString()){
            const error = new Error('You are not authorized to cancel this subscription');
            error.status = 401;
            throw error;
        }
        subscription.status = 'Cancelled';
        await subscription.save();
        res.status(200).json({
            success: true,
            data: subscription,
        });
    }catch(error){
        next(error);
    }   
}

export const userUpcomingRenewals = async (req, res, next) => { 
   //in the next 30 days
    try
    {
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const subscriptions = await Subscription.find({
            user: req.user._id,
            renewalDate: {$gte: today, $lte: next30Days},   
            status: 'Active',
        });
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    }catch(error){
        next(error);
    }
}