import {useState,createContext } from 'react';

export const AuthContext=createContext();

function AuthContextWrapper(props) {

  const [auth,setAuth]=useState({isLoggedIn:false,id:''})

  return (
    <AuthContext.Provider value={{
      isLoggedIn:auth.isLoggedIn,
      id:auth.id,
      onLoginSuccess:setAuth
    }}>
      {props.children}
    </AuthContext.Provider>
    
  );
}

export default AuthContextWrapper;
