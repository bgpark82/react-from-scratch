function createElement(type, props = {}, ...children) {

  children = children.map((child) =>
    typeof child === "object" ? 
      child : 
      createTextElement(child)
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

let rootNode = null;
let rootContainer = null;
const isFunctionComponent = (element) => typeof element.type === "function"
const isProperties = (key) => key !== "children" && !key.startsWith("on")
const isEvent = (key) => key.startsWith("on")

function createDom (element) {

  /* 1. 함수형 컴포넌트인 경우 */
  if(isFunctionComponent(element)) {
     
    const node = element.type(null, element.props, element.children)

    return createDom({
      type: node.type, 
      props: node.props
    })
  }

  /* 2. 일반 dom인 경우 */
  const dom = element.type === "TEXT"
    ? document.createTextNode(element)
    : document.createElement(element.type);

    /* attribute 바인딩 */
    Object.keys(element.props)
      .filter(isProperties)
      .forEach((name) => dom[name] = element.props[name]);

    /* event 바인딩 */
    Object.keys(element.props)
      .filter(isEvent)
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, element.props[name])})
    
  return {
    dom,
    children: element.props.children
  }
}

/* dom 생성 */
function createDomTree(node) {

  /* dom 초기화 */
  rootContainer.innerHTML = '';

  const newNode = {...node};
  
  newNode.children = newNode.children
    .map(createDom)
    .map(createDomTree)

  return newNode;
}

/* 노드 트리를 끝까지 탐색(DFS)하여 dom에 append */
function appendDom(node) {
  const {dom, children} = node;

  children.map(appendDom)
    .forEach(child => dom.appendChild(child))  

  return dom
}

function render(element, container) {

  rootContainer = container

  rootNode = {
    dom: container,
    children: [element],
  };

  appendDom(createDomTree(rootNode))
}

function useState(initial) {
  
  if(!rootNode.hook) {
      rootNode = {
        ...rootNode,
        hook: {
          state: initial
        }
      }
  }

  function setNumber (value) {
    rootNode.hook.state = value;
    appendDom(createDomTree(rootNode))
  }
  
  return [rootNode.hook.state, setNumber]
}


/** @jsx createElement */
function App() {

  const [number, setNumber] = useState(1);
  
  function handleClick() {
    setNumber(number + 1)
  }

  return (
    <div>
      <div>숫자 {number}</div>
      <button onclick={handleClick}>+1</button>
    </div>
  );
}

render(<App />, document.getElementById("root"));
