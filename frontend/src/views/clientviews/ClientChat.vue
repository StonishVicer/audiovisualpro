<template>
  <div class="client-chat-container">
    <div class="chat-wrapper">
      <div class="chat-header">
        <div class="header-info">
          <i class="fas fa-comments chat-icon"></i>
          <div class="header-text">
            <h3 class="chat-title">Chat con Administrador</h3>
            <span class="status">En línea</span>
          </div>
        </div>
        <button class="btn-close-chat">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div class="message received">
          <div class="message-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="message-content">
            <div class="message-text">
              ¡Hola! Bienvenido al sistema de chat de AudiovisualPro. ¿En qué puedo ayudarte hoy?
            </div>
            <div class="message-time">10:00 AM</div>
          </div>
        </div>

        <div class="message sent">
          <div class="message-content">
            <div class="message-text">
              Hola, tengo una pregunta sobre el avance de mi proyecto "Video Corporativo"
            </div>
            <div class="message-time">10:05 AM</div>
          </div>
          <div class="message-avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <div class="message received">
          <div class="message-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="message-content">
            <div class="message-text">
              Claro, el proyecto está al 75% completado. El equipo está trabajando en la edición final.
            </div>
            <div class="message-time">10:07 AM</div>
          </div>
        </div>

        <div class="message sent">
          <div class="message-content">
            <div class="message-text">
              Perfecto, ¿cuándo estiman tener la versión final?
            </div>
            <div class="message-time">10:08 AM</div>
          </div>
          <div class="message-avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <div class="message received">
          <div class="message-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="message-content">
            <div class="message-text">
              Estimamos tenerlo listo para el viernes de esta semana. ¿Le gustaría programar una revisión?
            </div>
            <div class="message-time">10:10 AM</div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-group">
          <input 
            type="text" 
            class="message-input" 
            placeholder="Escribe tu mensaje..."
            v-model="newMessage"
            v-on:keypress.enter="sendMessage"
          >
          <button class="btn-send" v-on:click="sendMessage">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="chat-actions">
          <button class="btn-action">
            <i class="fas fa-paperclip"></i>
          </button>
          <button class="btn-action">
            <i class="fas fa-smile"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientChat',
  data() {
    return {
      newMessage: '',
      messages: []
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;

      // Aquí iría la lógica para enviar el mensaje
      console.log('Mensaje enviado:', this.newMessage);
      this.newMessage = '';
    },
    
    scrollToBottom() {
      this.$nextTick(function() {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
}
</script>

<style scoped>
/* Colores utilizados:
   - Verde Principal: #19C848
   - Fondo muy claro: #F5FFF5
   - Gris de input/avatar Admin: #BBBBBB
   - Texto principal: #555555
*/

.client-chat-container {
  height: 100vh;
  background: #F5FFF5; /* Fondo pastel de tu imagen */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-wrapper {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header del Chat */
.chat-header {
  background: #19C848; /* Verde brillante */
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.chat-icon {
  font-size: 1.5rem;
  color: white;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.chat-title {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
}

.status {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.btn-close-chat {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-close-chat:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Área de Mensajes */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #F8F9FA;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 80%;
  animation: fadeIn 0.3s ease-in;
}

.message.received {
  align-self: flex-start;
}

.message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
}

.message.received .message-avatar {
  background: #BBBBBB; /* Avatar del administrador con gris */
  color: white;
}

.message.sent .message-avatar {
  background: #19C848; /* Avatar del cliente con verde */
  color: white;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message.received .message-text {
  background: white;
  color: #555555; /* Texto oscuro */
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.message.sent .message-text {
  background: #19C848; /* Fondo del mensaje enviado con verde */
  color: white;
  border-bottom-right-radius: 5px;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  padding: 0 8px;
}

.message.sent .message-time {
  text-align: right;
}

/* Área de Escritura */
.chat-input-area {
  border-top: 1px solid #e9ecef;
  padding: 20px;
  background: white;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.message-input {
  flex: 1;
  border: 2px solid #BBBBBB; /* Borde del input con gris */
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.message-input:focus {
  border-color: #19C848; /* Borde al enfocar con verde */
  box-shadow: 0 0 0 0.2rem rgba(25, 200, 72, 0.25);
}

.btn-send {
  background: #19C848; /* Botón de enviar con verde */
  border: none;
  border-radius: 50%;
  color: white;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-send:hover {
  background: #15a03a; /* Un tono de verde un poco más oscuro para el hover */
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(25, 200, 72, 0.4);
}

.chat-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.btn-action {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s;
}

.btn-action:hover {
  color: #19C848; /* Iconos de acción con verde al pasar el ratón */
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar personalizado */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .client-chat-container {
    padding: 10px;
    height: 100vh;
  }
  
  .chat-wrapper {
    height: 100%;
    border-radius: 10px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .chat-header {
    padding: 15px 20px;
  }
  
  .chat-messages {
    padding: 15px;
  }
  
  .chat-input-area {
    padding: 15px;
  }
}
</style>