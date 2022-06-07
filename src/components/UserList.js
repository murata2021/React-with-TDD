import { useEffect,useState } from "react";
import { loadUsers } from "../api/apiCalls";
import { Link } from "react-router-dom";
import UserListItem from "./UserListItem";
import Spinner from "./Spinner";

const UserList=()=>{


    const [userPages,setUserPages]=useState({
                                    page:{
                                        content:[],
                                        page:0,
                                        size:0,
                                        totalPages:0
                                    }
    })

    const [pendingApiCall,setPendingApiCall]=useState(false);

    const loadData=async(pageIndex)=>{
        setPendingApiCall(true)
        try{
            const response=await loadUsers(pageIndex)
            setUserPages(pages=>({...pages,...{page:response.data}}))
        }
        catch(e){
            console.log(e)
        }
        setPendingApiCall(false)

    } 

    useEffect(()=>{

        let isMounted=true
        
        if(isMounted)loadData();

        return ()=>isMounted=false
        
    },[])

    const {totalPages,page,content}=userPages.page
    let ShowNextButton=page+1<(totalPages)
    let ShowPreviousButton=page>0

    return(
        <div className="card">
            <div className='card-header text-center'>
                <h3>Users</h3>
            </div>
            <ul className='list-group list-group flush'>
                {content.map((user)=>{
                    return <UserListItem key={user.id} user={user}/>
                })}
            </ul>

            <div className="card-footer text-center">

                {
                !pendingApiCall && ShowPreviousButton && 
                    <button className='btn btn-outline-secondary btn-sm float-start' onClick={()=>loadData(page-1)}>
                        {'< previous'}
                    </button>
                }

                {
                !pendingApiCall && ShowNextButton && 
                    <button className='btn btn-outline-secondary btn-sm float-end' onClick={()=>loadData(page+1)}>
                        {'next >'}
                    </button>
                }
                {pendingApiCall&&<Spinner size='big'/>}


            </div>
            
        </div>
    )
}

export default UserList;