/** @jsx createElement */

function createElement(type, props = {}, ...children) {
  // type이 함수일 경우 (제일 초기 <App>을 호출 시, 앞에서 정의한 App 함수 자체를 호출한다)
  if (typeof type === "function") {
    return type(null, props, ...children);
  }

  children = children.map((child) =>
    typeof child === "object" ? child : createTextElement(child)
  );

  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(element) {
  const dom =
    element.type === "TEXT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      console.log(name);
      dom[name] = element.props[name];
    });

  element.props.children
    .map(createDom)
    .forEach((child) => dom.appendChild(child));
  return dom;
}

let rootNode = null;

function appendDom() {
  // root 노드로 dom에 append 한다
  rootNode;
}

function render(element, container) {
  // 여기서 node를 생성하고 dom에 append 하는 함수를 따로 생성한다
  // node는 hook을 가진다
  rootNode = {
    dom: container,
    children: [element],
    hook: {
      state: 1,
    },
  };

  console.log(rootNode);

  const dom = createDom(element);
  container.appendChild(dom);
}

function App() {
  return (
    <div
      onclick={() => {
        console.log("hello");
      }}
    >
      안녕하세요
    </div>
  );
}

render(<App />, document.getElementById("root"));

console.log(<App />);
