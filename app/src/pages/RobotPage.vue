<template>
  <QLayout view="hHh lpR fFf">
    <QDrawer
      v-model="leftDrawerOpen"
      side="left"
      overlay
      bordered
    >
      <QList bordered>
        <QItem>
          <QItemSection avatar>
            <QIcon
              color="primary"
              name="smart_toy"
            />
          </QItemSection>

          <QItemSection
            v-if="!editingRoomName"
            @click="editingRoomName = true"
          >
            {{ (soupStore.roomState?.roomName? soupStore.roomState?.roomName : 'No name!') }}
          </QItemSection>
          <QItemSection
            v-else
          >
            {{ (soupStore.roomState?.roomName? soupStore.roomState?.roomName : 'No name!') }}
            <QForm
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
            </QForm>
          </QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
          @click="toggleOpenRoom"
        >
          <QItemSection avatar>
            <QIcon
              :name="(roomIsOpen?'door_front':'lock')"
              :color="(roomIsOpen?'primary':'negative')"
            />
          </QItemSection>

          <QItemSection>
            {{ (roomIsOpen?'Robbit är öppet':'Robbit är stängd') }}
            <!-- <QToggle
              v-model="roomIsOpen"
              :label="roomIsOpen?'Robbit är öppet':'Robbit är stängd'"
              unchecked-icon="lock"
              checked-icon="door_front"
              :color="roomIsOpen?'positive':'negative'"
              keep-color
            /> -->
            <!-- @click="toggleOpenRoom" -->
          </QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
          @click="getBluetoothDevice()"
        >
          <QItemSection avatar>
            <QIcon
              :name="(bleConnected?'bluetooth_connected':'bluetooth_disabled')"
              :color="(bleConnected?'primary':'negative')"
            />
          </QItemSection>

          <QItemSection>{{ (bleConnected?'Bluetooth ansluten':'Bluetooth frånkopplad') }}</QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
        >
          <QItemSection avatar>
            <QIcon
              color="primary"
              name="videocam"
            />
          </QItemSection>

          <QItemSection>
            <!-- label="Välj din kamera från nedanstående lista av anslutna video-enheter"
            tooltip="Om du inte väljer en videokälla kommer mottagarna inte se något" -->
            <DevicePicker
              style="min-width: 15rem;"
              media-type="videoinput"
              @deviceselected="onVideoPicked"
            />
            <div
              class="row justify-evenly"
            >
              <QBtn
                icon="video_camera_front"
                @click="getMobileVideo(true)"
              />
              <QBtn
                icon="video_camera_back"
                @click="getMobileVideo(false)"
              />
            </div>
          </QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
        >
          <QItemSection avatar>
            <QIcon
              color="primary"
              name="mic"
            />
          </QItemSection>

          <QItemSection>
            <!-- label="Välj din ljudkälla"
            tooltip="Om du inte väljer en ljudkälla kommer mottagarna inte höra dig" -->
            <DevicePicker
              style="min-width: 15rem;"
              media-type="audioinput"
              @deviceselected="onAudioPicked"
            />
          </QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
          @click="toggleFullscreen"
        >
          <QItemSection avatar>
            <QIcon
              color="primary"
              :name="($q.fullscreen.isActive? 'fullscreen_exit': 'fullscreen')"
            />
          </QItemSection>

          <QItemSection>
            {{ ($q.fullscreen.isActive? 'Avsluta helskärm': 'Helskärm') }}
          </QItemSection>
        </QItem>
        <QItem
          clickable
          v-ripple
          :to="{name: 'controlStart'}"
        >
          <QItemSection avatar>
            <QIcon
              color="primary"
              name="logout"
            />
          </QItemSection>

          <QItemSection>
            Exit
          </QItemSection>
        </QItem>
      </QList>
    </QDrawer>
    <QDrawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      bordered
    >
      <ClientList
        v-if="soupStore.roomState && soupStore.roomState.clients && soupStore.clientId"
        @client-removed="kickClient"
        class="col-4 q-mr-md"
        :clients="soupStore.roomState?.clients"
        :client-id="soupStore.clientId"
      />
    </QDrawer>
    <QPageContainer>
      <QPage
        class="column debug-green"
      >
        <div
          class="absolute-top-right"
          style="width: fit-content; max-width: 25%;"
        >
          <video
            ref="videoTag"
            autoplay
            style="max-width: 100%; background-color: darkcyan; border-bottom-left-radius: 2em;"
          />
        </div>
        <div
          class="col column items-stretch justify-center"
          style="max-height:100vh"
        >
          <div
            v-if="(soupStore.roomState && soupStore.roomState.clients && Object.keys(soupStore.roomState.clients).length === 0)"
            class="col column justify-center items-center q-gutter-md"
          >
            <div
              class="text-h1"
            >
              😴
            </div>
            <div>
              Robbit sover i väntan på att någon ansluter..
            </div>
          </div>
          <ClientCameras
            v-if="soupStore.roomState && soupStore.roomState.clients && soupStore.clientId && Object.keys(soupStore.roomState.clients).length > 0"
            class="col"
            :clients="soupStore.roomState?.clients"
            :client-id="soupStore.clientId"
          />
        </div>
        <QPageSticky
          position="bottom-left"
          :offset="[18, 18]"
        >
          <QBtn
            size="md"
            icon="menu"
            color="secondary"
            @click="toggleLeftDrawer"
          />
        </QPageSticky>
        <QPageSticky
          position="bottom-right"
          :offset="[18, 18]"
        >
          <QBtn
            size="md"
            icon-right="people"
            color="secondary"
            @click="toggleRightDrawer"
            :label="(soupStore.roomState && soupStore.roomState.clients? Object.keys(soupStore.roomState.clients).length :'0')+' '"
          />
        </QPageSticky>
      </QPage>
    </QPageContainer>
  </QLayout>
  <!-- <div
    v-if="false"
    class="q-ml-md q-mt-md row no-wrap items-center"
  >
    <QBtn
      :to="{name: 'controlStart'}"
      icon="arrow_back"
      round
      color="primary"
    />
    <div class="text-h3 q-ml-md">
      Robbit
    </div>
  </div> -->
  <!-- <div
    v-if="false"
    class="row q-ma-md"
  >
    hej
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
          Namn: {{ soupStore.roomState?.roomName }}
        </div>
        <QBtn
          round
          color="primary"
          icon="edit"
          @click="editingRoomName = true"
        >
          <QTooltip>Ändra namn</QTooltip>
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
          :label="roomIsOpen?'Robbit är öppet':'Robbit är stängd'"
          unchecked-icon="lock"
          checked-icon="door_front"
          :color="roomIsOpen?'positive':'negative'"
          keep-color
          @click="toggleOpenRoom"
        />
        <QBtn @click="getMobileVideo(true)">
          Selfie
        </QBtn>
        <QBtn @click="getMobileVideo(false)">
          Baksidan
        </QBtn>
        <QBtn @click="getBluetoothDevice()">
          Bluetooth
        </QBtn>
        <QIcon
          :name="(bleConnected?'bluetooth_connected':'bluetooth_disabled')"
          :color="(bleConnected?'positive':'negative')"
        />
        <DevicePicker
          label="Välj din kamera från nedanstående lista av anslutna video-enheter"
          tooltip="Om du inte väljer en videokälla kommer mottagarna inte se något"
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
  </div> -->
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
import ClientCameras from 'src/components/ClientCameras.vue';
import { extractMessageFromCatch } from 'shared-modules/utilFns';
import { createResponse } from 'shared-types/MessageTypes';
import { Services, getServices, requestMicrobit } from 'microbit-web-bluetooth';
import type { BluetoothDevice } from 'web-bluetooth';

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

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

const roomIsOpen = ref<boolean>(false);

const bleDevice = ref<BluetoothDevice>();
const bleServices = ref<Services>();
const bleConnected = ref<boolean>(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleRightDrawer () {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

function toggleFullscreen () {
  if ($q.fullscreen.isActive) {
    $q.fullscreen.exit()
      .then(() => {
        console.log('Leaving fullscreen');
      })
      .catch(err => {
        console.log('Can\'t leave fullscreen because ' + err);
      });
  } else {
    $q.fullscreen.request()
      .then(() => {
        console.log('Going fullscreen');
      })
      .catch(err => {
        console.log('Can\'t go fullscreen because ' + err);
      });
  }
}

function toggleOpenRoom () {
  if (!soupStore.roomId) {
    throw Error('no good');
  }
  roomIsOpen.value = !roomIsOpen.value;
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
    console.warn('roomId empty! Cant save room name');
    return;
  }
  if (inputRoomName.value?.trim() === undefined) {
    console.warn('Roomname was undefined. Cant save it');
    return;
  }
  if (inputRoomName.value?.trim() === '') {
    console.warn('Roomname was empty. Cant save it');
    return;
  }
  await peer.setRoomName(soupStore.roomId, inputRoomName.value);
  persistedStore.roomName = inputRoomName.value;
  editingRoomName.value = false;
}

onBeforeUnmount(async () => {
  await stopVideoTracks();
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
    // const _throwAwayStream = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });
    getMobileVideo(true);
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

async function stopVideoTracks () {
  if (originalVideoTrack) {
    console.log('stopping original video track');
    await originalVideoTrack.stop();
  }
  if (clonedVideoTrack) {
    console.log('stopping cloned video track');
    await clonedVideoTrack.stop();
  }
  if (videoStream) {
    await videoStream.getTracks().forEach(function (track) {
      console.log('stopping track');
      track.stop();
      videoStream.removeTrack(track);
    });
  }
}

async function getMobileVideo (frontfacing: boolean) {
  console.log('Did we find any mobile cameras?');
  await stopVideoTracks();
  if (videoProducerId) {
    // await peer.pauseProducer(videoProducerId);
    // await peer.closeAndNotifyProducer(videoProducerId);
    // videoProducerId = '';
  }
  // const videoStreamFront = await navigator.mediaDevices.getUserMedia({
  //   // video: {
  //   //   // facingMode: { exact: (frontfacing ? 'user' : 'environment') },
  //   //   facingMode: {
  //   //     exact: 'environment',
  //   //   },
  //   // },
  //   video: {
  //     // width: { ideal: 4096 },
  //     // height: { ideal: 2160 },
  //     facingMode: { ideal: 'environment' },
  //   },
  // });
  videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        ideal: (frontfacing ? 'user' : 'environment'),
      },
    },
  });

  const videoSettings = videoStream.getVideoTracks()[0].getSettings();
  if (!videoSettings) throw new Error('couldnt get settings from videotrack!!!');
  const { width, height, frameRate, aspectRatio } = videoSettings;
  videoInfo.value = { width, height, frameRate, aspectRatio };

  if (!videoTag.value) {
    console.log('template ref not available');
    return;
  }
  videoTag.value.srcObject = videoStream;

  handleVideoStreamChanged();
}

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
    title: 'Robbitnamn',
    message: 'Välj ett namn för din Robbit:',
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
  await stopVideoTracks();
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
let clonedVideoTrack: MediaStreamTrack;
async function handleVideoStreamChanged () {
  // Ok. The videoStream was changed. we must update the producer and/or the canvas accordingly

  // We already have a producer created.
  if (videoProducerId) {
    console.log('videoProducerId exists, we will replace producer track');
    originalVideoTrack.stop();
    originalVideoTrack = videoStream.getVideoTracks()[0];
    clonedVideoTrack = originalVideoTrack.clone();
    peer.replaceProducerTrack(videoProducerId, clonedVideoTrack);
  } else {
    console.log('videoProducerId does not exist, we will replace producer track');
    originalVideoTrack = videoStream.getVideoTracks()[0];
    clonedVideoTrack = originalVideoTrack.clone();

    videoProducerId = await peer.produce(clonedVideoTrack);
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

  const roomState = await peer.joinOrCreateRoom(roomName, true);
  soupStore.setRoomState(roomState);
}

async function getBluetoothDevice () {
  bleDevice.value = await requestMicrobit(window.navigator.bluetooth);
  if (!bleDevice.value) {
    console.log('Bluetooth device not found.');
    return;
  }
  console.log(bleDevice.value);
  bleServices.value = await getServices(bleDevice.value);
  if (!bleServices.value) {
    console.log('Bluetooth services not found.');
    return;
  }
  if (!bleServices.value.uartService) {
    console.log('Bluetooth uartService not found.');
    return;
  }
  console.log(bleServices.value);
  console.log(bleServices.value.uartService);
  bleDevice.value.addEventListener('gattserverdisconnected', bleDisconnected);
  bleServices.value.uartService.addEventListener('receiveText', bleEventHandler);
  bleConnected.value = true;
}

async function bleEventHandler (event: Event) {
  console.log('bleEventHandler received:');
  console.log(event);
}

async function bleDisconnected (event: Event) {
  console.log('BLE disconnected:');
  console.log(event);
  bleConnected.value = false;
}

async function sendBluetoothData (data: string) {
  if (!bleConnected.value || !bleServices.value || !bleServices.value.uartService) {
    // console.log('No bluetooth uart service found?');
    return;
  }

  // const result = await bleServices.value.uartService.sendText('300,300,65\n');
  // console.log('Going to send bluetooth data');
  await bleServices.value.uartService.sendText(data);
  // await this.services.uartService.send(new Uint8Array([104, 101, 108, 108, 111, 58])); // hello:
  // console.log(result);
  // await bleServices.value.uartService.sendText('0,0,65\n');
  // this.services.uartService.emit('0, 0, 65')
}

peer.on('robotControl', (payload) => {
  // console.log('Peer received robotcontrol!');
  sendBluetoothData(payload.msg);
});

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
