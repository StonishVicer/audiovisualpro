<template>
  <div class="admin-chat-container">
    <div class="chat-wrapper">
      <div class="chat-header">
        <div class="header-info">
          <i class="fas fa-headset chat-icon"></i>
          <div class="header-text">
            <h3 class="chat-title">Chat con Cliente: [Nombre del Cliente]</h3>
            <span class="status">Últ. conexión: hace 2 min</span>
          </div>
        </div>
        <button class="btn-close-chat">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div class="message received">
          <div class="message-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="message-content">
            <div class="message-text">
              Hola, tengo una pregunta sobre el avance de mi proyecto "Video Corporativo"
            </div>
            <div class="message-time">10:05 AM</div>
          </div>
        </div>

        <div class="message sent">
          <div class="message-content">
            <div class="message-text">
              Claro, el proyecto está al 75% completado. El equipo está trabajando en la edición final.
            </div>
            <div class="message-time">10:07 AM</div>
          </div>
          <div class="message-avatar">
            <i class="fas fa-user-tie"></i>
          </div>
        </div>

        <div class="message received">
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
        
        <div class="typing-indicator" v-if="isClientTyping">
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-text typing-text">
                    El cliente está escribiendo<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span>
                </div>
            </div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-group">
          <button class="btn-action file-action">
            <i class="fas fa-paperclip"></i>
          </button>
          
          <input 
            type="text" 
            class="message-input" 
            placeholder="Escribe tu respuesta al cliente..."
            v-model="newMessage"
            v-on:keypress.enter="sendMessage"
          >
          
          <button class="btn-action emoji-action">
            <i class="fas fa-smile"></i>
          </button>
          
          <button class="btn-send" v-on:click="sendMessage">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminChat',
  data() {
    return {
      newMessage: '',
      isClientTyping: true, 
      messages: []
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;
      console.log('Mensaje enviado (Admin):', this.newMessage);
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
/* PALETA DEL ADMINISTRADOR ACTUALIZADA */
/* Principal (Admin/Header/Enviado/Acción): #19C848 (Verde Brillante) */
/* Fondo: #ECF0F1 (Gris muy claro) */
/* Secundario (Cliente/Recibido): #F0F0F0 (Gris Claro) */
/* Botones de acción: Gris oscuro */


.admin-chat-container {
  height: 100vh;
  background: #ECF0F1; /* Fondo gris muy claro */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-wrapper {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header del Chat */
.chat-header {
  background: #19C848; /* VERDE de la paleta principal */
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-icon {
  font-size: 1.5rem;
  color: white; /* Icono blanco */
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

/* Colores de Avatares */
.message.received .message-avatar {
  background: #BBBBBB; /* Cliente (gris estándar) */
  color: white;
}

.message.sent .message-avatar {
  background: #19C848; /* Admin (VERDE) */
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

/* Colores de Mensajes */
.message.received .message-text {
  background: #F0F0F0; /* Mensaje del Cliente (Gris Claro) */
  color: #555555;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.message.sent .message-text {
  background: #19C848; /* Mensaje del Administrador (VERDE) */
  color: white;
  border-bottom-right-radius: 5px;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  padding: 0 8px;
}

/* Indicador de Escritura */
.typing-indicator {
    align-self: flex-start;
    display: flex;
    gap: 12px;
    align-items: center;
    max-width: 80%;
}

.typing-text {
    background: #F0F0F0;
    color: #555555;
    border-bottom-left-radius: 5px !important;
    animation: none;
    font-style: italic;
    min-width: 150px;
}

.dot-1, .dot-2, .dot-3 {
  animation: typing-dots 1.5s infinite;
}
.dot-2 { animation-delay: 0.5s; }
.dot-3 { animation-delay: 1s; }

@keyframes typing-dots {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
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
  /* IMPORTANTE: Alineamos el input y los botones al centro */
  align-items: center; 
}

.message-input {
  flex: 1;
  border: 2px solid #BBBBBB;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.message-input:focus {
  border-color: #19C848; /* Borde al enfocar con VERDE */
  box-shadow: 0 0 0 0.2rem rgba(25, 200, 72, 0.25);
}

.btn-send {
  background: #19C848; /* Botón de enviar con VERDE */
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
  /* Eliminar margin-bottom si lo tenía el input */
}

.btn-send:hover {
  background: #15a03a; /* Tono más oscuro para el hover */
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(25, 200, 72, 0.4);
}

/* Estilos para los botones de acción */
.btn-action {
  background: none;
  border: none;
  color: #6c757d; /* Gris para que se vean como iconos de acción */
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0; /* Quitamos padding excesivo */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-action:hover {
  color: #19C848; 
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}


.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.chat-messages::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
.chat-messages::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

@media (max-width: 768px) {
  .admin-chat-container { padding: 10px; height: 100vh; }
  .chat-wrapper { height: 100%; border-radius: 10px; }
  .message { max-width: 90%; }
  .chat-header { padding: 15px 20px; }
  .chat-messages { padding: 15px; }
  .chat-input-area { padding: 15px; }
  .input-group { gap: 5px; }
  .btn-send { width: 45px; height: 45px; }
}
</style>