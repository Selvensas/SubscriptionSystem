import mongoose from "mongoose";


const subscriptionSchema = new mongoose.Schema({
   name: {type:String,
    required:[true,'Subscription Name is required'],
    trim:true,
    minLength:2,
    maxLength:100,
    },
    price: {type:Number,
    required:[true,'Subscription Price is required'],
    min:[0,'Price must be greater than or equal to 0'],
    },
    currency: {type:String,
        enum:['USD','EUR','GBP','INR','AUD','CAD','QAR','JPY'],
        default:'USD',
    },
    frequency: {type:String,
        enum:['Monthly','Yearly','Weekly','Daily'],
        default:'Monthly',
    },
    category: {type:String,
        enum:['Entertainment','Education','Productivity','Health','Finance','Other'],
        required:[true,'Subscription Category is required'],
        trim:true,
    },
    paymentMethod: {type:String,
        required:[true,'Payment Method is required'],
        trim:true,
    },
    status:{type:String,
        enum:['Active','Inactive','Cancelled','Paused','Expired'],
        default:'Active',  
    },
    startDate:{type:Date,
        required:[true,'Start Date is required'],
        validate : {
            validator: function(value){
                return value <= new Date();
            },
            message: 'Start Date cannot be in the future'
        }
    },
    renewalDate:{type:Date,

        validate : {
            validator: function(value){
                return value > this.startDate;
            },
            message: 'Renewal date must be after start date'
        }
    },
    user:{type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true,
    }


},{timestamps:true} );




const Subscription = mongoose.model('Subscription',subscriptionSchema);
export default Subscription;