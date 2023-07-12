# State: A Component's Memory

## 일반 변수

- 지역 변수는 렌더링 간에 유지되지 않는다.
- 지역 변수를 변경해도 렌더링을 발동시키지 않는다.

## How does React know which state to return?

- React는 state 변수를 어떻게 찾는가?
- 훅은 동일한 컴포넌트의 모든 렌더링에서 안정적인 호출 순서에 의존한다.
- 내부적으로 React는 모든 컴포넌트에 대해 한 쌍의 state 배열을 가진다.
- 또한 렌더링 전에 0으로 설정된 현재 쌍 인덱스를 유지한다.
- useState를 호출할 때마다 React는 다음 쌍의 인덱스를 사용하고, 현재 인덱스를 다음 인덱스로 업데이트한다.