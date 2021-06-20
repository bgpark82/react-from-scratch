/** @jsx createElement */

function createElement(type, props = {}, ...children) {
  //   if (typeof type === "function") {
  //     return type(null, props, ...children);
  //   }

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

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  console.log("dom 생성", dom);

  return dom;
}

// 모든 노드를 dom에 붙힌다
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

// fiber tree를 계속 추가한다
let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function render(element, container) {
    console.log("렌더링", element, container);
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

function updateDom(dom, prevProps, nextProps) {
  // old props 삭제
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // new, change props 설정
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // event handler 제거
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // event handler 추가
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    console.log("유닛 작업", nextUnitOfWork, shouldYield);
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1; // 현재 idle 프로세스에서 남은 예상 시간 (ms), 리턴 전에 얼마동안 계속 작업 가능한지 결정가능, 다음 일을 하기 까지 충분한 시간이 있는지 확인
    console.log("유닛 작업 이후", nextUnitOfWork, shouldYield);
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 시작점
// 브라우저가 idle 상태일 때, 실행될 함수를 queue에 담는다
// 백그라운드 작업 가능, 낮은 우선순위 작업을 메인 이벤트루프에서 가능
// timeout이 있으면 우선순위에서 빠진다
requestIdleCallback(workLoop);

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];

    // 2. 새로운 fiber 추가
    let newFiber = {
      dom: null,
      type: element.type,
      props: element.props,
      parent: wipFiber,
    };

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTage: "UPDATE",
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 2-1. 자식에 fiber 추가
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      // 2-2. 형제에 fiber 추가
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  // 1. dom 노드 생성
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function performUnitOfWork(fiber) {
  // TODO: 새로운 작업 추가

  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 1. 자식 검색
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    // 2. 형재 검색
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 3. 형재의 부모 검색
    nextFiber = nextFiber.parent;
  }

  console.log("유닛 중", fiber);
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];

  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  console.log("Hook", hook, wipFiber);

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);

  hookIndex++;

  return [hook.state, setState];
}

function App(props) {
  const [state, setState] = useState(1);

  return (
    <div>
      <div>안녕 {props.foo}</div>
      <div>안녕 {state}</div>
      <input type="text" value={state} />
      <button onclick={() => setState((c) => c + 1)}>버튼</button>
    </div>
  );
}

const container = document.getElementById("root");

console.log(<App name="foo" />);

render(<App name="foo" />, container);
