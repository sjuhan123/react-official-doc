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

컴포넌트를 정의할 때 중첨해서 정의하면 안된다.  
  
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

