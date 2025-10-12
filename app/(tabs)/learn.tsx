import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'What is Intermittent Fasting?',
    category: 'Basics',
    content: 'Intermittent fasting is an eating pattern that cycles between periods of fasting and eating. It does not specify which foods you should eat but rather when you should eat them. Common methods include the 16/8 method, where you fast for 16 hours and eat during an 8-hour window.',
  },
  {
    id: '2',
    title: 'Benefits of Fasting',
    category: 'Health',
    content: 'Research suggests intermittent fasting may help with weight loss, improve metabolic health, reduce inflammation, and support cellular repair processes. It may also improve brain function and increase longevity. Always consult with a healthcare provider before starting.',
  },
  {
    id: '3',
    title: 'How to Start Safely',
    category: 'Getting Started',
    content: 'Begin with a shorter fasting window like 12:12 and gradually increase. Stay hydrated during fasting periods. Break your fast with nutritious, whole foods. Listen to your body and adjust as needed. If you have any medical conditions, consult your doctor first.',
  },
  {
    id: '4',
    title: 'What Can I Drink While Fasting?',
    category: 'FAQ',
    content: 'During fasting periods, you can drink water, black coffee, and unsweetened tea. These beverages contain minimal to no calories and will not break your fast. Avoid adding sugar, milk, or cream to your drinks during the fasting window.',
  },
  {
    id: '5',
    title: 'Common Mistakes to Avoid',
    category: 'Tips',
    content: 'Avoid overeating during your eating window, not staying hydrated, choosing unhealthy foods, and being too rigid with your schedule. Remember that consistency is more important than perfection. Be patient with yourself as you adapt to this new eating pattern.',
  },
  {
    id: '6',
    title: 'Breaking Your Fast',
    category: 'Nutrition',
    content: 'Break your fast with easily digestible foods like fruits, vegetables, and lean proteins. Avoid heavy, processed foods immediately after fasting. Start with a small meal and wait 30-60 minutes before eating a larger meal. This helps your digestive system adjust.',
  },
];

export default function LearnScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleArticle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Learn About Fasting</Text>
          <Text style={styles.subtitle}>
            Discover the science and best practices
          </Text>
        </View>

        <View style={styles.articles}>
          {ARTICLES.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isExpanded={expandedId === article.id}
              onToggle={() => toggleArticle(article.id)}
            />
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Important Note</Text>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider before starting any new diet or fasting regimen, especially if you have existing health conditions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ArticleCard({
  article,
  isExpanded,
  onToggle,
}: {
  article: Article;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.articleHeader}>
        <View style={styles.articleIcon}>
          <BookOpen size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.articleInfo}>
          <Text style={styles.articleCategory}>{article.category}</Text>
          <Text style={styles.articleTitle}>{article.title}</Text>
        </View>
        <View style={styles.expandIcon}>
          {isExpanded ? (
            <ChevronUp size={24} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={24} color={colors.textSecondary} />
          )}
        </View>
      </View>
      {isExpanded && (
        <View style={styles.articleContent}>
          <Text style={styles.articleText}>{article.content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  articles: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  articleCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleInfo: {
    flex: 1,
  },
  articleCategory: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  articleTitle: {
    ...typography.body,
    fontWeight: '600' as const,
    color: colors.text,
  },
  expandIcon: {
    padding: spacing.xs,
  },
  articleContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  articleText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  disclaimerCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
