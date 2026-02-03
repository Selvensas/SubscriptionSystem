import { Router } from "express";
import  { getUser, getUsers } from "../controllers/user.controller.js";
import User from "../models/user.model.js";
import authorize from "../middlewares/auth.middlewar.js";
const userRouter = Router();

userRouter.get('/' , getUsers)

userRouter.get('/:id',authorize ,getUser)

userRouter.post('/' ,)

userRouter.put('/:id' , (req,res)=>{
    res.send({title: 'Update user '})
})

userRouter.delete('/:id' , (req,res)=>{
    res.send({title: 'Delete User'})
})

export default userRouter;