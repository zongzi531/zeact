# Zzeact

Zzeact is a JavaScript library to learn the source code of React.

## Todo

- [ ] DOM render *in progress*
- [ ] Event
- [ ] LifeCycle
- [ ] React Components
- [ ] Components Update
- [ ] JSX

## Install

```bash
$ yarn add zzeact
#or
$ npm install zzeact --save
```

## Quick Start

```javascript
var Examples = Zzeact.createClass({
  render: () => Zzeact.DOM.p(
    {
      style: {
        margin: 0,
        fontSize: 16,
        color: 'red'
      }
    },
    'Zzeact is rendered'
  )
})

Zzeact.renderComponent(
  Examples(null, 'children'),
  document.getElementById('container')
)
```

Or, you can see [examples](https://github.com/zongzi531/zzeact/tree/master/examples).

## License

[MIT](https://github.com/zongzi531/zzeact/blob/master/LICENSE)
