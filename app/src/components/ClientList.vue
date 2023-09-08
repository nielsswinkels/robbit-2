<template>
  <QCard>
    <QCardSection class="q-pa-none">
      <QList
        separator
      >
        <QItem>
          <QItemSection>
            <div class="text-h6">
              {{ Object.keys(clients).length }} personer i detta rum:
            </div>
          </QItemSection>
          <QItemSection side>
            <QBtn
              round
              :icon="soundOn?'volume_up':'volume_off'"
              @click="toggleSound"
            >
              <QTooltip>
                Slå av / sätt på allt ljud
              </QTooltip>
            </QBtn>
          </QItemSection>
        </QItem>
        <!-- <QItem>
          producerAudioTags
          <pre>
            {{ producerAudioTags }}
          </pre>
        </QItem>
        <QItem>
          consumedProducers
          <pre>
            {{ consumedProducers }}
          </pre>
        </QItem>
        <QItem
          v-for="(audioTag, index) in producerAudioTags"
          :key="index"
        >
          {{ index }}:
          <pre>
            {{ audioTag.srcObject }}
          </pre>
        </QItem> -->
        <QItem
          v-for="client in clientsWithMuteState"
          :key="client.clientId"
        >
          <QItemSection>
            {{ client.username }}
            <template v-if="client.clientId === clientId">
              (du)
            </template>
          </QItemSection>
          <QItemSection
            v-if="Object.keys(client.producers).length"
          >
            <div>
              <template
                v-for="(producer, key) in client.producers"
                :key="key"
              >
                <audio
                  v-if="producer.kind == 'audio'"
                  :ref="(el) => { producerAudioTags[producer.producerId] = el as HTMLAudioElement }"
                  autoplay
                />
                <!-- <video
                  v-if="!producer.producerInfo.paused"
                  :ref="(el) => { producerVideoTags[producer.producerId] = el as HTMLAudioElement }"
                  autoplay
                /> -->
              </template>
            </div>
          </QItemSection>
          <QItemSection side>
            <QIcon
              id="hand-icon"
              color="yellow"
              v-if="client.customProperties.handRaised"
              name="waving_hand"
            />
          </QItemSection>
          <QItemSection
            v-if="client.clientId !== clientId && !hasAtLeastSecurityLevel(client.role, 'host')"
            side
          >
            <div class="q-gutter-sm">
              <QIcon
                :name="(client.videoEnabled? 'videocam': 'videocam_off')"
                size="md"
              />
              <!-- :label="client.muteLabel" -->
              <QBtn
                dense
                rounded
                :icon="client.muteIcon"
                @click="toggleConsume(client)"
              >
                <QTooltip>Sätt på / stäng av användarens mikrofon</QTooltip>
              </QBtn>
              <!-- label="släng ut" -->
              <QBtn
                dense
                rounded
                icon="person_remove"
                text-color="negative"
                @click="$emit('clientRemoved', client.clientId)"
              >
                <QTooltip>Ta bort användaren från rummet</QTooltip>
              </QBtn>
            </div>
          </QItemSection>
        </QItem>
      </QList>
    </QCardSection>
  </QCard>
</template>

<script setup lang="ts">
import { ClientState, RoomState } from 'shared-types/CustomTypes';
import { hasAtLeastSecurityLevel } from 'shared-modules/authUtils';
import { ref, computed, watch } from 'vue';
import usePeerClient from 'src/composables/usePeerClient';

defineEmits<{(event: 'clientRemoved', clientId: string): void}>();

const peer = usePeerClient();

const props = defineProps<{
  clients: RoomState['clients'],
  clientId: string
}>();

const muteStateToIcon = {
  unmuted: 'mic',
  muted: 'mic_off',
  forceMuted: 'do_not_disturb',
};

const clientsWithMuteState = computed(() => {
  const getMuteState = (client: ClientState) => {
    if (client.customProperties.forceMuted) {
      return 'forceMuted';
    }
    // if(Object.keys(client.producers).length === 0) {
    const producererArr = Object.values(client.producers);
    for (const producer of producererArr) {
      if (producer.kind === 'audio' && !producer.producerInfo?.paused) {
        return 'unmuted';
      }
    }
    return 'muted';
  };

  const getMuteLabel = (muteState: ReturnType<typeof getMuteState>) => {
    switch (muteState) {
      case 'unmuted':
        return 'ljud på';
      case 'muted':
        return 'ljud av';
      case 'forceMuted':
        return 'mikrofon blockerad';
    }
  };

  const getVideoEnabled = (client: ClientState) => {
    const producererArr = Object.values(client.producers);
    for (const producer of producererArr) {
      if (producer.kind === 'video' && !producer.producerInfo?.paused) {
        return true;
      }
    }
    return false;
  };

  const clients = Object.values(props.clients).map(client => {
    const muteState = getMuteState(client);
    const videoEnabled = getVideoEnabled(client);
    return { ...client, muteState, muteIcon: muteStateToIcon[muteState], muteLabel: getMuteLabel(muteState), videoEnabled };
  });
  return clients.sort((clientA, _clientB) => {
    if (clientA.role === 'client') return 1;
    return -1;
  });
});

const clientProducers = computed(() => {
  let producers: ClientState['producers'] = {};
  Object.values(props.clients).forEach(client => {
    if (client.role === 'client') {
      producers = { ...producers, ...client.producers };
    }
  });
  return producers;
});

const soundOn = ref<boolean>(true);
// NOTE: This is a bit hacky since well be left with dangling keys when the audioelements are removed from the dom.
const producerAudioTags = ref<Record<string, HTMLAudioElement>>({});
const producerVideoTags = ref<Record<string, HTMLAudioElement>>({});
let consumedProducers: Record<string, string> = {};
watch(clientProducers, (producers) => {
  console.log('clientProducers watcher triggered:', producers);
  if (!soundOn.value) return;
  updateProducelistAndConsumeThem(producers);
}, { deep: true, immediate: true });

// TODO: Here is memoryleak where we create more and more consumers!!! NO GOOD! MUST FIX!!!
async function updateProducelistAndConsumeThem (producers: (typeof props.clients)[string]['producers']) {
  console.log('Update producelistandconsume triggered!!');

  console.log('consumedProducers before:', consumedProducers);
  // console.log('LOOPING (Not yet consumed) PRODUCERS AND CONSUMING THEM');
  const addedConsumedProducers: Record<string, string> = {};
  for (const producer of Object.values(producers)) {
    if (consumedProducers[producer.producerId]) {
      console.log('this producer is already consumed. Skipping it!');
      continue;
    }
    if (producer.producerInfo?.paused) {
      console.log('this producer is paused. Will not cosume it.');
      continue;
    }

    if (!peer.receiveTransport) {
      console.log('Creating receive transport in watcher callback');
      await peer.sendRtpCapabilities();
      await peer.createReceiveTransport();
    }
    console.log('this producer was not conumsed. Adding it!');
    const { consumerId, track } = await peer.consume(producer.producerId);
    addedConsumedProducers[producer.producerId] = consumerId;
    console.log('producer:');
    console.log(producer);
    console.log('kind:' + producer.kind);
    console.log('track:');
    console.log(track);
    const mediaStream = new MediaStream([track]);
    if (producer.kind === 'audio' && producerAudioTags.value[producer.producerId]) {
      console.log('Setting mediaStream as srcObject!!!!');
      console.log(mediaStream);
      producerAudioTags.value[producer.producerId].srcObject = mediaStream;
    }
    if (producer.kind === 'video' && producerVideoTags.value[producer.producerId]) producerVideoTags.value[producer.producerId].srcObject = mediaStream;
  }

  consumedProducers = { ...addedConsumedProducers, ...consumedProducers };
  console.log('consumed producers after:', consumedProducers);
}

async function toggleSound () {
  soundOn.value = !soundOn.value;
  if (!soundOn.value) {
    peer.closeAndNotifyAllConsumers();
    consumedProducers = {};
  } else {
    updateProducelistAndConsumeThem(clientProducers.value);
  }
}

async function toggleConsume (client: (typeof clientsWithMuteState.value)[number]) {
  if (client.muteState === 'unmuted') {
    await peer.pauseAllProducersForCLient(client.clientId);
    // await peer.closeAllProducersForClient(client.clientId);
    return;
  }
  const newState = client.muteState === 'muted';
  await peer.setForcedMuteStateForClient(client.clientId, newState);
}

</script>
<style lang="scss">
@keyframes wave {
  0% {
    transform: translate(0, 10%) rotate(-90deg);
  }
  100% {
    transform: translate(0, 10%) rotate(-10deg);
  }
}

#hand-icon {
  transform-origin: bottom left;
  animation: wave 0.5s linear 0s infinite alternate;
}

.emoji {
  font-size: large;
}
    </style>
