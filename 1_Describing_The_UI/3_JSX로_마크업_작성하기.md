# Writing Markup with JSX

JSX는 JavaScript의 확장 문법이다. Javascript 파일 안에 HTML과 유사한 마크업을 작성할 수 있도록 해준다.

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

# 도전과제

```js
// 문제
export default function Bio() {
  return (
    <div class="intro">
      <h1>Welcome to my website!</h1>
    </div>
    <p class="summary">
      You can find my thoughts here.
      <br><br>
      <b>And <i>pictures</b></i> of scientists!
    </p>
  );
}

// 정답
export default function Bio() {
  return (
    <div>
    <div class="intro">
      <h1>Welcome to my website!</h1>
    </div>
    <p class="summary">
      You can find my thoughts here.
      <br></br>
      <b>And <i>pictures</i></b> of scientists!
    </p>
        </div>
  );
}
```
