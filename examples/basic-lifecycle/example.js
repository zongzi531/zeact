class ExampleApplication extends Zzeact.Component {
  constructor(props) {
    super(props)
    console.log(this, 'constructor')
  }
  componentDidMount() {
    console.log(this, 'componentDidMount')
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(this, prevProps, prevState, snapshot, 'componentDidUpdate')
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log(this, nextProps, nextState, 'shouldComponentUpdate')
  }
  static getDerivedStateFromProps(props, state) {
    console.log(this, props, state, 'getDerivedStateFromProps')
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log(this, prevProps, prevState, 'getSnapshotBeforeUpdate')
  }
  static getDerivedStateFromError(error) {
    console.log(this, error, 'getDerivedStateFromError')
  }
  componentDidCatch(error, info) {
    console.log(this, error, info, 'componentDidCatch')
  }
  componentWillUnmount() {
    console.log(this, 'componentWillUnmount')
  }
  render() {
    return Zzeact.createElement('p', null, 'LifeCycle will unmount at 3s late.')
  }
}

ZzeactDOM.render(
  Zzeact.createElement(ExampleApplication),
  document.getElementById('container')
)

setTimeout(() => {
  ZzeactDOM.unmountComponentAtNode(document.getElementById('container'))
}, 3000)
