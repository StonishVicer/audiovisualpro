<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue'
import { socket } from '../../services/socketService';
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' });

const clientId = ref('');
const clientes = ref([]);
const proyectosCliente = ref([]);
const selectedProyecto = ref(null);
const roomId = ref(null);
const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);
const paso = ref(1); // 1 = buscar cliente, 2 = seleccionar proyecto, 3 = chat

const getTime = () => {
  return new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = messagesContainer.value;
    if (container) container.scrollTop = container.scrollHeight;
  });
};

const buscarClientes = async () => {
  try {
    const res = await api.get('/api/clientes');
    clientes.value = res.data;
  } catch (err) {
    console.error('Error cargando clientes:', err);
    clientes.value = [];
  }
};

const seleccionarCliente = async (cliente) => {
  clientId.value = cliente.id_cliente;
  paso.value = 2;

  try {
    const res = await api.get('/api/contratos');
    const contratosCliente = res.data.filter(c => c.id_cliente === cliente.id_cliente);
    const proyectosIds = [...new Set(contratosCliente.map(c => c.id_proyecto))];

    const resProyectos = await api.get('/api/proyectos');
    proyectosCliente.value = resProyectos.data.filter(p => proyectosIds.includes(p.id_proyecto));
  } catch (err) {
    console.error('Error cargando proyectos del cliente:', err);
    proyectosCliente.value = [];
  }
};

const joinRoom = (proyecto) => {
  selectedProyecto.value = proyecto;
  roomId.value = `proyecto_${proyecto.id_proyecto}`;
  messages.value = [];
  paso.value = 3;

  if (!socket.connected) socket.connect();

  socket.emit('join_room', {
    roomId: roomId.value,
    userId: clientId.value,
    userType: 'client'
  });
};

const volverAProyectos = () => {
  paso.value = 2;
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
    senderType: 'client',
    senderId: clientId.value
  });
};

const setupListeners = () => {
  socket.on('chat_history', (history) => {
    messages.value = history.map(msg => ({
      ...msg,
      isMine: msg.sender_type === 'client',
      time: new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    }));
    scrollToBottom();
  });

  socket.on('new_message', (msg) => {
    messages.value.push({
      ...msg,
      isMine: msg.sender_type === 'client',
      time: new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    });
    if (msg.sender_type === 'client') newMessage.value = '';
    scrollToBottom();
  });
};

onMounted(() => {
  buscarClientes();
  setupListeners();
});

onUnmounted(() => {
  socket.off('chat_history');
  socket.off('new_message');
  socket.disconnect();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex justify-center items-start p-5 pt-10">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

      <!-- Paso 1: Seleccionar cliente -->
      <template v-if="paso === 1">
        <div class="bg-green-600 text-white p-5">
          <h3 class="font-semibold text-lg text-center">Chat de Cliente</h3>
          <p class="text-sm text-green-100 text-center mt-1">Selecciona tu identidad</p>
        </div>
        <div class="p-5">
          <div v-if="clientes.length === 0" class="text-center text-gray-400 py-8">
            <Icon icon="mdi:account-search" width="48" height="48" class="mx-auto mb-3" />
            <p>Cargando clientes...</p>
          </div>
          <div class="space-y-2">
            <div v-for="cliente in clientes" :key="cliente.id_cliente"
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer transition"
              @click="seleccionarCliente(cliente)">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:account" width="22" class="text-green-600" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ cliente.nombre_cliente }}</p>
                <p class="text-xs text-gray-500">{{ cliente.rif_cliente }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Paso 2: Seleccionar proyecto -->
      <template v-if="paso === 2">
        <div class="bg-green-600 text-white p-5 flex items-center gap-3">
          <button @click="paso = 1" class="hover:bg-green-700 p-1 rounded transition">
            <Icon icon="material-symbols:arrow-back" width="24" />
          </button>
          <div>
            <h3 class="font-semibold text-lg">Tus Proyectos</h3>
            <p class="text-xs text-green-100">Selecciona un proyecto para chatear</p>
          </div>
        </div>
        <div class="p-5">
          <div v-if="proyectosCliente.length === 0" class="text-center text-gray-400 py-8">
            <p>No tienes proyectos activos</p>
          </div>
          <div class="space-y-2">
            <div v-for="proyecto in proyectosCliente" :key="proyecto.id_proyecto"
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer transition"
              @click="joinRoom(proyecto)">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon icon="ix:project" width="22" class="text-green-600" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ proyecto.nombre_proyecto }}</p>
                <p class="text-xs text-gray-500">{{ proyecto.nombre_estado || 'Sin estado' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Paso 3: Chat activo -->
      <template v-if="paso === 3">
        <div class="bg-green-600 text-white p-4 flex items-center gap-3">
          <button @click="volverAProyectos" class="hover:bg-green-700 p-1 rounded transition">
            <Icon icon="material-symbols:arrow-back" width="24" />
          </button>
          <div>
            <h3 class="font-semibold text-lg">{{ selectedProyecto.nombre_proyecto }}</h3>
            <p class="text-xs text-green-100">Chat del proyecto</p>
          </div>
        </div>

        <div class="h-96 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3" ref="messagesContainer">
          <div v-if="messages.length === 0" class="text-center text-gray-400 mt-20">
            <p>No hay mensajes aún. Envía el primero.</p>
          </div>

          <div v-for="(msg, index) in messages" :key="index"
            :class="['flex items-end gap-2 max-w-[80%]', msg.isMine ? 'flex-row-reverse self-end' : 'self-start']">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0',
              msg.isMine ? 'bg-green-600' : 'bg-gray-400']">
              <Icon :icon="msg.isMine ? 'mdi:account' : 'mdi:account-tie'" width="18" />
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
  </div>
</template>
