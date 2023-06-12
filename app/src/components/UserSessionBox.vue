<template>
  <QCard
    v-if="userStore.userData"
    id="user-info-box"
  >
    <QCardSection class="q-py-xs row items-center no-wrap q-gutter-sm">
      <div>
        Inloggad som:
      </div>
      <QBadge
        :label="userStore.userData.username"
        outline
        color="primary"
      />
      <QBtn
        flat
        icon="logout"
        round
        @click="logOut"
      >
        <QTooltip class="bg-primary text-white">
          Logga ut
        </QTooltip>
      </QBtn>
    </QCardSection>
  </QCard>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

function logOut () {
  exitFullscreen();
  router.replace('/logout');
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

<style scoped lang="scss">
#user-info-box {
  border-radius: 0;
  border-bottom-left-radius: 1rem;
  z-index: 500;
  position: fixed;
  top: 0;
  right: 0;
}
</style>
