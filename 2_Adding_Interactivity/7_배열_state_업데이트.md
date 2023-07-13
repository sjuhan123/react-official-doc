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

- 배열 내부의 객체 업데이트하기: 중첩된 state를 업데이트할 때는 업데이트하려는 지점부터 최상위 수준까지 복사본을 만들어야 한다.