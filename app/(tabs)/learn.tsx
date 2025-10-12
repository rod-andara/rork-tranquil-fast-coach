import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Search, ChevronRight, BookOpen, Utensils } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type ContentType = 'All' | 'Recipes' | 'Articles' | 'Products';

interface Recipe {
  id: string;
  type: 'recipe';
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface Article {
  id: string;
  type: 'article';
  title: string;
  description: string;
  source: string;
  category: string;
}

type ContentItem = Recipe | Article;

const CONTENT: ContentItem[] = [
  {
    id: '1',
    type: 'recipe',
    title: 'Mediterranean Quinoa Breakfast Bowl',
    description: 'Perfect for breaking your fast with 25g of protein and healthy fats',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tags: ['High Protein', 'Mediterranean', 'Quick'],
  },
  {
    id: '2',
    type: 'recipe',
    title: 'Salmon Avocado Power Bowl',
    description: 'Low-carb, high-fat meal packed with omega-3s and nutrients',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    tags: ['Keto', 'Low Carb', 'Healthy Fats'],
  },
  {
    id: '3',
    type: 'recipe',
    title: 'Complete Nutrition Buddha Bowl',
    description: 'Nutrient-dense meal with everything you need in one bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['OMAD', 'Complete Nutrition', 'Plant-Based'],
  },
  {
    id: '4',
    type: 'article',
    title: 'The Complete Guide to Intermittent Fasting',
    description: 'Evidence-based overview of intermittent fasting benefits and methods',
    source: 'Healthline',
    category: 'Science',
  },
  {
    id: '5',
    type: 'article',
    title: 'Essential Electrolytes During Fasting',
    description: 'Why electrolytes matter and how to maintain proper balance while fasting',
    source: 'Healthline',
    category: 'Supplements',
  },
  {
    id: '6',
    type: 'article',
    title: 'What to Eat When Breaking Your Fast',
    description: 'Optimize your eating window with the right foods for better results',
    source: 'Mayo Clinic',
    category: 'Nutrition',
  },
  {
    id: '7',
    type: 'article',
    title: 'Exercise and Intermittent Fasting: The Perfect Combination',
    description: 'How to combine fasting with exercise for optimal results',
    source: 'Healthline',
    category: 'Fitness',
  },
];

export default function LearnScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<ContentType>('All');

  const filteredContent = CONTENT.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      selectedTab === 'All' ||
      (selectedTab === 'Recipes' && item.type === 'recipe') ||
      (selectedTab === 'Articles' && item.type === 'article');

    return matchesSearch && matchesTab;
  });

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
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'recipe') {
            return <RecipeCard recipe={item} />;
          } else {
            return <ArticleCard article={item} />;
          }
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          filteredContent.some((item) => item.type === 'recipe') ? (
            <View style={styles.sectionHeader}>
              <Utensils size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Healthy Recipes</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <TouchableOpacity style={styles.recipeCard} activeOpacity={0.7}>
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
        </View>
        <Text style={styles.recipeDescription}>{recipe.description}</Text>
        <View style={styles.recipeTags}>
          {recipe.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <TouchableOpacity style={styles.articleCard} activeOpacity={0.7}>
      <View style={styles.articleIcon}>
        <BookOpen size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <Text style={styles.articleCategory}>{article.category}</Text>
          <Text style={styles.articleSource}>• {article.source}</Text>
        </View>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleDescription}>{article.description}</Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
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
});
