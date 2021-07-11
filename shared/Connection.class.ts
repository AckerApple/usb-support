import { Subject, Subscription } from 'rxjs'

export class Connection {
  retryInterval: number = 100

  $connect: Subject<void>  = new Subject()
  $connected: Subject<void>  = new Subject()
  $down: Subject<Error> = new Subject()
  $closed: Subject<void>  = new Subject()
  $failed: Subject<void>  = new Subject()

  subs: Subscription = new Subscription()
  private restartProcessId: any

  constructor() {
    this.subs.add(
      this.$connected.subscribe(() => {
        clearInterval(this.restartProcessId)
        this.restartProcessId = 0
      })
    )

    this.subs.add(
      this.$down.subscribe(() =>
        this.connect()
      )
    )
  }

  close() {
    this.subs.unsubscribe()
  }

  connect(): Connection {
    // console.log('check to restart', this.retryInterval)
    if (this.restartProcessId) {
      return this
    }

    this.restartProcessId = setInterval(() => {
      try {
        this.$connect.next()
      } catch (err) {
        // console.error('error reconnecting to usb control', err.message)
      }
    }, this.retryInterval)

    return this
  }
}