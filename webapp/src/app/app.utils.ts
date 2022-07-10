import { DeviceProductLayout, IDeviceMeta } from '../../../src/shared/typings'

export interface IDeviceMetaState extends DeviceProductLayout {
  subscribed?: boolean
  recording?: boolean
  lastEvent?: number[]
  ignoreBits?: number[]
  pressed?: string[] // populated if matched to savedController
}

export const testController: IDeviceMeta = {
  path: 'test-path',
  interface: -1,
  usage: -1,
  usagePage: -1,
  productId: -1,
  vendorId: -32,
  product: 'test-product',
  manufacturer: 'test-manu',
}

export interface DebugData {
  devices?: boolean // reveal debugging for non-controllers
  controllers?: boolean // reveal debugging for controllers
  state: 'initializing' | 'constructing' | 'constructed' | 'message-received' | 'socket opened'
  messages: number
  url: string
  socket: Record<string, any>,
  lastWssData: Record<string, any>,
  lastPayload: Record<string, any>,
  lastLogs: {
    info: Record<string, any>
    error?: Record<string, any>
  }
}

export function download(filename:string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function copyText(text: string) {
  /* Get the text field */
  var copyText = document.createElement('textarea');
  copyText.value = text
  document.body.appendChild(copyText)

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  document.body.removeChild(copyText)
  // copyText.parentNode.removeChild(copyText)
}
