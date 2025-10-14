import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Search, ChevronRight, BookOpen, ShoppingBag, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import Skeleton from '@/components/Skeleton';
import { Image } from 'expo-image';
import { contentData, ContentItem } from '@/utils/content';

type ContentType = 'All' | 'Recipes' | 'Articles' | 'Products';

const handleOpenLink = async (url: string, title: string) => {
  if (Platform.OS !== 'web') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  
  if (url) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open this link');
    }
  } else {
    Alert.alert('Coming Soon', `${title} will be available soon!`);
  }
};

export default function LearnScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<ContentType>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredContent = useMemo(
    () =>
      contentData.filter((item) => {
        const matchesSearch =
          searchQuery === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab =
          selectedTab === 'All' ||
          (selectedTab === 'Recipes' && item.type === 'recipe') ||
          (selectedTab === 'Articles' && item.type === 'article') ||
          (selectedTab === 'Products' && item.type === 'product');

        return matchesSearch && matchesTab;
      }),
    [searchQuery, selectedTab]
  );

  const tabs: ContentType[] = ['All', 'Recipes', 'Articles', 'Products'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn & Grow</Text>
        <Text style={styles.subtitle}>Recipes, tips, and expert guidance</Text>

        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes, articles, and products..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search content"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${tab}`}
            >
              <Text
                style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        initialNumToRender={10}
        windowSize={5}
        data={(loading ? Array.from({ length: 6 }, (_, i) => ({ id: `s-${i}`, type: 'skeleton' as const })) : filteredContent) as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          if (loading || item.type === 'skeleton') {
            return (
              <View style={styles.skeletonCard}>
                <Skeleton width={'100%'} height={180} />
                <View style={{ padding: spacing.md, gap: spacing.sm }}>
                  <Skeleton width={'60%'} height={16} />
                  <Skeleton width={'90%'} height={12} />
                </View>
              </View>
            );
          }
          if (item.type === 'recipe') {
            return <RecipeCard recipe={item} />;
          } else if (item.type === 'article') {
            return <ArticleCard article={item} />;
          } else if (item.type === 'product') {
            return <ProductCard product={item} />;
          }
          return null;
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={null}
      />
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: ContentItem }) {
  return (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open recipe ${recipe.title}`}
      onPress={() => handleOpenLink(recipe.url, recipe.title)}
    >
      {recipe.image && (
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
        </View>
        <Text style={styles.recipeDescription}>{recipe.desc}</Text>
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.recipeTags}>
            {recipe.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ArticleCard({ article }: { article: ContentItem }) {
  return (
    <TouchableOpacity
      style={styles.articleCard}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open article ${article.title}`}
      onPress={() => handleOpenLink(article.url, article.title)}
    >
      <View style={styles.articleIcon}>
        <BookOpen size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          {article.category && <Text style={styles.articleCategory}>{article.category}</Text>}
          {article.source && <Text style={styles.articleSource}>• {article.source}</Text>}
        </View>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleDescription}>{article.desc}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
    </TouchableOpacity>
  );
}

function ProductCard({ product }: { product: ContentItem }) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View product ${product.title}`}
      onPress={() => handleOpenLink(product.url, product.title)}
    >
      {product.image && (
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View style={styles.productContent}>
        <View style={styles.productHeader}>
          <View style={styles.productTitleContainer}>
            <Text style={styles.productTitle}>{product.title}</Text>
          </View>
          <View style={styles.productIcon}>
            <ShoppingBag size={20} color={colors.primary} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.productDescription}>{product.desc}</Text>
        
        {(product.price || product.rating) && (
          <View style={styles.productMeta}>
            {product.price && <Text style={styles.productPrice}>{product.price}</Text>}
            {product.rating && (
              <View style={styles.productRating}>
                <Star size={14} color={colors.primary} fill={colors.primary} strokeWidth={2} />
                <Text style={styles.productRatingText}>{product.rating}</Text>
              </View>
            )}
          </View>
        )}
        
        {product.whyRecommended && (
          <View style={styles.productRecommendation}>
            <Text style={styles.productRecommendationText}>
              💡 {product.whyRecommended}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  tabsContainer: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  tabsContent: {
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
  },
  recipeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  recipeImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surface,
  },
  recipeContent: {
    padding: spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  recipeTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  recipeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  articleCategory: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  articleSource: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  articleTitle: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  articleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface,
  },
  productContent: {
    padding: spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  productPrice: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productRatingText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  productRecommendation: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  productRecommendationText: {
    ...typography.small,
    color: colors.text,
    flex: 1,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
