/** @jsx Zzeact.DOM */
// 比较奇怪的是不知道为什么之前那个注释反而转换不出来，来自官方示例的坑
const ExampleApplication = Zzeact.createClass({
  render: function () {
    const elapsed = Math.round(this.props.elapsed / 100)
    const seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0')
    const message = 'Zzeact has been successfully running for ' + seconds + ' seconds.'
    const style = { margin: 0, fontSize: 16, color: 'red' }
    return <p style={style}>{message}</p>
  }
})
const start = new Date().getTime()
const debug = setInterval(() => {
  clearInterval(debug)
  Zzeact.renderComponent(
    <ExampleApplication elapsed={new Date().getTime() - start} />,
    document.getElementById('container')
  )
}, 50)
