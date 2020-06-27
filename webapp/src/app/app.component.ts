import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webapp';

  constructor() {
    const url = 'ws://localhost:8080'
    const connection = new WebSocket(url)

    connection.onopen = () => {
      connection.send('Message From Client')
    }

    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`)
    }

    connection.onmessage = (e) => {
      console.log("client got message:", e.data)
    }
  }
}
