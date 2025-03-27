import { images } from '@/constants';
import { useAuthContext } from '@/lib/authContext';
import { Redirect, Tabs } from 'expo-router';
import { t } from 'i18next';
import React from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Platform, SafeAreaView, Text, View } from 'react-native';



export default function TabLayout() {
   // const { loading , isLogged} = 
   const { isLogged , authLoading} = useAuthContext()
   
   const TabIcon = ({
     focused,
     icon,
     title,
   }: {
     focused: boolean;
     icon: ImageSourcePropType;
     title: string;
   }) => (
     <View  style={{ display : 'flex' , width : 160 , height : 30 ,  justifyContent : 'center' , alignItems : 'center'}}>
       <Image
         source={icon}
         tintColor={focused ? "#0061FF" : "#666876"}
         resizeMode="contain"
         style={{width : 20 , height : 20}}
       />
       <Text
       style={{width : 100}}
         className={`${
           focused
             ? "text-primary-300 font-Poppins-bold"
             : "text-black-200 font-Poppins-medium"
         } text-md w-50 text-center `}
       >
         {t(title)}
       </Text>
     </View>
   );
   if(authLoading){
     return (
       <SafeAreaView className='flex-1 h-screen bg-primary-200 items-center justify-center'>
         <ActivityIndicator  size={100} className='text-primary-200'/>
         <Text className='font-Poppins-Thin text-5xl'>Loading</Text>
       </SafeAreaView>
     )
   }
 
   if(!isLogged) return <Redirect href='/'/>

  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "white",
        position: "absolute",
        borderTopColor: "black",
        padding : 10 ,
        borderRadius : 25 ,
        borderWidth: 4,
        display : 'flex' ,
        alignItems : 'center' ,
        justifyContent : 'center' ,
        alignSelf : 'center'
        
      },
    }}>
      <Tabs.Screen
     name="profile"
     options={{
       
       headerShown: false,
       tabBarIcon: ({ focused }) => (
         <TabIcon focused={focused} icon={images.user} title={t("Profile")} />
       ),
     }}
   />
         <Tabs.Screen
        name="home"
        options={{
         
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={images.home}title={t("Home")} />
          ),
        }}
      />
    </Tabs>
  );
}
