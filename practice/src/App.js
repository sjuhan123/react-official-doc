import './App.css';
import Header from "./components/Header.jsx";
import Title from "./components/Title.jsx";
import Content from "./components/Content.jsx";

function App() {
  return (
    <div className="App">
      <Header>
        <Title color='tomato'>
          <Content></Content>
        </Title>
      </Header>
    </div>
  );
}

export default App;
