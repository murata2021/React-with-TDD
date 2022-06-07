import defaultProfileImage from '../assets/profile.png'
import { AuthContext } from "../state/AuthContextWrapper";
import { useContext, useState } from 'react';
import {useSelector,useDispatch} from 'react-redux';
import Input from './Input';
import { updateUser,deleteUser } from '../api/apiCalls';
import ButtonWithProgress from './ButtonWithProgress';
import Modal from './Modal';
import { useHistory } from 'react-router-dom';

import { logoutSuccess,updateSuccess } from '../state/authActions';


const ProfileCard=(props)=>{

    const history=useHistory()
    

    // const auth=useContext(AuthContext)
    const {id
        // ,header
        ,username}=useSelector((store)=>({id:store.id,username:
        store.username
        // ,header:store.header
    }))
    const dispatch=useDispatch()



    const [inEditMode,setEditMode]=useState(false)
    const [updateApiProgress,setUpdateApiProgress]=useState(false)
    const [deleteApiProgress,setDeleteApiProgress]=useState(false)
    const [modalVisible,setModalVisible]=useState(false)
    const {user}=props;
    const [newUsername,setNewUsername]=useState(user.username)

    
    const onClickSave=async()=>{
        setUpdateApiProgress(true)
        try{
            await updateUser(user.id,{username:newUsername}
                // ,header
                )
            setEditMode(false)
            dispatch(updateSuccess({
                            username:newUsername
                }))
            // dispatch({
            //     type:"user-update-success",
            //     payload:{
            //         username:newUsername
            //     }
            // })

        }catch(error){}
        setUpdateApiProgress(false)
    }

    const onClickCancel=()=>{
        setEditMode(false);
        setNewUsername(username)

    }

    const onClickCancelDelete=()=>{
        setModalVisible(false)
    }

    const onClickDelete=async ()=>{
        setDeleteApiProgress(true)
        try{
            await deleteUser(id)
            history.push("/")
            dispatch(logoutSuccess())
            // dispatch({type:"logout-success"})
        }
        catch(error){}

        setDeleteApiProgress(false)

    }
    let content;

    if(inEditMode){

        content=
        <>
            <Input 
                onChange={(event)=>{setNewUsername(event.target.value)}}
                initialValue={newUsername} 
                id="username" 
                label='Change your username'
                />
            <ButtonWithProgress onClick={onClickSave} apiProgress={updateApiProgress}>Save</ButtonWithProgress>
            <button onClick={onClickCancel} className="btn btn-outline-secondary" >Cancel</button>
        </>
    }
    else{

        content=(
            <>
            <h3>{newUsername}</h3>
            {
                user.id===id &&
                <>
                <div>
                    <button
                        onClick={()=>setEditMode(true)} className="btn btn-outline-success">
                        Edit
                    </button>
                </div>
                <div className='pt-2'>
                    <button
                        onClick={()=>setModalVisible(true)}
                        className="btn btn-danger">
                        Delete My Account
                    </button>
                </div>
                </>
            }
            </>  
        )
    }

    return(
        <>
            <div className='card text-center'>
                <div className='card-header'>
                    <img className='rounded-circle shadow' src={defaultProfileImage} width='200' height='200 'alt="profile"/>
                </div>
                <div className='card-body'>
                    {content}
                </div>
            </div>
            {modalVisible &&
             <Modal 
                content="Are you sure to delete your account?"
                onClickCancel={onClickCancelDelete}
                onClickConfirm={onClickDelete}
                apiProgress={deleteApiProgress}
            />}
        </>
    )

}

export default ProfileCard;