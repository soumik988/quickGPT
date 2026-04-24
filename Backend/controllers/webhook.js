import Stripe from "stripe";
import Transcation from "../models/Transcation.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    // ✅ Verify webhook signature
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log("❌ Webhook signature error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        // ✅ CORRECT EVENT
        if (event.type === "checkout.session.completed" ||
             event.type === "payment_intent.succeeded"
        ) {
            const session = event.data.object;

            const { transactionId, appId } = session.metadata || {};

            // Optional safety check
            if (appId && appId !== "quickgpt") {
                return res.json({ received: true, message: "Invalid app" });
            }

            // ✅ Find transaction
            const transaction = await Transcation.findById(transactionId);

            if (!transaction) {
                console.log("❌ Transaction not found");
                return res.json({ received: true });
            }

            // ✅ Prevent duplicate processing
            if (transaction.isPaid) {
                console.log("⚠️ Already paid");
                return res.json({ received: true });
            }

            // ✅ Add credits to user
            await User.findByIdAndUpdate(transaction.userId, {
                $inc: { credits: transaction.credits },
            });

            // ✅ Mark as paid
            transaction.isPaid = true;
            await transaction.save();

            console.log("✅ Payment success → credits added");
        } else {
            console.log("Unhandled event:", event.type);
        }

        res.json({ received: true });

    } catch (error) {
        console.error("❌ Webhook processing error:", error);
        res.status(500).send("Internal Server Error");
    }
};