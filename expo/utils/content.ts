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

// External links should be stable, non-affiliate, and periodically rechecked
// before release. See expo/specs/SPEC-22-external-link-health-check.md for the
// audit method and the verified-link table.
export const contentData: ContentItem[] = [
  {
    id: '1',
    type: 'recipe',
    title: 'High-Protein Quinoa Breakfast Bowl',
    desc: 'A protein-rich breakfast bowl that works well for breaking your fast',
    url: 'https://www.allrecipes.com/recipe/265840/high-protein-quinoa-breakfast-bowl/',
    gradientColors: ['#FF6B6B', '#FFE66D'],
    tags: ['High Protein', 'Quick'],
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
    title: 'Buddha Bowl',
    desc: 'A colorful, plant-based bowl with grains, veggies, and protein',
    url: 'https://www.loveandlemons.com/buddha-bowl-recipe/',
    gradientColors: ['#00B4DB', '#0083B0'],
    tags: ['OMAD', 'Plant-Based'],
  },
  {
    id: '4',
    type: 'article',
    title: '10 Health Benefits of Intermittent Fasting',
    desc: 'An evidence-based look at what research says about intermittent fasting',
    url: 'https://www.healthline.com/nutrition/10-health-benefits-of-intermittent-fasting',
    gradientColors: ['#667EEA', '#764BA2'],
    category: 'Science',
    source: 'Healthline',
  },
  {
    // SPEC-29: Healthline's consent wall blocked the article on device; replaced
    // with NIH MedlinePlus (no consent/login wall, verified on iPhone).
    id: '5',
    type: 'article',
    title: 'Electrolytes and Fluid Balance',
    desc: 'General education on how the body balances fluids and electrolytes',
    url: 'https://medlineplus.gov/fluidandelectrolytebalance.html',
    gradientColors: ['#4FACFE', '#00F2FE'],
    category: 'Supplements',
    source: 'MedlinePlus',
  },
  {
    id: '6',
    type: 'article',
    title: 'Nutrition Basics',
    desc: 'Mayo Clinic guidance on building a balanced, healthy diet',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/basics/nutrition-basics/hlv-20049477',
    gradientColors: ['#F093FB', '#F5576C'],
    category: 'Nutrition',
    source: 'Mayo Clinic',
  },
  // SPEC-22: id 7 (Exercise + Intermittent Fasting / Healthline) removed for v1.0.
  // Original Healthline URL returned 404 and no verified replacement was found
  // from approved sources (Healthline, Cleveland Clinic, Mayo Clinic, Harvard
  // Health, Verywell Health) on the specific "exercise + fasting" topic.
  // Re-introduce in v1.1 if/when a stable URL is identified.
  {
    id: '8',
    type: 'article',
    title: 'Intermittent Fasting: What Are the Benefits?',
    desc: 'A Mayo Clinic expert overview of intermittent fasting',
    // SPEC-29: previous art-20346459 URL returned Page Not Found.
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/intermittent-fasting/faq-20441303',
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
    whyRecommended: 'Electrolyte drink mix option for users who already include supplements in their fasting routine',
  },
  {
    // SPEC-22: replaced broken Amazon product URL (B01GC654YG returned 404) with
    // an editorial guide; type changed product -> article to drop price/rating.
    id: '10',
    type: 'article',
    title: 'Best Food Storage Containers',
    desc: 'Editorial guide to containers for meal prep, leftovers, and fridge organization',
    url: 'https://people.com/best-food-storage-containers-8701834',
    gradientColors: ['#30CFD0', '#330867'],
    category: 'Meal Prep',
    source: 'People',
  },
  {
    id: '11',
    type: 'product',
    title: 'The Complete Guide to Fasting by Dr. Jason Fung',
    desc: 'Comprehensive guide to fasting concepts and protocols by a well-known author',
    url: 'https://www.amazon.com/Complete-Guide-Fasting-Intermittent-Alternate-Day/dp/1628600012',
    gradientColors: ['#A8EDEA', '#FED6E3'],
    whyRecommended: 'Evidence-informed approach from a health professional',
  },
  {
    id: '12',
    type: 'product',
    title: 'Hydro Flask 32 oz Wide Mouth Bottle',
    desc: 'An insulated bottle to keep water within reach during your fast',
    url: 'https://www.hydroflask.com/32-oz-wide-mouth',
    gradientColors: ['#6A11CB', '#2575FC'],
    whyRecommended: 'Proper hydration is crucial for fasting success',
  },
];
