import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants'
import { LinearGradient } from "expo-linear-gradient";

import { useTranslation } from 'react-i18next';
import { useAuthContext, userProps } from '@/lib/authContext';
import { useLocationContext } from '@/lib/locationContxt';
import { Link, Redirect, router } from 'expo-router';
import { account } from '@/lib/appwrite';
import { reload } from 'expo-router/build/global-state/routing';


const Index = () => {
  const {t} = useTranslation()
  const {width , height } = Dimensions.get('screen')
  const { isLogged, authLoading, authErrors, loginHandler , reload} = useAuthContext();
  const { locationLoading } = useLocationContext();
  
  
 
  // Redirect if already logged in
  useEffect(() => {
        // Redirect if already logged in
      if (!locationLoading && !authLoading && isLogged) router.replace('/(root)/home')
      
  }, [locationLoading , authLoading , isLogged]);
 
  
  async function handleLogin() {
    try {
      if(isLogged) {router.replace('/(root)/home')} else { await loginHandler()}
     
      if(authErrors){
        Alert.alert('Error', `Login failed: ${authErrors}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Login failed: ${errorMessage}`);
    } 
  }

  return (
      <ImageBackground source={images.onBoarding} resizeMode='cover' className='flex justify-center items-center' style={{height : height , width : width}} >
        <LinearGradient
        colors={["rgba(0, 0, 0, 0.2)", "rgba(34, 150, 94, 0.9)"]} // Green gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlay}
      />
      <View>
        <Text className='text-6xl text-center font-Poppins-bold text-white' style={{borderBottomColor : 'white' , borderBottomWidth : 3}}>
            {t('appName')}
        </Text>
        <Text className='text-4xl font-Poppins-semibold text-center text-white'>
          {t('Driver Panel')}
        </Text>
      </View>
      <View>
      {
         (authLoading || locationLoading) ? (
            <ActivityIndicator size="large" color="green" />
        ) : (<TouchableOpacity onPress={handleLogin} className='flex-row items-center justify-center p-4 m-32' style={{ backgroundColor : "rgba(255, 255, 255, 0.8)"}}>
          {authLoading ? (<ActivityIndicator size="large" color="white" />) : (
           <>
          
           <Image source={images.google} className="w-8 h-8" />
               <Text className={`text-2xl text-green-500 font-Poppins-medium px-2 `}>
                 {t('login')}
               </Text>
               <Image 
                 source={images.rightArrow} 
                 className="w-8 h-8"
                 tintColor={'green'}
               />
            
           </>
          )}
          </TouchableOpacity>)
      }
      </View>
    </ImageBackground>
    
  )
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject, // Covers the entire background
    },
    content: {
      position: "absolute", // Ensures content is above the gradient
    },
  });
  

export default Index