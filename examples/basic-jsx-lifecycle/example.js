/** @jsx Zzeact.DOM */
const ExampleApplication = Zzeact.createClass({
  componentWillMount () {
    console.log(this, 'componentWillMount')
  },
  componentDidMount () {
    console.log(this, 'componentDidMount')
  },
  componentWillUnmount () {
    console.log(this, 'componentWillUnmount')
  },
  render: function () {
    return <p>LifeCycle will unmount at 3s late.</p>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)

setTimeout(() => {
  Zzeact.unmountAndReleaseZzeactRootNode(document.getElementById('container'))
}, 3000);
