// ProductListScreen.tsx
import React, { useCallback } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ProductList from '../components/ProductList'
import useProductsStore from '../features/products/store/useProductsStore'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProductListScreen() {
  const loadProducts = useProductsStore((s) => s.loadProducts)

  const handleRefresh = useCallback(async () => {
    await loadProducts()
  }, [loadProducts])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        // barStyle={isDark ? 'light-content' : 'dark-content'}
        barStyle='dark-content'
        translucent
        backgroundColor="transparent"
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.iconButton}>
            <MaterialCommunityIcons name="refresh" size={20} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#111" />
              <View style={styles.badge} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List Component – no internal title */}
      <ProductList />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
  },
})