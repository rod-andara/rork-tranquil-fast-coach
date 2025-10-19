import React, { useEffect, useMemo, useState } from 'react';
import {
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
    <View className="flex-1 bg-white dark:bg-neutral-50">
      {/* Header Section */}
      <View className="px-4 pt-6 pb-4 bg-white dark:bg-neutral-50">
        <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-800 mb-2">
          Learn & Grow
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-500 mb-4">
          Recipes, tips, and expert guidance
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white dark:bg-neutral-100 rounded-md px-4 py-2 border border-neutral-200 dark:border-neutral-300 mb-4 gap-2">
          <Search size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            className="flex-1 text-base text-neutral-800 dark:text-neutral-800 p-0"
            placeholder="Search recipes, articles, and products..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search content"
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`px-4 py-2 rounded-full border ${
                selectedTab === tab
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white dark:bg-neutral-100 border-neutral-200 dark:border-neutral-300'
              }`}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${tab}`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTab === tab ? 'text-white' : 'text-neutral-800 dark:text-neutral-800'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content List */}
      <FlatList
        initialNumToRender={10}
        windowSize={5}
        data={(loading ? Array.from({ length: 6 }, (_, i) => ({ id: `s-${i}`, type: 'skeleton' as const })) : filteredContent) as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          if (loading || item.type === 'skeleton') {
            return (
              <View className="bg-white dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-300 mb-4 overflow-hidden shadow-sm">
                <Skeleton width={'100%'} height={180} />
                <View style={{ padding: 16, gap: 8 }}>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={null}
      />
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: ContentItem }) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-300 mb-4 overflow-hidden shadow-sm"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open recipe ${recipe.title}`}
      onPress={() => handleOpenLink(recipe.url, recipe.title)}
    >
      {recipe.image && (
        <Image
          source={{ uri: recipe.image }}
          className="w-full h-[180px] bg-neutral-100 dark:bg-neutral-200"
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-800 flex-1">
            {recipe.title}
          </Text>
          <ChevronRight size={20} color="#6B7280" strokeWidth={2} />
        </View>
        <Text className="text-sm text-neutral-500 dark:text-neutral-500 mb-2">
          {recipe.desc}
        </Text>
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1">
            {recipe.tags.map((tag, index) => (
              <View key={index} className="bg-neutral-100 dark:bg-neutral-200 px-2 py-1 rounded-sm">
                <Text className="text-xs text-primary-600 font-medium">{tag}</Text>
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
      className="flex-row items-center bg-white dark:bg-neutral-100 p-4 rounded-lg border border-neutral-200 dark:border-neutral-300 mb-4 gap-4 shadow-sm"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open article ${article.title}`}
      onPress={() => handleOpenLink(article.url, article.title)}
    >
      <View className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-200 justify-center items-center">
        <BookOpen size={20} color="#7C3AED" strokeWidth={2} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          {article.category && (
            <Text className="text-xs font-semibold text-primary-600">{article.category}</Text>
          )}
          {article.source && (
            <Text className="text-xs text-neutral-500 dark:text-neutral-500 ml-1">
              • {article.source}
            </Text>
          )}
        </View>
        <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-800 mb-1">
          {article.title}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-500">{article.desc}</Text>
      </View>
      <ChevronRight size={20} color="#6B7280" strokeWidth={2} />
    </TouchableOpacity>
  );
}

function ProductCard({ product }: { product: ContentItem }) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-300 mb-4 overflow-hidden shadow-sm"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View product ${product.title}`}
      onPress={() => handleOpenLink(product.url, product.title)}
    >
      {product.image && (
        <Image
          source={{ uri: product.image }}
          className="w-full h-[160px] bg-neutral-100 dark:bg-neutral-200"
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-800 mb-1">
              {product.title}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-200 justify-center items-center">
            <ShoppingBag size={20} color="#7C3AED" strokeWidth={2} />
          </View>
        </View>
        <Text className="text-sm text-neutral-500 dark:text-neutral-500 mb-2">
          {product.desc}
        </Text>

        {(product.price || product.rating) && (
          <View className="flex-row items-center justify-between mb-2">
            {product.price && (
              <Text className="text-lg font-bold text-primary-600">{product.price}</Text>
            )}
            {product.rating && (
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#7C3AED" fill="#7C3AED" strokeWidth={2} />
                <Text className="text-xs text-neutral-500 dark:text-neutral-500 font-medium">
                  {product.rating}
                </Text>
              </View>
            )}
          </View>
        )}

        {product.whyRecommended && (
          <View className="bg-neutral-100 dark:bg-neutral-200 p-2 rounded-sm flex-row items-start gap-1">
            <Text className="text-xs text-neutral-800 dark:text-neutral-800 flex-1">
              💡 {product.whyRecommended}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
