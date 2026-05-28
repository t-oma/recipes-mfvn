<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "../model/auth.store";

const { isAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <slot v-if="!isAuthenticated" />
</template>
