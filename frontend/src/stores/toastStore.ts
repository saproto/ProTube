import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export interface toast {
    text: string;
    random: number;
    duration: number;
}

export const useToastStore = defineStore('toaststore', () => {
    const toasts: Ref<toast[]> = ref([]);

    function addToast(text: string, duration = 2500) {
        const newToast = {
            text: text,
            random: Math.random(),
            duration: duration,
        };

        toasts.value.push(newToast);
        setTimeout(() => {
            const index = toasts.value.indexOf(newToast);
            if (index !== -1) toasts.value.splice(index, 1);
        }, newToast.duration ?? 2500);
    }

    return { toasts, addToast };
});
