<template>
  <v-app>
    <HeaderComponent />
    <v-main>
      <TextComponent/>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue';
import TextComponent from './components/TextComponent.vue';

export default {
  components: {
    HeaderComponent,
    TextComponent
  }
}
</script>
