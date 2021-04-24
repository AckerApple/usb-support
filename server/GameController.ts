import * as HID from 'node-hid';
import { Subject, Subscription } from 'rxjs';
import GameControlEvents from '../webapp/src/app/GameControlEvents';

export interface IDevice {
  readSync: () => number[];
  read: (callback: (err, value: number[]) => any) => void;
  listenerCount: () => number;
  eventNames: () => string[];
  addListener: (eventName: string, callback: (...args) => any) => any;
  removeAllListeners: () => any;
  removeListener: (eventType: string, listener: (...args) => any) => any
  resume: () => any;
  pause: () => any;
  on: (type: string, data: any) => any;
  close: () => any;
}

export interface ISubscriber {
  unsubscribe: () => any
}

export class GameController extends GameControlEvents {
  device: IDevice;
  $data: Subject<number[]> = new Subject()
  listener: (data: number[]) => any
  private subs = new Subscription()

  // device can be asked for state versus always reporting its state
  allowsInterfacing() {
    return this.deviceMeta.interface === 0 ? false : true;
  }

  onNextChangeHold(callback: () => any, timeMs: number = 2000) {
    const startState = this.lastData;
    let timeout;

    const listener = () => {
      if (timeout != undefined) {
        clearTimeout(timeout);
      }

      const lastChangedAt = this.changedAt;

      timeout = setTimeout(() => {
        if (this.changedAt === lastChangedAt && !this.isCurrentState(startState)) {
          callback();
          sub.unsubscribe();
        }
      }, timeMs);
    }

    const sub = this.change.subscribe(listener);
  }

  async promiseNextIdle(): Promise<GameController> {
    return new Promise((res, rej) =>
      this.onNextIdle((err, response)=> {
        if (err) {
          return rej(err)
        }

        res(response)
      })
    )
  }

  onNextIdle(callback: (err: Error, value: GameController) => any) {
    if (this.isIdle) {
      return callback(null, this);
    }

    const sub = this.$idle.subscribe(() => {
      callback(null, this);
      sub.unsubscribe();
    });

    return this;
  }

  isCurrentState(state: number[]) {
    if (!state && !this.lastData) {
      return true;
    }

    if (!state || !this.lastData) {
      return false;
    }

    return this.lastData.find((data,index) => state.length <= index || state[index] !== data) ? false : true
  }

  listen() {
    if (this.listener) {
      return this; // already listening
    }

    if (!this.device) {
      if (this.deviceMeta) {
        this.device = this.tryConnection()
      } else {
        throw new Error("GameController.deviceMeta has not been set. Need vendorId and productId");
      }
    }

    const onNewData = (data) => {
      this.onNewData(data)
    }
    const callback = whenCallbackChanges(onNewData, (a) => a.toString());

    this.listener = (data: number[]) => {
      this.lastData = data;
      this.$data.next(data);
      callback(data)
    };

    this.device.addListener("data", this.listener);

    return this;
  }

  tryConnection() {
    try {
      return new HID.HID(this.deviceMeta.path);
    } catch (err) {
      console.warn("Could not connect by path", err);
      return this.tryVendorProductConnection()
    }
  }

  tryVendorProductConnection() {
    try {
      return new HID.HID(this.deviceMeta.vendorId, this.deviceMeta.productId);
    } catch (err) {
      err.message = err.message + `(vId:${this.deviceMeta.vendorId} pId:${this.deviceMeta.productId} ${this.deviceMeta.product})`
      err.tip = 'PROCESS MAY NEED TO RUN AS ROOT USER';
      // console.error(err)
      throw err;
    }
  }

  close() {
    // this.device.off("data")
    // this.device.removeAllListeners();
    if (this.listener) {
      this.device.removeListener("data", this.listener);
      this.device.close()
      delete this.listener;
    }
    this.subs.unsubscribe();
    // delete this.device;
    // this.device.close();
  }

  async mapIdle(): Promise<GameController> {
    if (this.allowsInterfacing()) {
      return Promise.resolve(this);
    }

    return new Promise((res, rej) => {
      const timeout = setTimeout(() => {
        rej(new Error(`Could not map idle state of ${this.deviceMeta.product} in timely fashion`))
      }, 1000);

      const dataReader = (data) => {
        clearTimeout(timeout);
        this.idle = data;
        res(this);
      };

      this.device.read((err, data) => {
        if (err) {
          rej(new Error(`Could not map idle state of ${this.deviceMeta.product} due to ${err.message}`))
          return;
        }

        this.idle = this.lastData = data;
        dataReader(data);
      });

      this.subs.add( this.$data.subscribe(dataReader) );
      const oneSub = this.$data.subscribe((data) => {
        dataReader(data)
        oneSub.unsubscribe()
      });
    });
  }

  async paramIdle(): Promise<GameController> {
    if (this.idle.length) {
      return Promise.resolve(this);
    }

    return this.mapIdle();
  }

  getLastPins() {
    return [...this.lastData.map((v,i) => v)];
  }

  getLastPinsString() {

    return this.getLastPins().map((v, i) => i + ":" + ("000" + v).slice(-3)).join(" | ");
  }

  tempAxisMemoryArray: {
    updatedAt: number,
    repeats: number,
    pin: number,
    min: number,
    max: number
  }[] = []

  axisDataDiscoverer(data) {
    data.forEach((pinValue, pin) => {
      for (let mPinIndex = this.tempAxisMemoryArray.length - 1; mPinIndex >= 0; --mPinIndex) {
        const pinMemory = this.tempAxisMemoryArray[mPinIndex];

        if (pinMemory.pin !== pin) {
          continue;
        }

        // check cancel by min
        if (Math.abs(pinMemory.min - pinValue) > 10) {
          this.tempAxisMemoryArray.splice(mPinIndex, 1);
          return;
        }

        // check cancel by max
        if (Math.abs(pinMemory.max - pinValue) > 10) {
          this.tempAxisMemoryArray.splice(mPinIndex, 1);
          return;
        }

        // recording

        if(pinMemory.repeats === 5) {
          // record its an axis
          return;
        }
      }

      // todo, record new
      this.tempAxisMemoryArray.push({
        updatedAt: Date.now(),
        repeats: 0,
        pin,
        min: pinValue,
        max: pinValue
      });
    });
  }

}

function whenCallbackChanges(callback, eachArgument) {
  let args: any = [];

  return function (...allArguments) {
    if (arguments.length !== args.length) {
      callback.apply(this, arguments);
    } else {
      eachArgument = eachArgument || function (a) { return a };
      for (let index = arguments.length - 1; index >= 0; --index) {
        const newValue = eachArgument(arguments[index]);
        const oldValue = eachArgument(args[index]);
        const unmatched = oldValue != newValue;
        if (unmatched) {
          callback.apply(this, arguments);
          break;
        }
      }
    }
    args = arguments;
  }
}
