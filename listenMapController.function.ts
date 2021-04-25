import * as fs from "fs";
import * as path from "path";
import { GameController } from "./server/GameController";
import mapController from "./webapp/src/app/mapController.function";
// import { GameControlEvents as GameController } from "./GameControlEvents";
const controllersFilePath = path.join(process.cwd(), "controllers.json");

export default function listenMapController(
  gameController: GameController
): Promise<void> {
  console.log("pairing with controller " + gameController.meta.product);

  gameController.listen().paramIdle().then(() => {
    console.log("paired with controller")
  })

  return mapController(gameController)
    .then(readControllerFile)
    .then((controllerFile) => {
      const vendorId = this.gameController.meta.vendorId
      const productId = this.gameController.meta.productId
      const vendors = controllerFile[vendorId] = controllerFile[vendorId] || {}

      vendors[productId] = vendors[productId] || {}
      vendors[productId].meta = this.gameController.meta
      vendors[productId].map = this.gameController.map

      return controllerFile
    })
    .then(saveControllerFile)
    .finally(() => this.gameController.close())
}

async function saveControllerFile(controllerFile: any): Promise<void> {
  return new Promise((res) => {
    fs.writeFileSync(controllersFilePath, JSON.stringify(controllerFile, null, 2));
    console.log("saved controllerFile");
    res();
  });
}

function readControllerFile() {
  return new Promise((res) => {
    const file = fs.readFileSync(controllersFilePath).toString()
    res(JSON.parse(file));
  }).catch((err: Error) => ({}))
}
