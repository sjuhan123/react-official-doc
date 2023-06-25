# 반응형 Effect의 생명주기

Effect는 컴포넌트와 다른 생명주기를 가진다. 컴포넌트는 마운트, 업데이트 또는 마운트 해제할 수 있다. **Effect는 동기화를 시작하고 나중에 동기화를 중지하는 두 가지 작업만 할 수 있다**. 이 사이클은 시간이 지남에 따라 변하는 props와 state에 의존하는 Effect의 경우 여러 번 발생할 수 있다. React는 Effect의 의존성을 올바르게 지정했는지 확인하는 린터 규칙을 제공한다. 이렇게 하면 Effect가 최신 props와 state에 동기화된다.

## Effect의 생명주기

```js
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

예시. roomId가 "general"에서 "travel"로 변경 됐을 때.  
  
1. Effect가 "general" 방에 연결됨
2. Effect가 "general" 방과 연결이 끊어지고, "travel" 방에 연결됨

이는,

1. Effect가 "general" 방에 연결됨 (연결이 끊어질 때까지)
2. Effect가 "travel" 방에 연결됨 (연결이 끊어질 때까지)

## React가 Effect의 재동기화 필요성을 인식하는 방법

1. roomId는 prop이므로 시간이 지남에 따라 변경될 수 있다는 것을 알고 있다.
2. Effect가 roomId를 읽는다는 것을 알았습니다.(따라서 해당 로직은 나중에 변경될 수 있는 값에 따라 달라집니다.)
3. 이 때문에 Effect의 의존성으로 지정했습니다.

초기 렌더링 중에 ["general"]을 전달했고 나중에 다음 렌더링 중에 ["travel"]을 전달한 경우, React는 "general"과 "travel"을 비교합니다. 이 값은 (Object.is와 비교했을 때) 다른 값이기 때문에 React는 Effect를 다시 동기화할 것입니다. 반면 컴포넌트가 다시 렌더링될 때 roomId가 변경되어있지 않은 경우 Effect는 동일한 방에 연결된 상태로 유지됩니다.

## 각각의 Effect는 별도의 동기화 프로세스를 나타냅니다.

```js
function ChatRoom({ roomId }) {
  useEffect(() => {
    logVisit(roomId); // 코드 추가
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

나중에 이 Effect에 연결을 다시 설정해야 하는 다른 의존성을 추가한다고 가정해보자. 그럼 이 Effect가 다시 동기화되면 의도하지 않은 동일한 방에 대해 `logVisit()`도 호출하게 된다. 방문을 기록하는 것은 연결과는 별게의 포르세스다. 그렇기 때문에 두 개의 개별 Effect로 작성해야 한다.

```js
function ChatRoom({ roomId }) {
  useEffect(() => {
    logVisit(roomId);
  }, [roomId]);

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    // ...
  }, [roomId]);
  // ...
}
```

- 코드의 각 Effect는 별도의 독립적인 동기화 프로세스를 나타내야 한다.

- 한 Effect를 삭제해도 다른 Effect의 로직이 깨지지 않는다. 서로 다른 것을 동기화 하므로 분리하는 것이 합리적이라는 것을 나타낸다.

- 단, 일관된 로직을 별도의 Effect로 분리하면 코드가 "더 깔끔해" 보일 수 있지만 유지 관리가 더 여려워 진다.

- 따라서 코드가 더 깔끔해 보이는지 여부가 아니라 프로세스가 동일한지 또는 분리되어 있는지를 고려해야 한다.

### :round_pushpin: DEEP DIVE. 전역 또는 변이 가능한 값이 의존성이 될 수 있나요?

변이 가능한 값(전역 변수 포함)은 반응하지 않는다.  
  
- location.pathname과 같은 변이 가능한 값은 의존성이 될 수 없다. 이 값은 변이 가능하므로 React 렌더링 데이터 흐름 외부에서 언제든지 값이 바뀔 수 있다. 이 값을 변경해도 컴포넌트가 다시 렌더링 되지 않는다. 

- 렌더링 도중(의존성을 계산할 때) 변경 가능한 데이터를 읽는 것은 **렌더링의 순수성**을 깨뜨리기 때문에 React의 규칙을 위반한다. 대신 **useSyncExternalStore**를 사용하여 외부 변경 가능한 값을 읽고 구독해야 한다.

- 린터는 이러한 문제를 자동으로 확인해 준다.

### 재동기화를 원치 않는 경우엔 어떻게 해야 하나요?

의존성에 넣은 값들이 반응형 값이 아니라는 것, 즉 리렌더링의 결과로 변경될 수 없다는 것을 린터에 "증명"할 수 있다.

- 외부에 상수화 하기 -> 절대 변하지 않는다.
- Effect 내부에 해당 변수 선언하기 -> 렌더링 중에 계산되지 않으므로 반응하지 않는다.

**Effect는 반응형 코드 블록**이다. 내부에서 읽는 값이 변경되면 다시 동기화된다. 상호작용당 한 번만 실행되는 이벤트 핸들러와 달리 Effect는 동기화가 필요할 때마다 실행된다.

- Effect가 **독립적인 동기화 프로세스**를 나타내는지 확인하자. Effect가 아무것도 동기화하지 않는다면, 불필요한 것일 수 있다. 여러 개의 독립적인 것을 동기화하는 경우 분할하자.

- 객체와 함수를 의존성으로 사용하지 마세요. 렌더링 중에 오브젝트와 함수를 생성한 다음 Effect에서 읽으면 렌더링할 때마다 오브젝트와 함수가 달라진다. 그러면 매번 Effect를 다시 동기화해야 한다.