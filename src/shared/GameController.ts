import * as HID from 'node-hid';
import { Subject, Subscription } from 'rxjs';
import GameControlEvents from './GameControlEvents';

export interface IDevice {
  sendFeatureReport: (command: any[]) => any
  readSync: () => number[];
  read: (callback: (err: Error, value: number[]) => any) => void
  listenerCount: () => number
  eventNames: () => string[]
  addListener: (eventName: string, callback: (...args: any[]) => any) => any
  removeAllListeners: () => any;
  removeListener: (eventType: string, listener: (...args: any[]) => any) => any
  resume: () => any;
  pause: () => any;
  on: (type: string, data: any) => any
  close: () => any
}

export interface ISubscriber {
  unsubscribe: () => any
}

export class GameController extends GameControlEvents {
  // events: any
  device?: HID.HID;
  $data: Subject<number[]> = new Subject()
  listener?: (data: number[]) => any
  private subs = new Subscription()
  $error = new Subject()

  // device can be asked for state versus always reporting its state
  allowsInterfacing() {
    return this.meta?.interface === 0 ? false : true;
  }

  onNextChangeHold(callback: () => any, timeMs: number = 2000) {
    const startState = this.lastData;
    let timeout: any;

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

  onNextIdle(callback: (err: Error | null, value: GameController) => any) {
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

  paramDeviceConnect() {
    if (this.device) {
      return this.device
    }
    if (this.meta) {
      return this.device = this.tryConnection()
    }

    throw new Error("GameController.meta has not been set. Need vendorId and productId");
  }

  listen() {
    if (this.listener) {
      return this; // already listening
    }

    this.paramDeviceConnect()

    const onNewData = (data: any) => {
      this.onNewData(data)
    }
    const callback = whenCallbackChanges(onNewData, (a: any) => a.toString());

    this.listener = (data: number[]) => {
      this.lastData = data;
      this.$data.next(data);
      callback(data)
    };

    if (this.device) {
      this.device.addListener("data", this.listener);
    }

    return this;
  }

  tryConnection(): HID.HID | undefined {
    try {
      // console.log('connecting by path', this.meta.path)
      const device = new HID.HID(this.meta.path);
      // console.log('connected to device by path', this.meta.path)
      return device
    } catch (err) {
      // console.warn("Could not connect by path", err.message);
      return this.tryVendorProductConnection()
    }
  }

  tryVendorProductConnection(): HID.HID | undefined {
    try {
      // console.log('connecting by ids', this.meta.vendorId, this.meta.productId)
      const device = new HID.HID(this.meta.vendorId, this.meta.productId)
      // console.log('connected to by ids', this.meta.path)
      return device
    } catch (err) {
      err.message = err.message + `(vId:${this.meta.vendorId} pId:${this.meta.productId} ${this.meta.product})`
      err.tip = 'PROCESS MAY NEED TO RUN AS ROOT USER';
      // console.error("Could not connect to device", err);
      // console.warn(err.tip);
      // throw err;
      this.$error.next(err)
    }
  }

  close() {
    // this.device.off("data")
    // this.device.removeAllListeners();
    if (this.listener) {
      if (this.device) {
        this.device.removeListener("data", this.listener);
        this.device.close()
      }
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
        rej(new Error(`Could not map idle state of ${this.meta.product} in timely fashion`))
      }, 1000);

      const dataReader = (data: any) => {
        clearTimeout(timeout);
        this.idle = data;
        res(this);
      };

      this.device?.read((err, data) => {
        if (err) {
          rej(new Error(`Could not map idle state of ${this.meta.product} due to ${err.message}`))
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

  axisDataDiscoverer(data: any) {
    data.forEach((pinValue: any, pin: number) => {
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

  write(command: any[]) {
    console.log('this.meta', this.meta)
    const device = this.paramDeviceConnect() as HID.HID

    try {
      console.log('sending command', command)
      device.sendFeatureReport(command)
    } catch (err) {
      console.error('could not write to device', err);
    }
  }
}

function whenCallbackChanges(callback: any, eachArgument: any) {
  let args: any = [];

  return function (this:any, ...allArguments: any[]) {
    if (arguments.length !== args.length) {
      callback.apply(this, arguments);
    } else {
      eachArgument = eachArgument || function (a: any) { return a };
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
