
import { useParams } from "react-router-dom";
import defaultProfileImage from '../assets/profile.png'
import { getUserById } from "../api/apiCalls";
import { useEffect,useState } from "react";
import ProfileCard from "../components/ProfileCard";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import { AuthContext } from "../App";
import { useContext } from "react";

const UserPage=(props)=>{

    const {id}=props.match.params

    // const auth=useContext(AuthContext)

    const [user,setUser] =useState({})
    const [pendingApiCall,setPendingApiCall]=useState(false)
    const [failedResponse,setFailedResponse]=useState()

    useEffect(()=>{
        let isMounted=true
        async function loadUserById(){
            setPendingApiCall(true)
            try{
                const response=await getUserById(id)
                setUser((user)=>({...response.data}))
            }
            catch(error){
                console.log(error)
                setFailedResponse({failResponse:error.response.data.message})
            }
            setPendingApiCall(false)
        }
        if (isMounted) loadUserById()


        return (()=>isMounted=false)
            
    },[id])

    let content=(
        <Alert type='secondary' center>
            <Spinner size='big'/>
        </Alert>
    )

    if(!pendingApiCall){
        if(failedResponse){
            content=<Alert type='danger' center>{failedResponse.failResponse}</Alert>
        }
        else{
            content=<ProfileCard user={user}/>
        }

    }
    return(
        <div data-testid='user-page'>
            {content}
        </div>
    )
}

export default UserPage;