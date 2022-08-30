import {reactive} from 'vue'
import Sock   from './sock.js'
import util   from './util.js'
import Cookie from './cookie.js'

const default_peer = '127.0.0.1'
const default_port = 7396
const api_url      = 'https://api.foldingathome.org'


class Client extends Sock {
  constructor(address = default_peer, ...args) {
    let _address = address
    if (!address.match(/.*:\d+/)) _address += ':' + default_port

    super('ws://' + _address + '/api/websocket', ...args)

    this.state = reactive({
      address,
      connected: false,
      log_enabled: false,
      viz_unit: undefined,
      stats: new Cookie().get('stats', {}),
      data: {}
    })

    this.connect()
  }


  on_open() {
    this.first = true
    this.state.connected = true
  }


  on_close(event) {this.state.connected = false}


  on_message(msg) {
    console.debug(this.state.address + ':', msg)

    if (this.first) {
      this.state.data = msg
      this._update()

    } else util.update(this.state.data, msg)

    this.first = false
  }


  _update() {
    this.update_stats()
    if (this.viz_unit)    this._send_viz_enable()
    if (this.log_enabled) this._send_log_enable()
  }


  paused() {
    if (!this.state.data.config) return false
    return this.state.data.config.paused
  }


  fold()            {this.send({cmd: 'unpause'})}
  finish()          {this.send({cmd: 'finish'})}
  pause()           {this.send({cmd: 'pause'})}
  dump(unit)        {this.send({cmd: 'dump', unit})}
  configure(config) {this.send({cmd: 'config', config})}


  viz_get_frames() {
    let unit = this.viz_unit
    if (unit && this.state.data.viz && this.state.data.viz[unit])
      return this.state.data.viz[unit].frames.length
  }


  _send_viz_enable() {
    if (!this.connected) return
    const unit   = this.viz_unit
    const frames = this.viz_get_frames()
    this.send({cmd: 'viz', unit, frames})
  }


  visualize_unit(unit) {
    if (this.viz_unit == unit) return
    this.viz_unit = unit || undefined
    this._send_viz_enable()
  }


  _send_log_enable() {
    if (this.connected) this.send({cmd: 'log', enable: this.log_enabled})
  }


  log_enable(enable) {
    if (this.log_enabled == enable) return
    this.log_enabled = enable
    this._send_log_enable()
  }


  update_stats() {
    // TODO update stats periodically

    let {user, team, passkey} = this.state.data.config
    if (!user) return

    let url = api_url + `/user/${user}/stats?team=${team}`
    if (passkey) url += `&${passkey}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        let config = this.state.data.config

        if (user == config.user && team == config.team &&
            passkey == config.passkey) {
          this.state.stats = data
          new Cookie().set('stats', data)
        }
      })
  }
}

export default Client
