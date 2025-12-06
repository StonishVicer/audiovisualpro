<script setup>
import { ref, onMounted, onUpdated, nextTick } from 'vue';
import { socket } from '../../../services/socketService';
import { Icon } from '@iconify/vue'

const myUserId = ref('ADMIN');
const recipientId = ref('CLIENTE_A');
const newMessage = ref('');
const messages = ref([]);
const isClientTyping = ref(false);

const errMessage = ref('')
const err = ref(false)

const messagesContainer = ref(null);

const getTime = () => {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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
    messages.value.push({
      senderId: senderId,
      text: message,
      isMine: false,
      time: getTime()
    });
  });

  socket.on('message_sent', ({ message }) => {
    messages.value.push({
      senderId: myUserId.value,
      text: message,
      isMine: true, // Mensaje propio
      time: getTime()
    });
    newMessage.value = '';
  });

  socket.on('error', (msg) => {
    err.value = true
    errMessage.value = msg
    console.error('Error del Servidor:', msg);
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
  scrollToBottom();
});

onUpdated(() => {
  scrollToBottom();
});
</script>

<template>
    <div
      class="rounded-[15px] w-full h-full flex flex-col overflow-hidden"
    >
      <div
        class="bg-[#19C848] text-white p-5 flex justify-between items-center border-b border-white/20"
      >
        <div class="flex items-center space-x-4">
          <i class="fas fa-headset text-xl text-white"></i>
          <div class="flex flex-col">
            <h3 class="m-0 font-semibold text-lg">
              Chat con Cliente
            </h3>
          </div>
        </div>
      </div>

      <div
        class="border-2 border-gray-300 flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col space-y-5 chat-messages"
        ref="messagesContainer"
      >
        <div v-if="err" class="items-center justify-center flex text-center p-3 border border-red-500 bg-red-100 text-red-700 font-semibold rounded-lg shadow-lg">
          <Icon icon="mdi:error" width="25" height="25" class="mr-2" /> {{ errMessage }}
        </div>
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
            <Icon :icon="msg.isMine ? 'mdi:account-tie' : 'mdi:account'" />
            <i :class="msg.isMine ? 'asd' : 'dsa'"></i>
          </div>
          <div :class="['flex flex-col space-y-1', msg.isMine ? 'items-end' : '']">
            <div
              :class="[
                'p-3 rounded-xl shadow-sm',
                msg.isMine
                  ? 'bg-[#19C848] text-white rounded-br-sm shadow-md'
                  : 'bg-[#F0F0F0] text-gray-700 border border-gray-200 rounded-bl-sm',
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
        
        <div
          class="typing-indicator flex items-center space-x-3 self-start max-w-[80%]"
          v-if="isClientTyping"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#BBBBBB] text-white text-lg"
          >
            <i class="fas fa-user"></i>
          </div>
          <div class="flex flex-col space-y-1">
            <div
              class="p-3 bg-[#F0F0F0] text-gray-700 rounded-xl rounded-bl-sm italic min-w-[150px] typing-text"
            >
              El cliente está escribiendo<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 p-5 bg-white">
        <div class="flex space-x-3 items-center">
          <button
            class="bg-none border-none text-gray-600 text-xl cursor-pointer w-10 h-10 flex items-center justify-center transition duration-300 hover:text-[#19C848]"
          >
            <i class="fas fa-paperclip"></i>
          </button>

          <input
            type="text"
            class="flex-1 border-2 border-[#BBBBBB] rounded-full p-3 text-base transition duration-300 focus:border-[#19C848] focus:ring-4 focus:ring-[#19C848]/25 outline-none"
            placeholder="..."
            v-model="newMessage"
            v-on:keypress.enter="sendMessage"
          />

          <button
            class="bg-none border-none text-gray-600 text-xl cursor-pointer w-10 h-10 flex items-center justify-center transition duration-300 hover:text-[#19C848]"
          >
            <i class="fas fa-smile"></i>
          </button>

          <button
            class="bg-[#19C848] border-none rounded-full text-white w-[50px] h-[50px] flex items-center justify-center cursor-pointer transition duration-300 hover:bg-[#15a03a] hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#19C848]/40"
            v-on:click="sendMessage"
          >
            <Icon icon="material-symbols:send-rounded" />
          </button>
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

.typing-text {
  animation: none;
}

.dot-1,
.dot-2,
.dot-3 {
  animation: typing-dots 1.5s infinite;
}
.dot-2 {
  animation-delay: 0.5s;
}
.dot-3 {
  animation-delay: 1s;
}

@keyframes typing-dots {
  0%,
  60%,
  100% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
}

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