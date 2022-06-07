import {createStore} from "redux";
import authReducer from "./authReducer"
import storage from "./storage"

export let store;

const createAppStore=()=>{

    let initialState=storage.getItem("auth") ||{
        isLoggedIn:false,
        id:''
    };


    store=createStore(
    authReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

    //In Redux, subscriptions are called after the root reducer has returned the new state
    
    store.subscribe(()=>{
        // localStorage.setItem("auth",JSON.stringify(store.getState()))
        storage.setItem("auth",store.getState())

    })

    return store;

};

export default createAppStore;



