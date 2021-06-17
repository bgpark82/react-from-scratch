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

    Object.keys(element.props)
        .filter(key => key !== "children")
        .forEach(name => {
            
            dom[name] = element.props[name]
        })
    
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

function handleClick() {
    console.log("클릭!")
    state.number = state.number+1
}

const state = {
    number :1,
}    

function App() {

    return (
        <div>
            <input type="text" value={state.number}/>
            <button onclick={handleClick}>+</button>
        </div>
    );
}

const container = document.getElementById("root")

render(<App/>, container)

console.log(<App />)



