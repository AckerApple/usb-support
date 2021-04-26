import { GameController } from "./GameController";
import { IDeviceMeta } from "./typings";
export declare function listenToDeviceByMeta(deviceMeta: IDeviceMeta): Promise<GameController>;
export declare function getGameControllerByMeta(deviceMeta: IDeviceMeta): GameController;
