import { GameController } from "./GameController";
import { IDeviceMeta } from "./typings";
export { InputControlMonitor } from './InputControlMonitor.class';
export { getControlHander, HandlerClass } from "./Handler.class";
export { getDeviceLabel } from './index.utils';
export { decodeDeviceMetaState } from './decodeControllerButtonStates.function';
export declare function listenToDeviceByMeta(deviceMeta: IDeviceMeta): Promise<GameController>;
export declare function getGameControllerByMeta(deviceMeta: IDeviceMeta): GameController;
