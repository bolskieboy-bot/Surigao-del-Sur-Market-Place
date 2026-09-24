import { MunicipalityInfo } from '../types';

export const SURIGAO_DEL_SUR_MUNICIPALITIES: MunicipalityInfo[] = [
  {
    name: 'Tandag City',
    isCity: true,
    popularItems: ['Fresh Seafood', 'Local Delicacies', 'Handicrafts', 'Electronics', 'Motorcycle Parts'],
    description: 'Capital city of Surigao del Sur, vibrant trade and commercial center.'
  },
  {
    name: 'Bislig City',
    isCity: true,
    popularItems: ['Tinuy-an Treats', 'Timber Crafts', 'Agricultural Produce', 'Fish Products'],
    description: 'Home of the magnificent Tinuy-an Falls, largest commercial hub in Southern Surigao.'
  },
  {
    name: 'Madrid',
    isCity: false,
    popularItems: ['Madrid Native Rice', 'Copra', 'Fresh Catch', 'Handwoven Mats', 'Pastries'],
    description: 'Agricultural heartland nestled along the northern coast.'
  },
  {
    name: 'Cantilan',
    isCity: false,
    popularItems: ['Fresh Mud Crabs', 'Cantilan Surfing Gear', 'Organic Rice', 'Native Delicacies'],
    description: 'Cradle of Caraga culture, famous for Ayoke Island and pristine marine bounties.'
  },
  {
    name: 'Carrascal',
    isCity: false,
    popularItems: ['Fresh Tuna', 'Dried Fish', 'Agricultural Fertilizers', 'Motorcycle Accessories'],
    description: 'Northern gateway with bustling fishing ports and coastal trade.'
  },
  {
    name: 'Cortes',
    isCity: false,
    popularItems: ['Laswitan Souvenirs', 'Smoked Fish (Tinapa)', 'Root Crops', 'Farm Supplies'],
    description: 'Famous for the majestic Laswitan Lagoon and fertile farming valleys.'
  },
  {
    name: 'Lanuza',
    isCity: false,
    popularItems: ['Lanuza Surfing Merch', 'Native Baskets', 'Fresh Lobster', 'Organic Vegetables'],
    description: 'Premier surfing haven and eco-tourism paradise.'
  },
  {
    name: 'Lianga',
    isCity: false,
    popularItems: ['Prawns', 'Lianga Bay Fish', 'Cassava Cakes', 'Local Honey'],
    description: 'Picturesque coastal municipality bordering rich marine sanctuaries.'
  },
  {
    name: 'Lingig',
    isCity: false,
    popularItems: ['Dried Squid', 'Highland Coffee Beans', 'Corn Harvest', 'Native Bananas'],
    description: 'Southern gateway of the province with lush agriculture and offshore fisheries.'
  },
  {
    name: 'Marihatag',
    isCity: false,
    popularItems: ['Virgin Coconut Oil', 'Banana Chips', 'Poultry Products', 'Bamboo Crafts'],
    description: 'Coastal agricultural town celebrated for resilient farm cooperatives.'
  },
  {
    name: 'San Agustin',
    isCity: false,
    popularItems: ['Britania Island Souvenirs', 'Crab Paste (Aligue)', 'Fresh Sea Urchin', 'Beach Apparel'],
    description: 'Home of the breathtaking Britania Group of Islands.'
  },
  {
    name: 'San Miguel',
    isCity: false,
    popularItems: ['Mountain Rice', 'Wild Honey', 'Freshwater Tilapia', 'Native Handicrafts'],
    description: 'Lush inland municipality with boundless agricultural terrains.'
  },
  {
    name: 'Tagbina',
    isCity: false,
    popularItems: ['Tagbina Robusta Coffee', 'Cacao & Tablea', 'Fresh Fruits', 'Livestock Feed'],
    description: 'Renowned Coffee Capital of Caraga region with award-winning beans.'
  },
  {
    name: 'Barobo',
    isCity: false,
    popularItems: ['Bagasat Clams', 'Fresh Grouper', 'Vegetable Crates', 'General Hardware'],
    description: 'Central transit crossroads linking Davao, Butuan, and Tandag.'
  },
  {
    name: 'Bayabas',
    isCity: false,
    popularItems: ['Dried Anchovies (Dilis)', 'Coconut Sugar', 'Root Crops', 'Artisanal Soap'],
    description: 'Tranquil coastal municipality with rich marine life.'
  },
  {
    name: 'Cagwait',
    isCity: false,
    popularItems: ['Cagwait White Beach Apparel', 'Squid Flakes', 'Handmade Shell Crafts', 'Local Snacks'],
    description: 'Celebrated for its crescent-shaped White Beach and Kaliguan Festival.'
  },
  {
    name: 'Carmen',
    isCity: false,
    popularItems: ['Calamansi Concentrate', 'Fresh Milkfish (Bangus)', 'Organic Fertilizers'],
    description: 'Fertile agricultural plains producing citrus, rice, and livestock.'
  },
  {
    name: 'Hinatuan',
    isCity: false,
    popularItems: ['Enchanted River Souvenirs', 'Giant Blue Crabs', 'Seaweed (Lato)', 'Native Kakanin'],
    description: 'World-famous for the mythical Enchanted River and rich seafood estuaries.'
  },
  {
    name: 'Tago',
    isCity: false,
    popularItems: ['Tago River Clams', 'Handwoven Mats', 'Native Chicken', 'Fresh Bananas'],
    description: 'Historic riverside municipality with vibrant artisan traditions.'
  }
];

export const MARKETPLACE_CATEGORIES = [
  'Food',
  'Fashion',
  'Electronics',
  'Mobile Phones',
  'Home & Living',
  'Appliances',
  'Agriculture',
  'Seafood',
  'Fruits & Vegetables',
  'Handicrafts',
  'Automotive',
  'Motorcycle Parts',
  'Services',
  'Beauty',
  'Sports',
  'Baby & Kids',
  'Other'
] as const;

export const PROHIBITED_CATEGORIES = [
  'Illegal Drugs & Controlled Substances',
  'Firearms, Weapons & Explosives',
  'Protected Coral & Endangered Wildlife',
  'Counterfeit & Pirated Merchandise',
  'Prescription-Only Pharmaceuticals',
  'Stolen Property & Unregistered Vehicles',
  'Hazardous Chemicals & Fireworks'
];

export const PROHIBITED_ITEMS = PROHIBITED_CATEGORIES;
