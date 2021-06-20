const element = {
  type: "div", 
  props: {
    id: "a", 
    children: "안녕하세요"
  }
};

function render(element, container) {

  // 1. node 생성
  const node = document.createElement(element.type);
  node["id"] = element.props.id;

  // 2. child 생성
  const text = document.createTextNode("");
  text["nodeValue"] = element.props.children;
  console.log(text)

	// 3. node, text 연결
  node.appendChild(text);

	// 4. dom 연결
  container.appendChild(node);
}

render(element, document.getElementById("root"))