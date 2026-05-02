import React, { memo, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import type { Product } from '../types'

type Props = {
  product: Product
  onEdit: () => void
  updating?: boolean
  highlighted?: boolean
}

function ProductCardComponent({ product, onEdit, updating, highlighted }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const highlightAnim = useRef(new Animated.Value(0)).current

  // Highlight animation when price/rating updates automatically
  useEffect(() => {
    if (highlighted) {
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 500,
          delay: 1000,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [highlighted, highlightAnim])

  const handlePressIn = () => {
    if (!updating) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
      }).start()
    }
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start()
  }

  const highlightColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#fef3f8'],
  })

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: highlightColor,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={updating}
          style={styles.touchable}
        >
          {/* Header: Title + Price */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {product.title}
            </Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>

          {/* Category Chip */}
          <View style={styles.categoryChip}>
            <MaterialCommunityIcons name="tag-outline" size={12} color="#7c3aed" />
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          {/* Rating with Star */}
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color="#fbb040" />
            <Text style={styles.ratingValue}>
              {product.rating?.rate?.toFixed(1)}
            </Text>
            <Text style={styles.ratingCount}>({product.rating?.count ?? 0})</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={onEdit}
            disabled={updating}
            style={[styles.editButton, updating && styles.editButtonDisabled]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={13}
              color={updating ? '#ccc' : '#7c3aed'}
            />
            <Text
              style={[
                styles.editButtonText,
                updating && styles.editButtonTextDisabled,
              ]}
            >
              Edit
            </Text>
          </TouchableOpacity>

          {/* Updating Overlay */}
          {updating && (
            <View style={styles.updatingOverlay}>
              <Animated.View style={[styles.spinner, { opacity: 0.7 }]} />
              <Text style={styles.updatingText}>Saving...</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    overflow: 'hidden',
  },
  touchable: {
    padding: 11,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 9,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    lineHeight: 16,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    minWidth: 45,
    textAlign: 'right',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#f3f0ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 9,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  ratingCount: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#d8d5ff',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    alignSelf: 'flex-end',
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7c3aed',
  },
  editButtonTextDisabled: {
    color: '#ccc',
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#e6e6e6',
    borderTopColor: '#7c3aed',
  },
  updatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
})

export default memo(ProductCardComponent)
