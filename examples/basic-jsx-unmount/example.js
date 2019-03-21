/** @jsx Zzeact.DOM */
const ExampleApplication = Zzeact.createClass({
  render: function () {
    return <div><p>I will auto unmount.</p></div>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)

Zzeact.unmountAndReleaseZzeactRootNode(document.getElementById('container'))
