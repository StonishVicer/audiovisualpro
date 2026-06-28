import { ChatService } from '../services/chatService.js'
import { logger } from '../config/logger.js'

export function setupChat(io) {
    io.on('connection', (socket) => {
        logger.info(`Socket conectado: ${socket.id}`)

        socket.on('join_room', async ({ roomId, userId, userType }) => {
            socket.join(roomId)
            logger.info(`${userType} ${userId} se unió a sala ${roomId}`)

            try {
                const messages = await ChatService.getMessages(parseInt(roomId))
                socket.emit('chat_history', messages)
            } catch (err) {
                logger.error('Error cargando historial de chat', { error: err.message, roomId })
            }
        })

        socket.on('send_message', async ({ roomId, message, senderType, senderId }) => {
            try {
                const saved = await ChatService.saveMessage({
                    roomId: parseInt(roomId),
                    senderType,
                    senderId: parseInt(senderId),
                    message
                })
                io.to(roomId).emit('new_message', saved)
            } catch (err) {
                logger.error('Error guardando mensaje', { error: err.message, roomId })
            }
        })

        socket.on('disconnect', () => {
            logger.info(`Socket ${socket.id} desconectado`)
        })
    })
}
