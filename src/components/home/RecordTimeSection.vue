<script setup>
import broImg from '@/assets/images/bro.png'
</script>

<template>
  <section class="py-16 sm:py-24 bg-white dark:bg-slate-950 overflow-hidden border-t border-slate-100 dark:border-slate-800">
    <div class="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        <!-- Left Text Column -->
        <div class="lg:col-span-7 space-y-4 text-left">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            <span class="text-secondaire dark:text-red-400">Rahma Delivery,</span><br class="hidden sm:inline" />
            <span class="text-principal dark:text-sky-300"> Votre colis dans les bonnes mains dans un temps record</span>
          </h2>
        </div>

        <!-- Right Illustration Column (bro.png) -->
        <div class="lg:col-span-5 flex justify-center lg:justify-end">
          <img 
            :src="broImg" 
            alt="Rahma Delivery Temps Record" 
            class="w-full max-w-md sm:max-w-lg h-auto object-contain transform hover:scale-[1.02] transition-transform duration-300"
          />
        </div>

      </div>
    </div>
  </section>
</template>
