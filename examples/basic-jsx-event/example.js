/** @jsx Zzeact.DOM */
const ExampleApplication = Zzeact.createClass({
  render: function () {
    return <div>
      <p
        onClick={() => console.log('onClick!')}
        onClickCapture={() => console.log('onClickCapture!')}>Click me.</p>
      <p
        onClick={() => console.log('outside onClick!')}
        onClickCapture={() => console.log('outside onClickCapture!')}>
        <p
          onClick={() => console.log('inside onClick!')}
          onClickCapture={() => console.log('inside onClickCapture!')}>Click me Capture to Bubble.</p>
      </p>
      <p
        onDoubleClick={() => console.log('onDoubleClick!')}
        onDoubleClickCapture={() => console.log('onDoubleClickCapture!')}>Double Click me.</p>
      <div>
        <input
          onFocus={() => console.log('onFocus!')}
          onFocusCapture={() => console.log('onFocusCapture!')}
          onBlur={() => console.log('onBlur!')}
          onBlurCapture={() => console.log('onBlurCapture!')}
          onKeyDown={() => console.log('onKeyDown!')}
          onKeyDownCapture={() => console.log('onKeyDownCapture!')}
          onKeyPress={() => console.log('onKeyPress!')}
          onKeyPressCapture={() => console.log('onKeyPressCapture!')}
          onKeyUp={() => console.log('onKeyUp!')}
          onKeyUpCapture={() => console.log('onKeyUpCapture!')}
          placeholder="Edit me." />
      </div>
      <div>
        <input
          onChange={() => console.log('onChange!')}
          onChangeCapture={() => console.log('onChangeCapture!')}
          type="checkbox" />Change me.
      </div>
      <div
        onMouseDown={() => console.log('onMouseDown!')}
        onMouseDownCapture={() => console.log('onMouseDownCapture!')}
        onMouseUp={() => console.log('onMouseUp!')}
        onMouseUpCapture={() => console.log('onMouseUpCapture!')}
        onMouseWheel={() => console.log('onMouseWheel!')}
        onMouseWheelCapture={() => console.log('onMouseWheelCapture!')}
        onMouseMove={() => console.log('onMouseMove!')}
        onMouseMoveCapture={() => console.log('onMouseMoveCapture!')}
        style={{
          width: 100,
          height: 100,
          background: '#000',
          color: '#fff',
      }}>Come on!</div>
    </div>
  }
})

Zzeact.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
)
