class ExampleApplication extends Zzeact.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick() {
    console.log(this)
  }
  render() {
    return Zzeact.createElement('p', { onClick: this.handleClick }, 'Click me.')
  }
}

ZzeactDOM.render(
  Zzeact.createElement(ExampleApplication),
  document.getElementById('container')
)
