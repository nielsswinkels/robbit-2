<template>
  <div
    id="login-page-container"
    class="column justify-center items-center no-wrap"
  >
    <div
      id="main-title"
      class="column no-wrap items-end"
    >
      <h1>Robbit</h1>
      <h2>Logga in</h2>
    </div>
    <LoginBox
      @submit="loginUser"
    />
  </div>
</template>

<script setup lang="ts">
import LoginBox from 'src/components/LoginBox.vue';
import { getMe, login, getJwt, scheduleReFetchJwt } from 'src/modules/authClient';
import { useUserStore } from 'src/stores/userStore';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
const $q = useQuasar();
const userStore = useUserStore();

const router = useRouter();
type Creds = Parameters<InstanceType<typeof LoginBox>['$emit']>[1]
async function loginUser (creds: Creds) {
  try {
    await login(creds.username, creds.password);
    const me = await getMe();
    console.log('me:', me);
    userStore.jwt = await getJwt();
    scheduleReFetchJwt(userStore);
    let redirect: RouteLocationRaw = { name: 'index' };
    switch (me.role) {
      case 'client':
        redirect = { name: 'lobby' };
        break;
      case 'host':
      case 'admin':
        redirect = { name: 'controlStart' };
        break;
    }
    router.replace(redirect);
  } catch (e: any) {
    // console.log('login failed:', e);
    $q.notify({ message: e.data, color: 'negative' });
  }
}
</script>
<style lang="scss" scoped>
#login-page-container {
  height: 100vh;
  width: 100vw;
}

#main-title {
  margin-bottom: 4rem;
  h1 {
    font-size: 3.5rem;
    letter-spacing: 1rem;
    text-align: end;
    // direction: rtl;
    span {
      letter-spacing: 0;
    }
  }

  h2 {
    color: $secondary;
    font-family: 'Dosis', sans-serif;
    margin-top: -0.6em;
    text-transform: lowercase;
    text-align: end;
    // font-style: italic;
    // display: inline;
    white-space: nowrap;
    font-weight: 200;
  }
}

</style>
