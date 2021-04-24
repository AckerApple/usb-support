export enum SocketMessageType {
  // client side
  UNSUBSCRIBEDEVICE = 'unsubscribeDevice',
  LISTENTODEVICE = 'listenToDevice',
  REFRESH = 'refresh',
  GETSAVEDCONTROLLERS = 'getSavedControllers',

  // server side
  DEVICEEVENT_CHANGE = 'deviceEvent.change',
  LISTENERS = 'listeners',
  SAVEDCONTROLLERS = 'savedControllers',
  DEVICES = 'devices',
  ERROR = 'error',
}
