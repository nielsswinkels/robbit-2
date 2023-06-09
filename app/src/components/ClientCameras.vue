<template>
  <div
    class="col row justify-stretch items-stretch"
  >
    <!-- style="width:100%;" -->
    <template
      v-for="client in clientsWithMuteState"
      :key="client.clientId"
    >
      <div
        v-if="client.clientId !== clientId"
        :class="clientsColClass + ' client-camera'"
      >
        <div
          class="absolute-bottom-right q-ma-xs"
        >
          <!-- style="position: absolute; bottom: 0px; right: 0px;" -->
          {{ client.username }}
        </div>
        <template
          v-for="(producer, key) in client.producers"
          :key="key"
        >
          <!-- has {{ producer.kind }} -->
          <!-- (producer.producerInfo && !producer.producerInfo.paused) &&  -->
          <video
            v-if="producer.kind == 'video'"
            v-show="(producer.producerInfo && !producer.producerInfo.paused)"
            :ref="(el) => { producerVideoTags[producer.producerId] = el as HTMLAudioElement }"
            autoplay
            muted
          />
          <QIcon
            name="videocam_off"
            v-if="producer.kind == 'video' && producer.producerInfo && producer.producerInfo.paused"
          />
        </template>
      </div>
    </template>
  </div>
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
    if (!producererArr.length || producererArr[0].producerInfo?.paused) {
      return 'muted';
    } else {
      return 'unmuted';
    }
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

  const clients = Object.values(props.clients).map(client => {
    const muteState = getMuteState(client);
    return { ...client, muteState, muteIcon: muteStateToIcon[muteState], muteLabel: getMuteLabel(muteState) };
  });
  return clients.sort((clientA, _clientB) => {
    if (clientA.role === 'client') return 1;
    return -1;
  });
});

const clientsColClass = computed(() => {
  console.log('clientsColClass' + Object.keys(props.clients).length);
  if (Object.keys(props.clients).length <= 1) {
    return 'col';
  } else if (Object.keys(props.clients).length <= 4) {
    return 'col-6';
  } else if (Object.keys(props.clients).length <= 6) {
    return 'col-4';
  } else if (Object.keys(props.clients).length <= 8) {
    return 'col-3';
  } else if (Object.keys(props.clients).length <= 9) {
    return 'col-4';
  } else {
    return 'col-4';
  }
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

// NOTE: This is a bit hacky since well be left with dangling keys when the audioelements are removed from the dom.
const producerAudioTags = ref<Record<string, HTMLAudioElement>>({});
const producerVideoTags = ref<Record<string, HTMLAudioElement>>({});
let consumedProducers: Record<string, string> = {};
watch(clientProducers, (producers) => {
  console.log('clientProducers watcher triggered:', producers);
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
    console.log('##### producer:');
    console.log(producer);
    console.log('kind:' + producer.kind);
    const mediaStream = new MediaStream([track]);
    if (producer.kind === 'audio' && producerAudioTags.value[producer.producerId]) producerAudioTags.value[producer.producerId].srcObject = mediaStream;
    if (producer.kind === 'video' && producerVideoTags.value[producer.producerId]) producerVideoTags.value[producer.producerId].srcObject = mediaStream;
  }

  consumedProducers = { ...addedConsumedProducers, ...consumedProducers };
  console.log('consumed producers after:', consumedProducers);
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

.client-camera {
  position: relative;
  z-index: -1;
  background-color: $dark;
  border: 2px solid $primary;
}
    </style>
