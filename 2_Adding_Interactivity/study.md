






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