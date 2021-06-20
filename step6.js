/** @jsx createElement */

function createElement(type, props = {}, ...children) {
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


let rootNode = null;
let rootContainer = null;

function createDom (element) {

  // 함수형 컴포넌트인 경우
  if(typeof element.type === "function") {
    // 일반 돔으로 변경
    const node = element.type(null, element.props, element.children)
    console.log("컴포넌트 자식", node)
    return createDom({
      type: node.type, 
      props: node.props
    })
  }

    // 일반 돔인 경우
    const dom = element.type === "TEXT"
      ? document.createTextNode(element)
      : document.createElement(element.type);

    
    // attribute 바인딩
    Object.keys(element.props)
      .filter((key) => key !== "children" && !key.startsWith("on"))
      .forEach((name) => dom[name] = element.props[name]);

    // event 바인딩
    Object.keys(element.props)
      .filter((key) => key.startsWith("on"))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, element.props[name])})
      
    return {
      dom,
      children:element.props.children
    }
}

function createDomTree(node) {
  rootContainer.innerHTML = '';

  // 얕은 복사, 참조의 전파를 막는다
  const newNode = {...node};
  
  const children = newNode.children
    .map(createDom)
    .map(createDomTree)
    
  newNode.children = children;

  return newNode;
}

/**
 * 노드 트리를 끝까지 탐색(DFS)하여 children이 없으면(주로 텍스트 노드) dom에 append
 */
function appendDom(node) {
  
  const dom = node.dom;

  node.children.map(appendDom)
    .forEach(child => dom.appendChild(child))  

  return dom
}

function render(element, container) {

  rootContainer = container

  rootNode = {
    dom: container,
    children: [element],
    hook: {
      state: 1,
    },
  };

  appendDom(createDomTree(rootNode))
}

function useState(initial) {
  console.log("useState 생성", rootNode)

  if(!rootNode.hook) {
      rootNode.hook = {
        state: initial
      }
  }

  function setNumber (value) {
    const newRootNode = {
      ...rootNode,
      hook: {
        state:value
      }
    }
    
    rootNode = newRootNode;

    console.log("setNumber",value, rootNode)

    appendDom(createDomTree(rootNode))
  }
  

  return [rootNode.hook.state, setNumber]
}


function App() {

  const [number, setNumber] = useState(1);
  
  function handleClick() {
    setNumber(number+1)
  }

  return (
    <div 
      className="a"
      onclick={handleClick}
    >
      <h1 className="b">안녕하세요</h1>
      <div>만나서 반갑습니다<div>{number}</div></div>
    </div>
  );
}

render(<App />, document.getElementById("root"));
