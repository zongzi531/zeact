class ExampleApplication extends Zzeact.Component {
  render() {
    const elapsed = Math.round(this.props.elapsed / 100)
    const seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0')
    const message = 'Zzeact has been successfully running for ' + seconds + ' seconds.'
    const style = { margin: 0, fontSize: 16, color: 'red' }
    return Zzeact.createElement('div', { style }, Zzeact.createElement('p', null, message));
  }
}
const start = new Date().getTime()
const debug = setInterval(() => {
  clearInterval(debug)
  ZzeactDOM.render(
    Zzeact.createElement(ExampleApplication, { elapsed: new Date().getTime() - start }),
    document.getElementById('container')
  )
}, 50)
