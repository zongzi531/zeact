/* eslint-disable @typescript-eslint/explicit-function-return-type */
const Utils = {
  uuid(a, b) { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-'); return b },
  pluralize(count, word) {
    return count === 1 ? word : word + 's'
  },
  store(namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data))
    } else {
      const store = localStorage.getItem(namespace)
      return (store && JSON.parse(store)) || []
    }
  }
}

function cx(obj) {
  let s = ''
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue
    }
    if (obj[key]) {
      s += key + ' '
    }
  }
  return s
}

class TodoItem extends Zzeact.Component {
  constructor(props) {
    super(props)
    this.state = { editText: props.todo.title }
  }
  editField = Zzeact.createRef()
  handleSubmit = () => {
    const val = this.state.editText
    if (val) {
      this.props.onSave(val)
      this.setState({ editField: '' })
    }
    return false
  }
  handleEdit = () => {
    this.props.onEdit()
    this.editField.current.focus()
  }
  handleKey = (event) => {
    if (event.nativeEvent.keyCode === 27) {
      this.handleSubmit()
    }
    this.setState({ editText: event.target.value })
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.todo.title !== this.props.todo.title) {
      this.setState({ editText: nextProps.todo.title })
    }
  }
  render() {
    return Zzeact.createElement('li', {
      className: cx({
        completed: this.props.todo.completed,
        editing: this.props.editing
      })
    }, Zzeact.createElement('div', {
      className: 'view'
    }, Zzeact.createElement('input', {
      className: 'toggle',
      type: 'checkbox',
      checked: this.props.todo.completed ? 'checked' : null,
      onChange: this.props.onToggle
    }), Zzeact.createElement('label', {
      onDoubleClick: this.handleEdit
    }, this.props.todo.title), Zzeact.createElement('button', {
      className: 'destroy',
      onClick: this.props.onDestroy
    })), Zzeact.createElement('form', {
      onSubmit: this.handleSubmit
    }, Zzeact.createElement('input', {
      ref: this.editField,
      className: 'edit',
      defaultValue: this.state.editText,
      onBlur: this.handleSubmit,
      onKeyUp: this.handleKey
    }), Zzeact.createElement('input', {
      type: 'submit',
      className: 'submitButton'
    })))
  }
}

class TodoFooter extends Zzeact.Component {
  render() {
    const activeTodoWord = Utils.pluralize(this.props.count, 'todo')
    let clearButton = null

    if (this.props.completedCount > 0) {
      clearButton = Zzeact.createElement('button', {
        className: 'clear-completed',
        onClick: this.props.onClearCompleted
      }, 'Clear completed (', this.props.completedCount, ')')
    }
    return Zzeact.createElement('footer', {
      className: 'footer'
    }, Zzeact.createElement('span', {
      className: 'todo-count'
    }, Zzeact.createElement('strong', null, this.props.count), ' ', activeTodoWord, ' ', 'left'), clearButton)
  }
}

class TodoApp extends Zzeact.Component {
  constructor(props) {
    super(props)
    this.state = {
      todos: Utils.store('react-todos'),
      editing: {}
    }
  }
  newField = Zzeact.createRef()

  handleSubmit = () => {
    const val = this.newField.current.value.trim()
    if (val) {
      const todos = this.state.todos
      const newTodo = {
        id: Utils.uuid(),
        title: val,
        completed: false
      }
      this.setState({ todos: todos.concat([newTodo]) })
      this.newField.current.value = ''
    }
    return false
  }

  toggleAll(event) {
    const checked = event.nativeEvent.target.checked
    this.state.todos.map(function (todo) {
      todo.completed = checked
    })
    this.setState({ todos: this.state.todos })
  }

  toggle(todo) {
    todo.completed = !todo.completed
    this.setState({ todos: this.state.todos })
  }

  destroy(todo) {
    const newTodos = this.state.todos.filter(function (candidate) {
      return candidate.id !== todo.id
    })
    this.setState({ todos: newTodos })
  }

  edit(todo) {
    this.state.todos.map(function (todo) {
      this.state.editing[todo.id] = false
    }.bind(this))
    this.state.editing[todo.id] = true
    this.setState({ editing: this.state.editing })
  }

  save(todo, text) {
    todo.title = text
    this.state.editing[todo.id] = false
    this.setState({ todos: this.state.todos, editing: this.state.editing })
  }

  clearCompleted() {
    const newTodos = this.state.todos.filter(function (todo) {
      return !todo.completed
    })
    this.setState({ todos: newTodos })
  }
  render() {
    Utils.store('react-todos', this.state.todos)
    let footer = null
    let main = null
    const todoItems = this.state.todos.map(function (todo) {
      return Zzeact.createElement(TodoItem, {
        key: todo.id,
        todo: todo,
        onToggle: this.toggle.bind(this, todo),
        onDestroy: this.destroy.bind(this, todo),
        onEdit: this.edit.bind(this, todo),
        editing: this.state.editing[todo.id],
        onSave: this.save.bind(this, todo)
      })
    }.bind(this))

    const activeTodoCount = this.state.todos.filter(function (todo) {
      return !todo.completed
    }).length
    const completedCount = todoItems.length - activeTodoCount
    if (activeTodoCount || completedCount) {
      footer = Zzeact.createElement(TodoFooter, {
        count: activeTodoCount,
        completedCount: completedCount,
        onClearCompleted: this.clearCompleted.bind(this)
      })
    }

    if (todoItems.length) {
      main = Zzeact.createElement('section', {
        className: 'main'
      }, Zzeact.createElement('input', {
        className: 'toggle-all',
        type: 'checkbox',
        onChange: this.toggleAll.bind(this)
      }), Zzeact.createElement('label', {
        className: 'toggle-all-label'
      }, 'Mark all as complete'), Zzeact.createElement('ul', {
        className: 'todo-list'
      }, todoItems))
    }

    return Zzeact.createElement('div', null, Zzeact.createElement('section', {
      className: 'todoapp'
    }, Zzeact.createElement('header', {
      className: 'header'
    }, Zzeact.createElement('h1', null, 'todos'), Zzeact.createElement('form', {
      onSubmit: this.handleSubmit
    }, Zzeact.createElement('input', {
      ref: this.newField,
      className: 'new-todo',
      placeholder: 'What needs to be done?',
      autoFocus: 'autofocus'
    }), Zzeact.createElement('input', {
      type: 'submit',
      className: 'submitButton'
    }))), main, footer), Zzeact.createElement('footer', {
      className: 'info'
    }, Zzeact.createElement('p', null, 'Double-click to edit a todo'), Zzeact.createElement('p', null, 'Created by', ' ', Zzeact.createElement('a', {
      href: 'http://github.com/petehunt/'
    }, 'petehunt')), Zzeact.createElement('p', null, 'Part of', ' ', Zzeact.createElement('a', {
      href: 'http://todomvc.com'
    }, 'TodoMVC'))))
  }
}

ZzeactDOM.render(
  Zzeact.createElement(TodoApp),
  document.getElementById('todoapp')
)

// Some benchmarking that requires either a custom build of Zzeact or more
// modules exposed from Zzeact.*
// var initTime = ZzeactMount.totalInstantiationTime + ZzeactMount.totalInjectionTime;
// var benchmark = document.getElementById('benchmark');
// setInterval(function() {
//   benchmark.innerHTML = (
//     'Init render time = ' + initTime + 'ms' +
//     '<br />' +
//     'Post-init render time = ' + (ZzeactMount.totalInstantiationTime + ZzeactMount.totalInjectionTime - initTime) + 'ms'
//   );
// }, 1000);
