import { pool } from '../config/database.js'

export function setupChat(io) {
    const rooms = {}

    io.on('connection', (socket) => {
        console.log(`Socket conectado: ${socket.id}`)

        socket.on('join_room', async ({ roomId, userId, userType }) => {
            socket.join(roomId)
            rooms[socket.id] = { roomId, userId, userType }
            console.log(`${userType} ${userId} se unió a sala ${roomId}`)

            try {
                const result = await pool.query(
                    'SELECT * FROM chat_messages WHERE id_room = $1 ORDER BY timestamp DESC LIMIT 50',
                    [parseInt(roomId)]
                )
                socket.emit('chat_history', result.rows.reverse())
            } catch (err) {
                console.error('Error cargando historial:', err.message)
            }
        })

        socket.on('send_message', async ({ roomId, message, senderType, senderId }) => {
            try {
                const result = await pool.query(
                    `INSERT INTO chat_messages (id_room, sender_type, sender_id, mensaje)
                     VALUES ($1, $2, $3, $4) RETURNING *`,
                    [parseInt(roomId), senderType, parseInt(senderId), message]
                )
                io.to(roomId).emit('new_message', result.rows[0])
            } catch (err) {
                console.error('Error guardando mensaje:', err.message)
            }
        })

        socket.on('disconnect', () => {
            if (rooms[socket.id]) {
                console.log(`Socket ${rooms[socket.id].userId} desconectado`)
                delete rooms[socket.id]
            }
        })
    })
}
