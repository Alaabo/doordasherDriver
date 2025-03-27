import {Account, AppwriteException, Avatars, Client, Databases, ID, OAuthProvider, Query } from "react-native-appwrite"


import { openAuthSessionAsync } from "expo-web-browser";

import { DBUser, RequestType, Transaction } from "@/types/globals";


import { makeRedirectUri } from 'expo-auth-session'
import { router } from "expo-router";
import { LocationProp } from "./locationContxt";







export const config = {
    Platform : 'com.alaabo.doordasher',
    Platform2 : "doordasherWeb",
    endpoint : process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectd : process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ,
    databseId : process.env.EXPO_PUBLIC_APPWRITE_DATABASEID
}


export const client = new Client()

client
        .setEndpoint(config.endpoint!)
        .setProject(config.projectd!)
        .setPlatform(config.Platform)
        

        



export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function login() {
  try {
    let redirectScheme = new URL(makeRedirectUri())

    // HACK: localhost is a hack to get the redirection possible
    if (!redirectScheme.hostname) {
      redirectScheme.hostname = `localhost`;
    }
    const scheme = redirectScheme.protocol
   

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${redirectScheme}`,
      `${redirectScheme}`
    );
    if (!response) return {succes : false , message : "Create OAuth2 token failed"};

    const browserResult = await openAuthSessionAsync(
      `${response}`,
      scheme
    );
    if (browserResult.type !== "success") return {succes : false , message : "Create OAuth2 token failed"};
      

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");
    console.log('udfhgkdufhngkfdjhg');
    
    const session = await account.createSession(userId, secret);
    console.log(session)
    
    if (!session) throw new Error("Failed to create session");
    const user = await readUser(userId)
    if(user){
      
      //@ts-ignore
    if(!user.role === 'driver'){
      await account.deleteSessions()
      return {succes : false , message : 'You are not driver Yet , Contact support to activate it'}
    }else{
      return {succes : true , user : {$id: user.$id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'driver',
        phone: user.phone,}}
      //@ts-ignore
      
    }
   }
    
    
  } catch (error) {
    console.log(error)
    console.log('returned error from login');
    
    return {succes : false};
  }
}
// export async function login() {
//   try {
//     let redirectScheme = makeRedirectUri();

//     // HACK: localhost is a hack to get the redirection possible
//     if (!redirectScheme.includes('localhost')) {
//       redirectScheme = `${redirectScheme}localhost`;
//     }
//     console.log(redirectScheme)
   
    
//     const response =  account.createOAuth2Token(
//       OAuthProvider.Google,
//       redirectScheme
//     );
//     console.log(response)
//     if (!response) throw new Error("Create OAuth2 token failed");

//     const browserResult = await openAuthSessionAsync(
//       response.href,
//       redirectScheme
//     );
//     console.log(browserResult)
    
//     if (browserResult.type !== "success")
//       throw new Error("Create OAuth2 token failed");

//     const url = new URL(browserResult.url);
//     const secret = url.searchParams.get("secret")?.toString();
//     const userId = url.searchParams.get("userId")?.toString();
//     if (!secret || !userId) throw new Error("Create OAuth2 token failed");

//     const session = await account.createSession(userId, secret);
//     if (!session) throw new Error("Failed to create session");
    
//     return {succes : true}
    
//   } catch (error) {
//     console.log(error)
//     return {succes : false};
//   }
// }



export async function logoutCurrentUser() {
    try {
      const result = await account.deleteSession("current");
      router.replace('/')
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  
  export async function ChekAuthState() {
    try {
      const currentAccount = await account.get();
      if( currentAccount){
       return currentAccount 
      }
      return null
  } catch (error) {

      // if (error instanceof AppwriteException && error.code === 401) {
      //   console.log("no logged user")
      //   return null
      // }else {

      // }
      console.error('Auth check failed:', error);
     
      
      
     
      
    } 
  }



export const readUser = async (id : string ) =>{
      try {
        const user = await databases.getDocument(config.databseId! , "users" , id)
        
        if(!user) return null

        return user
      } catch (error : any) {
        console.log(error)
        if (error.code === 404 ) return null
        return error
      }
}

export const getNearby = async (location : LocationProp)=>{
  try {
    const R = 6371; // Earth's radius in km
    const latDelta = 10 / R * (180 / Math.PI);
    const lngDelta = 10 / (R * Math.cos((location.latitude * Math.PI) / 180)) * (180 / Math.PI);

    const minLat = location.latitude - latDelta;
    const maxLat = location.latitude + latDelta;
    const minLng = location.longitude - lngDelta;
    const maxLng = location.longitude + lngDelta;

    const requests = await databases.listDocuments(config.databseId , "requests" , [
      Query.between('pickUpLan' , minLat , maxLat),
      Query.between('pickUpLon' , minLng , maxLng),
      Query.equal('status' , ['pending'])
    ])

    return requests as unknown as RequestType[]

  } catch (error) {
    console.log(error)
    return error as Error
  }
}
export const getRequestByDriver = async (id : string)=>{
  try {
    

 

    const requests = await databases.listDocuments(config.databseId , "requests" , [
      Query.equal('status' , ['onRoad']),
      Query.equal('driverId' , id)
    ])

    return requests as unknown as RequestType[]

  } catch (error) {
    console.log(error)
    return error as Error
  }
}
export const getRequestByDriverAll = async (id : string)=>{
  try {
    

 

    const requests = await databases.listDocuments(config.databseId , "requests" , [
      Query.equal('driverId' , id)
    ])

    return requests as unknown as RequestType[]

  } catch (error) {
    console.log(error)
    return error as Error
  }
}

export const createReq = async (req : Partial<RequestType>) : Promise<RequestType | Error> =>{
  try {
    const results = await databases.createDocument(config.databseId! , "requests" , ID.unique()  ,req)
    return results.documents as unknown as RequestType
   
  } catch (
    error
  ) {
    console.log(error)
    return error as Error
  }
}

export const deleteReq = async (id : string)=>{
     try {
        await databases.deleteDocument(config.databseId! , "requests" ,id)
     } catch (error) {
        console.log(error)
     }

}

export const updateReq = async (request : RequestType)=>{
     try {
        await databases.updateDocument(config.databseId! , "requests" ,request.$id! , request)
     } catch (error) {
        console.log(error)
     }

}

export const getReq = async (id : string) => {
    try {
      const requests  = await databases.listDocuments(config.databseId! ,"requests" , [
        Query.equal("user" , id) 
      ])
      if(requests.total == 0) return null

      return requests.documents
    } catch (error) {
      console.log(error)
    }
}
export const getReqComplete = async (id : string) => {
    try {
      const requests  = await databases.listDocuments(config.databseId! ,"requests" , [
        Query.equal("user" , id) ,
        Query.equal('status' , ['pending' , 'onRoad' , 'accepted']), 
        Query.limit(10)
      ])
      if(requests.total == 0) return null

      return requests.documents
    } catch (error) {
      console.log(error)
    }
}
export const getReqById = async (id : string) =>{
  try {
    const request = await databases.getDocument(config.databseId! , "requests" , id)

    if(!request) return null

    return request
  } catch (error : any) {
    console.log(error)
    if (error.message === "Document with the requested ID could not be found" ) return null
    return error
  }
}
export const getCompletedTransactions = async (id : string) => {
  try {
    const requests  = await databases.listDocuments(config.databseId! ,"transactions" , [
      Query.equal("user" , id) ,
      Query.equal('status' , 'completed') ,
      Query.limit(10)
    ])
    if(requests.total == 0) return null

    return requests.documents
  } catch (error) {
    console.log(error)
  }
}
export const getAllTransactions = async (id : string) => {
  try {
    const requests  = await databases.listDocuments(config.databseId! ,"transactions" , [
      Query.equal("driver" , id)
    ])
    if(requests.total == 0) return null

    return requests.documents
  } catch (error) {
    console.log(error)
  }
}

export const createTraansaction = async (transaction : Partial<Transaction>)=>{
  try {
    const transactionResult = await databases.createDocument(config.databseId! , 'transactions' , ID.unique() , {
      amount : transaction.amount,
      createdAt : transaction.createdAt,
      request : transaction.request , 
      driver : transaction.driver ,
      user : transaction.user,
      status : 'pending'
    })

    console.log(transactionResult);
    
  } catch (error) {
    console.log(error)
  }
}

export const payTransaction = async (driverid : string , requestId : string)=>{
  try {
    const transactionResult = await databases.listDocuments(config.databseId! , 'transactions' ,[
      Query.equal( 'request' , requestId)
    ])
  
    await databases.updateDocument(config.databseId! , 'transactions' , transactionResult.documents[0].$id! , {status : 'completed' , driver : driverid})
  } catch (error) {
    console.log(error)
  }
}
export const appendTransaction = async (driverid : string , requestId : string)=>{
  try {
    const transactionResult = await databases.listDocuments(config.databseId! , 'transactions' ,[
      Query.equal( 'request' , requestId)
    ])
  
    await databases.updateDocument(config.databseId! , 'transactions' , transactionResult.documents[0].$id! , {status : 'pending' , driver : driverid})
  } catch (error) {
    console.log(error)
  }
}
export const cancelTransaction = async (requestId : string , driverId : string)=>{
  try {
    const transactionResult = await databases.listDocuments(config.databseId! , 'transactions' ,[
      Query.equal( 'request' , requestId)
    ])
  
    await databases.updateDocument(config.databseId! , 'transactions' , transactionResult.documents[0].$id! , {status : 'failed' , driver : driverId})
  } catch (error) {
    console.log(error)
  }
}