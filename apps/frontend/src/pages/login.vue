<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { LoginInput } from "@recipes/shared/auth";
import { loginInputSchema } from "@recipes/shared/auth";
import { useToast } from "primevue";
import { reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AuthPageShell, useLoginMutation } from "@/features/auth";

definePage({
  meta: {
    layout: "no-layout",
    guestOnly: true,
  },
});

const toast = useToast();
const router = useRouter();
const route = useRoute();

const initialValues = reactive<LoginInput>({
  email: "",
  password: "",
});
const resolver = zodResolver(loginInputSchema);

const { mutate, isPending } = useLoginMutation();

function onSubmit({ valid, values }: FormSubmitEvent) {
  if (!valid) return;

  mutate(values as LoginInput, {
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "You have successfully logged in.",
        life: 3000,
      });
      const redirect = route.query.redirect;
      router.push(typeof redirect === "string" ? redirect : "/");
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message || "Invalid credentials.",
        life: 3000,
      });
    },
  });
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
        <FormField name="rememberMe" class="flex items-center gap-2">
          <Checkbox input-id="remember-me" binary />
          <label for="remember-me" class="text-sm">Remember me</label>
        </FormField>

        <RouterLink
          to="#"
          class="text-terracotta hover:text-terracotta-dark text-sm font-medium transition-colors"
        >
          Forgot password?
        </RouterLink>
      </div>

      <Button
        type="submit"
        :label="isPending ? 'Signing in...' : 'Sign In'"
        :loading="isPending"
        :disabled="isPending"
        class="font-semibold"
        fluid
      />
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
