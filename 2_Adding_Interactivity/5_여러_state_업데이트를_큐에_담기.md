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
// 이벤트 발생할 때 마다 3이 아닌 1씩 증가한다.
```

- React는 state 업데이틀르 하기 전에 이벤트 핸들러의 모든 코드가 실행될 때까지 기다린다.
- 이로 인해 많은 리렌더링을 촉발하지 않고도 여러 컴포넌트에서 나온 다수의 state 변수를 업데이트할 수있다.
- 일괄처리(배칭, batching)라고도 하는 이 동작은 React 앱을 훨씬 빠르게 실행할 수 있게 해준다.
- React는 클릭과 같은 여러 의도적인 이벤트에 대해 일괄 처리하지 않으며, 각 클릭은 개별적으로 처리된다.

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

### state를 교체한 후 업데이트하면 어떻게 될까?

```js
  <button onClick={() => {
    setNumber(number + 5);
    setNumber(n => n + 1);
  }}>
```

1. `setNumber(number + 5);` -> React는 큐에 5로 바꾸기를 추가
2. `setNumber(n => n + 1);` -> `n => n+1` 함수를 큐에 추가
3. 6을 최종 결과로 저장하고 `useState`에서 반환

setState(x)가 실제로는 setState(n => x) 처럼 동작되지만 n이 사용되지 않는다.

### Naming conventions

업데이터 함수 인수의 이름은 해당 state 변수의 첫 글자로 지정하는 것이 일반적이다.

```js
setEnabled(e => !e);
setLastName(ln => ln.reverse());
setFriendCount(fc => fc * 2);
```
