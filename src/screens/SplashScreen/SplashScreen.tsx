import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StatusBar, StyleSheet } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'
import { styles } from './SplashScreen.styles'

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.6)).current

  const loaderAnim = useRef(new Animated.Value(0)).current

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

    // Endless loading bar animation
    Animated.loop(
      Animated.timing(loaderAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start()
  }, [fadeAnim, scaleAnim, loaderAnim, navigation])

  const translateX = loaderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  })

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
        
        {/* Animated Gradient Loader */}
        <View style={styles.loaderTrack}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  )
}
