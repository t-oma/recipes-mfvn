<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { RegisterInput } from "@recipes/shared";
import { registerInputSchema } from "@recipes/shared";
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
const initialValues = reactive<RegisterInput>({
  email: "",
  password: "",
  name: "",
});
const resolver = zodResolver(registerInputSchema);

function onSubmit({ valid, values }: FormSubmitEvent) {
  if (!valid) return;

  console.log(values);

  // TODO: integrate register mutation
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "You have successfully registered.",
      life: 3000,
    });
  }, 1200);
}
</script>

<template>
  <AuthPageShell
    title="Create account"
    description="Let's get you started with your new account."
    aside-title="Start your cooking journey"
    aside-text="Join thousands of home cooks discovering new recipes every day."
    image-src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1010&auto=format&fit=crop"
    image-alt="Avocado and Egg Toast"
  >
    <Form :resolver :initial-values class="space-y-5" @submit="onSubmit">
      <FormField v-slot="$field" name="name" class="flex flex-col">
        <label
          for="register-name"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Full Name
        </label>

        <IconField>
          <InputIcon class="pi pi-user text-stone-400" />
          <InputText
            id="register-name"
            type="text"
            autocomplete="name"
            placeholder="Jane Doe"
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

      <FormField v-slot="$field" name="email" class="flex flex-col">
        <label
          for="register-email"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Email
        </label>

        <IconField>
          <InputIcon class="pi pi-envelope text-stone-400" />
          <InputText
            id="register-email"
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
          for="register-password"
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
              id: 'register-password',
              autocomplete: 'new-password',
            }"
          />
        </IconField>

        <Message
          v-if="!$field?.invalid"
          size="small"
          severity="secondary"
          variant="simple"
          class="pt-1"
        >
          Must be at least 6 characters
        </Message>

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

      <Button
        type="submit"
        :label="isLoading ? 'Creating account...' : 'Create Account'"
        :loading="isLoading"
        :disabled="isLoading"
        class="font-semibold"
        fluid
      />
    </Form>

    <p class="mt-8 text-center text-sm text-stone-500">
      Already have an account?
      <RouterLink
        to="/login"
        class="text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
      >
        Sign in
      </RouterLink>
    </p>
  </AuthPageShell>
</template>
