<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue'
import { socket } from '../../services/socketService';
import api from '../../services/api.js'

const proyectos = ref([]);
const selectedProyecto = ref(null);
const roomId = ref(null);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);

const getTime = () => {
  return new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = messagesContainer.value;
    if (container) container.scrollTop = container.scrollHeight;
  });
};

const cargarProyectos = async () => {
  try {
    const res = await api.get('/api/proyectos');
    proyectos.value = res.data;
  } catch (err) {
    console.error('Error cargando proyectos:', err);
  }
};

const joinRoom = (proyecto) => {
  selectedProyecto.value = proyecto;
  roomId.value = `proyecto_${proyecto.id_proyecto}`;
  messages.value = [];

  if (!socket.connected) socket.connect();

  socket.emit('join_room', {
    roomId: roomId.value,
    userId: 1,
    userType: 'admin'
  });
};

const volverAProyectos = () => {
  selectedProyecto.value = null;
  roomId.value = null;
  messages.value = [];
  socket.disconnect();
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !roomId.value) return;

  socket.emit('send_message', {
    roomId: roomId.value,
    message: newMessage.value.trim(),
    senderType: 'admin',
    senderId: 1
  });
};

const setupListeners = () => {
  socket.on('chat_history', (history) => {
    messages.value = history.map(msg => ({
      ...msg,
      isMine: msg.sender_type === 'admin',
      time: new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    }));
    scrollToBottom();
  });

  socket.on('new_message', (msg) => {
    messages.value.push({
      ...msg,
      isMine: msg.sender_type === 'admin',
      time: new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    });
    if (msg.sender_type === 'admin') newMessage.value = '';
    scrollToBottom();
  });
};

onMounted(() => {
  cargarProyectos();
  setupListeners();
});

onUnmounted(() => {
  socket.off('chat_history');
  socket.off('new_message');
  socket.disconnect();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Vista de selección de proyecto -->
    <template v-if="!selectedProyecto">
      <div class="border-b border-gray-200 pb-3 mb-4">
        <h3 class="text-center font-bold text-lg text-gray-700">Chat por Proyecto</h3>
        <p class="text-sm text-gray-500 text-center mt-1">Selecciona un proyecto para chatear con el cliente</p>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="proyectos.length === 0" class="text-center text-gray-400 mt-10">
          <Icon icon="material-symbols:chat-error" width="48" height="48" class="mx-auto mb-3" />
          <p>No hay proyectos registrados</p>
        </div>

        <div class="grid gap-3 grid-cols-1 md:grid-cols-2">
          <div v-for="proyecto in proyectos" :key="proyecto.id_proyecto"
            class="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-md transition cursor-pointer"
            @click="joinRoom(proyecto)">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-gray-800">{{ proyecto.nombre_proyecto }}</h4>
                <p class="text-xs text-gray-500 mt-1">
                  {{ proyecto.nombre_tipo || 'Sin tipo' }} · {{ proyecto.nombre_estado || 'Sin estado' }}
                </p>
              </div>
              <div class="bg-green-100 p-2 rounded-full">
                <Icon icon="material-symbols:chat" width="24" height="24" class="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Vista de chat activo -->
    <template v-else>
      <div class="bg-green-600 text-white p-4 flex items-center gap-3 rounded-t-xl">
        <button @click="volverAProyectos" class="hover:bg-green-700 p-1 rounded transition">
          <Icon icon="material-symbols:arrow-back" width="24" />
        </button>
        <div>
          <h3 class="font-semibold text-lg">{{ selectedProyecto.nombre_proyecto }}</h3>
          <p class="text-xs text-green-100">Chat del proyecto</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3" ref="messagesContainer">
        <div v-if="messages.length === 0" class="text-center text-gray-400 mt-10">
          <p>No hay mensajes aún. Envía el primero.</p>
        </div>

        <div v-for="(msg, index) in messages" :key="index"
          :class="['flex items-end gap-2 max-w-[80%]', msg.isMine ? 'flex-row-reverse self-end' : 'self-start']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0',
            msg.isMine ? 'bg-green-600' : 'bg-gray-400']">
            <Icon :icon="msg.isMine ? 'mdi:account-tie' : 'mdi:account'" width="18" />
          </div>
          <div :class="['flex flex-col gap-1', msg.isMine ? 'items-end' : '']">
            <div :class="['px-4 py-2 rounded-xl shadow-sm text-sm',
              msg.isMine ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-sm']">
              {{ msg.mensaje }}
            </div>
            <span class="text-xs text-gray-400">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-white border-t border-gray-200">
        <div class="flex gap-2 items-center">
          <input type="text" v-model="newMessage" @keypress.enter="sendMessage"
            class="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
            placeholder="Escribe tu mensaje..." />
          <button @click="sendMessage"
            class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-700 transition flex-shrink-0">
            <Icon icon="material-symbols:send-rounded" width="20" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
