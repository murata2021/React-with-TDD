import SecureLS from "secure-ls"

const ls = new SecureLS();

const setItem=(key,value)=>{
    ls.set(key,value);
}

const getItem=(key)=>{
    return ls.get(key)
}


const clear=()=>{
    localStorage.clear()
}


const storage={setItem,getItem,clear}

export default storage;