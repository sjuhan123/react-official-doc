# 컴포넌트에 props 전달하기

## 시간에 따라 props가 변하는 방식

```js
export default function Clock({ color, time }) {
  return (
    <h1 style={{ color: color }}>
      {time}
    </h1>
  );
}
```

- `Clock` 컴포넌트는 `color`와 `time`이라는 두 개의 props를 받습니다.
- `color`와 `time`은 `Clock` 컴포넌트가 렌더링될 때마다 다른 값을 가질 수 있습니다.
- props는 항상 고정되어 있지 않다.
- 그러나 props는 불변.
- 컴포넌트가 props를 변경해야 하는 경우, 부모 컴포넌트에 다른 props, 즉, 새로운 객체를 전달하도록 요청해야 한다.
  - 그러면 이전의 props는 버려지고(참조를 끊는다.), JS 엔진은 기존 props가 차지했던 메모리를 회수(GC)하게 된다.
- **props 변경을 시도하지 마세요**. 
  - 선택한 색을 변경하는 등 사용자 입력에 반응해야 하는 경우에는 "set State" 활용
