import React, { FC, useEffect } from 'react';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  from,
} from '@apollo/client';

import { setContext } from '@apollo/client/link/context';
import { useMsal } from './msal-react-lite';
import { BatchHttpLink } from "@apollo/client/link/batch-http";

export interface AuthProps {
  AuthenticationIdentifier?: string
}

const ApolloConnection: FC<any> = (props) => {

  const { getAuthToken,getSilentAuthResult, getIsLoggedIn } = useMsal();

  const hasAuth = props.AuthenticationIdentifier !== null && typeof props.AuthenticationIdentifier !== "undefined";
  
  const withToken = setContext(async (_, { headers }) => {
    if(hasAuth){
      const token = await getSilentAuthResult(props.AuthenticationIdentifier);
      console.log('auth-token',token);
      var returnHeaders = {...headers};
      if(token && token.accessToken){ returnHeaders['Authorization'] = `Bearer ${token.accessToken}`; }
      if(localStorage.getItem('community') !== null){ returnHeaders['community'] = localStorage.getItem('community')?.replaceAll('"',''); }
      console.log('returnHeaders',returnHeaders);
      return {headers: returnHeaders};
      /*
      return {
        
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token.accessToken}` : null,
          community: localStorage.getItem('community')?.replaceAll('"','') || null
        },
      };
      */
    }else {
      return {
        headers: {
          ...headers
        },
      };
    }
  });

  const httpLink = new BatchHttpLink({ 
    uri: `${process.env.REACT_APP_FUNCTION_ENDPOINT}`,
    batchMax: 15, // No more than 15 operations per batch
    batchInterval: 50 // Wait no more than 50ms after first batched operation
  });
  const cache = new InMemoryCache();
  
  const client = new ApolloClient({
    link: from([withToken, httpLink]),
    cache: cache,
  });

  useEffect(() => {
    if (hasAuth && !getIsLoggedIn(props.AuthenticationIdentifier) && client) {
      (async () => {
        try{  // will throw exception if not connected
          await client.resetStore(); //clear Apollo cache when user logs off
        } catch(err){
          if(err instanceof Error && err.message !== 'Failed to fetch'){
            console.error("Apollo Reset error",err);
          }
        }
      })();
    }
  }, [getIsLoggedIn,hasAuth, props.AuthenticationIdentifier]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};

export default ApolloConnection;