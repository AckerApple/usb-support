const repl = require('repl');

interface IDevice {
    productId: number;
    vendorId: number;
    manufacturer: string;
    product: string;
}

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
    console.log("COMMANDS: menu, devices, game-devices, exit");
    console.log("METHODS: listenToDeviceByIndex(index: number)");
    console.log("   -  listenToDeviceByIndex(index: number)");
    console.log("   -  mapDeviceByIndex(index: number)");
}

runApp();







import * as HID from 'node-hid';
import { EventEmitter } from 'events';

class GameController {
    device: {
        on: (type: string, data: any) => any,
        close: () => any
    };

    listing: IDevice = {} as IDevice;

    events: EventEmitter = new EventEmitter(); // change
    lastData: number[] = [];
    idle: number[] = [];
    map: { [string: string]: { pos: number, value: number, idle: number } | null } = {
        up: null,
        down: null,
        left: null,
        right: null,
        a: null,
        b: null,
        select: null,
        start: null
    };

    listen() {
        const onNewData = (data) => {
            this.events.emit("change", data);
        }
        const callback = whenCallbackChanges(onNewData, (a) => a.toString());
        this.device.on("data", (data) => {
            this.lastData = data;
            this.events.emit("data", data);
            callback(data)
        });

        return this;
    }

    close() {
        this.device.close();
        this.events.removeAllListeners();
    }

    mapIdle() {
        this.events.once("data", () => this.idle = this.lastData);
        return this;
    }

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

function listGameDevices(): {index: number, device: IDevice}[] {
    return listDevices().map((device, index) => ({device, index})).filter(a => a.device.product.indexOf("game") >=0 );
}

function listDevices(): IDevice[] {
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
    const listing = devices[index];

    const gameController = new GameController();
    gameController.listing = listing;
    gameController.device = new HID.HID(listing.vendorId, listing.productId);
    gameController.listen().mapIdle();

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

    openDevices.push(gameController.device);

    return "";
}

function listenMapGameController() {
    console.log("Press and hold a button on a game controller");
}

function mapDeviceByIndex(index) {
    const gameController = new GameController();
    const devices = listDevices();
    const listing = devices[index];


    gameController.listing = listing;
    gameController.device = new HID.HID(listing.vendorId, listing.productId);

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
                gameController.map[key] = { pos, value, idle: gameController.idle[pos] }
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
                const vendorId = gameController.listing.vendorId;
                const productId = gameController.listing.productId;
                console.log("gameController.device", gameController.device, vendorId, productId);
                const vendors = controllerFile[vendorId] = controllerFile[vendorId] || {};
                vendors[productId] = vendors[productId] || {};
                vendors[productId].listing = gameController.listing;
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
                if (oldValue != newValue) {
                    callback.apply(this, arguments);
                    break;
                }
            }
        }
        args = arguments;
    }
}
