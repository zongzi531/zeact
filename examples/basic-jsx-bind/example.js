/** @jsx Zzeact.DOM */
const ExampleApplication = Zzeact.createClass({
  handleClick: Zzeact.autoBind(function() {
   console.log(this)
  }),
  render: function () {
    return <p onClick={this.handleClick}>Click me.</p>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)
