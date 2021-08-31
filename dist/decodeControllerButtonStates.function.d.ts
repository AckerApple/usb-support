import { DeviceProductLayout, IButtonState } from './typings';
export default decodeDeviceMetaState;
/** runtime decode button presses
 * - Todo: More performance using a map of all possible presses instead of using this
*/
export declare function decodeDeviceMetaState(metaState: DeviceProductLayout, event: number[]): string[];
export declare function getSamePosButtons(buttonName: string, changedMap: ButtonStates): string[];
/** determines if multiple button pressed  */
export declare function findButtonCombo(alikes: string[], // two or more button names
current: IButtonState, { changedMap, seekValue }: {
    changedMap: {
        [buttonName: string]: IButtonState;
    };
    seekValue: number;
}): boolean;
interface ButtonStates {
    [buttonName: string]: IButtonState;
}
