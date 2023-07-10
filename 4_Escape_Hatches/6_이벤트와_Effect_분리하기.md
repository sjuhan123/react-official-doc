# 이벤트와 Effect 분리하기

이벤트 핸들러는 같은 상호 작용을 다시 수행할 때만 다시 실행된다. 이벤트 핸들러와 달리, Effect는 prop 또는 state 변수와 같은 일부 값을 마지막 렌더링 때 다른 값으로 읽게 되면 다시 동기화된다.

## 이벤트 핸들러와 Effect 중 선택하기

이벤트 핸들러와 Effects 중 어떤 것을 사용해야 할지는 **코드가 실행되어야하는 이유**를 생각해야 된다.

### 이벤트 핸들러는 특정 상호 작용에 대한 응답으로 실행된다.

### Effect는 동기화가 필요할 때마다 실행된다.

### 반응형 값 및 반응형 로직

이벤트 핸들러는 버튼을 클릭하는 등 '수동'으로 촉발시킨다. 반면에 Effect는 '자동'으로 동기화 상태를 유지하는 데 필요한 만큼 자주 다시 실행된다.

컴포넌트 본문 내부에 선언된 props, state, 변수를 반응형 값이라고 한다.

### Effect 내부의 로직은 반응형입니다.

### Effect에서 비반응형 로직 추출하기.

```js
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    return () => {
      connection.disconnect()
    };
  }, [roomId, theme]);
```

Effect에서 읽는 모든 반응형 값은 의존성으로 선언해야 된다. `theme`도 반응형 값이므로, Effect의 의존성으로 지정해야 된다.

하지만 위 예제의 경우 theme도 의존성이기 때문에 dark 테마와 light 테마 사이를 전환할 때 마다 채팅이 또다시 연결된다.

```js
// ...
showNotification('Connected!', theme);
// ...
```

위 비반응형 로직을 주변의 반응형 Effect로부터 분리할 수 있는 방법이 필요하다.

### Effect Event 선언하기.

비반응형 로직을 Effect에서 추출하려면 `useEffectEvent`라는 특수 Hook을 사용합니다.

```js
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

### Effect Event로 최신 props 및 state 읽기

```js
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onVisit = useEffectEvent(visitedUrl => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // ✅ All dependencies declared
  // ...
}
```

`onVisit`는 Effect Event다. 그 안의 코드는 반응형이 아니다.  
반면에 Effect 자체는 반응형으로 유지된다. Effect 내부의 코드는 url prop을 사용하므로, Effect는 다른 url로 다시 렌더링할 때마다 다시 실행된다. 그러나 `numberOfItems`가 자체적으로 변경되면 코드가 다시 실행되지 않는다.

### Effect Event의 제한사항

- Effect 내부에서만 호출할 수 있다.
- 다른 컴포넌트나 Hook에 전달하면 안된다.

Effect Eventsms는 Effect 코드의 비반응형 "조각"이다. Effect Event는 이를 사용하는 Effect 옆에 있어야 한다.





