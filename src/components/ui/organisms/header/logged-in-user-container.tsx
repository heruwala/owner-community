import React, {useEffect,useState} from 'react';
import PropTypes from 'prop-types';
import { useLazyQuery } from "@apollo/client";
import { LoggedInUserContainerCurrentUserQueryDocument } from '../../../../generated';

import { LoggedInUser, LoggedInUserPropTypes } from '../../molecules/logged-in-user';
import { useMsal } from '../../../shared/msal-react-lite';


const ComponentProps = {
  autoLogin: PropTypes.bool,
}

interface ComponentPropInterface {
  autoLogin: boolean;
}

export type HeaderPropTypes = PropTypes.InferProps<typeof ComponentProps> & ComponentPropInterface;

export const LoggedInUserContainer: React.FC<HeaderPropTypes> = (props) => {
  const { getIsLoggedIn, login, logout, registerCallback } = useMsal();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean|undefined>(undefined);

  const [loadUser,{called,loading, data, error}] = useLazyQuery(LoggedInUserContainerCurrentUserQueryDocument,{
    variables: {
    }
  })

  useEffect(() => {
    registerCallback('account',(result) => {
      setIsLoggedIn(result);
      if(!called){
        loadUser()
       }
    });

  }, [registerCallback,loadUser,called]);

  useEffect(() => {
    setIsLoggedIn(getIsLoggedIn('account'));
    /*
    if(!called){
      loadUser()
     }
     */
  }, [getIsLoggedIn,loadUser,called]);

  /*
  if(props.autoLogin && !isLoggedIn){
    
  }
  */
  
  const handleLogin = async() => {
    await login('account');
  }
  const handleSignUp = async() => {
    await login('account',new Map<string,string>([['option','signup']]));
  }
  const handleLogout = async() => {
    await logout('account');
  }

  

  if(isLoggedIn === true) {
    if(!called){
     // loadUser()
    }
    if(called && loading){
      return <div>Loading...</div>
    }
    if(called && error){
      return <div>Error :( {JSON.stringify(error)}
      </div>
    }
    if(called && data){

      const userData:LoggedInUserPropTypes = {data:{
        isLoggedIn:true,
        firstName:data.currentUser!.firstName??'',
        lastName:data.currentUser!.lastName??'',
        notificationCount:0,  
        profileImage:data.currentUser!?`https://sharethrift.blob.core.windows.net/public/${data.currentUser!.id}`:'',      
      }}

      return <LoggedInUser data={userData.data}
      onLogoutClicked={handleLogout}  />
    }
    return <>
      <div>
        <h1>HELLO THERE</h1>
      </div>
    </>

  }else if(isLoggedIn === false){
    return <>
      <LoggedInUser 
        data={{isLoggedIn:false}} 
        onLoginClicked={handleLogin}
        onSignupClicked={handleSignUp}  
         />
    </>
  } else {
   // setIsLoggedIn(getIsLoggedIn('account'));
   
    return <div>Don't Know...</div>
  }

    



  

}