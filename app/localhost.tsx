import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'

const localhost = () => {
  useEffect(() => {
    router.replace('/(root)/home')
  
    
  }, [])
  return (
    <View>
      <Text>localhost</Text>
    </View>
  )
}

export default localhost