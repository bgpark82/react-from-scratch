const element = {
  type: "h1", // tag
  props: {
    title: "foo", // props
    children: "안녕하세요"
  }
};

function render(element, container) {

  // 1. tag 생성
  const dom = document.createElement(element.type);
  dom["title"] = element.props.title;

  // 2. text 생성
  const text = document.createTextNode("");
  text["nodeValue"] = element.props.children;

  // 3. dom 렌더링
  dom.appendChild(text);
  container.appendChild(dom);
}


render(element, document.getElementById("root"))