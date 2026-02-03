import { Router } from "express";
import authorize from "../middlewares/auth.middlewar.js";
import { createSubscription,getUserSubscriptions,deleteUserSubscription,cancelSubscription, userUpcomingRenewals } from "../controllers/subscription.controller.js";

import { get } from "mongoose";
import { getUser } from "../controllers/user.controller.js";
const subscriptionRouter = Router();



subscriptionRouter.get('/',(req,res)=>{
    res.send({title:"GET ALl Subscriptions"})
})

subscriptionRouter.get('/:id',(req,res)=>{
    res.send({title:"GET specific Subscriptions details"})
})

subscriptionRouter.post('/',authorize,createSubscription);

subscriptionRouter.put('/:id',(req,res)=>{
    res.send({title:"UPDATE Specific Subscription "})
})

subscriptionRouter.delete('/:id',authorize,deleteUserSubscription);

subscriptionRouter.get('/user/:id',authorize,getUserSubscriptions);

subscriptionRouter.put('/:id/cancel',authorize,cancelSubscription);

subscriptionRouter.get('/:id/upcoming-renewals',authorize,userUpcomingRenewals)



export default subscriptionRouter;