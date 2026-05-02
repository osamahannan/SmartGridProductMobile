import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, View, LayoutChangeEvent, ViewStyle, StyleProp } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type Props = {
  style?: StyleProp<ViewStyle>
  colors?: [string, string, string]
  duration?: number
  delay?: number
  baseColor?: string
}

export default function Shimmer({
  style,
  colors = ['#e2e8f0', '#f8fafc', '#e2e8f0'],
  duration = 1200,
  delay = 0,
  baseColor = '#e2e8f0',
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      })
    )

    animation.start()

    return () => {
      animation.stop()
      animatedValue.stopAnimation()
      animatedValue.setValue(0)
    }
  }, [animatedValue, duration, delay])

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  })

  return (
    <View onLayout={onLayout} style={[styles.container, { backgroundColor: baseColor }, style]}>
      {width > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
})
