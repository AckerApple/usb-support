import delayLog from "../../../shared/delayLog.function";
import { Subject, Subscription } from "rxjs";
import { GameControlEvents } from "../../../shared/GameControlEvents";

export default function mapController(
  gameController: GameControlEvents
): Promise<void> {
  return new Promise(res => () => {
    const subs = new Subscription()
    const gcChangeListener = new GameControlChangeListener(gameController)

    this.subs.add(
      gameController.notIdle.subscribe(() => gcChangeListener.handler()),
      gcChangeListener.completed.subscribe(() => {
        subs.unsubscribe()
        res()
      })
    )

    gcChangeListener.askForButton()
  })
}

class GameControlChangeListener {
  completed: Subject<void> = new Subject()

  constructor(public gameController: GameControlEvents) {}

  getNextQuestion() {
    return Object.keys(this.gameController.map).find(
      (key) => this.gameController.map[key] === null
    )
  }

  askForButton() {
    const key = this.getNextQuestion();
    delayLog("\x1b[36mPush the " + key + " key\x1b[0m");
  }

  // listener from button press
  handler (): Promise<void> {
    const data = this.gameController.lastData
    const key = this.getNextQuestion()
    const diffs = this.gameController.filterIdleDifferences(data)
    const diffKeys = Object.keys(diffs)
    const map = this.gameController.map

    if (diffKeys.length === 0) {
      return;
    } else if (diffKeys.length > 1) {
      console.log("multiple buttons activated");
    } else {
      const pos = Number(diffKeys[0])
      const value = diffs[diffKeys[0]]
      const alreadySet = Object.keys(map).find((key) =>
        map[key] && map[key].pos === pos && map[key].value === value
      );

      if (alreadySet) {
        console.log("Key already set: " + alreadySet, { pos, value });
      } else {
        this.gameController.map[key] = {
          pos, value, idle: this.gameController.idle[pos], updatedAt: Date.now()
        }
        // console.log(gameController.map);
        console.log("SAVED KEY: " + key + " as ", { pos, value })
      }
    }

    console.log();

    if (this.getNextQuestion()) {
      this.askForButton()
    } else {
      console.log("Buttons mapped", this.gameController.map);
      this.completed.next()
    }
  }
}