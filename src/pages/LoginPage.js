import { useState,useContext } from "react";
import { useHistory } from "react-router-dom";
import Input from "../components/Input"
import { login } from "../api/apiCalls";
import Alert from "../components/Alert";
import ButtonWithProgress from "../components/ButtonWithProgress";
import { AuthContext } from "../state/AuthContextWrapper";
import {useDispatch} from "react-redux"
import { loginSuccess } from "../state/authActions";

const LoginPage=()=>{

    // const auth=useContext(AuthContext)

    const [formData,setFormData]=useState({email:'',password:''})
    const [apiProgress,setApiProgress]=useState(false);
    const [failMessage,setFailMessage]=useState()

    const dispatch=useDispatch();

    const history=useHistory()

    const handleChange=(e)=>{

        const {id,value}=e.target

        setFormData((data)=>({...data,[id]:value}))
        setFailMessage();
    }

    const handleSubmit=async (e)=>{

        e.preventDefault();
        setApiProgress(true)

        try{
            const {email,password}=formData
            const response=await login({email,password})
            // props.history.push('/')
            history.push('/')

            dispatch(loginSuccess({
                        ...response.data,
                        header:`Bearer ${response.data.token}`
                }))

            // dispatch({
            //     type:"login-success",
            //     payload:{
            //         ...response.data,
            //         header:`Bearer ${response.data.token}`
            //     }
            // })
            // auth.onLoginSuccess(
            //     {
            //         isLoggedIn:true,
            //         id:response.data.id
            //     })


        }catch(error){

            setFailMessage(error.response.data.message)

        }
        setApiProgress(false)
    }

    const {email,password}=formData
    let disabled=(email!=="" && password!=="" )?false:true

    return(

        <div className='col-lg-6 offset-lg-3 col-md-8 offset-md-2' data-testid='login-page'>
            <form className='card'>
                <div className="card-header">
                    <h1 className="text-center">Login</h1>
                </div>
                <div className="card-body">
                    <Input id="email" label="Email" onChange={handleChange}/>
                    <Input id="password" type="password" label="Password"onChange={handleChange}/>
                    {failMessage && <Alert type='danger'>{failMessage}</Alert>}
                    <div className="text-center">
                        <ButtonWithProgress disabled={disabled} apiProgress={apiProgress} onClick={handleSubmit}>Login</ButtonWithProgress>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default LoginPage;