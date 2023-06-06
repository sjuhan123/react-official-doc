# Your First Component

>  Components can render other components, but you must never nest their definitions:  
>  
>  export default function Gallery() {  
>   // 🔴 Never define a component inside another component!  
>   function Profile() {  
>     // ...  
>   }  
>   // ...  
> }  
> The snippet above is very slow and causes bugs. Instead, define every component at the top level:  

컴포넌트를 정의할 때 중첩해서 정의하면 안된다.  
  
이유:  
1. 성능 문제.
- 컴포넌트를 중첩하여 정의하면, 각각의 중첩된 컴포넌트가 렌더링될 때마다 해당 컴포넌트 함수가 실행된다.
- 함수 실행은 CPU 연산을 필요로 하며, 이는 불필요한 계산이 발생하고 메모리 할당을 초래할 수 있다. 
- 중첩 구조에서는 부모 컴포넌트가 렌더링될 때마다 자식 컴포넌트도 모두 다시 렌더링되어 성능 저하를 유발할 수 있다.
2. 상태 관리와 스코프 문제  
- 컴포넌트를 중첩하여 정의하면 스코프와 상태 관리에 문제가 발생할 수 있다. 
- 내부 컴포넌트는 외부 컴포넌트의 변수와 상태에 접근할 수 있다. 
  - 이는 의도치 않게 상태를 변경하거나 외부 컴포넌트의 상태에 종속적인 동작을 수행하는 경우에 예기치 않은 동작을 발생시킬 수 있다.
  - 또한, 상태 업데이트가 외부 컴포넌트에 영향을 미칠 수 있어 예측하기 어려운 버그를 유발할 수 있다.

질문!

> React-based frameworks take this a step further. Instead of using an empty HTML file and letting React “take over” managing the page with JavaScript, they also generate the HTML automatically from your React components. This allows your app to show some content before the JavaScript code loads.  
> 빈 HTML 파일을 사용하고 React가 JavaScript로 페이지 관리를 “대행”하도록 하는 대신,  
> React 컴포넌트에서 HTML을 자동으로 생성하기도 합니다. 이를 통해 JavaScript 코드가 로드되기 전에 앱에서 일부 콘텐츠를 표시할 수 있습니다.

위 내용을 GPT에게 물어보니, 리액트의 기능 중 하나인 "서버 사이드 렌더링"을 설명하는 문구라고 합니다. 서버 사이드 렌더링은 서버에서 React 컴포넌트를 렌더링하여 HTML을 생성하고, 이를 초기 페이지 로드 시에 클라이언트에게 전달하는 방식이라고 하네요.

# Importing and Exporting Components

> Note  
>  
> To reduce the potential confusion between default and named exports, some teams choose to only stick to one style (default or named), or avoid mixing them in a single file. Do what works best for you!

위 구문을 읽고나서 import, export 하는 방식도 컨벤션으로 정해놓고 프로젝트를 시작하면 좋겠다는 생각을 했습니다.

# Writing Markup with JSX

## JSX 형태

예전.

```js
import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

변환.  

```js
// Inserted by a compiler (don't import it yourself!)
import {jsx as _jsx} from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Hello world' });
}
```

## JSX 규칙

1. 하나의 root element return

- element로 묶거나.
- <React.Fragment></React.Fragment> 로 묶거나.
- <></> 로 묶거나.

이유?  
JSX는 HTML처럼 보이지만 내부적으로는 JavaScript 객체로 변환된다. 하나의 배열로 감싸지 않은 하나의 함수에서는 두 개의 객체를 반환할 수 없다. 그렇기에 JSX도 하나로 묶여야 된다.

> Pitfall  
> For historical reasons, aria-* and data-* attributes are written as in HTML with dashes.
>
> 이 이유에 대해서 정재남님의 번역 사이트에 추가한 내용이 있어서 못 보신 분들을 위해 남겨 놓습니다.  
> https://react-ko.dev/learn/writing-markup-with-jsx

## 전문가 팁: JSX 변환기 사용 (몰랐던 내용)

> Converting all these attributes in existing markup can be tedious! We recommend using a converter to translate your existing HTML and SVG to JSX. Converters are very useful in practice, but it’s still worth understanding what is going on so that you can comfortably write JSX on your own.

HTML과 SVG 파일 등을 JSX로 변환할 수 있다!

```js
// 예시
<svg style="flex:1;" xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect x="10" y="10" height="100" width="100"
    style="stroke:#ff0000; fill: #0000ff"/>
</svg>

// 변환!
import * as React from "react"

function SvgComponent(props) {
  return (
    <svg
      style={{
        flex: 1
      }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path stroke="red" fill="#00f" d="M10 10H110V110H10z" />
    </svg>
  )
}

export default SvgComponent
```

# [Conditional Rendering](https://react.dev/learn/conditional-rendering#:~:text=Hide-,Details,-If%20you%E2%80%99re%20coming)

### Conditional (ternary) operator (? :) 

조건부 렌더링을 하고 싶을 때, JS의 IF문 뿐만 아니라 조건 연산자를 사용할 수 있다.

```js
if (isPacked) {
  return <li className="item">{name} ✔</li>;
}
return <li className="item">{name}</li>;
```

```js
return (
  <li className="item">
    {isPacked ? name + ' ✔' : name}
  </li>
);
```

근데 위 두 예시는 완벽히 동일할까?  
:round_pushpin: 질문! :round_pushpin: "객체 지향 프로그래밍에 익숙하다면, 위의 두 예제 중 하나가 `<li>`의 서로 다른 두 “인스턴스”를 생성할 수 있기 때문에 미묘하게 다르다고 생각할 수 있습니다. 하지만 JSX 요소는 내부 state를 보유하지 않고 실제 DOM 노드가 아니기 때문에 “인스턴스”가 아닙니다. 이는 청사진과 같은 가벼운 설명입니다. 이 두 예제는 사실 완전히 동등합니다. state 보존 및 재설정에서 작동 방식에 대해 자세히 설명합니다."

### Logical AND operator (&&) 

:round_pushpin: Pitfall(함정)

Don’t put numbers on the left side of &&.
논리 AND 연산자(&&) 왼쪽에 숫자를 넣으면 안된다.(특히 0)

> 이 부분은 그룹프로젝트 때 실제로 겪어본 릴제 팀이 공유 부탁 드려요!

추가로 이 부분에 대해서 정재남님의 번역 사이트에서 대안을 제시해주셔서 공유합니다.

<img width="844" alt="스크린샷 2023-06-04 오후 7 58 52 복사본" src="https://user-images.githubusercontent.com/81420856/243172335-d0a65f1b-425f-419a-b360-d917f2d1d214.png">


# [Rendering Lists](https://react.dev/learn/rendering-lists)

### Keeping list items in order with key 

배열 항목에는 해당 배열의 항목들 사이에서 고유하게 식별할 수 있는 문자열 또는 숫자인 key를 부여해야 한다.

key는 각 컴포넌트가 어떤 배열 항목에 해당하는지 React에 알려줘서 나중에 매칭할 수 있도록 한다. 이는 배열 항목이(정렬 등의 이유로 인해) 이동, 삽입, 삭제될 경우에 중요해진다.

### Where to get your key

- 데이터베이스의 데이터
- 로컬에서 생성된 데이터: ex. `crypto.randomUUID()` 또는 uuid

### Key Rule

- key는 형제 간에 고유해야 된다.
- key는 변경되지 않아야 된다.

### Why does React need keys? 

key를 사용하면 형제 항목 사이에서 특정 항목을 고유하게 식별할 수 있다. 재정렬로 인핸 어떤 항목의 위치가 변경되더라도, 해당 항목이 사라지지 않는 한 React는 key를 통해 그 항목을 식별할 수 있습니다.  

:round_pushpin: Pitfall(함정)  

- 배열의 index를 key로 사용하면, 버그가 발생할 수 있다.
- `key={Math.random()}`와 같이 즉석에서 Key를 생성하면 안된다. 이렇게 하면 렌더링될 때마다 key가 일치하지 않아 매번 모든 컴포넌트와 DOM이 다시 생성된다. 대신 데이터에 기반한 안정적인 ID를 사용해야 된다.
- 컴포넌트는 key를 prop으로 받지 않는다는 점에 유의해야 된다. 컴포넌트에 ID가 필요한 경우 별도의 프로퍼티로 전달해야 된다. `<Profile key={id} userId={id} />`

# (Keeping Components Pure)[https://react.dev/learn/rendering-lists]

### Purity: Components as formulas

- 자신의 일에만 신경쓴다. 호출되기 전에 존재했던 객체나 변수를 변경하지 않는다.
- 동일 입력, 동일 출력. 동일한 입력이 주어지면 항상 동일한 결과를 반환해야 된다.

React는 사용자가 작성하는 모든 컴포넌트가 순수함수라고 가정한다. 즉 React 컴포넌트는 동일한 입력이 주어졌을 때 항상 동일한 JSX를 반환해야 된다.

### Side Effects: (un)intended consequences

외부에서 선언된 변수를 읽고 쓰면 컴포넌트는 호출될 때마다 다른 JSX가 생성된다. 대신 변수를 prop으로 받으면 된다.


