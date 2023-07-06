<template>
  <div
    class="column q-my-xl q-gutter-md items-center"
    v-if="!showSpinner"
  >
    <QBtn
      color="primary"
      outline
      rounded
      label="Robbit"
      @click="startRobbit"
      icon="smart_toy"
      icon-right="navigate_next"
    />
    <!-- <QBtn
      color="primary"
      outline
      rounded
      label="Kamerastation"
      :to="{name:'camera'}"
      icon="linked_camera"
      icon-right="navigate_next"
    /> -->
    <QBtn
      color="primary"
      outline
      rounded
      label="Rumskontroll"
      :to="{name: 'controlLobby'}"
      icon="room_preferences"
      icon-right="navigate_next"
    />
    <QBtn
      color="primary"
      outline
      rounded
      :label="manageBtnLabel"
      :to="{ name: 'userManager'}"
      icon="manage_accounts"
      icon-right="navigate_next"
    />
  </div>
  <QBtn
    class="absolute-bottom-left q-ma-sm"
    color="primary"
    outline
    rounded
    @click="toggleFullscreen"
    :icon="($q.fullscreen.isActive? 'fullscreen_exit' : 'fullscreen' )"
  />
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
  return 'Hantera gästkonton';
});

function startRobbit () {
  showSpinner.value = true;
  goFullscreen();
  // :to="{name:'robot'}"
  // router.replace('/robot');
  router.replace({ name: 'robot' });
}

function toggleFullscreen () {
  if (!$q.fullscreen.isActive) {
    goFullscreen();
  } else {
    exitFullscreen();
  }
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
function exitFullscreen () {
  if ($q.fullscreen.isActive) {
    $q.fullscreen.exit()
      .then(() => {
        console.log('Leaving fullscreen');
      })
      .catch(err => {
        console.log('Can\'t leave fullscreen because ' + err);
      });
  }
}

</script>
