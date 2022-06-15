import { Subject, Subscription } from 'rxjs'

export class Connection {
  retryInterval: number = 100

  $connect: Subject<void>  = new Subject() // attempt to connect
  $connected: Subject<void>  = new Subject() // a connection was made
  $down: Subject<Error> = new Subject()
  $closed: Subject<void>  = new Subject()
  $failed: Subject<void>  = new Subject()

  subs: Subscription = new Subscription()
  private restartProcessId: any

  constructor() {
    // when connected stop retry timers
    this.subs.add(
      this.$connected.subscribe(() => {
        clearInterval(this.restartProcessId)
        this.restartProcessId = 0
      })
    )

    // when disconnected, keep trying to reconnect
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
    // already trying to connect?
    if (this.restartProcessId) {
      return this // do not continue to try again
    }

    this.restartProcessId = setInterval(() => {
      this.$connect.next()
    }, this.retryInterval)

    return this
  }
}