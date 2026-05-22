<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { LoginInput } from "@recipes/shared";
import { loginInputSchema } from "@recipes/shared";
import { useToast } from "primevue";
import { reactive, ref } from "vue";
import AuthPageShell from "@/features/auth/ui/AuthPageShell.vue";

definePage({
  meta: {
    layout: "no-layout",
  },
});

const toast = useToast();

const isLoading = ref(false);
const initialValues = reactive<LoginInput>({
  email: "",
  password: "",
});
const resolver = zodResolver(loginInputSchema);

function onSubmit({ valid, values }: FormSubmitEvent) {
  if (!valid) return;

  console.log(values);

  // TODO: integrate login mutation
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "You have successfully logged in.",
      life: 3000,
    });
  }, 1200);
}
</script>

<template>
  <AuthPageShell
    title="Sign in"
    description="Welcome back! Please enter your details."
    aside-title="Welcome back, chef!"
    aside-text="Continue your culinary journey with step-by-step recipes and inspiration."
    image-src="https://plus.unsplash.com/premium_photo-1672153937750-9ea567e94026?q=80&w=987&auto=format&fit=crop"
    image-alt="A cooking scene with ingredients and kitchen tools"
  >
    <Toast />

    <Form :resolver :initial-values class="space-y-5" @submit="onSubmit">
      <FormField v-slot="$field" name="email" class="flex flex-col">
        <label
          for="login-email"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Email
        </label>

        <IconField>
          <InputIcon class="pi pi-envelope text-stone-400" />
          <InputText
            id="login-email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            fluid
          />
        </IconField>

        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          class="pt-1"
        >
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="password" class="flex flex-col">
        <label
          for="login-password"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Password
        </label>

        <IconField>
          <InputIcon class="pi pi-lock text-stone-400" />
          <Password
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            :input-props="{
              id: 'login-password',
              autocomplete: 'current-password',
            }"
          />
        </IconField>

        <template v-if="$field?.invalid">
          <Message
            v-for="(error, index) in $field.errors"
            :key="index"
            severity="error"
            size="small"
            variant="simple"
            class="pt-1"
          >
            {{ error.message }}
          </Message>
        </template>
      </FormField>

      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            class="text-terracotta accent-terracotta focus:ring-terracotta h-4 w-4 rounded border-stone-300"
          />
          <span class="text-sm text-stone-600">Remember me</span>
        </label>

        <RouterLink
          to="#"
          class="text-terracotta hover:text-terracotta-dark text-sm font-medium transition-colors"
        >
          Forgot password?
        </RouterLink>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="bg-terracotta shadow-terracotta/25 hover:bg-terracotta-dark flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
      >
        <i v-if="isLoading" class="pi pi-spinner pi-spin" aria-hidden="true" />
        <span>{{ isLoading ? "Signing in..." : "Sign In" }}</span>
      </button>
    </Form>

    <p class="mt-8 text-center text-sm text-stone-500">
      Don't have an account?
      <RouterLink
        to="/register"
        class="text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
      >
        Sign up
      </RouterLink>
    </p>
  </AuthPageShell>
</template>
