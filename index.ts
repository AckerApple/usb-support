import * as fs from "fs";
import * as path from "path";
import { promisify } from 'util';
// import { IDeviceMeta } from "./typings";
import { ISubscriber, GameController } from "./server/GameController";
import { listDevices, listenToDeviceByMeta, listGameDevices, delayLog } from './server/index.utils'
import { isDeviceController } from './index.shared'
import listenMapController from './listenMapController.function';
import { IDeviceMeta } from "./shared/typings";

// HID.setDriverType('libusb');

const repl = require('repl');

const commands = {
  "menu": {
    help: "Tells you what's available",
    action: menu
  },

  "devices": {
    help: "List USB devices",
    action: consoleDevices
  },

  "logAllControllerChanges": {
    help: "Every time a usb controller has a change it will be listed",
    action: logAllControllerChanges
  },

  "pairGameController": {
    help: "Pair a controller",
    action: pairGameController
  },

  "logAllDeviceChanges": {
    help: "Every time a usb device has a change it will be listed",
    action: logAllDeviceChanges
  },

  "saved-devices": {
    help: "List saved USB devices",
    action: consoleSavedDevices
  },

  "dump-devices": {
    help: "Depp detail list USB devices",
    action: consoleDumpDevices
  },

  "dump-controllers": {
    help: "Depp detail list USB devices",
    action: consoleDumpControllers
  },

  "game-devices": {
    help: "List USB devices known to be game controllers",
    action: consoleGameDevices
  },
};

function runApp() {
  console.log("\n\n\n");
  console.log( pink("Welcome to gamepad cli helper") );

  console.log("");
  menu();
  console.log();

  const r = repl.start({
    prompt: '> ', eval: (a) => {
      const command = a.trim();

      switch (command) {
        default:
          if (command.length) {
            console.warn(eval(a));
          }
      }
    }
  });

  function reprompt() {
    console.log()
    r.displayPrompt(true);
  }

  function action(
    method: (...args) => any,
    name: string
  ) {
    return () => {
      console.log();
      new Promise((res, rej) => {
        Promise.resolve(method()).then(res)
      })
      .catch((err: Error) => {
        console.error(`Failed to run action ${name}`, err)
      });
    }
  }
  Object.keys(commands).forEach((name,i) => {
    r.defineCommand(name, {
      help: commands[name].help,
      action: action(commands[name].action, name)
    });
  });

  Object.defineProperty(r.context, 'm', {
    configurable: false,
    enumerable: true,
    value: "test me out"
  });

  // r.close()
}

function menu() {
  console.log(cyan("COMMANDS") + ": " + Object.keys(commands).map(name => "." + name).join(", "));
  console.log(cyan("METHODS") + ":");
  console.log("   -  pairGameController()");
  console.log("   -  listenToDeviceByIndex(index: number)");
  console.log("   -  mapDeviceByIndex(index: number)");
  console.log("   -  getSavedDevices()");
  console.log();
  console.log(cyan("Type .help for list of commands"));
}

runApp();






let devices;
const openDevices = [];

function runGamepadCode() {
  consoleDevices(); console.log();
}

function consoleGameDevices() {
  const devices = listGameDevices();
  console.log();
  console.log(devices.map((item) => `[${item.index}] ${item.device.manufacturer || "Unkown Make"}: ${item.device.product}\n\tvendorId:${item.device.vendorId} productId:${item.device.productId}`).join("\n"));
  return devices;
}

function consoleDumpDevices() {
  const devices = listDevices();
  console.log();
  console.log(devices);
  return devices;
}

function consoleDumpControllers() {
  const devices = listDevices().filter( isDeviceController );
  console.log();
  console.log(devices);
  return devices;
}

function getSavedDevices() {
  const devicesJson = fs.readFileSync(path.join(__dirname, "controllers.json")).toString();
  const devices = JSON.parse(devicesJson);
  return devices;
}

function consoleSavedDevices() {
  const devices = getSavedDevices();
  console.log()
  const log = Object.keys(devices).map(vendor => {
    return Object.keys(devices[vendor]).map(product => {
      const deviceMeta = devices[vendor][product].meta;
      return {
        manufacturer: deviceMeta.manufacturer,
        product: deviceMeta.product,
        interface: deviceMeta.interface,
        usagePage: deviceMeta.usagePage,
        usage: deviceMeta.usage
      };
    });
  }).reduce((end, arrayOfArrays) => {
    end.push(...arrayOfArrays)
    return end;
  },[]);

  console.log(log)
  console.log()
  console.log(cyan(`${log.length} saved devices`));
}

function consoleDevices() {
  const devices = listDevices();
  console.log();
  const log = devices.map((device, i) => `[${i}] ${device.manufacturer || "Unkown Make"}: ${device.product}\n\tvendorId:${device.vendorId} productId:${device.productId}`).join("\n");
  console.log(log);
  return devices;
}

async function logAllDeviceChanges() {
  const devices = listDevices();
  for (let x = devices.length - 1; x >= 0; --x) {
    const device = devices[x]
    try {
      console.log(`-> Opening device ${x} ` + device.product);
      await listenToDeviceByMeta(device).then(() => {
        console.log("-> Opened " + device.product);
      }).catch((err: Error) => {
        console.log(red(`-> Failed to open device ${x} ` + device.product));
        console.error(red(err.message))
      })
    } catch (err) {
      console.log(red(`-> Failed to open device ${x} ` + device.product));
      console.error(red(err.message));
    }
  }
}

async function logAllControllerChanges() {
  // const devices = listDevices();
  const devices = getGameControllers();
  for (let x = 0; x < devices.length; ++x) {
    const device = devices[x]
    try {
      console.log(`-> Opening device ${x} ` + device.meta.product);
      await listenToDeviceByMeta(device.meta).then(() => {
        console.log("-> Opened " + device.meta.product);
      }).catch((err: Error) => {
        console.log(red(`-> Failed to open device ${x} ` + device.meta.product));
        console.error(red(err.message))
      })
    } catch (err) {
      console.log(red(`-> Failed to open device ${x} ` + device.meta.product));
      console.error(red(err.message));
    }
  }
}

function listenToDeviceByIndex(index) {
  const devices = listDevices();
  const deviceMeta = devices[index];
  listenToDeviceByMeta(deviceMeta)
  .then((controller) => {
    setInterval(() => {
      console.log(cyan(`10 second checkin on ${deviceMeta.product.trim()}`), controller.getLastPinsString());
    }, 10000);
  })
  .catch((err: Error) => console.error(err));
}

async function logListenToDeviceByMeta(deviceMeta: IDeviceMeta): Promise<GameController> {
  console.log(cyan("capturing idle state of " + deviceMeta.product))
  return listenToDeviceByMeta(deviceMeta).then(gameController => {
    console.log(cyan("idle state captured of " + deviceMeta.product))
    console.log(cyan("Listening to device: ") + deviceMeta.product)

    return gameController;
  }).catch((err: Error) => {
    // gameController.close();
    return Promise.reject(err);
  })
}

function pairGameController(): Promise<any> {
  const controllers = getGameControllers();

  listenToControllers(controllers)
  mapControllersIdle(controllers);

  console.log("Listening to controllers: ", controllers.map(controller => controller.meta.product))

  return requestOneControllerFrom(controllers).then((controller) => {
    closeControllers(controllers);
    console.log(cyan(`Working with ${controller.meta.product}`));


    return controller.listen().promiseNextIdle();
  })
  .then((controller) => listenMapController(controller));
}

function pink(message: string) {
  return `\x1b[35m${message}\x1b[0m`;
}

function cyan(message: string) {
  return `\x1b[36m${message}\x1b[0m`;
}

function red(message: string) {
  return `\x1b[31m${message}\x1b[0m`;
}

function closeControllers(controllers: GameController[]) {
  controllers.forEach(controller => controller.close());
  return controllers;
}

function listenToControllers(controllers: GameController[]) {
  controllers.forEach(controller => controller.listen());
  return controllers;
}

function mapControllersIdle(controllers: GameController[]) {
  controllers.forEach(controller => controller.mapIdle());
  return controllers;
}


function requestOneControllerFrom(controllers: GameController[]): Promise<GameController> {
  console.log();
  console.log();
  console.log("\x1b[36mPairing idle states on " + controllers.length + " game controllers\x1b[0m");
  console.log();
  console.log("\x1b[33mDo not touch any buttons for three seconds...\x1b[0m");

  setTimeout(() => console.log("."), 1000);
  setTimeout(() => console.log("."), 2000);
  setTimeout(() => console.log("."), 3000);

  return promisify( setTimeout )( 3000 ).then(() => {
    console.log();
    delayLog("\x1b[36mPress and hold a button on a game controller...\x1b[0m")

    const listeners: ISubscriber[] = [];
    return new Promise((res) => {
      controllers.forEach(controller => {
        const notIdleListener = controller.notIdle.subscribe(() => {
          console.log("Controller active: " + controller.meta.product)
        });

        const idleListener = controller.$idle.subscribe(() => {
          console.log("Controller idle: " + controller.meta.product)
        });

        listeners.push(idleListener, notIdleListener);

        controller.onNextChangeHold(() => {
          listeners.forEach(listener => listener.unsubscribe())

          res(controller);
        });
      });
    });
  });
}

function getGameControllers(): GameController[] {
  return listGameDevices().map(item => {
    const gameController = new GameController();
    gameController.meta = item.device;
    // gameController.device = new HID.HID(item.device.vendorId, item.device.productId);
    return gameController;
  });
}

export function mapDeviceByIndex(index) {
  const gameController = new GameController();
  const devices = listDevices();
  const deviceMeta = devices[index];
  gameController.meta = deviceMeta;
  gameController.listen()

  listenMapController(gameController);

  openDevices.push(gameController.device);

  return "";
}
