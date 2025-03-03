<template>
  <div class="q-ml-md q-mt-md row no-wrap items-center">
    <QBtn
      :to="{name: 'controlStart'}"
      icon="arrow_back"
      round
      color="primary"
    />
    <div class="text-h3 q-ml-md">
      Kamerastation
    </div>
  </div>
  <div
    class="row q-ma-md"
  >
    <ClientList
      v-if="soupStore.roomState && soupStore.roomState.clients && soupStore.clientId"
      @client-removed="kickClient"
      class="col-4 q-mr-md"
      :clients="soupStore.roomState?.clients"
      :client-id="soupStore.clientId"
    />
    <QCard class="col">
      <QCardSection
        v-if="!editingRoomName"
        class="row items-center q-gutter-sm"
      >
        <div class="text-h5">
          Rumsnamn: {{ soupStore.roomState?.roomName }}
        </div>
        <QBtn
          round
          color="primary"
          icon="edit"
          @click="editingRoomName = true"
        >
          <QTooltip>Ändra rummets namn</QTooltip>
        </QBtn>
      </QCardSection>
      <QCardSection
        v-else
        tag="form"
        class="row q-gutter-sm"
        @submit.prevent="saveRoomName"
      >
        <QInput
          v-model="inputRoomName"
          outlined
          dense
        />
        <QBtn
          icon="save"
          round
          color="primary"
          type="submit"
        />
        <QBtn
          round
          icon="cancel"
          color="negative"
          @click="editingRoomName = false"
        />
      </QCardSection>
      <QCardSection class="q-gutter-lg">
        <QToggle
          v-model="roomIsOpen"
          :label="roomIsOpen?'rummet är öppet':'rummet är stängd'"
          unchecked-icon="lock"
          checked-icon="door_front"
          :color="roomIsOpen?'positive':'negative'"
          keep-color
          @click="toggleOpenRoom"
        />
        <DevicePicker
          label="Välj din 360-kamera från nedanstående lista av anslutna video-enheter"
          tooltip="Använder du en Ricoh Theta? Titta då efter en enhet med det namnet i listan"
          style="min-width: 15rem;"
          media-type="videoinput"
          @deviceselected="onVideoPicked"
        />
        <DevicePicker
          label="Välj din ljudkälla"
          tooltip="Om du inte väljer en ljudkälla kommer mottagarna inte höra dig"
          style="min-width: 15rem;"
          media-type="audioinput"
          @deviceselected="onAudioPicked"
        />
        <div
          class="relative-position"
          style="width: fit-content;"
        >
          <video
            ref="videoTag"
            autoplay
            style="max-width: 100%; background-color: darkcyan;"
          />
        </div>
      </QCardSection>
    </QCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, onBeforeUnmount } from 'vue';
import { useSoupStore } from 'src/stores/soupStore';
import DevicePicker from 'src/components/DevicePicker.vue';
import usePeerClient from 'src/composables/usePeerClient';
import { useUserStore } from 'src/stores/userStore';
import { usePersistedStore } from 'src/stores/persistedStore';
import { useQuasar } from 'quasar';
import { asyncDialog } from 'src/modules/utilFns';
import { getAllGatherings } from 'src/modules/authClient';
import ClientList from 'src/components/ClientList.vue';
import { extractMessageFromCatch } from 'shared-modules/utilFns';
import { createResponse } from 'shared-types/MessageTypes';

const $q = useQuasar();
const peer = usePeerClient();
const soupStore = useSoupStore();

const videoTag = ref<HTMLVideoElement>();

const pickedVideoDevice = ref<MediaDeviceInfo>();
interface VideoInfo {
  width?: number, height?:number, frameRate?:number, aspectRatio?:number,
}
const videoInfo = ref<VideoInfo>();
// const outputCameraStream = ref<MediaStream>();
// const gatheringName = ref<string>('testEvent');

const userStore = useUserStore();
const persistedStore = usePersistedStore();

const roomIsOpen = ref<boolean>(false);

function toggleOpenRoom () {
  if (!soupStore.roomId) {
    throw Error('no good');
  }
  peer.setCustomRoomProperties(soupStore.roomId, { doorIsOpen: roomIsOpen.value });
}

function kickClient (clientId: string) {
  if (!soupStore.roomId) {
    throw Error('tried to kick client when not in a room');
  }
  peer.removeClientFromRoom(clientId, soupStore.roomId);
}

peer.on('forwardedRequestToJoinRoom', async (msgId, data) => {
  try {
    let username = soupStore.gatheringState?.clients[data.clientId].username;
    if (!username) {
      console.warn('no username found!');
      username = data.clientId;
    }
    const dialogOptions = {
      cancel: true,
      message: `Vill du släppa in ${username}?`,
      title: 'Knock on wood!',
    };
    const _dialogResult = await asyncDialog(dialogOptions, 29000);

    const response = createResponse('forwardedRequestToJoinRoom', msgId, {
      wasSuccess: true,
    });
    await peer.sendResponse(response);
  } catch (e) {
    console.error('not letting in!!!');
    const failResponse = createResponse('forwardedRequestToJoinRoom', msgId, {
      wasSuccess: false,
      message: 'we wont allow your kind around here!!',
    });
    await peer.sendResponse(failResponse);
  }
});

const editingRoomName = ref(false);
const inputRoomName = ref(soupStore.roomState?.roomName);

async function saveRoomName () {
  if (!soupStore.roomId) {
    console.warn('roomId empty! cant save room name');
    return;
  }
  if (inputRoomName.value === undefined) {
    console.warn('roomname was undefined. cant save it');
    return;
  }
  await peer.setRoomName(soupStore.roomId, inputRoomName.value);
  persistedStore.roomName = inputRoomName.value;
  editingRoomName.value = false;
}

onBeforeUnmount(() => {
  peer.leaveRoom();
  peer.closeAndNotifyAllConsumers();
  peer.closeAndNotifyAllProducers();
});

onUnmounted(() => {
  $q.loading.hide();
});

// INITIALIZE;
(async () => {
  try {
    $q.loading.show();
    if (!userStore.userData || !userStore.jwt) {
      throw new Error('no userstate! needed to run camerapage');
    }
    let { gathering } = userStore.userData;
    if (!gathering) {
      if (!persistedStore.gatheringName) {
        console.log('no gathering defined. Must pick one!');
        const gatherings = await getAllGatherings();
        if (!gatherings) {
          throw new Error('no gatherings found/fetched!');
        }
        $q.loading.hide();
        const pickedGatheringName = await pickGathering(gatherings.map(gathering => gathering.name));
        $q.loading.show();
        const pickedGathering = gatherings.find(gathering => gathering.name === pickedGatheringName);
        if (!pickedGathering) throw new Error('pickedGatheringName not found in gathering array. THis should not happen. Bug');
        persistedStore.gatheringName = pickedGatheringName;
      }
      gathering = persistedStore.gatheringName;
    }

    await peer.connect(userStore.jwt);
    if (!persistedStore.roomName) {
      console.log('no room in storage. Must choose roomName manually!');
      $q.loading.hide();
      persistedStore.roomName = await chooseRoomName();
      $q.loading.show();
    }
    await enterGatheringAndRoom(gathering, persistedStore.roomName);
    $q.loading.hide();

    // This is a dirty and filthy hack to force audio and video permissions.
    // In the future we'll be able to use the much nicer permissions API, but thats not rolled out to browsers yet
    const _throwAwayStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (e) {
    // TODO: find a nice way to ignore rejected dialog if navigating away from page.
    const msg = extractMessageFromCatch(e, 'failed to initialize camerapage!');
    $q.notify({
      type: 'negative',
      message: msg,
    });
    // $q.notify('will return to previous page');
    // await Timeout.set(1500);
    // router.back();
  }
})();

async function pickGathering (gatherings: string[]): Promise<string> {
  const radioOptions = gatherings.map(gatheringName => {
    return { label: gatheringName, value: gatheringName };
  });
  const dialogPromise = asyncDialog({
    title: 'Skola',
    message: 'Vilken skola vill du ansluta till?',
    noRouteDismiss: false,
    noBackdropDismiss: true,
    noEscDismiss: true,
    options: {
      model: gatherings[0],
      items: radioOptions,
    },
  });
  return dialogPromise as Promise<string>;
}

async function chooseRoomName (): Promise<string> {
  // console.log(gatheringResponse);
  const dialogPromise = asyncDialog({
    title: 'Rumsnamn',
    message: 'Välj ett namn för rummet:',
    // persistent: true,
    noBackdropDismiss: true,
    noEscDismiss: true,
    noRouteDismiss: false,
    prompt: {
      outlined: true,
      model: '',
      isValid: val => !!val,
    },
  });
  return dialogPromise as Promise<string>;
}

let videoStream: MediaStream;
async function onVideoPicked (deviceInfo: MediaDeviceInfo) {
  pickedVideoDevice.value = deviceInfo;
  persistedStore.deviceId = deviceInfo.deviceId;
  if (!videoTag.value) {
    console.log('template ref not available');
    return;
  }
  // videoStream = await peer.requestMedia(deviceInfo.deviceId);
  videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: deviceInfo.deviceId,
      // width: { min: 3000 },
      // height: { min: 1900 },
      frameRate: 20,
    },
  });
  const videoSettings = videoStream.getVideoTracks()[0].getSettings();
  if (!videoSettings) throw new Error('couldnt get settings from videotrack!!!');
  const { width, height, frameRate, aspectRatio } = videoSettings;
  videoInfo.value = { width, height, frameRate, aspectRatio };

  videoTag.value.srcObject = videoStream;

  handleVideoStreamChanged();
}

const audioTrack = ref<MediaStreamTrack>();
let audioStream: MediaStream;
async function onAudioPicked (deviceInfo: MediaDeviceInfo) {
  console.log('audio picked: ', deviceInfo);
  audioStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: deviceInfo.deviceId,
    },
  });
  const audioTracks = audioStream.getAudioTracks();
  console.log('got usermedia audiotracks:', audioTracks);
  audioTrack.value = audioTracks[0];
}

let audioProducerId: string;
watch(audioTrack, async (newAudioTrack, prevAudioTrack) => {
  console.log('audioTrack watch triggered:', newAudioTrack, prevAudioTrack);
  // Was first track?
  if (!prevAudioTrack && newAudioTrack) {
    audioProducerId = await peer.produce(newAudioTrack);
    if (!soupStore.clientState?.roomId || !soupStore.clientId) {
      throw new Error('no roomid. cant assign producer to room');
    }
    peer.assignMainProducerToRoom(soupStore.clientId, audioProducerId, soupStore.clientState.roomId, 'audio');
  } else if (prevAudioTrack && newAudioTrack) {
    prevAudioTrack.stop();
    if (!audioProducerId) {
      throw new Error('no previous audio producer when expected one');
    }
    peer.replaceProducerTrack(audioProducerId, newAudioTrack);
  }
});

let videoProducerId: string;
let originalVideoTrack: MediaStreamTrack;
async function handleVideoStreamChanged () {
  // Ok. The videoStream was changed. we must update the producer and/or the canvas accordingly

  // We already have a producer created.
  if (videoProducerId) {
    originalVideoTrack.stop();
    originalVideoTrack = videoStream.getVideoTracks()[0];
    peer.replaceProducerTrack(videoProducerId, originalVideoTrack.clone());
  } else {
    originalVideoTrack = videoStream.getVideoTracks()[0];
    const clonedTrack = originalVideoTrack.clone();

    videoProducerId = await peer.produce(clonedTrack);
    console.log('produce returned: ', videoProducerId);
    if (!soupStore.clientState?.roomId || !soupStore.clientId) {
      throw new Error('no roomid. cant assign producer to room');
    }
    peer.assignMainProducerToRoom(soupStore.clientId, videoProducerId, soupStore.clientState.roomId, 'video');
    // startProducing();
  }
}

async function enterGatheringAndRoom (gatheringName: string, roomName: string) {
  // if (!userStore.userData) throw new Error('no userstate! needed to run camerapage');
  // if (!gatheringName) {
  //   throw new Error('no gathering assigned for user! Cant connect...');
  // }
  soupStore.setGatheringState(await peer.joinOrCreateGathering(gatheringName));
  await peer.getRouterCapabilities();
  await peer.loadMediasoupDevice();
  await peer.createSendTransport();

  const roomState = await peer.joinOrCreateRoom(roomName);
  soupStore.setRoomState(roomState);
}
</script>

<style lang="scss">
.main-card {
  min-width: 30rem
}

#video-info {
  position: absolute;
  padding: 1rem;
  left: 0;
  bottom: 0;
  z-index: 80;
  background-color: rgba(231, 188, 255, 0.2);
}
</style>
