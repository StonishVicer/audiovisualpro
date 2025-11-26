<script setup>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Icon } from '@iconify/vue'

dayjs.extend(customParseFormat);
dayjs.locale('es'); 

const currentDate = ref(dayjs());
const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const displayMonthYear = computed(() => {
  return currentDate.value.format('MMMM \'YY').replace(/\b\w/g, l => l.toUpperCase());
});

const daysInMonth = computed(() => {
  const monthStart = currentDate.value.startOf('month');
  const monthEnd = currentDate.value.endOf('month');
  const today = dayjs().startOf('day');
  const calendarDays = [];

  let startDayIndex = monthStart.day();
  if (startDayIndex === 0) startDayIndex = 7;

  const prevMonth = currentDate.value.subtract(1, 'month');
  const daysToPrepend = startDayIndex - 1; 

  for (let i = daysToPrepend; i > 0; i--) {
    const day = prevMonth.endOf('month').subtract(i - 1, 'day');
    calendarDays.push({
      number: day.date(),
      isCurrentMonth: false,
      isToday: false,
      hasEvents: false,
    });
  }

  let day = monthStart.clone();
  while (day.isBefore(monthEnd) || day.isSame(monthEnd)) {
    calendarDays.push({
      number: day.date(),
      isCurrentMonth: true,
      isToday: day.isSame(today, 'day'),
      hasEvents: day.date() === 10 || day.date() === 25,
    });
    day = day.add(1, 'day');
  }

  const daysToAppend = 42 - calendarDays.length;

  const nextMonth = currentDate.value.add(1, 'month');
  for (let i = 1; i <= daysToAppend; i++) {
    const day = nextMonth.startOf('month').add(i - 1, 'day');
    calendarDays.push({
      number: day.date(),
      isCurrentMonth: false,
      isToday: false,
      hasEvents: false,
    });
  }
  
  return calendarDays;
});

const prevMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month');
};

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month');
};
</script>

<template>
  <div class="max-w-xs mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
    
    <div class="flex items-center justify-between p-2 border-b border-green-500 bg-green-500">
      
      <button 
        @click="prevMonth" 
        class="cursor-pointer p-1 rounded-full text-white hover:bg-white hover:text-green-500 transition"
      >
        <Icon icon="mingcute:left-fill" />
      </button>

      <h2 class="text-sm font-bold text-white select-none">
        {{ displayMonthYear }}
      </h2>

      <button 
        @click="nextMonth" 
        class="cursor-pointer p-1 rounded-full text-white hover:bg-white hover:text-green-500 transition"
      >
        <Icon icon="mingcute:right-fill" />
      </button>
    </div>

    <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 pt-1 pb-0.5">
      <div v-for="day in daysOfWeek" :key="day" class="py-1">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 border-t border-gray-100">
      <div 
        v-for="(day, index) in daysInMonth" 
        :key="index" 
        class="h-10 text-center relative flex justify-center items-center p-0.5 transition"
        :class="{ 
          'text-gray-400': !day.isCurrentMonth,
          'text-gray-800 hover:bg-green-100 cursor-pointer': day.isCurrentMonth,
        }"
      >
        <span 
          class="text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full transition duration-150 ease-in-out"
          :class="{ 
            'bg-green-500 text-white shadow-md font-bold': day.isToday,
          }"
        >
          {{ day.number }}
        </span>
        
        <div v-if="day.hasEvents && !day.isToday" class="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></div>

      </div>
    </div>
  </div>
</template>
