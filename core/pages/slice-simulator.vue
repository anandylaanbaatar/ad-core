<template>
  <SliceSimulator #default="{ slices }">
    <SliceZone :slices="slices" :components="components" />
  </SliceSimulator>
</template>

<script setup lang="js">
import { SliceSimulator } from "@slicemachine/adapter-nuxt/simulator"
import { components } from "~/slices"
</script>
