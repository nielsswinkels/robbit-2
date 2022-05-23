// export interface RoomState {
//   producers: Record<string, unknown>[],
//   consumers: Record<string, unknown>[],
//   clients: Record<string, unknown>[],
// }
import {types as soup} from 'mediasoup';
import { RequestSubjects } from './MessageTypes';

export interface ProducerInfo {
  screenShare: boolean,
  [key: string]: unknown
}

export interface ClientProperties {
  isWavingHand?: boolean,
  [key: string]: unknown,
}

export interface RoomProperties {
  requiresInlet?: boolean,
  [key:string]:unknown,
}

export interface ClientState {
  clientId: string;
  username?: string;
  customProperties: Record<string, unknown>
  gatheringId?: string;
  roomId?: string;
  connected: boolean;
  role: UserRole,
  producers: {
    [producerId: string]: {
      producerId: string;
      kind: soup.MediaKind;
      // producerInfo?: Record<string, unknown>
      producerInfo?: ProducerInfo
    }
  }
}

export interface RoomState {
  roomId: string;
  roomName?: string;
  customProperties: RoomProperties,
  mainProducers: {
    video?:string,
    audio?: string,
  },
  // clients: string[]
  clients: {
      [clientId: string]: ClientState;
  }
  // senderClients: {
  //     [clientId: string]: ClientState;
  // }
}

export type ShallowRoomState = Omit<RoomState, 'clients'> & {clients: string[]}

export interface GatheringState {
  gatheringId: string;
  gatheringName?: string;
  // senderClients: {
  //   [clientId: string] : ClientState
  // };
  rooms: {
    [roomId: string ] : ShallowRoomState;
  }
  clients: {
      [clientId: string]: ClientState;
  }
}

// export type AllowedActions  = Extract<RequestSubjects, 'createGathering' |'joinGathering' | 'gatheringState' | 'createRoom' | 'joinRoom'>
export type AllowedAction  =  RequestSubjects | '*';
export interface UserData {
  uuid: string,
  username: string,
  role: UserRole,
  gathering?: '*' | string
  // allowedRooms?: '*' | string[]
  // allowedActions: Array<AllowedAction>
}

export const securityLevels = [
'guest',
'client',
'sender',
'host',
'admin',
'gunnar' 
] as const;

export type UserRole = (typeof securityLevels)[number];
export type NonGuestUserRole = Exclude<(typeof securityLevels)[number], 'guest'>;


// TODO: This securitylevel array shit is reaaal hacky. No fun!!! You cry

const defaultActions = [
  'connectTransport',
  'createReceiveTransport',
  'createConsumer',
  'getRouterRtpCapabilities',
  'setRtpCapabilities',
  'notifyCloseEventRequest',
  'notifyPauseResumeRequest',
  'joinRoom',
  'requestToJoinRoom',
  'leaveRoom',
  'findRoomByName',
  'joinGathering',
  'leaveGathering',
  'findGatheringByName',
  'setName',
  'getClientState',
  'setCustomClientProperties',
  'createGathering',
  'createProducer',
  'createSendTransport',
] as const;


type DefaultAction = (typeof defaultActions)[number];
type NonDefaultAction = Exclude<AllowedAction, DefaultAction>

const hostActions: NonDefaultAction[] = [
'assignMainProducerToRoom', 'createRoom',  'customRequest', 'getGatheringState', 'removeClientFromRoom'
]

export const allowedActions: Record<UserRole, AllowedAction[]> = {
  gunnar: ['*'],
  admin: ['*'],
  host: [...defaultActions, ...hostActions],
  sender: [...defaultActions],
  client: [...defaultActions],
  guest: [...defaultActions],
}