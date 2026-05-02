import { styles } from './ProductList.styles';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Toast from 'react-native-toast-message'
import type { Product } from '../../types'
import ProductCard from '../ProductCard/ProductCard'
import useProductsStore from '../../features/products/store/useProductsStore'
import useLiveUpdates from '../../hooks/useLiveUpdates'
import useProducts from '../../hooks/useProducts'

export default function ProductList() {
  const { data, categories, filtered, searchQuery, selectedCategory, sortOption } =
    useProducts()

  const loadProducts = useProductsStore((s) => s.loadProducts)
  const setSearch = useProductsStore((s) => s.setSearch)
  const setCategoryFilter = useProductsStore((s) => s.setCategoryFilter)
  const setSort = useProductsStore((s) => s.setSort)
  const editCategory = useProductsStore((s) => s.editCategory)
  const undo = useProductsStore((s) => s.undo)
  const redo = useProductsStore((s) => s.redo)
  const canUndo = useProductsStore((s) => s.canUndo())
  const canRedo = useProductsStore((s) => s.canRedo())
  const isUpdating = useProductsStore((s) => s.isUpdating)
  const loading = useProductsStore((s) => s.loading)

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [editing, setEditing] = useState<{ id: number; visible: boolean } | null>(null)
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [highlightedProductId, setHighlightedProductId] = useState<number | null>(null)

  const previousDataRef = useRef(data)

  useLiveUpdates()

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(localSearch), 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearch])

  // Detect when prices/ratings update automatically (highlight animation)
  useEffect(() => {
    data.forEach((product) => {
      const prevProduct = previousDataRef.current.find((p) => p.id === product.id)
      if (prevProduct) {
        const priceChanged = prevProduct.price !== product.price
        const ratingChanged =
          prevProduct.rating?.rate !== product.rating?.rate ||
          prevProduct.rating?.count !== product.rating?.count

        if (priceChanged || ratingChanged) {
          setHighlightedProductId(product.id)
          setTimeout(() => setHighlightedProductId(null), 2000)
        }
      }
    })
    previousDataRef.current = data
  }, [data])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }, [loadProducts])

  const handleEditCategory = useCallback(
    (id: number, category: string) => {
      editCategory(id, category)
      setEditing(null)
    },
    [editCategory]
  )

  const handleUndo = useCallback(() => {
    undo()
    Toast.show({
      type: 'info',
      text1: 'Undo successful',
      position: 'top',
    })
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
    Toast.show({
      type: 'info',
      text1: 'Redo successful',
      position: 'top',
    })
  }, [redo])

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.item}>
        <ProductCard
          product={item}
          updating={!!isUpdating[item.id]}
          onEdit={() => setEditing({ id: item.id, visible: true })}
          highlighted={highlightedProductId === item.id}
        />
      </View>
    ),
    [isUpdating, highlightedProductId]
  )

  const keyExtractor = useCallback((item: Product) => String(item.id), [])

  const renderSkeleton = () => (
    <FlatList
      data={Array.from({ length: 6 })}
      renderItem={() => (
        <View style={[styles.item, styles.skeletonItem]}>
          <View style={styles.skeletonCard} />
        </View>
      )}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      numColumns={2}
      scrollEnabled={false}
    />
  )

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="inbox" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No products found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {/* Section 1: Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search products..."
            value={localSearch}
            onChangeText={setLocalSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {localSearch ? (
            <TouchableOpacity
              onPress={() => setLocalSearch('')}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#ccc"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Section 2: Category Filter */}
        <TouchableOpacity
          onPress={() => setCategoryFilterOpen(true)}
          style={[
            styles.filterButton,
            selectedCategory && styles.filterButtonActive,
          ]}
        >
          <MaterialCommunityIcons
            name="tag-outline"
            size={16}
            color={selectedCategory ? '#7c3aed' : '#666'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory && styles.filterButtonTextActive,
            ]}
            numberOfLines={1}
          >
            {selectedCategory || 'All categories'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={selectedCategory ? '#7c3aed' : '#666'}
          />
        </TouchableOpacity>

        {/* Active Category Chip */}
        {selectedCategory && (
          <View style={styles.activeFiltersRow}>
            <View style={styles.activeFilter}>
              <MaterialCommunityIcons
                name="tag"
                size={13}
                color="#7c3aed"
              />
              <Text style={styles.activeFilterText}>{selectedCategory}</Text>
              <TouchableOpacity
                onPress={() => setCategoryFilter(null)}
                style={styles.removeFilterButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={14}
                  color="#7c3aed"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setCategoryFilter(null)}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 3: Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() =>
              setSort(
                sortOption?.key === 'price' && sortOption.dir === 'asc'
                  ? { key: 'price', dir: 'desc' }
                  : { key: 'price', dir: 'asc' }
              )
            }
            style={[
              styles.actionButton,
              sortOption?.key === 'price' && styles.actionButtonActive,
            ]}
          >
            <MaterialCommunityIcons
              name={
                sortOption?.key === 'price'
                  ? sortOption.dir === 'asc'
                    ? 'arrow-up'
                    : 'arrow-down'
                  : 'sort'
              }
              size={15}
              color={sortOption?.key === 'price' ? '#7c3aed' : '#666'}
            />
            <Text
              style={[
                styles.actionButtonText,
                sortOption?.key === 'price' && styles.actionButtonTextActive,
              ]}
              numberOfLines={1}
            >
              Price
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setSort(
                sortOption?.key === 'rating' && sortOption.dir === 'asc'
                  ? { key: 'rating', dir: 'desc' }
                  : { key: 'rating', dir: 'asc' }
              )
            }
            style={[
              styles.actionButton,
              sortOption?.key === 'rating' && styles.actionButtonActive,
            ]}
          >
            <MaterialCommunityIcons
              name={
                sortOption?.key === 'rating'
                  ? sortOption.dir === 'asc'
                    ? 'arrow-up'
                    : 'arrow-down'
                  : 'sort'
              }
              size={15}
              color={sortOption?.key === 'rating' ? '#7c3aed' : '#666'}
            />
            <Text
              style={[
                styles.actionButtonText,
                sortOption?.key === 'rating' && styles.actionButtonTextActive,
              ]}
              numberOfLines={1}
            >
              Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUndo}
            style={[styles.actionButton, !canUndo && styles.actionButtonDisabled]}
            disabled={!canUndo}
          >
            <MaterialCommunityIcons
              name="undo"
              size={15}
              color={canUndo ? '#666' : '#ddd'}
            />
            <Text
              style={[
                styles.actionButtonText,
                !canUndo && styles.actionButtonTextDisabled,
              ]}
              numberOfLines={1}
            >
              Undo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            style={[styles.actionButton, !canRedo && styles.actionButtonDisabled]}
            disabled={!canRedo}
          >
            <MaterialCommunityIcons
              name="redo"
              size={15}
              color={canRedo ? '#666' : '#ddd'}
            />
            <Text
              style={[
                styles.actionButtonText,
                !canRedo && styles.actionButtonTextDisabled,
              ]}
              numberOfLines={1}
            >
              Redo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      {loading && data.length === 0 ? (
        renderSkeleton()
      ) : filtered.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          numColumns={2}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}

      {/* Edit Category Modal */}
      <Modal
        visible={!!editing?.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setEditing(null)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select category</Text>
                <TouchableOpacity onPress={() => setEditing(null)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalOptions} scrollEnabled={true}>
                {[
                  "men's clothing",
                  "women's clothing",
                  'jewelery',
                  'electronics',
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      if (editing) handleEditCategory(editing.id, cat)
                    }}
                    style={styles.categoryOption}
                  >
                    <Text style={styles.categoryOptionText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={categoryFilterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryFilterOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setCategoryFilterOpen(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter by category</Text>
                <TouchableOpacity onPress={() => setCategoryFilterOpen(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalOptions} scrollEnabled={true}>
                <TouchableOpacity
                  onPress={() => {
                    setCategoryFilter(null)
                    setCategoryFilterOpen(false)
                  }}
                  style={styles.categoryOption}
                >
                  <Text style={styles.categoryOptionText}>All categories</Text>
                  {!selectedCategory && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#7c3aed"
                    />
                  )}
                </TouchableOpacity>

                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategoryFilter(cat)
                      setCategoryFilterOpen(false)
                    }}
                    style={styles.categoryOption}
                  >
                    <Text style={styles.categoryOptionText}>{cat}</Text>
                    {selectedCategory === cat && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#7c3aed"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Toast />
    </View>
  )
}


