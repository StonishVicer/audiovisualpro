import { ChatModel } from '../models/chat.js'

export const ChatService = {
    async getMessages(roomId, limit = 50) {
        const result = await ChatModel.getRecentMessages(roomId, limit)
        return result.rows.reverse()
    },

    async saveMessage({ roomId, senderType, senderId, message }) {
        const result = await ChatModel.saveMessage({ roomId, senderType, senderId, message })
        return result.rows[0]
    }
}
