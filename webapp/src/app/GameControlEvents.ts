import { IButtonState, IDeviceMeta } from '../../../shared/typings';
// import { EventEmitter } from 'events';
import { Subject } from 'rxjs';

export class GameControlEvents {
  lastData: number[] = []
  meta: IDeviceMeta
  changedAt: number // last button
  idle: number[] = []
  isIdle: boolean

  // events: EventEmitter = new EventEmitter(); // change, idle, notIdle
  $idle: Subject<void> = new Subject()
  notIdle: Subject<void> = new Subject()
  change: Subject<number[]> = new Subject()

  map: { [string: string]: IButtonState | null } = {
    up: null,
    down: null,
    left: null,
    right: null,
    a: null,
    b: null,
    select: null,
    start: null
  };

  onNewData(data: number[]) {
    this.changedAt = Date.now();

    if (this.idle.length || this.meta.interface == -1) {
      this.isIdle = this.determineIdleStateBy(data);

      if (this.isIdle) {
        this.$idle.next()
      } else {
        this.notIdle.next()
      }
    }

    this.change.next(data)
  }

  // returns which bit buckets do not match
  determineIdleStateBy(data: number[]): boolean {
    if (this.meta.interface == -1) {
      return this.determineInterfaceIdleState();
    }

    const rtn: { [index: number]: number } = {};

    for (let index = this.idle.length - 1; index >= 0; --index) {
      const item = this.idle[index];
      if (data[index] !== item) {
        return false; // its not idle
      }
    }

    return true;
  }

  determineInterfaceIdleState(): boolean {
    for (let index = this.lastData.length - 3; index >= 0; --index) {
      if (this.lastData[index]) {
        return false; // its not idle
      }
    }
    return true;
  }


  // returns which bit buckets do not match
  filterIdleDifferences(data: number[]): { [index: number]: number } {
    const rtn: { [index: number]: number } = {};

    this.idle.forEach((item, index) => {
      if (data[index] !== item) {
        rtn[index] = data[index];
      }
    });

    return rtn;
  }
}

export default GameControlEvents