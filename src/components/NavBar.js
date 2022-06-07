import { Link } from "react-router-dom"
import logo from '../assets/hoaxify.png'
import {AuthContext} from "../state/AuthContextWrapper"
import { useContext } from "react";
import {useSelector,useDispatch } from 'react-redux';
import { logout } from "../api/apiCalls";
import { useHistory } from "react-router-dom";

import { logoutSuccess } from "../state/authActions";





const NavBar=()=>{

    // const auth=useContext(AuthContext)
    const history=useHistory()
    const auth=useSelector((store)=>store)
    const dispatch=useDispatch()

    const onClickLogout=async(event)=>{
        event.preventDefault();

        try{
            await logout()
        }
        catch(error){

        }
        dispatch(logoutSuccess())
        // dispatch({type:"logout-success"})
        history.push("/")
    }
    

    return (
        <nav className='navbar navbar-expand navbar-light bg-light shadow-sm '>
            <div className='container'>
                <Link className='navbar-brand' to="/"  title="Home">
                    <img src={logo} alt='Hoaxify' width="60"/>Hoaxify
                </Link>
                <ul className='navbar-nav'>
                    {!auth.isLoggedIn &&
                    <>
                        <Link className="nav-link " to="/signup" title="Sign Up">
                        Sign Up
                        </Link>
                        <Link className='nav-link' to="/login" title="Login">
                        Login
                        </Link>
                    </>
                    }
                    
                    {
                    auth.isLoggedIn && 
                    <>
                        <Link className="nav-link" to={`/users/${auth.id}`}>
                            My Profile
                        </Link>
                        <a href="/" className="nav-link" onClick={onClickLogout}>
                            Logout
                        </a>
                    </>
                    }


                </ul>  
            </div> 
        </nav>
    )
}

export default NavBar