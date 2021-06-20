function createStore(reducer) {

    let state;
    let handler = []

    state = reducer(null, {type:"INIT"})
    
    return {
        dispatch: (action) => {
            state = reducer(state, action)
            handler.forEach(h => h())
        },
        subscribe: (listener) => {
            handler.push(listener)
        },
        getState: () => state
    }
}

const initState = {
    number: 1
}

function reducer(state = initState, action)  {
    state = !state ? initState : state
    switch(action.type) {
        case "PLUS":
            return {
                ...state,
                number: action.number
            }
        default:
            return state;
    }
}

const store = createStore(reducer)