export interface ContentItem {
  id: string;
  type: 'recipe' | 'article' | 'product';
  title: string;
  desc: string;
  url: string;
  image?: string;
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    tags: ['High Protein', 'Mediterranean', 'Quick'],
  },
  {
    id: '2',
    type: 'recipe',
    title: 'Salmon Avocado Power Bowl',
    desc: 'Low-carb, high-fat meal packed with omega-3s and nutrients',
    url: 'https://www.spiritedandthensome.com/salmon-avocado-bowl-recipe/',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    tags: ['Keto', 'Low Carb', 'Healthy Fats'],
  },
  {
    id: '3',
    type: 'recipe',
    title: 'Complete Nutrition Buddha Bowl',
    desc: 'Nutrient-dense meal with everything you need in one bowl',
    url: 'https://www.loveandlemons.com/buddha-bowl-recipe/',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    tags: ['OMAD', 'Complete Nutrition', 'Plant-Based'],
  },
  {
    id: '4',
    type: 'article',
    title: 'The Complete Guide to Intermittent Fasting',
    desc: 'Evidence-based overview of intermittent fasting benefits and methods',
    url: 'https://www.healthline.com/nutrition/10-health-benefits-of-intermittent-fasting',
    category: 'Science',
    source: 'Healthline',
  },
  {
    id: '5',
    type: 'article',
    title: 'Essential Electrolytes During Fasting',
    desc: 'Why electrolytes matter and how to maintain proper balance while fasting',
    url: 'https://www.healthline.com/health/electrolyte-imbalance',
    category: 'Supplements',
    source: 'Healthline',
  },
  {
    id: '6',
    type: 'article',
    title: 'What to Eat When Breaking Your Fast',
    desc: 'Optimize your eating window with the right foods for better results',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/basics/nutrition-basics/hlv-20049477',
    category: 'Nutrition',
    source: 'Mayo Clinic',
  },
  {
    id: '7',
    type: 'article',
    title: 'Exercise and Intermittent Fasting: The Perfect Combination',
    desc: 'How to time your workouts for maximum fat burning and muscle retention',
    url: 'https://www.healthline.com/health/fitness/working-out-while-fasting',
    category: 'Fitness',
    source: 'Healthline',
  },
  {
    id: '8',
    type: 'article',
    title: 'Intermittent Fasting for Beginners',
    desc: 'Everything you need to know to start your fasting journey safely',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/intermittent-fasting/art-20346459',
    category: 'Getting Started',
    source: 'Mayo Clinic',
  },
  {
    id: '9',
    type: 'product',
    title: 'Enzymedica Fasting Today Drink Mix',
    desc: 'Specifically designed electrolyte blend for intermittent fasting',
    url: 'https://www.iherb.com/pr/enzymedica-fasting-today-intermittent-fasting-drink-mix-tropical-pineapple-9-31-oz-264-g/139047',
    price: '$26.81',
    rating: '4.5/5',
    whyRecommended: 'Prevents headaches and maintains energy during fasting',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  },
  {
    id: '10',
    type: 'product',
    title: 'Glass Meal Prep Containers Set',
    desc: 'BPA-free glass containers perfect for portion control and meal planning',
    url: 'https://www.amazon.com/dp/B01GC654YG',
    price: '$29.99',
    rating: '5/5',
    whyRecommended: 'Makes eating window meal prep easy and organized',
    image: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400',
  },
  {
    id: '11',
    type: 'product',
    title: 'The Complete Guide to Fasting by Dr. Jason Fung',
    desc: 'Comprehensive guide to therapeutic fasting by leading expert',
    url: 'https://www.amazon.com/Complete-Guide-Fasting-Intermittent-Alternate-Day/dp/1628600012',
    price: '$14.99',
    rating: '5/5',
    whyRecommended: 'Evidence-based approach from medical professional',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
  },
  {
    id: '12',
    type: 'product',
    title: 'Hydro Flask Water Bottle with Time Markers',
    desc: 'Stay hydrated during fasting with hourly intake reminders',
    url: 'https://www.hydroflask.com/32-oz-wide-mouth',
    price: '$24.95',
    rating: '4.5/5',
    whyRecommended: 'Proper hydration is crucial for fasting success',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
  },
];
