import { View, Text } from 'react-native'
import React from 'react'
import { usePathname } from 'expo-router'

const NotFoundScreen = () => {
  const path = usePathname()
  return (
    <View>
      <Text>{path}</Text>
      <Text>NotFoundScreen</Text>
    </View>
  )
}

export default NotFoundScreen