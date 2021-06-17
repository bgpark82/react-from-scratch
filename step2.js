/** @jsx createElement */

function createElement(type, props = {}, ...children) {

    // type이 함수일 경우 (제일 초기 <App>을 호출 시, 앞에서 정의한 App 함수 자체를 호출한다)
    if (typeof type === "function") {
        return type(null, props, ...children);
    }

    return {
        type,
        props: {
            ...props, 
            children
        }
    }
}

function createDom(element) {

    // element가 텍스트일 경우 텍스트 노드 반환 (주로 제일 마지막 노드)
    if(typeof element === "string") {
        return document.createTextNode(element)
    }

    const dom = document.createElement(element.type);

    // 재귀적으로 dom에 자식 노드를 append
    element.props.children
        .map(createDom)
        .forEach(child =>
            dom.appendChild(child))

    return dom;
}

function render(element, container) {
    container.appendChild(createDom(element))
}

function App() {
    return (
        <div>
            <h1>안녕하세요</h1>
        </div>
    );
}

render(<App/>, document.getElementById("root"))

console.log(<App />)



