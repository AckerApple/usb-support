import { ISubscriber, IDeviceMeta, IDevice, GameController } from "./GameController";
import * as HID from 'node-hid';

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

    function action(method: (...args) => any) {
        return () => {
            console.log();
            Promise.resolve(method()).then(() => {
                reprompt();
            });
        }
    }
    Object.keys(commands).forEach((name,i) => {
        r.defineCommand(name, {
            help: commands[name].help,
            action: action(commands[name].action)
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

function listGameDevices(): {index: number, device: IDeviceMeta}[] {
    return listDevices().map((device, index) => ({device, index})).filter(item => isDeviceController(item.device));
}

function isDeviceController(device: IDeviceMeta): boolean {
    return (device.usage === 5 && device.usagePage === 1)
    || (device.usage === 4 && device.usagePage === 1)
    || device.product.toLowerCase().indexOf("controller") >= 0
    || device.product.toLowerCase().indexOf("game") >= 0
    || device.product.toLowerCase().indexOf("joystick") >= 0;
}

function listDevices(): IDeviceMeta[] {
    return HID.devices().sort((a, b) => a.vendorId - b.vendorId + a.productId - b.productId);
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
            const deviceMeta = devices[vendor][product].deviceMeta;
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
            console.log(`-> Opening device ${x} ` + device.deviceMeta.product);
            await listenToDeviceByMeta(device.deviceMeta).then(() => {
                console.log("-> Opened " + device.deviceMeta.product);
            }).catch((err: Error) => {
                console.log(red(`-> Failed to open device ${x} ` + device.deviceMeta.product));
                console.error(red(err.message))
            })
        } catch (err) {
            console.log(red(`-> Failed to open device ${x} ` + device.deviceMeta.product));
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

async function listenToDeviceByMeta(deviceMeta): Promise<GameController> {
    const gameController = new GameController();
    gameController.deviceMeta = deviceMeta;
    // const device = new HID.HID(deviceMeta.vendorId, deviceMeta.productId);
    // gameController.device = device;
    gameController.listen();
    
    console.log(cyan("capturing idle state of " + deviceMeta.product));
    
    return gameController.paramIdle().then(() => {
        console.log(cyan("idle state captured of " + deviceMeta.product));
        gameController.events.on("change", (data) => {
            const product = deviceMeta.product.trim();
            console.log(`${product} map: `, gameController.getLastPinsString());

        });

        console.log(cyan("Listening to device: ") + deviceMeta.product);

        return gameController;
    }).catch((err: Error) => {
        gameController.close();
        return Promise.reject(err);
    });
}

function pairGameController(): Promise<any> {
    const controllers = getGameControllers();

    listenToControllers(controllers)
    mapControllersIdle(controllers);

    console.log("Listening to controllers: ", controllers.map(controller => controller.deviceMeta.product))
    
    return requestOneControllerFrom(controllers).then((controller) => {
        closeControllers(controllers);
        console.log(cyan(`Working with ${controller.deviceMeta.product}`));
        
        
        return controller.listen().promiseNextIdle();
    }).then((controller) => mapController(controller));
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
                const notIdleListener = controller.subscribe("notIdle", () => {
                    console.log("Controller active: " + controller.deviceMeta.product)
                });

                const idleListener = controller.subscribe("idle", () => {
                    console.log("Controller idle: " + controller.deviceMeta.product)
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
        gameController.deviceMeta = item.device;
        // gameController.device = new HID.HID(item.device.vendorId, item.device.productId);
        return gameController;
    });
}

export function mapDeviceByIndex(index) {
    const gameController = new GameController();
    const devices = listDevices();
    const deviceMeta = devices[index];
    gameController.deviceMeta = deviceMeta;
    gameController.listen()
    // gameController.device = new HID.HID(deviceMeta.vendorId, deviceMeta.productId);
    mapController(gameController);
    openDevices.push(gameController.device);
    return "";
}

function delayLog(...args) {
    setTimeout(() => console.log(...args), 300);
}

function mapController(gameController: GameController): Promise<void> {
    console.log("pairing with controller " + gameController.deviceMeta.product);
    let resolver;

    function getNextQuestion() {
        return Object.keys(gameController.map).find((key) => gameController.map[key] === null)
    }

    function askForButton() {
        const key = getNextQuestion();
        delayLog("\x1b[36mPush the " + key + " key\x1b[0m");
    }

    const onChange = () => {
        const data = gameController.lastData;
        const key = getNextQuestion();
        const diffs = gameController.filterIdleDifferences(data);
        const diffKeys = Object.keys(diffs);

        if (diffKeys.length === 0) {
            return;
        } else if (diffKeys.length > 1) {
            console.log("multiple buttons activated");
        } else {
            const pos = Number(diffKeys[0]);
            const value = diffs[diffKeys[0]];
            const alreadySet = Object.keys(gameController.map).find((key) =>
                gameController.map[key] && gameController.map[key].pos === pos && gameController.map[key].value === value
            );

            if (alreadySet) {
                console.log("Key already set: " + alreadySet, { pos, value });
            } else {
                gameController.map[key] = { pos, value, idle: gameController.idle[pos], updatedAt: Date.now() }
                // console.log(gameController.map);
                console.log("SAVED KEY: " + key + " as ", { pos, value })
            }
        }

        console.log();

        if (getNextQuestion()) {
            askForButton()
        } else {
            console.log("Buttons mapped", gameController.map);
            
            readControllerFile().then((controllerFile) => {
                // console.log("controllerFile loaded", controllerFile)
                const vendorId = gameController.deviceMeta.vendorId;
                const productId = gameController.deviceMeta.productId;
                // console.log("gameController.device", gameController.device, vendorId, productId);
                const vendors = controllerFile[vendorId] = controllerFile[vendorId] || {};
                vendors[productId] = vendors[productId] || {};
                vendors[productId].deviceMeta = gameController.deviceMeta;
                vendors[productId].map = gameController.map;
                return controllerFile;
            }).then(saveControllerFile).finally(() =>
                gameController.close()
            ).then( resolver );
        }
    };

    gameController.listen().paramIdle().then(() => {
        console.log("paired with controller")
        gameController.events.on("notIdle", onChange);
        askForButton();
    });

    return new Promise(res => resolver = res);
}

import * as fs from "fs";
import * as path from "path";
import { promisify } from 'util';
const controllersFilePath = path.join(process.cwd(), "controllers.json");
function readControllerFile() {
    return new Promise((res) => {
        const file = fs.readFileSync(controllersFilePath).toString()
        res(JSON.parse(file));
    }).catch((err: Error) => ({}))
}

function saveControllerFile(controllerFile: any) {
    return new Promise((res) => {
        fs.writeFileSync(controllersFilePath, JSON.stringify(controllerFile, null, 2));
        console.log("saved controllerFile");
        res();
    });
}
