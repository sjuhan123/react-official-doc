React는 UI를 조작하는 "선언적인 방법"을 제공합니다. UI를 개별적으로 직접 조작하는 대신 컴포넌트가 있을 수 있는 다양한 상태를 기술하고, 사용자 입력에 반응하여 각 상태들 사이를 전환합니다. 이는 "디자이너"가 UI를 바라보는 방식과 유사합니다.

# Reacting to Input with State

### 선언형 UI와 명령형 UI의 차이점 

명령형.

- 폼에 무언가를 입력하면 “Submit” 버튼이 활성화될 것입니다.
- “제출” 버튼을 누르면 폼과 버튼이 비활성화 되고 스피너가 나타날 것입니다.
- 네트워크 요청이 성공한다면 form은 숨겨질 것이고 “Thank you”메세지가 나타날 것입니다.
- 네트워크 요청이 실패한다면 오류 메세지가 보일 것이고 form은 다시 활성화 될 것입니다.

### UI를 선언적인 방식으로 생각하기

1. 컴포넌트의 다양한 시각적 상태를 식별합니다.
2. 상태 변화를 촉발하는 요소를 파악합니다.
3. useState를 사용하여 메모리의 상태를 표현합니다.
4. 비필수적인 state 변수를 제거합니다.
5. 이벤트 핸들러를 연결하여 state를 설정합니다.

# Choosing the State Structure

1. 관련 state 그룹화

2. state의 모순을 피하자

3. 불필요한 state를 피하자

- 렌더링 중에 컴포넌트의 props나 기존 state 변수에서 일부 정보를 계산할 수 있는 경우 해당 정보를 컴포넌트의 state에 넣지 않아야 한다.

:round_pushpin: DeepDive  
props를 state에 그대로 미러링하지 마세요 

4. state 중복을 피하자

5. 깊게 중첩된 state 피하자

# Sharing State Between Components

:round_pushpin: DeepDive  
- 비제어 컴포넌트: 로컬 state를 가진 컴포넌트
- 제어 컴포넌트: props에 의해 구동되는 컴포넌트

### A single source of truth for each state

# Preserving and Resetting State

### UI 트리

브라우저는 UI를 모델링하기 위해 많은 트리 구조를 사용한다.
DOM: HTML,  
CSSOM: CSS,  
Accessibility tree: 접근성 트리  
  
1. JSX로부터 UI 트리를 만든다.
2. React DOM은 해당 UI 트리와 **일치하도록** 브라우저 DOM 엘리먼트를 업데이트한다.

### state는 트리의 한 위치에 묶인다.

컴포넌트에 state를 부여할 때, state가 컴포넌트 내부에 “존재”한다고 생각할 수 있습니다.  
하지만 state는 **실제로 React 내부**에서 유지됩니다.  
React는 UI 트리에서 해당 컴포넌트가 어디에 위치하는지에 따라 보유하고 있는 각 state를 올바른 컴포넌트와 연결합니다.

### 동일한 위치의 동일한 컴포넌트는 state를 유지한다.

React에서 중요한 것은 JSX 마크업이 아니라 **UI 트리에서의 위치**라는 것을 기억하세요

### 동일한 위치의 다른 컴포넌트는 state를 초기화한다.

또한 같은 위치에 다른 컴포넌트를 렌더링하면 전체 하위 트리의 state가 재설정된다.

### 동일한 위치에서 state 재설정하기.

Option
- 컴포넌트를 다른 위치에 렌더링하기 
- key로 state 재설정하기 
- 키로 form 재설정하기 

:round_pushpin: DeepDive  
제거된 컴포넌트에 대한 state 보존 방법
- 모든 채팅을 렌더링하되 다른 모든 채팅은 CSS로 숨긴다
- 부모 컴포넌트에서 각 수신자에 대한 보류 중인 메시지를 state를 끌어올려서 보관할 수 있습니다. 이렇게 하면 자식 컴포넌트가 제거되더라도 중요한 정보를 보관하는 것은 부모 컴포넌트이므로 문제가 되지 않습니다. 이것이 가장 일반적인 해결책입니다.
- React state 외에 다른 소스를 사용할 수도 있습니다. 예를 들어, 사용자가 실수로 페이지를 닫아도 메시지 초안이 유지되기를 원할 수 있습니다. 이를 구현하기 위해 Chat 컴포넌트가 localStorage에서 읽어서 state를 초기화하고 초안도 저장하도록 할 수 있습니다.

# Extracting State Logic into a Reducer

# Passing Data Deeply with Context

### context 사용 사례

- 테마
- 현재 계정
- 라우팅
- state 관리