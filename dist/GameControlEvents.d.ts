import { IButtonState, IDeviceMeta } from './typings';
import { Subject } from 'rxjs';
export declare class GameControlEvents {
    lastData: number[];
    meta: IDeviceMeta;
    changedAt: number;
    idle: number[];
    isIdle: boolean;
    $idle: Subject<void>;
    notIdle: Subject<void>;
    change: Subject<number[]>;
    map: {
        [string: string]: IButtonState | null;
    };
    onNewData(data: number[]): void;
    determineIdleStateBy(data: number[]): boolean;
    determineInterfaceIdleState(): boolean;
    filterIdleDifferences(data: number[]): {
        [index: number]: number;
    };
}
export default GameControlEvents;
