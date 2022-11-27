import React, { useState } from 'react';
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
function App() {
  return (
    <div className='ui segment'>
      <ThreadTabs />
      <ThreadDisplay />
    </div>
  );
}

//=================Thread tabs component===============//
class ThreadTabs extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  activateTab = (e) => {
    const activate_tab_action = {
      type: 'ACTIVATE_TAB',
      id: e.target.id,
    };
    store.dispatch(activate_tab_action);
  };

  render() {
    const tabs = store.getState().threads.map((t) => {
      return {
        title: t.title,
        id: t.id,
        active: t.id === store.getState().activeThreadId,
      };
    });
    return <Tabs tabs={tabs} onClick={this.activateTab} />;
  }
}

//=================Thread component===============//
class ThreadDisplay extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }
  render() {
    const threadId = store.getState().activeThreadId;
    const performSubmit = (text) => {
      store.dispatch({
        type: 'ADD_MESSAGE',
        text: text,
        threadId: threadId,
      });
    };
    const performDelete = (id) => {
      store.dispatch({
        type: 'DELETE_MESSAGE',
        messageId: id,
        threadId: threadId,
      });
    };
    const getMessages = () => {
      return store.getState().threads.filter((t) => t.id === threadId)[0][
        'messages'
      ];
    };
    return (
      <Thread
        messages={getMessages()}
        onMessageSubmit={performSubmit}
        onMessageClick={performDelete}
      />
    );
  }
}

//================= generic representational component =======//

//----------tabs--------------//
function Tabs(props) {
  const tabs = props.tabs.map((tab) => {
    return (
      <div
        key={tab.id}
        id={tab.id}
        className={tab.active ? 'active item' : 'item'}
        onClick={props.onClick}
      >
        {tab.title}
      </div>
    );
  });
  return <div className='ui top attached tabular menu'>{tabs}</div>;
}

//---------Message list-------//
function MessageList(props) {
  const messages = props.messages.map((message) => (
    <div
      className='comment'
      key={message.id}
      onClick={() => props.onItemClick(message.id)}
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

//--------InputTextSubmit-----//
function InputTextSubmit(props) {
  const [value, setValue] = useState('');
  const handleSubmit = () => {
    props.onSubmit(value);
    setValue('');
  };
  return (
    <div className='ui input'>
      <input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        type='text'
      />
      <button
        onClick={handleSubmit}
        className='ui primary button'
        type='submit'
      >
        Submit
      </button>
    </div>
  );
}

//----------Thread-------------//
function Thread(props) {
  return (
    <div className='ui segment'>
      <MessageList
        messages={props.messages}
        onItemClick={props.onMessageClick}
      />
      <InputTextSubmit onSubmit={props.onMessageSubmit} />
    </div>
  );
}
//=================Export App===============//
export default App;
