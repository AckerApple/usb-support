import { GameController } from "../server/GameController";
import { IDeviceMeta } from "./typings";

export { getControlHander, HandlerClass } from "./Handler.class"

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
