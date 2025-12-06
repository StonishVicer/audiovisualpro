<script setup>
import { ref, onMounted, onUpdated, nextTick } from 'vue';
import { Icon } from '@iconify/vue'
import { socket } from '../../services/socketService';

const myUserId = ref('CLIENTE_A');
const recipientId = ref('ADMIN');
const newMessage = ref('');
const messages = ref([]);
const messagesContainer = ref(null);

const getTime = () => {
  return new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = messagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

const connectSocket = () => {
  socket.connect();
  socket.on('connect', () => {
    socket.emit('register', myUserId.value);
    console.log(`Conectado como: ${myUserId.value}`);
  });
};

const setupListeners = () => {
  socket.on('private_message', ({ senderId, message }) => {
    if (senderId === recipientId.value) {
      messages.value.push({
        senderId: senderId,
        text: message,
        isMine: false,
        time: getTime()
      });
    }
  });

  socket.on('message_sent', ({ message }) => {
    messages.value.push({
      senderId: myUserId.value,
      text: message,
      isMine: true,
      time: getTime()
    });
    newMessage.value = '';
  });
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !recipientId.value) return;

  const data = {
    receiverId: recipientId.value,
    message: newMessage.value.trim()
  };

  socket.emit('private_message', data);
};

onMounted(() => {
  connectSocket();
  setupListeners();
});

onUpdated(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="w-full bg-white rounded-2xl shadow-lg p-5 border border-green-100 overflow-hidden">
    
  </div>
  <div class="min-h-screen bg-[#F5FFF5] flex justify-center items-center p-5">
    <div
      class="bg-white rounded-[15px] shadow-xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden"
    >
      <div
        class="bg-[#19C848] text-white p-5 flex justify-between items-center border-b border-white/20"
      >
        <div class="flex items-center space-x-4">
          <i class="fas fa-comments text-xl text-white"></i>
          <div class="flex flex-col">
            <h3 class="m-0 font-semibold text-lg">Chat con Administrador</h3>
          </div>
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col space-y-5 chat-messages"
        ref="messagesContainer"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'flex items-end space-x-3 max-w-[80%] animate-fade-in',
            msg.isMine ? 'flex-row-reverse self-end' : 'self-start',
          ]"
        >
          <div
            :class="[
              'ml-3 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg',
              msg.isMine ? 'bg-[#19C848]' : 'bg-[#BBBBBB]',
            ]"
          >
            <Icon :icon="msg.isMine ? 'mdi:account' : 'mdi:account-tie'" width="25" height="25" />
            <i :class="msg.isMine ? 'fas fa-user' : 'fas fa-user-tie'"></i>
          </div>
          <div :class="['flex flex-col space-y-1', msg.isMine ? 'items-end' : '']">
            <div
              :class="[
                'p-3 rounded-xl shadow-sm',
                msg.isMine
                  ? 'bg-[#19C848] text-white rounded-br-sm shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 rounded-bl-sm',
              ]"
            >
              {{ msg.text }}
            </div>
            <div
              :class="[
                'text-xs text-gray-500',
                msg.isMine ? 'pr-2 text-gray-200' : 'pl-2',
              ]"
            >
              {{ msg.time }}
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 p-5 bg-white">
        <div class="flex space-x-3 mb-2">
          <input
            type="text"
            class="flex-1 border-2 border-[#BBBBBB] rounded-full p-3 text-base transition duration-300 focus:border-[#19C848] focus:ring-4 focus:ring-[#19C848]/25 outline-none"
            placeholder="Escribe tu mensaje..."
            v-model="newMessage"
            v-on:keypress.enter="sendMessage"
          />
          <button
            class="bg-[#19C848] border-none rounded-full text-white w-[50px] h-[50px] flex items-center justify-center cursor-pointer transition duration-300 hover:bg-[#15a03a] hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#19C848]/40"
            v-on:click="sendMessage"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="flex space-x-2 justify-start">
          <button
            class="bg-none border-none text-gray-600 text-xl cursor-pointer p-1 transition duration-300 hover:text-[#19C848]"
          >
            <i class="fas fa-paperclip"></i>
          </button>
          <button
            class="bg-none border-none text-gray-600 text-xl cursor-pointer p-1 transition duration-300 hover:text-[#19C848]"
          >
            <i class="fas fa-smile"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Scrollbar personalizado (Requiere prefijos webkit) */
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

@media (max-width: 768px) {
  .min-h-screen {
    height: 100vh;
  }
}
</style>