import Transcation from "../models/Transcation.js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

//api controller for getting all plans

export const getPlans = async (req, res) => {
    try {
        res.json({ success: true, plans })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//API CONTROLLER FOR PURCHESING PLANS

export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user._id
        const plan = plans.find(plan => plan._id === planId)

        if (!plan) {
            return res.json({ success: false, message: "Invalid Plan" })
        }

        //create new transaction
        const transaction = await Transcation.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })

        const { origin } = req.headers

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            metadata: { 
                transactionId: transaction._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        res.json({ success: true, url: session.url })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// ✅ STRIPE WEBHOOK (ADDED ONLY FOR isPaid UPDATE)

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // ✅ PAYMENT SUCCESS
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const transactionId = session.metadata.transactionId;

            // ✅ UPDATE isPaid = true
            await Transcation.findByIdAndUpdate(transactionId, {
                isPaid: true
            });
        }

        res.json({ received: true });

    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};