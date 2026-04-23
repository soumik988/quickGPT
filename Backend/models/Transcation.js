import mongoose from "mongoose";

const transactionSchmea = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: 'true'
    },
    planId: {
        type: String,
        required: "true"
    },
    amount: {
        type: Number,
        required: "true"
    },
    credits: {
        type: Number,
        required: "true"
    },
    isPaid: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const Transcation = mongoose.model('Transcation', transactionSchmea)

export default Transcation;