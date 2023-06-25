# Effect가 필요하지 않을 수도 있습니다.

## 불필요한 Effect를 제거하는 방법

- 렌더링을 위해 데이터를 변환하는 경우 Effect는 필요하지 않다. 컴포넌트의 state를 업데이트할 때 React는 먼저 컴포넌트 함수를 호출해 화면에 표시될 내용을 계산한다. 다음으로 변경 사항을 DOM에 **commit**해서 화면을 업데이트하고, 그 후에 Effect를 실행한다. 만약 Effect 역시 state를 즉시 업데이트한다면, 이로 인해 전체 흐로세스가 처음부터 다시 시작될 것이다.ㄴ

- 사용자 이벤트를 처리하는 데에 Effect는 필요하지 않다.

### props 또는 state에 따라 state 업데이트하기

- Bad 

```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // 🔴 Avoid: redundant state and unnecessary Effect
  // 🔴 이러지 마세요: 중복 state 및 불필요한 Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
  // ...
}
```

- Good

```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  // ✅ Good: calculated during rendering
  // ✅ 좋습니다: 렌더링 과정 중에 계산
  const fullName = firstName + ' ' + lastName;
  // ...
}
```

### 고비용 계산 캐싱하기

```js
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ This is fine if getFilteredTodos() is not slow.
  // ✅ getFilteredTodos()가 느리지 않다면 괜찮습니다.
  const visibleTodos = getFilteredTodos(todos, filter);
  // ...
}
```

하지만 getFilteredTodos()가 느리거나 todos가 많을 경우, newTodo와 같이 관련 없는 state 변수가 변경되더라도 getFilteredTodos()를 다시 계산하고 싶지 않을 수 있습니다.  
  
이럴 땐 값비싼 계산을 `useMemo` 훅으로 감싸서 캐시(또는 “메모화 (memoize)”)할 수 있다.

```js
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  const visibleTodos = useMemo(() => {
    // ✅ Does not re-run unless todos or filter change
    // ✅ todos나 filter가 변하지 않는 한 재실행되지 않음
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```

### :round_pushpin: DEEP DIVE. 계산이 비싼지는 어떻게 알 수 있을까?

콘솔 추가해서 계산해보기.

```js
console.time('filter array');
const visibleTodos = getFilteredTodos(todos, filter);
console.timeEnd('filter array');
```

기록된 전체 시간이 상당하다면 해당 계산은 메모해 두는 것이 좋을 수 있다.(1ms 이상)

### prop이 변경되면 모든 state 재설정하기

```js
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 Avoid: Resetting state on prop change in an Effect
  // 🔴 이러지 마세요: prop 변경시 Effect에서 state 재설정 수행
  useEffect(() => {
    setComment('');
  }, [userId]);
  // ...
}
```

```js
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  );
}

function Profile({ userId }) {
  // ✅ This and any other state below will reset on key change automatically
  // ✅ key가 변하면 이 컴포넌트 및 모든 자식 컴포넌트의 state가 자동으로 재설정됨
  const [comment, setComment] = useState('');
  // ...
}
```

### props가 변경될 때 일부 state 조정하기

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  // 🔴 이러지 마세요: prop 변경시 Effect에서 state 조정
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // Better: Adjust the state while rendering
  // 더 나음: 렌더링 중에 state 조정
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

렌더링 도중 컴포넌트를 업데이트하면, React는 반환된 JSX를 버리고 **즉시 렌더링을 다시 시도합니다.** React는 계산식으로 전파되는 매우 느린 재시도를 피하기 위해, 렌더링 도중 동일한 컴포넌트의 state만 업데이트할 수 있도록 허용합니다.

**이 패턴은 Effect보다 효율적이지만, 대부분의 컴포넌트에는 필요하지 않다.** 어떻게 하든 props나 다른 state들을 바탕으로 **state를 조정하면 데이터 흐름을 이해하고 디버깅하기 어려워질** 것이다. 항상 key로 모든 state를 재설정하거나 렌더링 중에 모두 계산할 수 있는지 확인하자. 예를 들어, 선택한 item을 저장(및 재설정)하는 대신, 선택한 item의 id를 저장할 수있다.

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // ✅ Best: Calculate everything during rendering
  // ✅ 가장 좋음: 렌더링 중에 모든 값을 계산
  const selection = items.find(item => item.id === selectedId) ?? null;
  // ...
}
```

### 이벤트 핸들러 간 로직 공유

```js
function ProductPage({ product, addToCart }) {
  // 🔴 Avoid: Event-specific logic inside an Effect
  // 🔴 이러지 마세요: Effect 내부에 특정 이벤트에 대한 로직 존재
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  function handleBuyClick() {
    addToCart(product);
  }

  function handleCheckoutClick() {
    addToCart(product);
    navigateTo('/checkout');
  }
  // ...
}
```

위 코드는 페이지가 새로고침 될 때마다 앱이 장바구니를 '기억'한다고 가정해보자. 그럼 카트에 제품을 한 번 추가하고 페이지를 새로고침 하면 알림이 다시 표시된다. 또한 해당 제품 페이지를 새로고침할 때에도 여전히 알림이 계속 등장한다.  
  
어떤 코드가 Effect에 있어야 하는지 혹은 이벤트 핸들러에 있어야 하는지 확실치 않은 경우, 이 코드가 실행되어야 하는 이유를 자문 해보자. **컴포넌트가 사용자에게 표시되었기 때문에 실행되어야 하는 코드에만 Effect를 사용하자**.  
  
위 예제에서는 페이지가 표시되었기 때문이 아니라, 사용자가 버튼을 눌렀기 때문에 알림이 표시되어야 한다.

### POST 요청 보내기

이 경우도 마찬가지로 컴포넌트가 사용자에게 표시되었기 때문에 실행되어야 하는 경우에 Effect에 로직을 넣고, 그렇지 않은 경우 빼야한다.  
  
예. 사용자의 상호작용에 의해서만 발생해야 되는 경우.

### 연쇄 계산

- Bad

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔴 Avoid: Chains of Effects that adjust the state solely to trigger each other
  // 🔴 이러지 마세요: 오직 서로를 촉발하기 위해서만 state를 조정하는 Effect 체인
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1)
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);

  useEffect(() => {
    alert('Good game!');
  }, [isGameOver]);

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    } else {
      setCard(nextCard);
    }
  }

  // ...
```

- Good 

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // ✅ Calculate what you can during rendering
  // ✅ 가능한 것을 렌더링 중에 계산
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    }

    // ✅ Calculate all the next state in the event handler
    // ✅ 이벤트 핸들러에서 다음 state를 모두 계산
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount <= 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) {
          alert('Good game!');
        }
      }
    }
  }

  // ...
```

### 애플리케이션 초기화하기

앱이 로드될 때 한 번만 실행되어야 하는 로직일 때,

```js
function App() {
  // 🔴 Avoid: Effects with logic that should only ever run once
  // 🔴 이러지 마세요: 한 번만 실행되어야 하는 로직이 포함된 Effect
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
  // ...
}
```

위 함수는 개발 중에 두 번 실행된다. 이 함수는 두 번 호출되도록 설계되지 않았기 때문에 **인증 토큰이 무효화**되는 등의 문제가 발생할 수 있다.  
  
일부 로직이 컴포넌트 마운트당 한번이 아니라 **앱 로드당 한 번** 실행되어야 하는 경우, **최상위 변수**를 추가하여 이미 실행되었는지 여부를 추적하세요.

```js
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ Only runs once per app load
      // ✅ 앱 로드당 한 번만 실행됨
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}
```

### state 변경을 부모 컴포넌트에 알리기

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  // 🔴 Avoid: The onChange handler runs too late
  // 🔴 이러지 마세요: onChange 핸들러가 너무 늦게 실행됨
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      setIsOn(true);
    } else {
      setIsOn(false);
    }
  }

  // ...
}
```

위 로직은 부모 컴포넌트에게 변경사항을 알리기 까지 시간이 오래 걸린다. 이벤트 발생 -> 상태 변경 -> Effect 실행 -> 부모컴포넌트 상태 변경 -> 이후 로직 실행  
  
대신 Effect를 삭제하고, 동일한 이벤트 핸들러 내에서 두 컴포넌트의 state를 업데이트하자.

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ Good: Perform all updates during the event that caused them
    // ✅ 좋습니다: 이벤트 발생시 모든 업데이트를 수행
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      updateToggle(true);
    } else {
      updateToggle(false);
    }
  }

  // ...
}
```

### 부모에게 데이터 전달하기

- Bad

```js
function Parent() {
  const [data, setData] = useState(null);
  // ...
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();
  // 🔴 Avoid: Passing data to the parent in an Effect
  // 🔴 이러지 마세요: Effect에서 부모에게 데이터 전달
  useEffect(() => {
    if (data) {
      onFetched(data);
    }
  }, [onFetched, data]);
  // ...
}
```

위 처럼 자식 컴포넌트에서 데이터를 패치해 부모 컴포넌트에 전달하지 말고, 아래 처럼 부모 컴포넌트에서 페치해서 자식에게 넘겨주자.

- Good 

```js
function Parent() {
  const data = useSomeAPI();
  // ...
  // ✅ Good: Passing data down to the child
  // ✅ 좋습니다: 자식에게 데이터 전달
  return <Child data={data} />;
}

function Child({ data }) {
  // ...
}
```

React에서 데이터는 부모 컴포넌트에서 자식 컴포넌트로 흐른다. 화면에 뭔가 잘못된 것이 보이면, 컴포넌트 체인을 따라 올라가서 어떤 컴포넌트가 잘못된 prop을 전달하거나 잘못된 state를 가지고 있는지 찾아냄으로써 정보의 출처를 추적할 수 있다. **자식 컴포넌트가 Effect에서 부모 컴포넌트의 state를 업데이트하면, 데이터 흐름을 추적하기 매우 어려워진다.**

### 외부 스토어 구독하기

컴포넌트가 외부의 일부 데이터를 구독해야 할 수도 있다. 외부 데이터는 React가 모르는 사이에 변경될 수도 있는데, 그럴 땐 수동으로 컴포넌트가 해당 데이터를 구독하도록 해야된다.

```js
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  // 이상적이지 않음: Effect에서 수동으로 store 구독
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

Effect를 사용하는 것이 일반적이지만, React에는 외부 저장소를 구독하기 위해 특별히 제작된 훅이 있다. Effect를 삭제하고 `useSyncExternalStore` 호출로 대체하자.

```js
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  // ✅ Good: Subscribing to an external store with a built-in Hook
  // ✅ 좋습니다: 빌트인 훅에서 외부 store 구독
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
               // React는 동일한 함수를 전달하는 한 다시 구독하지 않음
    () => navigator.onLine, // How to get the value on the client
                            // 클라이언트에서 값을 가져오는 방법
    () => true // How to get the value on the server
               // 서버에서 값을 가져오는 방법
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

Effect를 사용해 React state에 수동으로 동기화하는 것보다 오류 가능성이 적다. 일반적으로 위의 `useOnlineStatus()`와 같은 커스텀 훅을 작성해서 개별 컴포넌트에서 이 코드를 반복할 필요가 없도록하자.

### Fetching data 

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 🔴 Avoid: Fetching without cleanup logic
    // 🔴 이러지 마세요: 클린업 없이 fetch 수행
    fetchResults(query, page).then(json => {
      setResults(json);
    });
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```