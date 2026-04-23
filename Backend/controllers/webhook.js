import { response } from "express";
import Stripe from "stripe";
import Transcation from "../models/Transcation.js";
import User from "../models/User.js";


export const stripeWebhooks = (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_SECRET)
    const sig = request.headers['stripe-signature']

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return response.status(400).send(`Webhook Error:${error.message}`)
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })

                const session = sessionList.data[0];
                const { transcationId, appId } = session.metadata;
                if (appId === 'quickgpt') {
                    const transaction = Transcation.findOne({ _id: transcationId, isPaid: false })

                    //update credit

                    User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } })

                    //update the payment status

                    transaction.isPaid = true;
                    transaction.save()
                } else {
                    return res.json({ recived: true, message: "ignored event invalid app" })
                }
            }

                break;

            default:
                console.log("unhandled event type", event.type)
                break;
        }
        res.json({ recived: true })
    } catch (error) {
        console.error("webhook processing error", error)
        res.status(500).send("internal server error")
    }


}