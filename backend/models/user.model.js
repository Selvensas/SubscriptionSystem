import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String ,
    required: [true,'User name is Required'],
    trim: true,
    minLength:2,
    maxLength:50,
     },

    email: {type: String ,
    required: [true,'email name is Required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength:2,
    maxLength:50,
    match: [/\S+@\S+\.\S/,'Please fill a valid email address']
     },
     password:{
        type: String,
        required: [true,'User Pass is REQUIRED'],
        minLength:6,
     }

}, {timestamps:true} );

const User = mongoose.model('User',userSchema);
export default User;

// {name : 'John Doe', email: 'john.doe@example.com', password: 'hashedpassword123'}
// {name : 'Jane Smith', email: 'jane.smith@example.com', password: 'hashedpassword456'}