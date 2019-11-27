class ExampleApplication extends Zzeact.Component {
  render() {
    return Zzeact.createElement('div', null, Zzeact.createElement('p', null, 'I will auto unmount.'))
  }
}

ZzeactDOM.render(
  Zzeact.createElement(ExampleApplication),
  document.getElementById('container')
)

ZzeactDOM.unmountComponentAtNode(document.getElementById('container'))
