/** @jsx Zzeact.DOM */
const ExampleApplication = Zzeact.createClass({
  render: function () {
    return <p onClick={() => console.log('CLICK!')}>Click me.</p>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)
