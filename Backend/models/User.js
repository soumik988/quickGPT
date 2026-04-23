import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        
    },
    credits:{
        type:Number,
        default:20,
    },

})

//Hash password  before saving 

userSchema.pre('save',async function () {   //THIS IS THE MOGOOSE MIDDLEWARE HOOK IT RUNS BEFORE SAVE THE DATA TO MONGODB
    if(!this.isModified('password')){   //IF PASSWORD NOT CHHNAGE THEN SKIP HASING
        return next()
    }
    const salt=await bcrypt.genSalt(10) //SAME PASSWORD DIFFENT HASh
    this.password=await bcrypt.hash(this.password,salt)//ORIGINAL PASSWORD CONVER HASH PASSWORD
    
})



const User=mongoose.model('User',userSchema);

export default User;