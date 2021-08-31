import { GameController } from "./GameController";
import { IDeviceMeta } from "./typings";

export { InputControlMonitor } from './InputControlMonitor.class'
export { getControlHander, HandlerClass } from "./Handler.class"
export { getDeviceLabel } from './index.utils'
export { decodeDeviceMetaState } from './decodeControllerButtonStates.function'

export async function listenToDeviceByMeta(
  deviceMeta: IDeviceMeta
): Promise<GameController> {
  const gameController = getGameControllerByMeta(deviceMeta)
  gameController.listen();
  return gameController.paramIdle()
}

export function getGameControllerByMeta(deviceMeta: IDeviceMeta): GameController {
  const gameController = new GameController();
  gameController.meta = deviceMeta;
  return gameController
}
