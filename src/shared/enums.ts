export enum SocketMessageType {
  // client side
  UNSUBSCRIBEDEVICE = 'unsubscribeDevice',
  LISTENTODEVICE = 'listenToDevice',
  WRITETODEVICE = 'writeToDevice',
  REFRESH = 'refresh',
  GETSAVEDCONTROLLERS = 'getSavedControllers',
  SAVECONTROLLERS = 'save_controllers',

  // server side
  DEVICEEVENT_CHANGE = 'deviceEvent.change',
  LISTENERS = 'listeners',
  SAVEDCONTROLLERS = 'savedControllers',
  DEVICES = 'devices',
  ERROR = 'error',
}
