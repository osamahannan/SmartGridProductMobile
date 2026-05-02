import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StatusBar } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { styles } from './SplashScreen.styles'

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    // Start animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for a moment, then replace the navigation stack to go to main app
      setTimeout(() => {
        navigation.replace('Products')
      }, 1200)
    })
  }, [fadeAnim, scaleAnim, navigation])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons name="view-grid-outline" size={90} color="#ffffff" />
        <Text style={styles.title}>SmartGrid</Text>
        <Text style={styles.subtitle}>Products</Text>
      </Animated.View>
    </View>
  )
}
