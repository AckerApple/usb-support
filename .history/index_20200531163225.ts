const repl = require('repl');

function runApp() {
    console.log("\n");
    console.log("Welcome to gamepad cli helper");
    console.log("\n");
    menu();

    const r = repl.start({
        prompt: '> ', eval: (a) => {
            const command = a.trim();

            switch (command) {
                case "menu": menu(); break;

                case "devices": devices = consoleDevices(); break
                case "game-devices": devices = consoleGameDevices(); break
                case "map-controller": devices = listenMapGameController(); break

                case "quit":
                case "exit": {
                    console.log("goodbye");
                    process.exit(1);
                }

                default:
                    if (command.length) {
                        console.warn(eval(a));
                    }
            }
            console.log("\n")
        }
    });

    Object.defineProperty(r.context, 'm', {
        configurable: false,
        enumerable: true,
        value: "test me out"
    });

    // r.close()
}

function menu() {
    console.log("COMMANDS: menu, devices, game-devices, map-controller, exit");
    console.log("METHODS: listenToDeviceByIndex(index: number)");
    console.log("   -  listenToDeviceByIndex(index: number)");
    console.log("   -  mapDeviceByIndex(index: number)");
}

runApp();






import { IDeviceMeta, IDevice, GameController } from "./GameController";
import * as HID from 'node-hid';



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
    return listDevices().map((device, index) => ({device, index})).filter(a => a.device.product.indexOf("game") >=0 );
}

function listDevices(): IDeviceMeta[] {
    return HID.devices().sort((a, b) => a.vendorId - b.vendorId + a.productId - b.productId);
}

function consoleDevices() {
    const devices = listDevices();
    console.log();
    console.log(devices.map((device, i) => `[${i}] ${device.manufacturer || "Unkown Make"}: ${device.product}\n\tvendorId:${device.vendorId} productId:${device.productId}`).join("\n"));
    return devices;
}

function listenToDeviceByIndex(index) {
    const devices = listDevices();
    const deviceMeta = devices[index];

    const gameController = new GameController();
    gameController.deviceMeta = deviceMeta;
    gameController.device = new HID.HID(deviceMeta.vendorId, deviceMeta.productId);
    gameController.listen().mapIdle().then(() => {
        gameController.events.on("change", (data) => {
            console.log("new data", data.length, data)
    
            const map = {
                a: [47, 63].indexOf(data[5]) >= 0,
                b: [31, 63].indexOf(data[5]) >= 0,
                start: [32, 48].indexOf(data[6]) >= 0,
                select: [16, 48].indexOf(data[6]) >= 0,
                right: data[3] === 255,
                down: data[4] === 255,
                left: data[3] === 0,
                up: data[4] === 0
            }
    
            console.log("data5", map, "[0]", data[0], "[1]", data[1], "[2]", data[2], "[3]", data[3], "[4]", data[4], "[5]", data[5], "[6]", data[6], "[7]", data[7])
            // listenToDeviceByIndex(22)
        })
    });

    openDevices.push(gameController.device);

    return "";
}

function listenMapGameController() {
    const controllers = getGameControllers();
    
    return requestOneControllerFrom(controllers).then( () => listenToControllers(controllers) );
}

function closeControllers(controllers: GameController[]) {
    controllers.forEach(controller => controller.close());
}

function listenToControllers(controllers: GameController[]) {
    controllers.forEach(controller => controller.listen());
}

function mapControllersIdle(controllers: GameController[]) {
    controllers.forEach(controller => controller.mapIdle());
}


function requestOneControllerFrom(controllers: GameController[]): Promise<GameController> {
    console.log("Pairing idle states on " + controllers.length + " game controllers");
    console.log();
    console.log("Do not touch any buttons for three seconds...");

    return promisify( setTimeout )( 3000 ).then(() => {
        console.log();
        console.log("Press and hold a button on a game controller");

        return new Promise((res) => {
            controllers.forEach(controller => {
                controller.then(() => {
                    controller.onNextChangeHold(() => {
                        console.log("change held on " + controller.deviceMeta.product);
                        
                        controller.forEach(devices => close);

                        res(controller);
                    });
                });
            });
        });    
    });
}

function getGameControllers(): GameController[] {
    return listGameDevices().map(item => {
        const gameController = new GameController();
        gameController.deviceMeta = item.device;
        gameController.device = new HID.HID(item.device.vendorId, item.device.productId);
        return gameController;
    });
}

function mapDeviceByIndex(index) {
    const gameController = new GameController();
    const devices = listDevices();
    const deviceMeta = devices[index];


    gameController.deviceMeta = deviceMeta;
    gameController.device = new HID.HID(deviceMeta.vendorId, deviceMeta.productId);

    gameController.listen().mapIdle();

    function getNextQuestion() {
        return Object.keys(gameController.map).find((key) => gameController.map[key] === null)
    }

    function askForButton() {
        const key = getNextQuestion();
        console.log("\x1b[36mPush the " + key + " key\x1b[0m");
    }

    const onChange = (data: number[]) => {
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
                console.log(gameController.map);
                console.log("SAVED KEY " + key, { pos, value })
            }
        }

        console.log();

        if (getNextQuestion()) {
            askForButton()
        } else {
            console.log("Buttons mapped");

            readControllerFile().then((controllerFile) => {
                console.log("controllerFile loaded", controllerFile)
                const vendorId = gameController.deviceMeta.vendorId;
                const productId = gameController.deviceMeta.productId;
                console.log("gameController.device", gameController.device, vendorId, productId);
                const vendors = controllerFile[vendorId] = controllerFile[vendorId] || {};
                vendors[productId] = vendors[productId] || {};
                vendors[productId].deviceMeta = gameController.deviceMeta;
                vendors[productId].map = gameController.map;
                return controllerFile;
            }).then(saveControllerFile).finally(() =>
                gameController.close()
            );
        }
    };

    gameController.events.on("change", onChange);

    askForButton();

    openDevices.push(gameController.device);

    return "";
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
        console.log("saved controllerFile", controllerFile);
        res();
    });
}
