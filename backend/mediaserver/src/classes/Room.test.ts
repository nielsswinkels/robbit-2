import Room from './Room';
import Client from './Client';
import {types } from 'mediasoup';
import { mock, mockDeep, MockProxy } from 'jest-mock-extended';

describe('when instantiating a room it', () => {

  it('gets a uuid autogenerated if not provided', async () => {
    const worker = mock<types.Worker>();
    const room = await Room.createRoom(undefined, worker);
    expect(room).toBeDefined();
    expect(room.id).toBeDefined();
  });

  it('uses a custom uuid if provided', async () => {
    const customUuid = 'ökjhasr3';
    const worker = mock<types.Worker>();
    const room = await Room.createRoom(customUuid, worker);
    expect(room.id).toBe(customUuid);
  });

  // it('cant be done by calling the constructor directly', () => {
  //   const router = mock<types.Router>();
  //   const room = new Room('test', router);
  // });
});

describe('a valid room with a mocked worker', () => {
  let room: Room;
  beforeEach(async ()=>{
    const worker = mock<types.Worker>();
    room = await Room.createRoom(undefined, worker);
  });
  it('doesnt allow an unathourized client to be added to the room', () => {
    // TODO: Create logic for identifying/auhtorize users
  });
  it('allows an authorized client to be added to the room', () => {
    // TODO: finish this test
  });
  it('notifies all clients in the room when a new client is added (including the added one)', () => {
    const nrOfClients = 10;
    const clients: Client[] = [];
    for (let i = 0; i < nrOfClients; i++) { 
      const aClient = mock<Client>();
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      aClient.id = randomString;
      clients.push(aClient);
      room.addClient(aClient);
    }
    // const mainClient = mock<Client>();
    for (let i = 0; i < nrOfClients; i++) {
      const expectedNrOfCalls = nrOfClients - i;
      expect(clients[i].roomStateUpdated).toBeCalledTimes(expectedNrOfCalls);
    }
  });
  it('notifies all other clients in the room when a client is removed', () => {
    const nrOfClients = 10;
    const clients: MockProxy<Client>[] = [];
    for (let i = 0; i < nrOfClients; i++) { 
      const aClient = mock<Client>();
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      aClient.id = randomString;
      clients.push(aClient);
      room.addClient(aClient);
    }
    for (let i = 0; i < nrOfClients; i++) {
      //Only care about remove triggering roomstate calls
      clients[i].roomStateUpdated.mockClear();
    }
    for (let i = 0; i < nrOfClients; i++) {
      room.removeClient(clients[i]);
    }
    for (let i = 0; i < nrOfClients; i++) {
      const expectedNrOfCalls = i;
      expect(clients[i].roomStateUpdated).toBeCalledTimes(expectedNrOfCalls);
    }
  });
  it('cant add client with the same uuid twice', ()=>{
    const client = mock<Client>();
    client.id = 'asdf';
    expect(room.addClient(client)).toBe(true);
    expect(room.addClient(client)).toBe(false);

  });
  it('can NOT remove client if isnt in this room', () => {
    const client = mock<Client>();
    client.id = 'asdfagbfdfb';
    expect(room.removeClient(client)).toBe(false);
  });
  // it('cant remove a client if provided client object is missing id', () => {
  //   const client = mock<Client>();
  //   const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  //   client.id = undefined;
  //   console.log('client.id:', client.id);
  //   room.addClient(client);
  //   expect(room.removeClient(client)).toBe(false);
  //   expect(warnSpy).toBeCalled();
  //   warnSpy.mockRestore();
  // });
  it('can remove a client if its in this room', ()=>{
    // TODO: create test
    const client = mock<Client>();
    client.id = 'asdflkj3lkjhf';
    room.addClient(client);
    expect(room.removeClient(client)).toBe(true);
  });
  // it('wont remove another client if requested by normal user', ()=>{
  //   // TODO: create test
  // });
  // it('removes another client if requested by super user', ()=>{
  //   // TODO: create test
  // });
});