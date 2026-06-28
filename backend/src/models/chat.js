import { pool } from '../config/database.js'

export const ChatModel = {
    getRecentMessages(roomId, limit = 50) {
        return pool.query(
            'SELECT * FROM chat_messages WHERE id_room = $1 ORDER BY timestamp DESC LIMIT $2',
            [roomId, limit]
        )
    },

    saveMessage({ roomId, senderType, senderId, message }) {
        return pool.query(
            `INSERT INTO chat_messages (id_room, sender_type, sender_id, mensaje)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [roomId, senderType, senderId, message]
        )
    }
}
