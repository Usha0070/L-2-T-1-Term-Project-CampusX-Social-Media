<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
              :class="[sizeClasses[props.size], { 'my-8': props.scrollable }]"
            >
              <div class="bg-white px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                  <DialogTitle as="h3" class="text-lg font-medium text-gray-900">
                    <slot name="title">Modal Title</slot>
                  </DialogTitle>
                  <button type="button" class="rounded-full p-1 hover:bg-gray-100" @click="$emit('close')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                class="bg-white px-6 py-4"
                :class="{ 'overflow-y-auto': props.scrollable }"
                :style="props.scrollable ? { maxHeight: `calc(100vh - ${props.topOffset}px)` } : {}"
              >
                <slot name="content">Modal content goes here</slot>
              </div>

              <div v-if="$slots.footer" class="bg-gray-50 px-6 py-4 border-t">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from "@headlessui/vue";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface Props {
  show: boolean;
  size?: ModalSize;
  scrollable?: boolean;
  topOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "xl",
  scrollable: false,
  topOffset: 200,
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full mx-4",
};

// Lock scroll when modal is open
const lockScroll = () => {
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "15px"; // Prevent layout shift
};

const unlockScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

onMounted(() => {
  if (props.show) {
    lockScroll();
  }
});

onUnmounted(() => {
  unlockScroll();
});

// Watch for show prop changes to toggle scroll lock
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }
);
</script>
