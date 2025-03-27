import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { t } from "i18next";
import { router } from "expo-router";
import {  account, ChekAuthState, logoutCurrentUser, readUser } from "./appwrite";
import { makeRedirectUri } from "expo-auth-session";
import { OAuthProvider } from "react-native-appwrite";
import { openAuthSessionAsync } from "expo-web-browser";
export interface userProps {
    $id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'driver';
    phone: string;
   
}
interface AuthContextProps {
    isLogged : boolean ,
    userData : userProps | null,
    authLoading : boolean , 
    authErrors : string | null ,
    reload : () => Promise<void>,
    logout: () => Promise<void>,
    setUserAfterLogin: (user : userProps) =>Promise<void>,
    loginHandler : () => Promise<void>
}
interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps ) => {
    const [isLogged, setisLogged] = useState<boolean>(false)
    const [userData, setUserData] = useState<userProps | null>(null)
    const [authLoading, setAuthLoading] = useState<boolean>(false)
    const [authErrors, setAuthErrors] = useState<string | null>(null)
    

    const setUserAfterLogin = async (user : userProps)=>{
        try {
            setAuthLoading(true);
            setAuthErrors(null);
            setUserData(user)
        } catch (error) {
            setUserData(null)
            setAuthErrors(`login error due to unexpected reasons`)
        }finally{
            setAuthLoading(false)
        }
    }
    
    
    const reload = async () =>{
        try {
            setAuthLoading(true);
            setAuthErrors(null);
            const checkForAuth = await account.get();          
            
            if(!checkForAuth){
                
                
                setUserData(null)
                setAuthErrors('No User Logged In')
                
                setisLogged(false)
                return
            }
            const user = await readUser(checkForAuth.$id)
            setUserData(user)
            
            setAuthErrors(null)
            
            setisLogged(true)
        
            
        } catch (error) {
            console.log(error)
            setUserData(null),
            setAuthErrors('Error while trying to reload auth state')
            
            setisLogged(false)
            return
        } finally {
            setAuthLoading(false)
        }
    }
    const loginHandler= async () => {
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
            if (!response) {setAuthErrors("Create OAuth2 token failed") ; setUserData(null) ; setisLogged(false); setAuthLoading(false) ; return}
        
            const browserResult = await openAuthSessionAsync(
              `${response}`,
              scheme
            );
            if (browserResult.type !== "success") {{setAuthErrors("Create OAuth2 token failed") ; setUserData(null) ; setisLogged(false); setAuthLoading(false) ; return}}
              
            
            
            const url = new URL(browserResult.url);
            const secret = url.searchParams.get("secret")?.toString();
            const userId = url.searchParams.get("userId")?.toString();
            if (!secret || !userId) {{setAuthErrors("Google auth failed") ; setUserData(null) ; setAuthLoading(false) ; return}}
            const session = await account.createSession(userId, secret);            
            if (!session) {{setAuthErrors("creating session failed") ; setUserData(null) ; setAuthLoading(false) ; setisLogged(false) ; return}}
            const user = await readUser(userId)
            if(user && user.role==='driver'){
                setUserData(user)
                setisLogged(true)
                setAuthErrors(null)
                router.replace('/(root)/home')
            }else{
                await account.deleteSessions()
                setisLogged(false)
                setUserData(null)
                setAuthErrors('either you are a new client or not a driver please contact support')
            }
              
            
           
            
            
          } catch (error) {
             setisLogged(false)
            //@ts-ignore
            setAuthErrors(error.message)
            setUserData(null)
          }finally{
            setAuthLoading(false)
          }
        }
    
    const logout = async () =>{
       try {
            await account.deleteSessions()
            setUserData(null)
            setisLogged(false)
            router.replace('/')

       } catch (error) {
            //@ts-ignore
            setAuthErrors(error.message)
       }
    }
    
    useEffect(() => {
        reload()
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // When app comes back to active state, check auth again
            if (nextAppState === 'active') {
                reload();
            }
        });
        return () => {
            subscription.remove();
        };
    }, [])
    
    

    return (
        <AuthContext.Provider
            value={
                {
                    isLogged ,
                    userData ,
                    authLoading ,
                    authErrors ,
                    reload ,
                    logout ,
                    setUserAfterLogin,
                    loginHandler


                }
            }
        >
            {children}
        </AuthContext.Provider>
    )
}


export const useAuthContext = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("Location Provider must be used within a GlobalProvider");

    return context;
};