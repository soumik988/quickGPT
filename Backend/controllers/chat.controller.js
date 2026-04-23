import Chat from "../models/Chat.js"

//API CONTROOLLER FOR CREATING THE NEW CHAT

export const createChat = async (req, res) => {
    try {
        const userId = req.user._id

        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({ success: true, messages: "Chat Created" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//API CONTROLLER TO GET ALL CHAT DATA

export const getChats = async (req, res) => {
    try {
        const userId = req.user._id

        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
        res.json({ success: true, chats })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//API CONTROLLER THE DELETE THE CHAT

export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id
        const {chatId}=req.body
         await Chat.deleteOne({_id:chatId,userId})
        
        res.json({ success: true, message:"caht deleted" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}