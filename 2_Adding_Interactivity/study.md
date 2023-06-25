# Responding to Events

이벤트 핸들러는 컴포넌트에 있을 수 있는 모든 하위 컴포넌트의 이벤트도 포착한다. 이벤트가 트리 위로 '버블' 또는 '전파'되는 것을 이벤트가 발생한 곳에서 시작해서 트리 위로 올라간다.

:round_pushpin: Pitfall(함정)  
첨부한 JSX 태그에서만 작동하는 onScroll을 제외한 모든 이벤트는 React에서 전파된다.

### Stopping propagation

```js
function Button({ onClick, children }) {
  return (
    <button onClick={e => {
      e.stopPropagation();
      onClick();
    }}>
      {children}
    </button>
  );
}
```

### Preventing default behavior

```js
export default function Signup() {
  return (
    <form onSubmit={e => {
      e.preventDefault();
      alert('Submitting!');
    }}>
      <input />
      <button>Send</button>
    </form>
  );
}
```

# State: A Component's Memory

:round_pushpin: How does React know which state to return?

"대신 간결한 구문을 구현하기 위해 훅은 동일한 컴포넌트의 모든 렌더링에서 안정적인 호출 순서에 의존합니다. 위의 규칙(“최상위 수준에서만 훅 호출”)을 따르면, 훅은 항상 같은 순서로 호출되기 때문에 실제로 잘 작동합니다. 또한 *린터 플러그인*은 대부분의 실수를 잡아줍니다."

> eslint-plugin-react-hooks  
> 1. exhaustive-deps 규칙: useEffect나 useCallback 등의 Hook에서 의존성 배열(dependency array)을 지정해야 함을 강제합니다. 의존성 배열을 올바르게 설정하지 않으면 버그나 성능 이슈의 원인이 될 수 있습니다.  
> 2. rules-of-hooks 규칙: Hook을 올바르게 사용하는지 검사합니다. 예를 들어, 조건문이나 반복문 내에서 Hook을 호출하면 안 되며, 컴포넌트 함수 내에서만 Hook을 호출해야 합니다.  
> 3. exhaustive-deps (additionalHooks): 이 규칙은 추가적인 Hook들에 대한 의존성 배열을 지정해야 함을 검사합니다. React에 내장되지 않은 사용자 정의 Hook들에 대해서도 의존성 배열을 설정하는 것이 좋습니다. 이를 통해 컴포넌트가 예상대로 동작하고 필요한 상태나 프로퍼티 변화에 반응할 수 있게 됩니다.  
> 4. no-memo: 이 규칙은 불필요한 React.memo의 사용을 방지합니다. React.memo는 컴포넌트를 메모이제이션하여 재렌더링 성능을 최적화하는 데 사용됩니다. 그러나 메모이제이션은 항상 성능 향상을 보장하지는 않으며, 일부 상황에서는 오히려 성능을 저하시킬 수 있습니다. 이 규칙은 불필요한 React.memo의 사용을 방지하여 성능 최적화를 위해 적절하게 사용되도록 유도합니다.

# Render and Commit

1. 렌더링 촉발

- 컴포넌트의 첫 렌더링인 경우
- 컴포넌트의 state가 업데이트된 경우

2. React가 컴포넌트를 렌더링한다.

- 첫 렌더링에서 React는 루트 컴포넌트를 호출합니다.
- 이후 렌더링에서 React는 state 업데이트에 의해 렌더링이 발동된 함수 컴포넌트를 호출한다.

3. React가 DOM에 변경사항을 커밋

# State as a Snapshot

1. state를 설정하면 렌더링이 촉발된다.

2. 렌더링은 그 시점의 스냅샷을 찍는다.

3. 시간 경과에 따른 state

state 변수의 값은 이벤트 핸들러의 코드가 비동기적이더라도 렌더링 내에서 절대 변경되지 않는다.

# Queueing a Series of State Updates

### state 업데이트 일괄처리 

```js
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 1);
        setNumber(number + 1);
        setNumber(number + 1);
      }}>+3</button>
    </>
  )
}
```

그러나 이전 세션에서 기억할 수 있듯이, 각 렌더링의 state 값은 고정되어 있으므로, 첫번째 렌더링의 이벤트 핸들러의 number 값은 setNumber(1)을 몇 번 호출하든 항상 0이다.

이렇게 하면 너무 많은 리렌더링을 촉발하지 않고도 여러 컴포넌트에서 나온 다수의 state 변수를 업데이트할 수 있다. 하지만 이는 이벤트 핸들러와 그 안에 있는 코드가 완료될 때까지 UI가 업데이트되지 않는다는 의미이기도 하다. 일괄처리(배칭, batching)라고도 하는 이 동작은 React 앱을 훨씬 빠르게 실행할 수 있게 해준다. 또한 일부 변수만 업데이트된 “반쯤 완성된” 혼란스러운 렌더링을 처리하지 않아도 된다.

### 다음 렌더링 전에 동일한 state 변수를 여러 번 업데이트하기 

```js
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(n => n + 1);
        setNumber(n => n + 1);
        setNumber(n => n + 1);
      }}>+3</button>
    </>
  )
}
```

`setNumber(n => n + 1);` -> 업데이터 함수

### Naming conventions

업데이터 함수 인수의 이름은 해당 state 변수의 첫 글자로 지정하는 것이 일반적이다.

```js
setEnabled(e => !e);
setLastName(ln => ln.reverse());
setFriendCount(fc => fc * 2);
```

# Updating Objects in State

1. state를 읽기 전용으로 취급하세요.
2. 중첩된 객체 업데이트하기 
3. Immer로 간결한 업데이트 로직 작성 

# Updating Arrays in State

1. 변이 없이 배열 업데이트하기 

- 객체와 마찬가지로, React state의 배열은 읽기 전용으로 취급해야 합니다.
- 배열에 추가하기: push() x -> 배열 전개 구문을 사용
- 배열에서 제거하기: filter()
- 배열 변경하기: map()
- 배열에서 항목 교체하기: map()
- 배열에 삽입하기: slice() + 전개구문
```js
import { useState } from 'react';

let nextId = 3;
const initialArtists = [
  { id: 0, name: 'Marta Colvin Andrade' },
  { id: 1, name: 'Lamidi Olonade Fakeye'},
  { id: 2, name: 'Louise Nevelson'},
];

export default function List() {
  const [name, setName] = useState('');
  const [artists, setArtists] = useState(
    initialArtists
  );

  function handleClick() {
    const insertAt = 1; // Could be any index
    const nextArtists = [
      // Items before the insertion point:
      ...artists.slice(0, insertAt),
      // New item:
      { id: nextId++, name: name },
      // Items after the insertion point:
      ...artists.slice(insertAt)
    ];
    setArtists(nextArtists);
    setName('');
  }

  return (
    <>
      <h1>Inspiring sculptors:</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleClick}>
        Insert
      </button>
      <ul>
        {artists.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </>
  );
}
```
- 배열에 다른 변경 사항 적용하기: reverse() 및 sort() 메서드는 원래 배열을 변이하므로 직접 사용할 수 없습니다. 대신, 배열을 먼저 복사한 다음 변이하면 됩니다.
- 배열 내부의 객체 업데이트하기: