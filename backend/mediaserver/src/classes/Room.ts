import {types as soup} from 'mediasoup';
import {v4 as uuidv4} from 'uuid';
import { MediasoupConfig } from '../mediasoupConfig';
import Client from './Client';
export default class Room {
  router: soup.Router;
  id: string;
  clients: Map<string, Client> = new Map();

  static async createRoom(id: string = uuidv4(), worker: soup.Worker, config?: MediasoupConfig): Promise<Room> {
    const routerOptions: soup.RouterOptions = {};
    if(config?.router.mediaCodecs){
      routerOptions.mediaCodecs = config.router.mediaCodecs;
    }
    const router = await worker.createRouter(routerOptions);
    const createdRoom = new Room(id, router);
      
    return createdRoom;
  }

  constructor(id: string, router: soup.Router) {
    this.router = router;
    this.id = id;
  }

  getRtpCapabilities(): soup.RtpCapabilities {
    return this.router.rtpCapabilities;
  }
}