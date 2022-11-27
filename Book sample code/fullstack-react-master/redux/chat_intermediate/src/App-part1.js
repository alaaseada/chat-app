import React from 'react';
import uuid from 'uuid';
import { createStore, combineReducers } from 'redux';

//=================Active thread ID reducer =======//
function activeThreadIdReducer(state = '1-fca2', action) {
  if (action.type === 'ACTIVATE_TAB') {
    return action.id;
  } else {
    return state;
  }
}
//===============Message Reducer ==================//
function MessagesReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      const new_message = {
        text: action.text,
        timestamp: Date.now(),
        id: uuid.v4(),
      };
      return state.concat(new_message);
    case 'DELETE_MESSAGE':
      const new_messages = state.filter(
        (msg_obj) => msg_obj.id !== action.messageId
      );
      return new_messages;
    default:
      return state;
  }
}
//=================Threads reducer =======//
function ThreadsReducer(
  state = [
    {
      id: '1-fca2',
      title: 'Buzz Aldrin',
      messages: MessagesReducer(undefined, {}),
    },
    {
      id: '2-be91',
      title: 'Michael Collins',
      messages: MessagesReducer(undefined, {}),
    },
  ],
  action
) {
  const new_threads = state.map((t) => {
    if (t.id === action.threadId) {
      return { ...t, messages: MessagesReducer(t.messages, action) };
    } else {
      return t;
    }
  });
  return new_threads;
}
//=================Reducer===============//
const reducer = combineReducers({
  activeThreadId: activeThreadIdReducer,
  threads: ThreadsReducer,
});

//=================Create a store===============//
const store = createStore(reducer);

//=================The main component===============//
class App extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const activeThreadId = store.getState().activeThreadId;
    let activeThread;
    const tabs = store.getState().threads.map((t) => {
      if (t.id === activeThreadId) activeThread = t;
      return { title: t.title, id: t.id, active: t.id === activeThreadId };
    });
    return (
      <div className='ui segment'>
        <ThreadTabs tabs={tabs} />
        <Thread thread={activeThread} />
      </div>
    );
  }
}

//=================Thread tabs component===============//
class ThreadTabs extends React.Component {
  activateTab = (e) => {
    const activate_tab_action = {
      type: 'ACTIVATE_TAB',
      id: e.target.id,
    };
    store.dispatch(activate_tab_action);
  };

  render() {
    const tabs = this.props.tabs.map((tab) => {
      return (
        <div
          key={tab.id}
          id={tab.id}
          className={tab.active ? 'active item' : 'item'}
          onClick={this.activateTab}
        >
          {tab.title}
        </div>
      );
    });
    return <div className='ui top attached tabular menu'>{tabs}</div>;
  }
}

//=================Thread component===============//
class Thread extends React.Component {
  render() {
    const { id: threadId, messages } = this.props.thread;
    return (
      <div className='ui segment'>
        <MessageView messages={messages} threadId={threadId} />
        <MessageInput threadId={threadId} />
      </div>
    );
  }
}
//=================Message View component===============//
class MessageView extends React.Component {
  handleClick = (id) => {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      messageId: id,
      threadId: this.props.threadId,
    });
  };

  render() {
    const messages = this.props.messages.map((message) => (
      <div
        className='comment'
        key={message.id}
        onClick={() => this.handleClick(message.id)}
      >
        {message.text} @{message.timestamp}
      </div>
    ));
    return (
      <div className='ui center aligned basic segment'>
        <div className='ui comments'>{messages}</div>
      </div>
    );
  }
}

//=================Message Input component===============//
class MessageInput extends React.Component {
  state = {
    value: '',
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSubmit = () => {
    store.dispatch({
      type: 'ADD_MESSAGE',
      text: this.state.value,
      threadId: this.props.threadId,
    });
    this.setState({
      value: '',
    });
  };

  render() {
    return (
      <div className='ui input'>
        <input onChange={this.onChange} value={this.state.value} type='text' />
        <button
          onClick={this.handleSubmit}
          className='ui primary button'
          type='submit'
        >
          Submit
        </button>
      </div>
    );
  }
}
//=================Export App===============//
export default App;
