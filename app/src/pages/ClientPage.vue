<template>
  <QLayout
    view="hHh lpR fFf"
  >
    <QDrawer
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      bordered
    >
      <QList>
        <QItem
          clickable
          v-ripple
          @click="toggleLeftDrawer"
        >
          <QItemSection>
            <QItemLabel header>
              Inställningar
            </QItemLabel>
          </QItemSection>
          <QItemSection
            side
            top
          >
            <QIcon
              name="close"
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
        <QSeparator />
        <QExpansionItem>
          <template #header>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="chat"
              />
            </QItemSection>
            <QItemSection>
              Bild & Ljud
            </QItemSection>
          </template>
          <QItem
            clickable
            v-ripple
            @click="showSelfView =! showSelfView"
          >
            <QItemSection avatar>
              <QToggle
                v-model="showSelfView"
                color="primary"
                :label="(showSelfView? 'Visas för mig' : 'Gömd för mig')"
              />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="lens_blur"
              />
            </QItemSection>
            <QItemSection avatar>
              {{ selfviewOpacity }}%
            </QItemSection>
            <QItemSection>
              <QSlider
                v-model="selfviewOpacity"
                :min="0"
                :max="100"
              />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="open_in_full"
              />
            </QItemSection>
            <QItemSection avatar>
              {{ selfviewSize }}%
            </QItemSection>
            <QItemSection>
              <QSlider
                v-model="selfviewSize"
                :min="5"
                :max="50"
              />
            </QItemSection>
          </QItem>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem>
          <template #header>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="chat"
              />
            </QItemSection>
            <QItemSection>
              Chat
            </QItemSection>
          </template>
          <QItem
            clickable
            v-ripple
            @click="showChat =! showChat"
          >
            <QItemSection avatar>
              <QToggle
                v-model="showChat"
                color="primary"
                :label="(showChat? 'Visas' : 'Gömd')"
              />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="lens_blur"
              />
            </QItemSection>
            <QItemSection avatar>
              {{ chatOpacity }}%
            </QItemSection>
            <QItemSection>
              <QSlider
                v-model="chatOpacity"
                :min="0"
                :max="100"
              />
            </QItemSection>
          </QItem>
        </QExpansionItem>
        <QSeparator />
        <QExpansionItem>
          <template #header>
            <QItemSection avatar>
              <QIcon
                color="primary"
                name="code"
              />
            </QItemSection>
            <QItemSection>
              Debug
            </QItemSection>
          </template>
          <QItem>
            <pre>
              {{ soupStore.roomState }}
            </pre>
          </QItem>
        </QExpansionItem>
      </QList>
    </QDrawer>
    <QDrawer
      v-model="rightDrawerOpen"
      side="right"
      behavior="desktop"
      bordered
    >
      <QList>
        <QItem
          clickable
          v-ripple
          @click="toggleRightDrawer"
        >
          <QItemSection>
            <QItemLabel header>
              Deltagare
            </QItemLabel>
          </QItemSection>
          <QItemSection
            side
            top
          >
            <QIcon
              name="close"
            />
          </QItemSection>
        </QItem>
        <QItemLabel header>
          Robbit:
          <span class="text-primary">
            {{ soupStore.roomState?.roomName }}
          </span>
        </QItemLabel>
        <QItem
          v-for="client in soupStore.roomState?.clients"
          :key="client.clientId"
        >
          {{ client.customProperties.emojiFace }}
          {{ client.username }}
          {{ client.customProperties.chatMsg }}
          <template v-if="client.clientId === soupStore.clientState?.clientId">
            (du)
          </template>
        </QItem>
      </QList>
    </QDrawer>
    <QPageContainer>
      <QPage>
        <div
          class="absolute-top-right"
          :style="'width: fit-content; max-width: 25%; opacity: ' + chatOpacity + '%;'"
          v-if="showChat"
        >
          <template
            v-for="client in soupStore.roomState?.clients"
            :key="client.clientId"
          >
            <div
              v-if="client.customProperties?.chatMsg"
              class="chat-balloon q-pa-md q-ma-sm column no-wrap justify-end items-end"
            >
              <div class="text-bold">
                {{ client.username }}:
              </div>
              <div>
                {{ client.customProperties?.chatMsg }}
              </div>
            </div>
          </template>
        </div>
        <div
          id="video-container"
          class="col"
        >
          <video
            v-show="true"
            id="main-video"
            autoplay
            ref="videoTag"
            class=""
          />
          <video
            v-show="screenshareActive"
            id="screen-video"
            :class="{'fill-screen': screenshareWindowMode === 'big' }"
            autoplay
            ref="screenTag"
          />
        </div>
        <div
          class="absolute-top-left"
          :style="'width: fit-content; max-width: ' + selfviewSize + '%; opacity: ' + selfviewOpacity + '%;'"
          v-show="videoEnabled && showSelfView"
        >
          <video
            ref="selfVideoTag"
            id="self-video-tag"
            autoplay
          />
        </div>
      </QPage>
    </QPageContainer>
    <QFooter
      bordered
      class="bg-grey-8 text-white row justify-end items-center q-col-gutter-md q-px-sm q-pb-sm wrap"
    >
      <div class="col-shrink column justify-between items-center">
        <QBtn
          round
          icon="call_end"
          color="negative"
          @click="router.replace({name: 'lobby'})"
        >
          <QTooltip>Avsluta</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Avsluta
        </div>
      </div>
      <div class="col-shrink column justify-between items-center">
        <QBtn
          round
          icon="settings"
          :outline="!leftDrawerOpen"
          :color="(leftDrawerOpen?'primary':'')"
          @click="toggleLeftDrawer"
        >
          <QTooltip>Ändra inställningar</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Inställningar
        </div>
      </div>
      <div class="col-shrink column justify-between items-center wrap">
        <QBtn
          size="md"
          class="row no-wrap"
          icon-right="people"
          rounded
          :outline="!rightDrawerOpen"
          :color="(rightDrawerOpen?'primary':'')"
          @click="toggleRightDrawer"
          :label="(soupStore.roomState && soupStore.roomState.clients? Object.keys(soupStore.roomState.clients).length :'0')+' '"
        >
          <QTooltip>Se alla som är inne i denna Robbit</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Deltagare
        </div>
      </div>
      <div class="col-grow" />
      <QForm
        @submit="sendChat"
        class="col-xs-12 col-sm-12 col-md-grow col-lg-grow chat-input-form"
      >
        <QInput
          v-model="chatInput"
          outlined
          ref="chatInputField"
          @focus="chatHasFocus = true"
          @blur="chatHasFocus = false"
        >
          <template #append>
            <QBtn
              icon="send"
              color="primary"
              flat
              dense
              round
              @click="sendChat"
            />
          </template>
        </QInput>
      </QForm>
      <div class="col-shrink column justify-between items-center">
        <QBtn
          :disable="currentMuteState === 'forceMuted'"
          :icon="muteStateIcons[currentMuteState]"
          :color="(currentMuteState==='unmuted'?'primary':'')"
          :outline="currentMuteState!=='unmuted'"
          round
          @click="toggleMute"
        >
          <QTooltip>Stäng av eller sätt på mikrofonen</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Mikrofon
        </div>
      </div>
      <div class="col-shrink column items-center">
        <!-- :color="(videoEnabled?'primary':'#a58440')" -->
        <QBtn
          :icon="(videoEnabled?'videocam':'videocam_off')"
          :color="(videoEnabled?'primary':'')"
          :outline="!videoEnabled"
          round
          @click="toggleVideo"
        >
          <QTooltip>Stäng av eller sätt på video</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Kamera
        </div>
      </div>
      <div class="col-shrink column items-center">
        <QFab
          v-model="showEmojiPicker"
          :color="(!videoEnabled?'primary':'')"
          :outline="videoEnabled"
          round
          :icon="currentEmojiFace"
          :active-icon="currentEmojiFace"
          padding="9px"
          direction="up"
          class="fab-custom-icon fab-no-animation"
        >
          <template #tooltip>
            <QTooltip>Välj emoji att visa som ansikte</QTooltip>
          </template>
          <QFabAction
            v-for="(item, index) in emojiFaces"
            :key="index"
            color="primary"
            :icon="emojiFaces[index]"
            @click="chooseEmojiFace(emojiFaces[index])"
            :label="(index+1)%10"
            external-label
            label-position="left"
          />
        </QFab>
        <div class="col text-caption">
          Ansikte
        </div>
      </div>
      <div class="col-shrink column items-center">
        <QBtn
          id="raise-hand-button"
          icon="waving_hand"
          :class="{waving: handRaised}"
          :color="(handRaised? 'primary': '')"
          :outline="!handRaised"
          round
          @click="toggleRaiseHand"
        >
          <!-- <QIcon
            name="waving_hand"
            size="sm"
          /> -->
          <QTooltip>Räck upp handen</QTooltip>
        </QBtn>
        <div class="col text-caption">
          Vinka
        </div>
      </div>
      <!-- <div class="col-shrink row justify-evenly q-gutter-md no-wrap">
      </div> -->
      <div class="col-shrink row no-wrap">
        <div class="col-2 column justify-center items-center">
          <QSlider
            class="col-grow q-py-sm"
            :min="1"
            :max="3"
            v-model="speedMode"
            @change="changeSpeed"
            vertical
            reverse
            snap
            markers
          />
          <QIcon
            class="col-1 q-py-sm"
            name="speed"
            size="sm"
          />
        </div>
        <div class="col-2 column justify-center items-center">
          <QSlider
            class="col-grow q-py-sm"
            :min="SERVO_MIN_VALUE"
            :max="SERVO_MAX_VALUE"
            v-model="servoAngle"
            vertical
            inner-track-color="primary"
            thumb-color="primary"
            color="grey"
          />
          <QIcon
            class="col-1 q-py-sm"
            name="visibility"
            size="sm"
          />
        </div>
        <div class="col-8 column no-wrap">
          <div class="col row justify-center items-center">
            <div class="col" />
            <div class="col flex flex-center">
              <QBtn
                id="forward-button"
                icon="arrow_drop_up"
                size="md"
                class="q-mx-sm"
                rounded
                outline
                @mousedown="forwardActive = true"
                @mouseup="forwardActive = false"
                @touchstart="forwardActive = true"
                @touchend="forwardActive = false"
              />
            </div>
            <div class="col" />
          </div>
          <div class="col row justify-center items-center">
            <div class="col flex flex-center">
              <QBtn
                id="left-button"
                icon="arrow_left"
                size="md"
                class="q-mx-sm"
                rounded
                outline
                @mousedown="robotRotation = -1"
                @mouseup="robotRotation = 0"
                @touchstart="robotRotation = -1"
                @touchend="robotRotation = 0"
              />
            </div>
            <div class="col flex flex-center">
              <QBtn
                id="backward-button"
                icon="arrow_drop_down"
                size="md"
                class="q-mx-sm"
                rounded
                outline
                @mousedown="reverseActive = true"
                @mouseup="reverseActive = false"
                @touchstart="reverseActive = true"
                @touchend="reverseActive = false"
              />
            </div>
            <div class="col flex flex-center">
              <QBtn
                id="right-button"
                icon="arrow_right"
                size="md"
                class="q-mx-sm"
                rounded
                outline
                @mousedown="robotRotation = 1"
                @mouseup="robotRotation = 0"
                @touchstart="robotRotation = 1"
                @touchend="robotRotation = 0"
              />
            </div>
          </div>
        </div>
      </div>
    </QFooter>
  </QLayout>
</template>
<script
    setup
    lang="ts"
  >
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from 'vue';
import { useSoupStore } from 'src/stores/soupStore';
import usePeerClient from 'src/composables/usePeerClient';
import { useRouter } from 'vue-router';
// import { THREE, Entity } from 'aframe';
import { RoomState } from 'shared-types/CustomTypes';
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/userStore';
import { createMessage } from 'shared-types/MessageTypes';
import Timeout from 'await-timeout';

const $q = useQuasar();

const router = useRouter();
const peer = usePeerClient();
const soupStore = useSoupStore();
const userStore = useUserStore();

watch(() => soupStore.roomState?.mainProducers, (newMainProducers, oldMainProducers) => {
  if (!newMainProducers) return;
  if (newMainProducers.video && oldMainProducers?.video !== newMainProducers.video) {
    consumeVideo(newMainProducers.video);
  }
  if (newMainProducers.audio && oldMainProducers?.audio !== newMainProducers.audio) {
    consumeAudio(newMainProducers.audio);
  }
}, {
  immediate: true,
});

watch(() => soupStore.roomId, (newRoomId) => {
  if (!newRoomId) {
    router.replace({ name: 'lobby' });
  }
});

peer.on('notifyCloseEvent', (payload) => {
  if (payload.objectType === 'consumer' && payload.objectId === screenShareConsumerId.value) {
    screenShareConsumerId.value = undefined;
  }
});

peer.on('roomStateUpdated', data => {
  console.log('clientpage roomStateUpdated event triggered!! REASON: ', data.reason);
  console.log(data);
  let clientWithScreenShare = false;
  for (const [_clientId, client] of Object.entries(data.newState.clients)) {
    for (const [_producerId, producer] of Object.entries(client.producers)) {
      if (producer.producerInfo) {
        if (producer.producerInfo.screenShare && !producer.producerInfo.paused) {
          clientWithScreenShare = true;
        }
      }
    }
  }
  screenshareActive.value = clientWithScreenShare;
});

const videoEnabled = ref<boolean>(false);

async function toggleVideo () {
  videoEnabled.value = !videoEnabled.value;
  if (videoEnabled.value) {
    if (!videoProducerId) {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      videoProducerId = await peer.produce(videoStream.getVideoTracks()[0]);
      if (selfVideoTag.value) {
        selfVideoTag.value.srcObject = videoStream;
      } else {
        console.log('template ref not available for selfVideoTag');
      }
    } else {
      peer.resumeProducer(videoProducerId);
    }
  } else {
    peer.pauseProducer(videoProducerId);
  }
}

const muteStateIcons = {
  unmuted: 'mic',
  muted: 'mic_off',
  forceMuted: 'do_not_disturb',
};

const currentMuteState = computed(() => {
  if (!soupStore.clientState) return 'muted';
  if (soupStore.clientState.customProperties.forceMuted) {
    return 'forceMuted';
  }
  // if (!peer.producers.size || Array.from(peer.producers.values())[0].paused) {
  const producerArr = Object.values(soupStore.clientState.producers);
  let activeAudioFound = false;
  producerArr.forEach(producer => {
    if (producer.kind === 'audio' && !producer.producerInfo?.paused) {
      activeAudioFound = true;
    }
  });
  if (!activeAudioFound) {
    return 'muted';
  }
  return 'unmuted';
});
let audioProducerId: string;
let videoProducerId: string;
async function toggleMute () {
  switch (currentMuteState.value) {
    case 'forceMuted': {
      return;
    }
    case 'muted': {
      if (!audioProducerId) {
        const microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        console.log('Unmuting with new audio stream');
        audioProducerId = await peer.produce(microphoneStream.getAudioTracks()[0]);
      } else {
        console.log('Unmuting by resuming audio stream');
        peer.resumeProducer(audioProducerId);
      }
      break;
    }
    case 'unmuted': {
      console.log('Muting by pausing audio stream');
      // peer.closeAndNotifyProducer(audioProducerId);
      peer.pauseProducer(audioProducerId);
    }
  }
}

// const showVRVideoFrame = computed(() => {
//   // return shareInVR.value && screenShareConsumerId.value !== undefined;
//   return screenshareWindowMode.value === 'vr' && screenShareConsumerId.value !== undefined;
// });

// TODO: This will not protect from clients "stealing" the broadcasting of the screenshare
// We should change our produce code to assign the screenshare as a "mainproducer" instead. This will give better protection against script kiddies :-D
let consumedScreenProducerId: string;
const screenShareConsumerId = ref<string>();
const screenShareHeight = ref<number>(1);
const screenshareActive = ref<boolean>(false);

watch(() => soupStore.roomState?.clients, async (newClients, _oldCLients) => {
  if (!newClients) return;
  for (const [_clientId, client] of Object.entries(newClients)) {
    for (const [_producerId, producer] of Object.entries(client.producers)) {
      if (producer.producerInfo) {
        if (producer.producerInfo.screenShare) {
          if (producer.producerId !== consumedScreenProducerId) {
            consumedScreenProducerId = producer.producerId;
            if (producer.producerInfo?.dimensions) {
              const { w, h } = producer.producerInfo.dimensions;
              const ratio = w / h;
              const fixedWidth = 1.7777;
              screenShareHeight.value = fixedWidth / ratio;
            }
            console.log('screen share starts!!');
            screenshareActive.value = true;
            if (!screenTag.value) return;
            const { track, consumerId } = await peer.consume(producer.producerId);
            const trackSettings = track.getSettings();
            console.log('screenshare track settings:', trackSettings);
            // const aspect = trackSettings.aspectRatio;
            screenShareConsumerId.value = consumerId;
            const videoShareElement = screenTag.value;
            videoShareElement.srcObject = new MediaStream([track]);
            // videoShareElement.onloadeddata((ev) => {
            //   console.log(screenTag.value);
            //   const aspect = screenTag.value.videoWidth / screenTag.value.videoHeight;
            //   console.log('calculated aspect from videoTag dimensions:', aspect);
            //   if (aspect) {
            //     console.log('setting width for a-video to:', aspect);
            //     const vVideo = document.querySelector('a-video');
            //     vVideo.setAttribute('width', aspect);
            //   }
            // });
            await nextTick();
            // initVideoSphere();
          }
        }
      }
    }
  }
}, { immediate: true, deep: true });

const leftDrawerOpen = ref<boolean>(false);
const rightDrawerOpen = ref<boolean>(false);

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

const videoTag = ref<HTMLVideoElement>();
const screenTag = ref<HTMLVideoElement>();
const selfVideoTag = ref<HTMLVideoElement>();
const selfviewOpacity = ref<number>(50);
const selfviewSize = ref<number>(25);
const showSelfView = ref<boolean>(true);

const handRaised = ref<boolean>(false);
async function toggleRaiseHand () {
  handRaised.value = !handRaised.value;
  await peer.setCustomClientProperties({
    handRaised: handRaised.value,
  });
}

const chatInput = ref('');
const clearChatTimeout = ref<number>();
const clearChatTimeoutDuration = 10000;
const chatHasFocus = ref<boolean>(false);
const chatInputField = ref<HTMLInputElement>();
const chatOpacity = ref<number>(50);
const showChat = ref<boolean>(true);

const currentEmojiFace = ref('🙂');
const emojiFaces = ['🙂', '😁', '😎', '😍', '😂', '😮', '🙁', '😭', '😡', '😴'];
const showEmojiPicker = ref(false);

function chooseEmojiFace (chosenEmoji: string) {
  console.log('Chosen emoji: ' + chosenEmoji);
  currentEmojiFace.value = chosenEmoji;
  peer.setCustomClientProperties({
    emojiFace: currentEmojiFace.value,
  });
}

function sendChat () {
  peer.setCustomClientProperties({
    chatMsg: chatInput.value,
  });
  chatInput.value = '';
  clearChatTimeout.value = window.setTimeout(() => {
    peer.setCustomClientProperties({
      chatMsg: '',
    });
  }, clearChatTimeoutDuration);
}

let forwardActive: boolean;
let reverseActive: boolean;
let robotThrottle = 0;
const speedMode = ref(1);
let robotRotation = 0;
const servoAngleChange = ref(0);
// let isParked = false;
// let isWaving = false;
const SERVO_START_VALUE = 65;
const SERVO_MAX_VALUE = 100;
const SERVO_MIN_VALUE = 20;
const ROBOT_MOTOR_MAX_THROTTLE = 1000;
let DRIVE_MOTOR_SCALE = 0.3;
let TURN_MOTOR_SCALE = 0.23;
const SERVO_SCALE = 5;
const servoAngle = ref(SERVO_START_VALUE);

async function driveRobot () {
  if (!soupStore.roomId) {
    console.log('We have no room id? Can not talk to robot then.');
    return;
  }
  if (forwardActive) {
    robotThrottle =
      ROBOT_MOTOR_MAX_THROTTLE * DRIVE_MOTOR_SCALE;
  } else if (reverseActive) {
    robotThrottle =
      -ROBOT_MOTOR_MAX_THROTTLE * DRIVE_MOTOR_SCALE;
  } else {
    robotThrottle = 0;
  }

  const rotationMotorAdjustment =
    robotRotation *
    ROBOT_MOTOR_MAX_THROTTLE *
    TURN_MOTOR_SCALE; // -20 to +20

  let leftMotor = robotThrottle + rotationMotorAdjustment;
  let rightMotor = robotThrottle - rotationMotorAdjustment;

  // Section for constraining motor values within max allowed throttle
  let ratio = 1;
  if (
    Math.abs(leftMotor) > ROBOT_MOTOR_MAX_THROTTLE ||
    Math.abs(rightMotor) > ROBOT_MOTOR_MAX_THROTTLE
  ) {
    ratio =
      ROBOT_MOTOR_MAX_THROTTLE /
      Math.max(Math.abs(leftMotor), Math.abs(rightMotor));
  }
  leftMotor *= ratio;
  rightMotor *= ratio;

  const leftMotorFloored = Math.floor(leftMotor);
  const rightMotorFloored = Math.floor(rightMotor);

  servoAngle.value += servoAngleChange.value * SERVO_SCALE;
  servoAngle.value = Math.max(
    SERVO_MIN_VALUE,
    Math.min(SERVO_MAX_VALUE, servoAngle.value));
  const servoFloored = Math.floor(servoAngle.value);
  const robotControlMsg = `${leftMotorFloored},${rightMotorFloored},${servoFloored}\n`;
  console.log(`Sending robotcontrol ${robotControlMsg}`);
  await peer.controlRobot(createMessage('robotControl', { msg: robotControlMsg, roomId: soupStore.roomId }));
}

function changeSpeed () {
  switch (speedMode.value) {
    case 1:
      DRIVE_MOTOR_SCALE = 0.3;
      TURN_MOTOR_SCALE = 0.23;
      break;
    case 2:
      DRIVE_MOTOR_SCALE = 0.6;
      TURN_MOTOR_SCALE = 0.26;
      break;
    case 3:
      DRIVE_MOTOR_SCALE = 1;
      TURN_MOTOR_SCALE = 0.3;
      break;
  }
  // if (DRIVE_MOTOR_SCALE === 1) {
  //   DRIVE_MOTOR_SCALE = 0.3;
  //   TURN_MOTOR_SCALE = 0.23;
  // } else {
  //   DRIVE_MOTOR_SCALE = 1;
  //   TURN_MOTOR_SCALE = 0.3;
  // }
  // console.log('Set DRIVE_MOTOR_SCALE to ' + DRIVE_MOTOR_SCALE);
  console.log('Changed speed to mode ' + speedMode.value);
}

function handleKeypress (event: KeyboardEvent) {
  // console.log(event);
  // console.log(event.key + ' ' + event.type);

  if (chatHasFocus.value) {
    if (event.type === 'keyup') {
      switch (event.key) {
        case 'Escape':
          chatInputField.value?.blur();
          break;
      }
    }
  } else if (showEmojiPicker.value) {
    if (event.type === 'keyup') {
      switch (event.key) {
        case 'e':
        case 'E':
        case 'Escape':
          showEmojiPicker.value = false;
          break;
        case '0':
          chooseEmojiFace(emojiFaces[9]);
          showEmojiPicker.value = false;
          break;
        case '1':
          chooseEmojiFace(emojiFaces[0]);
          showEmojiPicker.value = false;
          break;
        case '2':
          chooseEmojiFace(emojiFaces[1]);
          showEmojiPicker.value = false;
          break;
        case '3':
          chooseEmojiFace(emojiFaces[2]);
          showEmojiPicker.value = false;
          break;
        case '4':
          chooseEmojiFace(emojiFaces[3]);
          showEmojiPicker.value = false;
          break;
        case '5':
          chooseEmojiFace(emojiFaces[4]);
          showEmojiPicker.value = false;
          break;
        case '6':
          chooseEmojiFace(emojiFaces[5]);
          showEmojiPicker.value = false;
          break;
        case '7':
          chooseEmojiFace(emojiFaces[6]);
          showEmojiPicker.value = false;
          break;
        case '8':
          chooseEmojiFace(emojiFaces[7]);
          showEmojiPicker.value = false;
          break;
        case '9':
          chooseEmojiFace(emojiFaces[8]);
          showEmojiPicker.value = false;
          break;
      }
    }
  } else {
    if (event.type === 'keydown') {
      switch (event.key) {
        case 'ArrowUp':
          if (event.shiftKey) {
            servoAngleChange.value = -1;
          } else {
            forwardActive = true;
            document.getElementById('forward-button')?.click();
          }
          break;
        case 'ArrowDown':
          if (event.shiftKey) {
            servoAngleChange.value = 1;
          } else {
            reverseActive = true;
            document.getElementById('backward-button')?.click();
          }
          break;
        case 'ArrowLeft':
          robotRotation = -1;
          document.getElementById('left-button')?.click();
          break;
        case 'ArrowRight':
          robotRotation = 1;
          document.getElementById('right-button')?.click();
          break;
        case 'a':
        case 'A':
          break;
        case 'z':
        case 'Z':
          break;
      }
    } else if (event.type === 'keyup') {
      switch (event.key) {
        case 'a':
          break;
        case 'z':
          break;
        case 'ArrowLeft':
          robotRotation = 0;
          break;
        case 'ArrowRight':
          robotRotation = 0;
          break;
        case 'ArrowUp':
          servoAngleChange.value = 0;
          forwardActive = false;
          break;
        case 'ArrowDown':
          servoAngleChange.value = 0;
          reverseActive = false;
          break;
        case 'k':
        case 'K':
          toggleVideo();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'r':
        case 'R':
          toggleRaiseHand();
          break;
        case 'p':
        case 'P':
          speedMode.value = (speedMode.value + 3) % 3 + 1;
          changeSpeed();
          break;
        case 'o':
        case 'O':
          // changeRobotCamera();
          break;
        case 'i':
        case 'I':
          // presentSettingsPopover(undefined);
          break;
        case 'e':
        case 'E':
          if (!videoEnabled.value) {
            showEmojiPicker.value = !showEmojiPicker.value;
          }
          break;
        case 'c':
        case 'C':
          chatInputField.value?.focus();
          break;
        case 'Escape':
          router.replace({ name: 'lobby' });
          break;
      }
    }
  }
}

const receiveStream = new MediaStream();

async function consumeVideo (producerId: string) {
  if (!videoTag.value) return;
  const { track } = await peer.consume(producerId);
  // videoTag.value.srcObject = new MediaStream([track]);
  receiveStream.getVideoTracks().forEach((track) => {
    receiveStream.removeTrack(track);
  });
  receiveStream.addTrack(track);
  attachSrcObject();
  await nextTick();
  // initVideoSphere();
}

async function consumeAudio (producerId: string) {
  const { track } = await peer.consume(producerId);
  receiveStream.getAudioTracks().forEach((track) => {
    receiveStream.removeTrack(track);
  });
  receiveStream.addTrack(track);
}

function attachSrcObject () {
  if (!videoTag.value) {
    console.error('no video tag to attach stream to!');
    return;
  }
  if (!receiveStream) {
    console.error('receiveStream was undefined');
    return;
  }
  videoTag.value.srcObject = receiveStream;
}

let robotControlIntervalId: Timeout;

onMounted(() => {
  if (!userStore.firstInteractionDone) {
    $q.dialog({
      title: 'Sidan laddad',
      message: 'Starta?',
    }).onDismiss(() => {
      attachSrcObject();
      userStore.firstInteractionDone = true;
    });
  } else {
    attachSrcObject();
  }
  robotThrottle = 0;
  robotRotation = 0;
  servoAngleChange.value = 0;
  robotControlIntervalId = setInterval(driveRobot, 300);
  window.addEventListener('keyup', handleKeypress);
  window.addEventListener('keydown', handleKeypress);
  chooseEmojiFace(currentEmojiFace.value);
});

onUnmounted(() => {
  console.log('UNMOUNTING"""""""""""""');
  clearInterval(robotControlIntervalId);
  window.removeEventListener('keyup', handleKeypress);
  window.removeEventListener('keydown', handleKeypress);
  // peer.closeAndNotifyAllConsumers();
  // peer.receiveTransport?.close();
  $q.loading.hide();
  peer.setCustomClientProperties({
    handRaised: false,
  });
  if (soupStore.roomId) {
    // peer.closeAndNotifyAllConsumers();
    // peer.closeAndNotifyAllProducers();
    console.log('LEAVING ROOOOOM!');
    peer.leaveRoom();
  }
});

//
// ***************
// INITIALIZE
(async () => {
  console.log('CLIENTPAGE INITIALIZE TRIGGERED!!!');
  const route = router.currentRoute.value;

  try {
    // First check if not yet connected to a gathering
    if (!soupStore.gatheringState) {
    // if not, try to connect using stores to choose gatheringName
      await peer.restoreOrInitializeGathering();
    }

    // if success joining gathering, join the room defined by the route!
    if (!route.params.roomId || Array.isArray(route.params.roomId)) {
      throw new Error('no or incorrectly formatted roomId specified in route!');
    }
    if (!peer.receiveTransport) {
      await peer.createReceiveTransport();
    }
    if (!peer.sendTransport) {
      await peer.createSendTransport();
    }

    const roomStateFromGathering = soupStore.gatheringState?.rooms[route.params.roomId];
    let roomState: RoomState;
    if (roomStateFromGathering?.customProperties.doorIsOpen) {
      roomState = await peer.joinRoom(route.params.roomId);
    } else {
      $q.loading.show({
        message: 'väntar på att bli insläppt',
      });
      roomState = await peer.requestToJoinRoom(route.params.roomId);
      $q.loading.hide();
    }

    soupStore.setRoomState(roomState);
  } catch (e) {
    console.error(e);
    router.back();
  }

  if (screenTag.value) {
    console.log('adding resize event to video!');
    screenTag.value.onresize = (ev) => {
      console.log('video resized!', ev);
      if (!screenTag.value) return;
      const ratio = screenTag.value.videoWidth / screenTag.value.videoHeight;
      const fixedWidth = 1.7777;
      screenShareHeight.value = fixedWidth / ratio;
    };
  }

  // Now we should be ready to start consuming media!!!

  // if (rooms.value.length) {
  //   await consume(rooms.value[currentRoomIndex]);
  // }
})();

// const cameraTag = ref<HTMLElement>();
// const videoRotaterTag = ref<Entity>();
// document.addEventListener('pointermove', (ev) => {
//   if (!videoIsGrabbed.value) return;
//   if (videoRotaterTag.value) {
//     console.log(ev);
//     videoRotaterTag.value.object3D.rotation.y -= THREE.MathUtils.degToRad(ev.movementX * 0.1);
//     const newZ = videoRotaterTag.value.object3D.rotation.x - THREE.MathUtils.degToRad(ev.movementY * 0.1);
//     videoRotaterTag.value.object3D.rotation.x = THREE.MathUtils.clamp(newZ, -Math.PI / 4, Math.PI / 4);
//   }
// });

const screenshareWindowMode = ref('vr');
// const videoIsGrabbed = ref(false);

// function videoGrabbed (ev: MouseEvent) {
//   console.log('video frame grabbed!', ev);
//   videoIsGrabbed.value = true;
//   // if (cameraTag.value) {
//   //   cameraTag.value.setAttribute('look-controls-enabled', 'false');
//   // }
//   document.addEventListener('mouseup', videoReleased, { once: true });
// }

// function videoClicked (ev: MouseEvent) {
//   console.log('video frame clicked!', ev);
// }

// function videoReleased (ev: MouseEvent) {
//   console.log('video frame released!', ev);
//   videoIsGrabbed.value = false;
//   // if (cameraTag.value) {
//   //   cameraTag.value.setAttribute('look-controls-enabled', 'true');
//   // }
// }

// function printEvent (ev: Event) {
//   console.log(ev);
// }

// async function initVideoSphere () {
//   const vSphere = document.querySelector('a-videosphere');
//   if (!vSphere) throw new Error('no videosphere found in DOM!!! What have you done Gunnar??');
//   // vSphere.setAttribute('srcObject', 'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4');
//   vSphere.setAttribute('src', '#main-video');
//   const vVideo = document.querySelector('a-video');
//   if (!vVideo) throw new Error('no videoframe found in (a-frame) DOM!!! What have you done Gunnar??');
//   vVideo.setAttribute('src', '#screen-video');
//   // sceneEl.appendChild(vSphere);
// }
</script>

  <style lang="scss">
    #video-container {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
    }

    #main-video {
      position: absolute;
      right: 0;
      bottom: 0;
      min-width: 0;
      min-height: 0;
      max-width:100% !important;
      max-height:100% !important;
      width: 100% !important;
      height: 100% !important;
    }

    #screen-video {
      z-index: 10000;
      position: absolute;
      right: 0;
      bottom: 0;
      max-width: 30rem;
      max-height: 30rem;
      background-color: $dark;
      transition: all 300ms;
    }

    .fill-screen {
      // left: auto !important;
      right: 50% !important;
      transform: translateX(50%);
      max-height: 100% !important;
      max-width: 100% !important;
      box-shadow: 0 0 10rem 7rem black;
    }

    #overlay {
      z-index: 100;
      position: absolute;
      // background-color: rgba(100, 100, 150, 0.5);
      // font-weight: bold;
      left: 2rem;
      top: 2rem;
      // pointer-events: none;
    }

    @keyframes wave {
      0% {
      transform: rotate(0deg);
      }
      100% {
      transform: rotate(-90deg);
      }
    }

    #raise-hand-button {
      // position: fixed;
      // z-index: 1000;
      // top: 2rem;
      // right: 2rem;
      // overflow: hidden;
      &.waving {
        animation: wave 0.5s linear 0s infinite alternate;
      }
    }

    // .participants-panel {
    //   background-color: $dark;
    //   // display:none;
    // }

    // .slide-in-panel {
    //   overflow:hidden;
    // }

    // .slide-in-panel > div {
    //   margin-left: 100%;
    //   border: 1px solid red;
    // }

    // .slide-in {
    //   margin-left: 0;
    //   transition: opacity 0.1s linear;
    //   transition: margin-left 0.5s linear;
    // }

    @media(max-width:1024px) {
      .chat-input-form {
        order: -1;
      }
    }

    .chat-balloon {
      background-color: $secondary;
      border-radius: 2em 2em 0 2em;
    }

    #self-video-tag {
      max-width: 100%;
      background-color: $dark;
      border-bottom-right-radius: 2em;
    }

    .fab-custom-icon .q-icon {
      top: -3px;
    }

    .fab-no-animation .q-fab__icon, .fab-no-animation .q-fab__active-icon {
      transition: none !important;
    }

  </style>
