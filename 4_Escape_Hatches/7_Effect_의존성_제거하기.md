# Effect 의존성 제거하기

## 의존성은 코드와 일치해야 한다.

### 의존성을 제거하려면 의존성이 아님을 증명하세요.

### 의존성을 변경하려면 코드를 변경하세요.

1. 먼저 Effect의 코드 또는 반응형 값 선언 방식을 변경한다.
2. 그런 다음, 변경한 코드에 맞게 의존성을 조정한다.
3. 의존성 목록이 마음에 들지 않으면 첫 번째 단계로 돌아가서 코드를 다시 변경한다.

## 불필요한 의존성 제거하기

- 다른 조건에서 Effect의 다른 부분을 다시 실행하고 싶을 수도 있다.
- 일부 의존성의 변경에 "반응"하지 않고 "최신 값"만 읽고 싶을 수도 있다.
- 의존성은 객체나 함수이기 때문에 의도치 않게 너무 자주 변경될 수 있다.

### 이 코드를 이벤트 핸들러로 옮겨야 하나요?

### Effect가 여러 관련 없는 일을 하고 있나요?

### 다음 state를 계산하기 위해 어떤 state를 읽고 있나요?

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages([...messages, receivedMessage]);
    });
    return () => connection.disconnect();
  }, [roomId, messages]); // ✅ All dependencies declared
  // ...
```

messages 변수를 사용하여 모든 기존 메시지로 시작하는 새 배열을 생성하고 마지막에 새 메시지를 추가합니다. 하지만 messages는 Effect에서 읽는 반응형 값이므로 의존성이어야 합니다.

근데 messages를 의존성으로 만들면 문제가 발생한다.

메시지를 수신할 때마다 `setMessages()`는 컴포넌트가 수신된 메시지를 포함하는 새 messages 배열로 리렌더링하도록 한다. 하지만 이 Effect는 이제 messages에 따라 달라지므로 Effect도 다시 동기화된다. 따라서 새 메시지가 올 때마다 채팅이 다시 연결된다.

이 문제를 해결하려면 Effect 내에서 messages를 읽으면 안된다. 대신 업데이터 함수를 `setMessages`에 전달하면 된다.

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages(msgs => [...msgs, receivedMessage]);
    });
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
```

- Effect가 messages 변수를 전혀 읽지 않는다.
- React는 업데이터 함수를 대기열에 넣고 다음 렌더링 중에 msgs 인수를 제공한다.

### 값의 변경에 '반응'하지 않고 값을 읽고 싶으신가요?

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages(msgs => [...msgs, receivedMessage]);
      if (!isMuted) {
        playSound();
      }
    });
    return () => connection.disconnect();
  }, [roomId, isMuted]);
```

isMuted가 변경될 때마다 Effect가 다시 동기화되고 채팅에 다시 연결된다.  
  
이 문제를 해결하려면 Effect에서 반응해서는 안 되는 로직을 추출해야 한다. 이 비반응 로직을 Effect Event로 옮기면 된다.

```js
import { useState, useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const onMessage = useEffectEvent(receivedMessage => {
    setMessages(msgs => [...msgs, receivedMessage]);
    if (!isMuted) {
      playSound();
    }
  });

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      onMessage(receivedMessage);
    });
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

## 일부 반응형 값이 의도치 않게 변경되나요?

```js
function ChatRoom({ roomId }) {
  // ...
  const options = {
    serverUrl: serverUrl,
    roomId: roomId
  };

useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
}, [options]);
```

`ChatRoom` 컴포넌트를 리렌더링할 때마다 새로운 `options` 객체가 처음부터 새로 생성됩니다. React는 `options` 객체가 마지막 렌더링 중에 생성된 `options` 객체와 **다른 객체**로 인식합니다. 그렇기 때문에 Effect를 다시 동기화하고 사용자가 입력할 때 채팅이 다시 연결된다.

이 문제는 객체와 함수에만 영향을 줍니다. Javascript에서는 새로 생성된 객체와 함수가 다른 모든 객체와 구별되는 것으로 간주 됩니다. 그 안의 내용이 동일할 수 있다는 것은 중요하지 않습니다.

```js
// During the first render
const options1 = { serverUrl: 'https://localhost:1234', roomId: 'music' };

// During the next render
const options2 = { serverUrl: 'https://localhost:1234', roomId: 'music' };

// These are two different objects!
console.log(Object.is(options1, options2)); // false
```

**객체 및 함수 의존성**으로 인해 Effect가 필요 이상으로 자주 재동기화될 수 있습니다.

그렇기 때문에 가능하면 객체와 함수를 Effect의 의존성으로 사용하지 않는 것이 좋습니다. 대신 컴포넌트 외부나 Effect 내부로 이동하거나 원시 값을 추출해 보세요.

### 정적 객체와 함수를 컴포넌트 외부로 이동

### Effect 내에서 동적 개체 및 함수 이동

### 객체에서 원시 값 읽기

가끔 props에서 객체를 받을 수도 있습니다.

```js
<ChatRoom
  roomId={roomId}
  options={{
    serverUrl: serverUrl,
    roomId: roomId
  }}
/>

function ChatRoom({ options }) {
  const [message, setMessage] = useState('');

  const { roomId, serverUrl } = options;
  useEffect(() => {
    const connection = createConnection({
      roomId: roomId,
      serverUrl: serverUrl
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]); // ✅ All dependencies declared
```

이렇게 하면 부모 컴포넌트가 리렌더링할 때마다 Effect가 다시 연결됩니다. 이 문제를 해결하려면 Effect 외부의 객체에서 정보를 읽고 객체 및 함수 의존성을 피하십시오.