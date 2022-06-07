import React,{useEffect, useState} from "react";
import axios from "axios";
import Input from "../components/Input";
import {signUp} from '../api/apiCalls'
import Alert from "../components/Alert";
import ButtonWithProgress from "../components/ButtonWithProgress";

const SignUpPage=()=>{

    const [apiProgress,setApiProgress]=useState(false)
    const [signUpSuccess,setSignUpSuccess]=useState(false)
    const [formData,setFormData]=useState({username:"",email:"",password:"",passwordRepeat:""})
    const [errors,setErrors]=useState({})

    const handleChange=(e)=>{
        const {id,value}=e.target
        setFormData(data=>({...data,[id]:value}))

        // const errorsCopy=JSON.parse(JSON.stringify(error)) a method for deep copy

        setErrors(errors=>({...errors,[id]:null}))
    }

    const handleSubmit=async (e)=>{
        e.preventDefault();
        console.log("here")

        const {username,email,password}=formData
        const body={
            username,email,password
        }
        console.log(body)
        setApiProgress(true)
        try{
            const res=await signUp(body)
            console.log(res)
            setSignUpSuccess(true)
        }
        catch(e){
            if(e.response.status===400){
                console.log(e.response.data.validationErrors)
                setErrors(data=>({...e.response.data.validationErrors}))
                setApiProgress(false)
            }
        }
        
    }
    
    const disabled=formData.password===formData.passwordRepeat && formData.password!==""?false:true;
    const passportMismatch=formData.password!==formData.passwordRepeat?"Password mismatch":null
    
    return(
        <div className='col-lg-6 offset-lg-3 col-md-8 offset-md-2' data-testid='signup-page'>
            {!signUpSuccess&&<form className='card' data-testid="form-sign-up">
                <div className="card-header">
                    <h1 className="text-center">Sign Up</h1>
                </div>
                <div className="card-body">
                    <Input id="username" label="Username" onChange={handleChange} help={errors.username}/>
                    <Input id="email" label="Email" onChange={handleChange} help={errors.email}/>
                    <Input id="password" type="password" label="Password" onChange={handleChange} help={errors.password}/>
                    <Input id="passwordRepeat" type="password" label="Password Repeat" onChange={handleChange} help={passportMismatch}/>
                    <div className="text-center">
                        <ButtonWithProgress disabled={disabled} apiProgress={apiProgress} onClick={handleSubmit}>
                            Sign Up
                        </ButtonWithProgress>
                    </div>
                </div>

            </form>
            }
            {signUpSuccess && <Alert>Please check your e-mail to activate your account</Alert>}
        </div>
    )
}

export default SignUpPage;