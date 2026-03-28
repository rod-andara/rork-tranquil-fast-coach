export interface ContentItem {
  id: string;
  type: 'recipe' | 'article' | 'product';
  title: string;
  desc: string;
  url: string;
  gradientColors: readonly [string, string, ...string[]];
  tags?: string[];
  category?: string;
  source?: string;
  price?: string;
  rating?: string;
  whyRecommended?: string;
}

export const contentData: ContentItem[] = [
  {
    id: '1',
    type: 'recipe',
    title: 'Mediterranean Quinoa Breakfast Bowl',
    desc: 'Perfect for breaking your fast with 25g of protein and healthy fats',
    url: 'https://www.allrecipes.com/recipe/265840/high-protein-quinoa-breakfast-bowl/',
    gradientColors: ['#FF6B6B', '#FFE66D'],
    tags: ['High Protein', 'Mediterranean', 'Quick'],
  },
  {
    id: '2',
    type: 'recipe',
    title: 'Salmon Avocado Power Bowl',
    desc: 'Low-carb, high-fat meal packed with omega-3s and nutrients',
    url: 'https://www.spiritedandthensome.com/salmon-avocado-bowl-recipe/',
    gradientColors: ['#FF6B9D', '#C44569'],
    tags: ['Keto', 'Low Carb', 'Healthy Fats'],
  },
  {
    id: '3',
    type: 'recipe',
    title: 'Complete Nutrition Buddha Bowl',
    desc: 'Nutrient-dense meal with everything you need in one bowl',
    url: 'https://www.loveandlemons.com/buddha-bowl-recipe/',
    gradientColors: ['#00B4DB', '#0083B0'],
    tags: ['OMAD', 'Complete Nutrition', 'Plant-Based'],
  },
  {
    id: '4',
    type: 'article',
    title: 'The Complete Guide to Intermittent Fasting',
    desc: 'Evidence-based overview of intermittent fasting benefits and methods',
    url: 'https://www.healthline.com/nutrition/10-health-benefits-of-intermittent-fasting',
    gradientColors: ['#667EEA', '#764BA2'],
    category: 'Science',
    source: 'Healthline',
  },
  {
    id: '5',
    type: 'article',
    title: 'Essential Electrolytes During Fasting',
    desc: 'Why electrolytes matter and how to maintain proper balance while fasting',
    url: 'https://www.healthline.com/health/electrolyte-imbalance',
    gradientColors: ['#4FACFE', '#00F2FE'],
    category: 'Supplements',
    source: 'Healthline',
  },
  {
    id: '6',
    type: 'article',
    title: 'What to Eat When Breaking Your Fast',
    desc: 'Optimize your eating window with the right foods for better results',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/basics/nutrition-basics/hlv-20049477',
    gradientColors: ['#F093FB', '#F5576C'],
    category: 'Nutrition',
    source: 'Mayo Clinic',
  },
  {
    id: '7',
    type: 'article',
    title: 'Exercise and Intermittent Fasting: The Perfect Combination',
    desc: 'How to time your workouts for maximum fat burning and muscle retention',
    url: 'https://www.healthline.com/health/fitness/working-out-while-fasting',
    gradientColors: ['#FA8BFF', '#2BD2FF'],
    category: 'Fitness',
    source: 'Healthline',
  },
  {
    id: '8',
    type: 'article',
    title: 'Intermittent Fasting for Beginners',
    desc: 'Everything you need to know to start your fasting journey safely',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/intermittent-fasting/art-20346459',
    gradientColors: ['#43E97B', '#38F9D7'],
    category: 'Getting Started',
    source: 'Mayo Clinic',
  },
  {
    id: '9',
    type: 'product',
    title: 'Enzymedica Fasting Today Drink Mix',
    desc: 'Specifically designed electrolyte blend for intermittent fasting',
    url: 'https://www.iherb.com/pr/enzymedica-fasting-today-intermittent-fasting-drink-mix-tropical-pineapple-9-31-oz-264-g/139047',
    gradientColors: ['#FA709A', '#FEE140'],
    price: '$26.81',
    rating: '4.5/5',
    whyRecommended: 'Prevents headaches and maintains energy during fasting',
  },
  {
    id: '10',
    type: 'product',
    title: 'Glass Meal Prep Containers Set',
    desc: 'BPA-free glass containers perfect for portion control and meal planning',
    url: 'https://www.amazon.com/dp/B01GC654YG',
    gradientColors: ['#30CFD0', '#330867'],
    price: '$29.99',
    rating: '5/5',
    whyRecommended: 'Makes eating window meal prep easy and organized',
  },
  {
    id: '11',
    type: 'product',
    title: 'The Complete Guide to Fasting by Dr. Jason Fung',
    desc: 'Comprehensive guide to therapeutic fasting by leading expert',
    url: 'https://www.amazon.com/Complete-Guide-Fasting-Intermittent-Alternate-Day/dp/1628600012',
    gradientColors: ['#A8EDEA', '#FED6E3'],
    price: '$14.99',
    rating: '5/5',
    whyRecommended: 'Evidence-based approach from medical professional',
  },
  {
    id: '12',
    type: 'product',
    title: 'Hydro Flask Water Bottle with Time Markers',
    desc: 'Stay hydrated during fasting with hourly intake reminders',
    url: 'https://www.hydroflask.com/32-oz-wide-mouth',
    gradientColors: ['#6A11CB', '#2575FC'],
    price: '$24.95',
    rating: '4.5/5',
    whyRecommended: 'Proper hydration is crucial for fasting success',
  },
];
