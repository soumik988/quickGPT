import express from "express"
import 'dotenv/config'
import cors from "cors"
import connectDb from "./config/db.js"
import userRouter from "./routes/user.route.js"
import chatRouter from "./routes/chat.route.js"
import messageRouter from "./routes/message.route.js"
import creditRouter from "./routes/credit.route.js"
import { stripeWebhooks } from "./controllers/webhook.js"


const app=express()


await connectDb()
//stripe webhoks
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

//Middleware

app.use(cors())

app.use(express.json())


//Routes

app.get('/',(req,res)=>res.send('server is running') )
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/message',messageRouter)
app.use('/api/credit',creditRouter)

const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server is Running on Port ${PORT}`)
})