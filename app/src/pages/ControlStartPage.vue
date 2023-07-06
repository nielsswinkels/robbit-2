<template>
  <div
    class="column q-my-xl q-gutter-md items-center"
    v-if="!showSpinner"
  >
    <QBtn
      color="primary"
      outline
      label="Robbit"
      @click="startRobbit"
      icon="smart_toy"
      icon-right="navigate_next"
    />
    <QBtn
      color="primary"
      outline
      label="Kamerastation"
      :to="{name:'camera'}"
      icon="linked_camera"
      icon-right="navigate_next"
    />
    <QBtn
      color="primary"
      outline
      label="Rumskontroll"
      :to="{name: 'controlLobby'}"
      icon="room_preferences"
      icon-right="navigate_next"
    />
    <QBtn
      color="primary"
      outline
      :label="manageBtnLabel"
      :to="{ name: 'userManager'}"
      icon="manage_accounts"
      icon-right="navigate_next"
    />
  </div>
  <QSpinner
    v-if="showSpinner"
    size="xl"
    class="fixed-center"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const $q = useQuasar();
const router = useRouter();
const showSpinner = ref(false);

const manageBtnLabel = computed(() => {
  const isAdmin = userStore.userData?.role === 'admin';
  if (isAdmin) { return 'Hantera konton'; }
  return 'Hantera elevkonton';
});

function startRobbit () {
  showSpinner.value = true;
  goFullscreen();
  // :to="{name:'robot'}"
  // router.replace('/robot');
  router.replace({ name: 'robot' });
}

function goFullscreen () {
  if (!$q.fullscreen.isActive) {
    $q.fullscreen.request()
      .then(() => {
        console.log('Going fullscreen');
      })
      .catch(err => {
        console.log('Can\'t go fullscreen because ' + err);
      });
  }
}

</script>
