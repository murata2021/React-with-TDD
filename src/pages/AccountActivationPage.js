import { findAllByTestId } from "@testing-library/react";
import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";

import {activate} from "../api/apiCalls"
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";

const AccountActivationPage=(props)=>{

    const [result,setResult]=useState();
    const {token}=props.match.params

    useEffect(()=>{
        let isMounted = true
        const activateRequest=async()=>{
            setResult()

            try{
                await activate(token)
                if (isMounted) setResult('success')
            }
            catch(e){
                if(isMounted) setResult("fail")
            }
        }
        activateRequest(token)
        return()=>{
             isMounted=false}

    },[token])

    let content=(
        <Alert type='secondary' center>
            <Spinner size='big'/>
        </Alert>
    )
    if(result==='success'){
        content=(<Alert>Account is activated</Alert>)
    }
    else if(result==='fail'){
        content=(<Alert type='danger'>Activation failure</Alert>)
    }

    return(
        <div data-testid='activation-page'>
            {content}
        </div>
    )
}

export default AccountActivationPage;