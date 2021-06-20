function createElement(type, props, ...children) {
    
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

    if(typeof element === "string") {
        return document.createTextNode(element)
    }

    const dom = document.createElement(element.type);

    element.props.children
        .map(createDom)
        .forEach(child =>
            dom.appendChild(child))

    return dom;
}

function render(element, container) {
    const dom = createDom(element)
    container.appendChild(dom)
}

/** @jsx createElement */
function App() {
    return (
        <div className="a">안녕하세요</div>
    );
}

render(<App/>, document.getElementById("root"))



