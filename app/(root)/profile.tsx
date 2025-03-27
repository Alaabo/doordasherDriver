
import { View, Text, TouchableOpacity, Image, ImageSourcePropType, Alert, I18nManager } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import i18next, { t } from 'i18next'
import { logoutCurrentUser } from '@/lib/appwrite'
import { useTranslation } from "react-i18next";
import { useAuthContext } from '@/lib/authContext'
import i18n from '@/utils/i18n'
import { router, usePathname } from 'expo-router'

interface SettingsItemProp {
    icon: ImageSourcePropType;
    title: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
    isRTL : boolean
  }
  
  const SettingsItem = ({
    icon,
    title,
    onPress,
    textStyle,
    showArrow = true,
    isRTL
  }: SettingsItemProp) => {
    // Get arrow based on RTL direction
    const arrowIcon = images.rightArrow
    
    return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center justify-between py-3"
      style={{ alignContent: isRTL ? 'flex-end' : 'flex-start' }}
    >
      <View 
        className="flex flex-row items-center gap-3"
        style={{ alignContent: isRTL ? 'flex-end' : 'flex-start'}}
      >
        <Image source={icon} className="size-6" />
        <Text className={`text-lg font-Poppins-medium text-primary-300 ${textStyle}`}>
          {title}
        </Text>
      </View>
  
      {showArrow && <Image source={arrowIcon} className="size-5" />}
    </TouchableOpacity>
  )};

const Profile = () => {
    const { t } = useTranslation();
    const [isRTL , setIsRTL] = useState(false);
     const pathname = usePathname();
  useEffect(() => {
      // Check if current language is Arabic to set RTL
      const currentLanguage = i18next.language;
      
      const isArabicLanguage = currentLanguage === 'ar';
      setIsRTL(isArabicLanguage);
      
      
    }, [pathname ]);
    const {userData , reload} = useAuthContext()
    // const {user , refetch} = useGlobalContext()
    const handleLogout = async () => {
        const result = await logoutCurrentUser();
        if (result) {
          Alert.alert("Success", "Logged out successfully");
          reload();
        } else {
          reload();
          
        }
      };

    const switchLanguageHandler = async () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
  
        await i18n.changeLanguage(newLang); // Ensure the language is fully changed
        Alert.alert("Info", `Language is set to ${newLang}`);
        const isRTL = newLang === "ar";
  
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
          I18nManager.allowRTL(isRTL);
          
        }
        router.replace('/(root)/home')
    }
    
  return (
   <SafeAreaView className='p-2 h-full bg-white' style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
    <View style={{ alignContent: isRTL ? 'flex-end' : 'flex-start' }}>
        <Text className='text-4xl font-Poppins-bold'>
            {t('Profile')}
        </Text>

        <View className="flex flex-col items-center relative mt-5 w-full">
            <Image
              source={{ uri: userData?.avatar }}
              className="size-44 relative rounded-full"
            />
           
            <Text className="text-2xl text-primary-200 font-Poppins-bold mt-2">{userData?.name}</Text>
          </View>
    </View>
        <View className="flex flex-col mt-10">
          <SettingsItem onPress={()=>{router.push('/reqestHistory')}} showArrow={false} icon={images.calendar} title={t('deliveryHistory')} isRTL={isRTL}/>
          <SettingsItem onPress={()=>{router.push('/transactionsHistory')}} showArrow={false}  icon={images.wallet} title={t('TransactionsHistory')} isRTL={isRTL}/>
        </View>
        <SettingsItem
            icon={images.language}
            title={t('switchLuanguage')}
            textStyle="text-danger"
            showArrow={false}
            onPress={switchLanguageHandler}
            isRTL={isRTL}
          />
        <SettingsItem
            icon={images.logout}
            title={t("Logout")}
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
            isRTL={isRTL}
          />

   </SafeAreaView>
  )
}

export default Profile
// import { View, Text, TouchableOpacity, Image, ImageSourcePropType, Alert, I18nManager } from 'react-native'
// import React from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { images } from '@/constants'
// import { t } from 'i18next'
// import { logoutCurrentUser } from '@/lib/appwrite'
// import { useTranslation } from "react-i18next";
// import { useAuthContext } from '@/lib/authContext'
// import RNRestart from "react-native-restart";

// interface SettingsItemProp {
//     icon: ImageSourcePropType;
//     title: string;
//     onPress?: () => void;
//     textStyle?: string;
//     showArrow?: boolean;
//   }
  
//   const SettingsItem = ({
//     icon,
//     title,
//     onPress,
//     textStyle,
//     showArrow = true,
//   }: SettingsItemProp) => (
//     <TouchableOpacity
//       onPress={onPress}
//       className="flex flex-row items-center justify-between py-3"
//     >
//       <View className="flex flex-row items-center gap-3">
//         <Image source={icon} className="size-6" />
//         <Text className={`text-lg font-Poppins-medium text-primary-300 ${textStyle}`}>
//           {title}
//         </Text>
//       </View>
  
//       {showArrow && <Image source={images.rightArrow} className="size-5" />}
//     </TouchableOpacity>
//   );
// const profile = () => {
//     const { t, i18n } = useTranslation();
//     const {userData , reload} = useAuthContext()
//     // const {user , refetch} = useGlobalContext()
//     const handleLogout = async () => {
//         const result = await logoutCurrentUser();
//         if (result) {
//           Alert.alert("Success", "Logged out successfully");
//           reload();
//         } else {
//           Alert.alert("Error", "Failed to logout");
//         }
//       };

//     const switchLanguageHandler = async () => {

//         const newLang = i18n.language === "en" ? "ar" : "en";
  
//         await i18n.changeLanguage(newLang); // Ensure the language is fully changed
//         Alert.alert("Info", `Language is set to ${newLang}`);
//         const isRTL = newLang === "ar";
  
//   if (I18nManager.isRTL !== isRTL) {
//     I18nManager.forceRTL(isRTL);
//     I18nManager.allowRTL(isRTL);
//     RNRestart.Restart(); // Restart the app to apply changes
//   }
//     }
    
//   return (
//    <SafeAreaView className='p-2 h-full bg-white '>
//     <View>
//         <Text className='text-4xl font-Poppins-bold '>
//             {t('Profile')}
//         </Text>

//         <View className="flex flex-col items-center relative mt-5">
//             <Image
//               source={{ uri: userData?.avatar }}
//               className="size-44 relative rounded-full"
//             />
           
//             <Text className="text-2xl text-primary-200 font-Poppins-bold mt-2">{userData?.name}</Text>
//           </View>
//     </View>
//         <View className="flex flex-col mt-10">
//           <SettingsItem icon={images.calendar} title={t('deliveryHistory')} />
//           <SettingsItem icon={images.wallet} title={t('TransactionsHistory')} />
//         </View>
//         <SettingsItem
//             icon={images.language}
//             title={t('switchLuanguage')}
//             textStyle="text-danger"
//             showArrow={false}
//             onPress={switchLanguageHandler}
//           />
//         <SettingsItem
//             icon={images.logout}
//             title={t("Logout")}
//             textStyle="text-danger"
//             showArrow={false}
//             onPress={handleLogout}
//           />

//    </SafeAreaView>
//   )
// }

// export default profile


