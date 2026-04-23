import Chat from "../models/Chat.js";
import User from "../models/User.js";
import axios from "axios";
import imagekit from "../config/imageKit.js";
import openai from "../config/openai.js";

// ================= TEXT MESSAGE =================

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You dont have enough credits"
            });
        }

        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // ✅ Save user message
        chat.messages.push({
            role: "user",
            content: prompt || "",
            Timestamp: Date.now(),
            isImage: false,
        });

        let content = "";

        // 🟢 GROQ ONLY
        const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant. Answer clearly."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 4000
            }
        );

        content = groqRes?.data?.choices?.[0]?.message?.content;

        // ❗ STRICT CHECK
        if (!content || content.trim() === "") {
            throw new Error("AI returned empty response");
        }

        const reply = {
            role: "assistant",
            content: content.trim(),
            Timestamp: Date.now(),
            isImage: false
        };

        chat.messages.push(reply);
        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        return res.json({ success: true, reply });

    } catch (error) {
        console.log("Groq ERROR:", error.response?.data || error.message);

        // ❗ RETURN ERROR INSTEAD OF FAKE ANSWER
        return res.json({
            success: false,
            message: "AI service is temporarily unavailable. Please try again."
        });
    }
};



// ================= IMAGE MESSAGE =================
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You dont have enough credits to use this feature"
            });
        }

        const { prompt, chatId, isPublished } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // save user message
        chat.messages.push({
            role: "user",
            content: prompt || "",
            Timestamp: Date.now(),
            isImage: false,
        });

        const encodedPrompt = encodeURIComponent(prompt || "");

        // ✅ FREE IMAGE API
        const generateImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        const aiImageResponse = await axios.get(generateImageUrl, {
            responseType: "arraybuffer"
        });

        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data).toString("base64")}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        });

        const reply = {
            role: "assistant",
            content: uploadResponse.url || "",
            Timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        // save reply
        chat.messages.push(reply);
        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        );

        return res.json({ success: true, reply });

    } catch (error) {
        if (!res.headersSent) {
            return res.json({
                success: false,
                message: error.message
            });
        }
    }
};