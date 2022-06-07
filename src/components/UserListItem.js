import {Link} from 'react-router-dom'
import defaultProfileImage from '../assets/profile.png'

const UserListItem=(props)=>{


    const {user}=props
    return(
        <>
            <Link style={{cursor:'pointer',textDecoration:"none",color:'black'}} to={`/users/${user.id}`}>
                <li className='list-group-item list-group-item-action'>
                    <img className='rounded-circle shadow-sm' src={defaultProfileImage} width='30' alt="profile"/>
                    <span style={{marginLeft:"4px"}}>{user.username}</span>
                </li>
            </Link>

        </>
    )

}

export default UserListItem;