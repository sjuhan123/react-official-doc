# Effect와 동기화하기

## Effect란 무엇이며 이벤트와는 어떤게 다른가요? 

Effect를 사용하면 특정 이벤트가 아닌 렌더링 자체로 인해 발생하는 사이드 이펙트를 명시할 수 있다.

## Effect 작성 방법

### Effect를 선언

- 컴포넌트가 렌더링될 때마다 React는 화면을 업데이트하고 useEffect 내부의 코드를 실행한다. 즉, useEffect는 해당 렌더링이 화면에 반영이 될 때 까지 코드 조각의 실행을 "지연"한다.

- 렌더링 중에 DOM 노드 수정과 같은 사이드 이펙트를 포함해서는 안된다. 대신 사이드 이팩트를 useEffect로 감싸 렌더링 계산 밖으로 옮기면 된다.

- Effect는 보통 컴포넌트를 외부 시스템과 동기화해야 된다. 외부 시스템이 없고 다른 state를 기반으로 일부 state만 조정하려는 경우 Effect가 필요하지 않을 수도 있다.

### Effect의 의존성을 명시

- 의존성 배열은 여러 개의 의존성을 포함할 수 있다. React는 지정한 모든 의존성의 값이 이전 렌더링 때와 정확히 동일한 경우에만 Effect의 재실행을 건너뛴다. React는 `Object.is` 비교를 사용해 의존성 값을 비교한다.

### :round_pushpin: DEEP DIVE. 의존성 배열에서 ref가 생략된 이유는 무엇인가요?

- ref 객체는 **안정적인 정체성**을 가지고 있기 때문이다. React는 렌더링할 떄마다 동일한 useRef 호출에서 **항상 동일한 객체를 얻을 수 있도록** 보장한다. 절대 변하지 않기 때문에 그 자체로 Effect가 다시 실행되지 않는다.(부모 컴포넌트에서 ref가 전달되는 경우 의존성 배열에 지정해야 된다.)

- useState가 반환하는 set 함수도 안정된 정체성을 가지므로 의존성에서 생략되는 경우가 많다.

### 필요한 경우 클린업을 추가

예시.

```js
import { useEffect } from 'react';
import { createConnection } from './chat.js';

export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();
  }, []);
  return <h1>Welcome to the chat!</h1>;
}

// Console (2)
// ✅ Connecting...
// ✅ Connecting...
```

사용자가 ChatRoom 페이지에서 다른 페이지 이동 후 다시 ChatRoom 페이지로 돌아오면, 두번째 연결은 설정되지만 첫 번째 연결이 없어지지 않는다.  
  
이를 해결하기 위해 Effect에서 **클린업 함수**를 반환하면 된다.

React는 Effect가 다시 실행되기 전에 **매번 클린업 함수**를 호출하고, 컴포넌트가 마운트 해제될 때 마지막으로 한 번 더 호출한다.

> 동작 예상: 컴포넌트 렌더링 -> useEffect 내부 코드 실행 -> 클린업 함수 호출(개발 모드에서 컴포넌트가 재실행 되기 전에) -> 개발모드로 인해 Effect 재실행.  
> 컴포넌트 마운트 해제 될 때 Effect 클린업 함수 호출

## 개발 환경에서 두 번씩 실행되는 Effect를 처리하는 방법?

신경써야될 case들 소개.

### React가 아닌 위젯 제어

### 이벤트 구독

### 애니메이션 촉발

### Fetching data

```js
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

만약 `userId`가 Alice에서 Bob으로 변경되면 클린업은 Alice 응답이 Bob 이후에 도착하더라도 이를 무시한다.

### :round_pushpin: DEEP DIVE. Effect에서 데이터를 페칭하는 것의 대안은 무엇일까?

- Effects는 서버에서 실행되지 않는다. 초기 서버에서 렌더링되는 HTML에는 데이터가 없는 로딩 state만 포함된다. 클라인트 컴퓨터는 JS를 다운로드하고 **앱을 렌더링하고 나서야 비로서 데이터를 로드**해야 해서 비효율적.

- Effect에서 직접 페치하면 **네트워크 워터폴**이 만들어지기 쉽다. 상위 컴포넌트를 렌더링 -> 상위컴포넌트 페치 실행 -> 하위 컴포넌트 렌더링 -> 하위 컴포넌트 페치 실행되서 모든 데이터를 병렬로 페치하는 것보다 훨씬 느려진다.

- Effect에서 직접 페치하는 것은 일반적으로 **데이터를 미리 로드하거나 캐시하지 않음**을 의미한다. 이것은 전혀 인체공학적이지 않다. **조건 경합**과 같은 버그가 발생하지 않는 방식으로 Fetch를 작성하기 위해서는 꽤 많은 사용구 코드가 필요하다.([조건 경합?](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect) **다시 공부할 때 정독하자.**)

### Sending analytics

```js
useEffect(() => {
  logVisit(url); // Sends a POST request
}, [url]);
```

개발 환경에서는 모든 URL에 대해 logVisit가 두 번 호출되므로 이를 수정하고 싶을 수 지만, 이 코드를 그대로 유지하는 것이 좋다.  
  
전송하는 분석 이벤트를 디버깅하려면 앱을 스테이징 환경(상용 모드에서 실행)에 배포하거나, Strict Mode 및 개발 전용의 중복 마운트 검사를 일시적으로 해체할 수 있다. Effect 대신 경로 변경 이벤트 핸들러에서 분석을 전송할 수도 있다. 보다 정확한 분석을 위해서는 **intersection observers**를 활용하면 어떤 컴포넌트가 있고 얼마나 오래 표시되는지를 추적하는 데 도움이 될 수 있다.

### Effect가 아님: 애플리케이션 초기화하기

```js
if (typeof window !== 'undefined') { // Check if we're running in the browser.
                                     // 실행환경이 브라우저인지 여부 확인
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

### Effect가 아님: 제품 구매하기.

```js
function handleClick() {
  // ✅ Buying is an event because it is caused by a particular interaction.
  // ✅ 구매는 특정 상호작용으로 인해 발생하므로 이벤트입니다.
  fetch('/api/buy', { method: 'POST' });
}
```
