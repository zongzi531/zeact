class ExampleApplication extends Zzeact.Component {
  render() {
    return Zzeact.createElement('div', null, Zzeact.createElement('p', {
      onClick: function onClick() {
        return console.log('onClick!')
      },
      onClickCapture: function onClickCapture() {
        return console.log('onClickCapture!')
      }
    }, 'Click me.'), Zzeact.createElement('p', {
      onClick: function onClick() {
        return console.log('outside onClick!')
      },
      onClickCapture: function onClickCapture() {
        return console.log('outside onClickCapture!')
      }
    }, Zzeact.createElement('p', {
      onClick: function onClick() {
        return console.log('inside onClick!')
      },
      onClickCapture: function onClickCapture() {
        return console.log('inside onClickCapture!')
      }
    }, 'Click me Capture to Bubble.')), Zzeact.createElement('p', {
      onDoubleClick: function onDoubleClick() {
        return console.log('onDoubleClick!')
      },
      onDoubleClickCapture: function onDoubleClickCapture() {
        return console.log('onDoubleClickCapture!')
      }
    }, 'Double Click me.'), Zzeact.createElement('div', null, Zzeact.createElement('input', {
      onFocus: function onFocus() {
        return console.log('onFocus!')
      },
      onFocusCapture: function onFocusCapture() {
        return console.log('onFocusCapture!')
      },
      onBlur: function onBlur() {
        return console.log('onBlur!')
      },
      onBlurCapture: function onBlurCapture() {
        return console.log('onBlurCapture!')
      },
      onKeyDown: function onKeyDown() {
        return console.log('onKeyDown!')
      },
      onKeyDownCapture: function onKeyDownCapture() {
        return console.log('onKeyDownCapture!')
      },
      onKeyPress: function onKeyPress() {
        return console.log('onKeyPress!')
      },
      onKeyPressCapture: function onKeyPressCapture() {
        return console.log('onKeyPressCapture!')
      },
      onKeyUp: function onKeyUp() {
        return console.log('onKeyUp!')
      },
      onKeyUpCapture: function onKeyUpCapture() {
        return console.log('onKeyUpCapture!')
      },
      placeholder: 'Edit me.'
    })), Zzeact.createElement('div', null, Zzeact.createElement('input', {
      onChange: function onChange() {
        return console.log('onChange!')
      },
      onChangeCapture: function onChangeCapture() {
        return console.log('onChangeCapture!')
      },
      type: 'checkbox'
    }), 'Change me.'), Zzeact.createElement('div', {
      onMouseDown: function onMouseDown() {
        return console.log('onMouseDown!')
      },
      onMouseDownCapture: function onMouseDownCapture() {
        return console.log('onMouseDownCapture!')
      },
      onMouseUp: function onMouseUp() {
        return console.log('onMouseUp!')
      },
      onMouseUpCapture: function onMouseUpCapture() {
        return console.log('onMouseUpCapture!')
      },
      onMouseWheel: function onMouseWheel() {
        return console.log('onMouseWheel!')
      },
      onMouseWheelCapture: function onMouseWheelCapture() {
        return console.log('onMouseWheelCapture!')
      },
      onMouseMove: function onMouseMove() {
        return console.log('onMouseMove!')
      },
      onMouseMoveCapture: function onMouseMoveCapture() {
        return console.log('onMouseMoveCapture!')
      },
      style: {
        width: 100,
        height: 100,
        background: '#000',
        color: '#fff'
      }
    }, 'Come on!'))
  }
}

ZzeactDOM.render(
  Zzeact.createElement(ExampleApplication),
  document.getElementById('container')
)
