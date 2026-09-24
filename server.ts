import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  User,
  SellerProfile,
  AdminAccount,
  Product,
  Order,
  CommissionTransaction,
  ChatMessage,
  Review,
  Report,
  Advertisement,
  Announcement,
  NotificationItem,
  AdminAuditLog,
  PlatformSettings,
  PaymentMethodType,
  OrderStatus,
  RiderProfile
} from './src/types';
import { SURIGAO_DEL_SUR_MUNICIPALITIES, PROHIBITED_CATEGORIES } from './src/data/surigaoData';
import { calculateGrabDeliveryFee, getMunicipalDistance } from './src/utils/deliveryCalculator';

dotenv.config();

const PORT = 3000;
const FIXED_ADMIN_PASSWORD = '1234567';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'marketplace_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database schema container
interface MarketplaceDB {
  users: User[];
  sellers: SellerProfile[];
  riders: RiderProfile[];
  adminAccounts: (AdminAccount & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
  commissionTransactions: CommissionTransaction[];
  chatMessages: ChatMessage[];
  reviews: Review[];
  reports: Report[];
  advertisements: Advertisement[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  auditLogs: AdminAuditLog[];
  settings: PlatformSettings;
}

// Helper to mask phone numbers
export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 7) return mobile || '';
  const clean = mobile.replace(/[^0-9]/g, '');
  if (clean.length === 11) {
    return `${clean.substring(0, 4)} ••• ••${clean.substring(9)}`;
  }
  return `${mobile.substring(0, 3)} ••• ••${mobile.slice(-2)}`;
}

// Simple deterministic hash for password simulation (in real prod use bcrypt)
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${password.length}`;
}

// Exactly 8 Constant, Fixed Administrator Accounts with same password '1234567'
const FIXED_ADMIN_ACCOUNTS: (AdminAccount & { passwordHash: string })[] = [
  {
    id: 'admin_1',
    username: 'admin1',
    name: 'Provincial Admin 1',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin1@surigaodelsur.ph'
  },
  {
    id: 'admin_2',
    username: 'admin2',
    name: 'Provincial Admin 2',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin2@surigaodelsur.ph'
  },
  {
    id: 'admin_3',
    username: 'admin3',
    name: 'Provincial Admin 3',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin3@surigaodelsur.ph'
  },
  {
    id: 'admin_4',
    username: 'admin4',
    name: 'Provincial Admin 4',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin4@surigaodelsur.ph'
  },
  {
    id: 'admin_5',
    username: 'admin5',
    name: 'Provincial Admin 5',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin5@surigaodelsur.ph'
  },
  {
    id: 'admin_6',
    username: 'admin6',
    name: 'Provincial Admin 6',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin6@surigaodelsur.ph'
  },
  {
    id: 'admin_7',
    username: 'admin7',
    name: 'Provincial Admin 7',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin7@surigaodelsur.ph'
  },
  {
    id: 'admin_8',
    username: 'admin8',
    name: 'Provincial Admin 8',
    role: 'admin',
    mustChangePassword: false,
    passwordHash: hashPassword('1234567'),
    email: 'admin8@surigaodelsur.ph'
  }
];

// Initialize seed data if not present
function getInitialDB(): MarketplaceDB {

  const seedSellers: SellerProfile[] = [
    {
      id: 'seller_1',
      userId: 'user_seller_1',
      ownerName: 'Samuel "Kuya Sam" Arreza',
      shopName: 'Kuya Sam General Merchandise',
      mobileNumber: '09171234567',
      email: 'kuyasam.madrid@gmail.com',
      municipality: 'Madrid',
      barangay: 'Poblacion',
      businessAddress: 'Magsaysay St., Poblacion, Madrid, Surigao del Sur',
      shopDescription: 'Quality hardware, agricultural tools, solar lights, and motorcycle spare parts serving Madrid, Cantilan, and Carrascal since 2012.',
      profilePhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'approved',
      verified: true,
      rating: 4.9,
      reviewCount: 38,
      featured: true,
      paymentMethods: {
        gcash: { linked: true, accountName: 'SAMUEL ARREZA', maskedMobile: '0917 ••• ••67', enabled: true },
        maya: { linked: true, accountName: 'SAMUEL ARREZA', maskedMobile: '0917 ••• ••67', enabled: true },
        cod: { enabled: true }
      },
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'seller_2',
      userId: 'user_seller_2',
      ownerName: 'Elena "Ate Elena" Guingona',
      shopName: 'Cantilan Fresh Catch & Marine Bounty',
      mobileNumber: '09289876543',
      email: 'cantilanfresh@gmail.com',
      municipality: 'Cantilan',
      barangay: 'Lininti-an',
      businessAddress: 'Fish Port Landing, Lininti-an, Cantilan, Surigao del Sur',
      shopDescription: 'Fresh live mud crabs, giant tiger prawns, tuna, and sun-dried squid directly from local Cantilan fishermen.',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'approved',
      verified: true,
      rating: 4.95,
      reviewCount: 64,
      featured: true,
      paymentMethods: {
        gcash: { linked: true, accountName: 'ELENA GUINGONA', maskedMobile: '0928 ••• ••43', enabled: true },
        maya: { linked: false, enabled: false },
        cod: { enabled: true }
      },
      createdAt: '2026-01-12T09:30:00.000Z'
    },
    {
      id: 'seller_3',
      userId: 'user_seller_3',
      ownerName: 'Engr. Danilo Perez',
      shopName: 'Tandag Organic Agro-Hub & Nursery',
      mobileNumber: '09193344556',
      email: 'danilo.agro@gmail.com',
      municipality: 'Tandag City',
      barangay: 'Bag-ong Lungsod',
      businessAddress: 'National Highway, Bag-ong Lungsod, Tandag City, Surigao del Sur',
      shopDescription: 'High quality Dinorado & Black Rice, organic vermicompost fertilizers, cacao seedlings, and fresh highland produce.',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'approved',
      verified: true,
      rating: 4.85,
      reviewCount: 42,
      featured: true,
      paymentMethods: {
        gcash: { linked: true, accountName: 'DANILO PEREZ', maskedMobile: '0919 ••• ••56', enabled: true },
        maya: { linked: true, accountName: 'DANILO PEREZ', maskedMobile: '0919 ••• ••56', enabled: true },
        cod: { enabled: true }
      },
      createdAt: '2026-01-15T10:15:00.000Z'
    },
    {
      id: 'seller_4',
      userId: 'user_seller_4',
      ownerName: 'Marilou Sanchez',
      shopName: 'Tagbina Highland Coffee & Cacao Growers',
      mobileNumber: '09204455667',
      email: 'marilou.tagbina@gmail.com',
      municipality: 'Tagbina',
      barangay: 'Doña Carmen',
      businessAddress: 'Purok 4, Doña Carmen, Tagbina, Surigao del Sur',
      shopDescription: 'Single-origin premium Robusta coffee beans, tablea chocolates, and raw mountain honey straight from Tagbina farms.',
      profilePhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'approved',
      verified: true,
      rating: 4.9,
      reviewCount: 51,
      featured: true,
      paymentMethods: {
        gcash: { linked: true, accountName: 'MARILOU SANCHEZ', maskedMobile: '0920 ••• ••67', enabled: true },
        maya: { linked: true, accountName: 'MARILOU SANCHEZ', maskedMobile: '0920 ••• ••67', enabled: true },
        cod: { enabled: true }
      },
      createdAt: '2026-01-18T14:20:00.000Z'
    },
    {
      id: 'seller_5',
      userId: 'user_seller_5',
      ownerName: 'Ricardo Morales',
      shopName: 'Lanuza Surfers & Artisan Crafts',
      mobileNumber: '09187766554',
      email: 'lanuza.crafts@gmail.com',
      municipality: 'Lanuza',
      barangay: 'Habag',
      businessAddress: 'Surfing Beach Walk, Habag, Lanuza, Surigao del Sur',
      shopDescription: 'Handcrafted woven banig, bamboo lamps, Surigao surf merch, rashguards, and beach accessories.',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'approved',
      verified: true,
      rating: 4.88,
      reviewCount: 29,
      featured: false,
      paymentMethods: {
        gcash: { linked: true, accountName: 'RICARDO MORALES', maskedMobile: '0918 ••• ••54', enabled: true },
        maya: { linked: false, enabled: false },
        cod: { enabled: true }
      },
      createdAt: '2026-02-01T11:00:00.000Z'
    },
    {
      id: 'seller_6',
      userId: 'user_seller_6',
      ownerName: 'Grace Teves',
      shopName: 'Hinatuan Enchanted Treats & Souvenirs',
      mobileNumber: '09156677889',
      email: 'grace.hinatuan@gmail.com',
      municipality: 'Hinatuan',
      barangay: 'Cambatong',
      businessAddress: 'River View Road, Cambatong, Hinatuan, Surigao del Sur',
      shopDescription: 'Famous Hinatuan crab paste (aligue), dried bluefish, native bananacups, and Enchanted River keepsakes.',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      idDocumentUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80',
      businessPermitUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=300&auto=format&fit=crop&q=80',
      status: 'pending',
      verified: false,
      rating: 0,
      reviewCount: 0,
      featured: false,
      paymentMethods: {
        gcash: { linked: true, accountName: 'GRACE TEVES', maskedMobile: '0915 ••• ••89', enabled: true },
        maya: { linked: false, enabled: false },
        cod: { enabled: true }
      },
      createdAt: '2026-02-20T16:45:00.000Z'
    }
  ];

  const seedRiders: RiderProfile[] = [
    {
      id: 'rider_1',
      userId: 'user_rider_1',
      riderName: 'Junjun Arreza',
      mobileNumber: '09191112233',
      email: 'rider.junjun@gmail.com',
      municipality: 'Madrid',
      barangay: 'Poblacion',
      vehicleType: 'Honda Wave 110 (Motorcycle)',
      plateNumber: 'SDS-4821',
      licenseNumber: 'L02-20-019842',
      active: true,
      totalDeliveries: 19,
      totalEarnings: 2750,
      createdAt: '2026-01-05T08:00:00.000Z'
    },
    {
      id: 'rider_2',
      userId: 'user_rider_2',
      riderName: 'Alex Tan',
      mobileNumber: '09192223344',
      email: 'rider.tandag@gmail.com',
      municipality: 'Tandag City',
      barangay: 'Bag-ong Lungsod',
      vehicleType: 'Yamaha Sight 115 (Motorcycle)',
      plateNumber: 'SDS-9912',
      licenseNumber: 'L02-19-034112',
      active: true,
      totalDeliveries: 24,
      totalEarnings: 3480,
      createdAt: '2026-01-08T09:00:00.000Z'
    },
    {
      id: 'rider_3',
      userId: 'user_rider_3',
      riderName: 'Mario Dimaano',
      mobileNumber: '09193334455',
      email: 'rider.bislig@gmail.com',
      municipality: 'Bislig City',
      barangay: 'Mangagoy',
      vehicleType: 'Suzuki Smash 115 (Motorcycle)',
      plateNumber: 'SDS-3381',
      licenseNumber: 'L02-21-049811',
      active: true,
      totalDeliveries: 15,
      totalEarnings: 2190,
      createdAt: '2026-01-12T11:00:00.000Z'
    }
  ];

  const seedUsers: User[] = [
    {
      id: 'user_rider_1',
      fullName: 'Junjun Arreza',
      mobileNumber: '09191112233',
      email: 'rider.junjun@gmail.com',
      role: 'rider',
      municipality: 'Madrid',
      barangay: 'Poblacion',
      completeAddress: 'Purok 1, Poblacion, Madrid, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-05T08:00:00.000Z'
    },
    {
      id: 'user_rider_2',
      fullName: 'Alex Tan',
      mobileNumber: '09192223344',
      email: 'rider.tandag@gmail.com',
      role: 'rider',
      municipality: 'Tandag City',
      barangay: 'Bag-ong Lungsod',
      completeAddress: 'National Highway, Tandag City, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-08T09:00:00.000Z'
    },
    {
      id: 'user_rider_3',
      fullName: 'Mario Dimaano',
      mobileNumber: '09193334455',
      email: 'rider.bislig@gmail.com',
      role: 'rider',
      municipality: 'Bislig City',
      barangay: 'Mangagoy',
      completeAddress: 'Espiritu St., Mangagoy, Bislig City, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-12T11:00:00.000Z'
    },
    {
      id: 'user_buyer_1',
      fullName: 'Maria Santos',
      mobileNumber: '09175551234',
      email: 'maria.santos@gmail.com',
      role: 'buyer',
      municipality: 'Madrid',
      barangay: 'Manga',
      completeAddress: 'Purok 2, Barangay Manga, Madrid, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-20T10:00:00.000Z',
      paymentMethods: {
        gcash: { linked: true, accountName: 'MARIA SANTOS', maskedMobile: '0917 ••• ••34' },
        maya: { linked: true, accountName: 'MARIA SANTOS', maskedMobile: '0917 ••• ••34' }
      }
    },
    {
      id: 'user_seller_1',
      fullName: 'Samuel Arreza',
      mobileNumber: '09171234567',
      email: 'kuyasam.madrid@gmail.com',
      role: 'seller',
      municipality: 'Madrid',
      barangay: 'Poblacion',
      completeAddress: 'Magsaysay St., Poblacion, Madrid, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'user_seller_2',
      fullName: 'Elena Guingona',
      mobileNumber: '09289876543',
      email: 'cantilanfresh@gmail.com',
      role: 'seller',
      municipality: 'Cantilan',
      barangay: 'Lininti-an',
      completeAddress: 'Fish Port Landing, Lininti-an, Cantilan, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-12T09:30:00.000Z'
    },
    {
      id: 'user_seller_3',
      fullName: 'Danilo Perez',
      mobileNumber: '09193344556',
      email: 'danilo.agro@gmail.com',
      role: 'seller',
      municipality: 'Tandag City',
      barangay: 'Bag-ong Lungsod',
      completeAddress: 'National Highway, Bag-ong Lungsod, Tandag City, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T10:15:00.000Z'
    },
    {
      id: 'user_seller_4',
      fullName: 'Marilou Sanchez',
      mobileNumber: '09204455667',
      email: 'marilou.tagbina@gmail.com',
      role: 'seller',
      municipality: 'Tagbina',
      barangay: 'Doña Carmen',
      completeAddress: 'Purok 4, Doña Carmen, Tagbina, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-01-18T14:20:00.000Z'
    },
    {
      id: 'user_seller_5',
      fullName: 'Ricardo Morales',
      mobileNumber: '09187766554',
      email: 'lanuza.crafts@gmail.com',
      role: 'seller',
      municipality: 'Lanuza',
      barangay: 'Habag',
      completeAddress: 'Surfing Beach Walk, Habag, Lanuza, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T11:00:00.000Z'
    },
    {
      id: 'user_seller_6',
      fullName: 'Grace Teves',
      mobileNumber: '09156677889',
      email: 'grace.hinatuan@gmail.com',
      role: 'seller',
      municipality: 'Hinatuan',
      barangay: 'Cambatong',
      completeAddress: 'River View Road, Cambatong, Hinatuan, Surigao del Sur',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      createdAt: '2026-02-20T16:45:00.000Z'
    }
  ];

  const seedProducts: Product[] = [
    {
      id: 'prod_1',
      sellerId: 'seller_2',
      sellerShopName: 'Cantilan Fresh Catch & Marine Bounty',
      sellerMunicipality: 'Cantilan',
      sellerVerified: true,
      sellerRating: 4.95,
      name: 'Fresh Live Cantilan Mud Crabs (Alimango) - 1kg',
      category: 'Seafood',
      description: 'Locally harvested meaty live mud crabs from the mangrove estuaries of Cantilan. Packed fresh with wet sea grass. Ideal for ginataang alimango or garlic butter chili crab.',
      price: 650,
      discountPrice: 590,
      stock: 35,
      photos: [
        'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Cantilan',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: true,
      views: 520,
      orderCount: 68,
      rating: 4.9,
      reviewCount: 24,
      createdAt: '2026-01-25T11:00:00.000Z'
    },
    {
      id: 'prod_2',
      sellerId: 'seller_1',
      sellerShopName: 'Kuya Sam General Merchandise',
      sellerMunicipality: 'Madrid',
      sellerVerified: true,
      sellerRating: 4.9,
      name: 'Heavy-Duty Honda & Yamaha Motorcycle Drive Chain & Sprocket Set (428H)',
      category: 'Motorcycle Parts',
      description: 'Genuine durable alloy sprocket set designed for rugged Surigao provincial roads and farm-to-market trails. Fits TMX, Wave, XRM, and Smash.',
      price: 980,
      discountPrice: 890,
      stock: 45,
      photos: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Madrid',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: true,
      views: 310,
      orderCount: 34,
      rating: 4.88,
      reviewCount: 16,
      createdAt: '2026-01-28T09:00:00.000Z'
    },
    {
      id: 'prod_3',
      sellerId: 'seller_3',
      sellerShopName: 'Tandag Organic Agro-Hub & Nursery',
      sellerMunicipality: 'Tandag City',
      sellerVerified: true,
      sellerRating: 4.85,
      name: 'Surigao Dinorado Fragrant Native Rice (25kg Sack)',
      category: 'Agriculture',
      description: 'Locally grown premium whole grain Dinorado rice harvested by our partner farming cooperatives in San Miguel and Tandag. Naturally fragrant, soft, and pest-free.',
      price: 1350,
      stock: 50,
      photos: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Tandag City',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: true,
      views: 740,
      orderCount: 88,
      rating: 4.96,
      reviewCount: 42,
      createdAt: '2026-02-01T08:30:00.000Z'
    },
    {
      id: 'prod_4',
      sellerId: 'seller_4',
      sellerShopName: 'Tagbina Highland Coffee & Cacao Growers',
      sellerMunicipality: 'Tagbina',
      sellerVerified: true,
      sellerRating: 4.9,
      name: 'Tagbina Award-Winning Roasted Robusta Whole Beans (500g)',
      category: 'Food',
      description: 'Single origin medium-dark roasted Robusta coffee from high elevation volcanic slopes of Tagbina, Caraga. Bold aroma, rich crema with notes of dark chocolate and roasted nuts.',
      price: 340,
      stock: 80,
      photos: [
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Tagbina',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: true,
      views: 450,
      orderCount: 57,
      rating: 4.92,
      reviewCount: 29,
      createdAt: '2026-02-05T13:00:00.000Z'
    },
    {
      id: 'prod_5',
      sellerId: 'seller_5',
      sellerShopName: 'Lanuza Surfers & Artisan Crafts',
      sellerMunicipality: 'Lanuza',
      sellerVerified: true,
      sellerRating: 4.88,
      name: 'Handwoven Pandan & Romblon Picnic Banig Mat with Carry Straps',
      category: 'Handicrafts',
      description: 'Traditionally handwoven by indigenous artisans in Lanuza and Madrid using sustainable wild romblon grass and colored with organic plant dyes. Foldable and durable.',
      price: 520,
      discountPrice: 480,
      stock: 20,
      photos: [
        'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Lanuza',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: false,
      views: 290,
      orderCount: 22,
      rating: 4.85,
      reviewCount: 11,
      createdAt: '2026-02-10T15:20:00.000Z'
    },
    {
      id: 'prod_6',
      sellerId: 'seller_1',
      sellerShopName: 'Kuya Sam General Merchandise',
      sellerMunicipality: 'Madrid',
      sellerVerified: true,
      sellerRating: 4.9,
      name: 'High-Lumen Solar Floodlight 100W IP67 Waterproof with Remote',
      category: 'Home & Living',
      description: 'Reliable outdoor solar flood light with large solar panel and 15,000mAh battery. Provides all-night illumination even during typhoon season and provincial brownouts.',
      price: 1250,
      discountPrice: 1150,
      stock: 25,
      photos: [
        'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Madrid',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: true,
      views: 390,
      orderCount: 41,
      rating: 4.9,
      reviewCount: 19,
      createdAt: '2026-02-12T10:00:00.000Z'
    },
    {
      id: 'prod_7',
      sellerId: 'seller_2',
      sellerShopName: 'Cantilan Fresh Catch & Marine Bounty',
      sellerMunicipality: 'Cantilan',
      sellerVerified: true,
      sellerRating: 4.95,
      name: 'Sun-Dried Special Danggit & Squid Flakes (250g Pack)',
      category: 'Food',
      description: 'Crispy, unsalted dried danggit and squid sun-dried at Ayoke Island, Cantilan. Crunchy, fragrant, and perfect with spiced native vinegar and garlic rice.',
      price: 280,
      stock: 60,
      photos: [
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Cantilan',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: false,
      views: 410,
      orderCount: 65,
      rating: 4.94,
      reviewCount: 30,
      createdAt: '2026-02-14T08:00:00.000Z'
    },
    {
      id: 'prod_8',
      sellerId: 'seller_3',
      sellerShopName: 'Tandag Organic Agro-Hub & Nursery',
      sellerMunicipality: 'Tandag City',
      sellerVerified: true,
      sellerRating: 4.85,
      name: 'Pure Raw Wild Forest Honey from San Miguel Highlands (750ml)',
      category: 'Food',
      description: '100% unpasteurized raw pukyutan honey harvested from the pristine virgin forests of San Miguel, Surigao del Sur. Rich in natural antioxidants and enzymes.',
      price: 450,
      stock: 30,
      photos: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
      ],
      municipality: 'Tandag City',
      deliveryAvailable: true,
      pickupAvailable: true,
      status: 'approved',
      isFeatured: false,
      views: 320,
      orderCount: 31,
      rating: 4.9,
      reviewCount: 14,
      createdAt: '2026-02-16T12:00:00.000Z'
    }
  ];

  const seedOrders: Order[] = [
    {
      id: 'ord_101',
      buyerId: 'user_buyer_1',
      buyerName: 'Maria Santos',
      buyerMobile: '09175551234',
      buyerAddress: 'Purok 2, Barangay Manga',
      buyerMunicipality: 'Madrid',
      buyerBarangay: 'Manga',
      notesToSeller: 'Please select lively crabs. Thanks Kuya!',
      sellerId: 'seller_2',
      sellerShopName: 'Cantilan Fresh Catch & Marine Bounty',
      sellerMunicipality: 'Cantilan',
      items: [
        {
          productId: 'prod_1',
          name: 'Fresh Live Cantilan Mud Crabs (Alimango) - 1kg',
          price: 590,
          quantity: 2,
          photo: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80',
          category: 'Seafood'
        }
      ],
      productSubtotal: 1180,
      deliveryDistanceKm: 14,
      deliveryFee: 169, // Grab PH: ₱49 (2km) + 12km * ₱10 = ₱169
      riderId: 'rider_1',
      riderName: 'Junjun Arreza',
      riderMobile: '09191112233',
      riderEarnings: 169, // 100% of delivery fee - no fee charged to rider
      totalPaid: 1349, // 1180 + 169
      commissionRate: 0.03,
      commissionAmount: 35.40, // 1180 * 0.03 (strictly on product subtotal)
      sellerNetAmount: 1144.60,
      paymentMethod: 'gcash',
      paymentStatus: 'completed',
      paymentReference: {
        refNumber: 'GC-20260220-891234',
        submittedAt: '2026-02-20T10:15:00.000Z',
        verifiedAt: '2026-02-20T10:20:00.000Z'
      },
      orderStatus: 'completed',
      fulfillmentType: 'delivery',
      rated: true,
      createdAt: '2026-02-20T10:00:00.000Z',
      updatedAt: '2026-02-20T14:30:00.000Z'
    },
    {
      id: 'ord_102',
      buyerId: 'user_buyer_1',
      buyerName: 'Maria Santos',
      buyerMobile: '09175551234',
      buyerAddress: 'Purok 2, Barangay Manga',
      buyerMunicipality: 'Madrid',
      buyerBarangay: 'Manga',
      notesToSeller: 'Leave at gate if delivery arrives early.',
      sellerId: 'seller_1',
      sellerShopName: 'Kuya Sam General Merchandise',
      sellerMunicipality: 'Madrid',
      items: [
        {
          productId: 'prod_2',
          name: 'Heavy-Duty Honda & Yamaha Motorcycle Drive Chain & Sprocket Set (428H)',
          price: 890,
          quantity: 1,
          photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
          category: 'Motorcycle Parts'
        }
      ],
      productSubtotal: 890,
      deliveryDistanceKm: 3,
      deliveryFee: 59, // Grab PH: ₱49 (2km) + 1km * ₱10 = ₱59 (intra-municipality)
      riderId: 'rider_1',
      riderName: 'Junjun Arreza',
      riderMobile: '09191112233',
      riderEarnings: 59, // 100% of delivery fee - no fee charged to rider
      totalPaid: 949, // 890 + 59
      commissionRate: 0.03,
      commissionAmount: 26.70, // 890 * 0.03
      sellerNetAmount: 863.30,
      paymentMethod: 'cod',
      paymentStatus: 'cod',
      orderStatus: 'ready_for_pickup_out_for_delivery',
      fulfillmentType: 'delivery',
      rated: false,
      createdAt: '2026-02-22T08:45:00.000Z',
      updatedAt: '2026-02-22T11:00:00.000Z'
    }
  ];

  const seedCommissionTransactions: CommissionTransaction[] = [
    {
      transactionId: 'tx_comm_101',
      orderId: 'ord_101',
      sellerId: 'seller_2',
      sellerShopName: 'Cantilan Fresh Catch & Marine Bounty',
      buyerId: 'user_buyer_1',
      buyerName: 'Maria Santos',
      productAmount: 1180,
      deliveryFee: 169,
      commissionRate: 0.03,
      commissionAmount: 35.40,
      sellerNetAmount: 1144.60,
      paymentMethod: 'gcash',
      transactionDate: '2026-02-20T14:30:00.000Z',
      orderStatus: 'completed',
      category: 'Seafood',
      municipality: 'Cantilan'
    }
  ];

  const seedReviews: Review[] = [
    {
      id: 'rev_1',
      orderId: 'ord_101',
      productId: 'prod_1',
      productName: 'Fresh Live Cantilan Mud Crabs (Alimango) - 1kg',
      sellerId: 'seller_2',
      buyerId: 'user_buyer_1',
      buyerName: 'Maria Santos',
      rating: 5,
      comment: 'Very fresh and energetic crabs! Delivered to Madrid safely within 2 hours. Seller Ate Elena was very polite and accommodating on GCash payment.',
      createdAt: '2026-02-20T15:00:00.000Z'
    }
  ];

  const seedAds: Advertisement[] = [
    {
      id: 'ad_1',
      businessName: 'Surigao del Sur Electric Cooperative (SURSECO II) Advisory',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
      link: '#',
      placement: 'home_banner',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true,
      clicks: 142,
      impressions: 2150
    },
    {
      id: 'ad_2',
      businessName: 'Cantilan Bank Rural Micro-Enterprise Loan',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      link: '#',
      placement: 'near_you',
      startDate: '2026-01-15',
      endDate: '2026-12-31',
      active: true,
      clicks: 98,
      impressions: 1420
    }
  ];

  const seedAnnouncements: Announcement[] = [
    {
      id: 'ann_1',
      title: 'Welcome to Surigao del Sur Marketplace!',
      content: 'Mabuhay! Buy Local, Sell Local, and support our very own farmers, fishermen, and micro-enterprises across our 19 municipalities and cities.',
      targetAudience: 'all',
      priority: 'normal',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'ann_2',
      title: '3% Platform Commission Policy & Transparent Accounting',
      content: 'Surigao del Sur Marketplace collects a standard 3% commission on completed product sales to sustain municipal operations and platform maintenance. Delivery fees are 100% exempt.',
      targetAudience: 'sellers',
      priority: 'normal',
      createdAt: '2026-01-05T00:00:00.000Z'
    }
  ];

  const seedSettings: PlatformSettings = {
    marketplaceName: 'Surigao del Sur Marketplace',
    commissionRate: 0.03,
    supportedPaymentMethods: ['gcash', 'maya', 'cod'],
    adminGcash: {
      linked: true,
      accountName: 'SDS MARKETPLACE TREASURY',
      maskedMobile: '0917 ••• ••99'
    },
    adminMaya: {
      linked: true,
      accountName: 'SDS MARKETPLACE OFFICIAL',
      maskedMobile: '0918 ••• ••88'
    },
    codEnabled: true,
    minOrderAmount: 50,
    maxOrderAmount: 100000,
    currency: 'PHP',
    prohibitedCategories: [...PROHIBITED_CATEGORIES]
  };

  const seedAuditLogs: AdminAuditLog[] = [
    {
      id: 'log_init_1',
      adminId: 'admin_1',
      adminUsername: 'admin1',
      action: 'BOOTSTRAP_SYSTEM',
      affectedRecord: 'SYSTEM_CONFIG',
      details: 'Initialized exactly 8 constant administrator accounts (admin1 - admin8) and platform commission policy at 3%',
      ipAddress: '127.0.0.1',
      timestamp: '2026-01-01T00:00:00.000Z'
    }
  ];

  return {
    users: [],
    sellers: [],
    riders: [],
    adminAccounts: FIXED_ADMIN_ACCOUNTS,
    products: [],
    orders: [],
    commissionTransactions: [],
    chatMessages: [],
    reviews: [],
    reports: [],
    advertisements: seedAds,
    announcements: seedAnnouncements,
    notifications: [],
    auditLogs: seedAuditLogs,
    settings: seedSettings
  };
}

// In-memory runtime database
let db: MarketplaceDB;

function loadDatabase(): MarketplaceDB {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Clean out any demo accounts that match previous demo users
      const demoEmails = [
        'maria.santos@gmail.com',
        'kuyasam.madrid@gmail.com',
        'cantilanfresh@gmail.com',
        'danilo.agro@gmail.com',
        'marilou.tagbina@gmail.com',
        'lanuza.crafts@gmail.com',
        'grace.hinatuan@gmail.com',
        'rider.junjun@gmail.com',
        'rider.tandag@gmail.com',
        'rider.bislig@gmail.com'
      ];
      parsed.users = (parsed.users || []).filter(
        (u: any) =>
          !demoEmails.includes(u.email?.toLowerCase()) &&
          !u.id.startsWith('user_demo') &&
          !u.id.startsWith('user_rider_') &&
          !u.id.startsWith('user_seller_') &&
          !u.id.startsWith('user_buyer_')
      );
      parsed.sellers = (parsed.sellers || []).filter(
        (s: any) =>
          !demoEmails.includes(s.email?.toLowerCase()) &&
          !s.id.startsWith('seller_')
      );
      parsed.riders = (parsed.riders || []).filter(
        (r: any) =>
          !demoEmails.includes(r.email?.toLowerCase()) &&
          !r.id.startsWith('rider_')
      );
      parsed.products = (parsed.products || []).filter((p: any) => !p.id.startsWith('prod_'));
      parsed.orders = (parsed.orders || []).filter((o: any) => !o.id.startsWith('ord_'));
      parsed.commissionTransactions = (parsed.commissionTransactions || []).filter((c: any) => !c.id.startsWith('comm_'));
      parsed.reviews = (parsed.reviews || []).filter((r: any) => !r.id.startsWith('rev_'));
      parsed.adminAccounts = FIXED_ADMIN_ACCOUNTS;
      if (!parsed.settings) parsed.settings = getInitialDB().settings;
      saveDatabase(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB, reverting to default initial seed:', err);
  }
  const init = getInitialDB();
  saveDatabase(init);
  return init;
}

function saveDatabase(dataToSave?: MarketplaceDB) {
  try {
    const toSave = dataToSave || db;
    fs.writeFileSync(DATA_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

db = loadDatabase();

// Audit log recorder
function logAdminAction(adminUsername: string, adminId: string, action: string, affectedRecord: string, details?: string, ip?: string) {
  const log: AdminAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    adminId,
    adminUsername,
    action,
    affectedRecord,
    details: details || '',
    ipAddress: ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // AUTHENTICATION & ADMIN APIS
  // ==========================================

  // Admin login endpoint
  app.post('/api/auth/admin-login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const admin = FIXED_ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === cleanUsername);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    if (password !== '1234567' && admin.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    admin.lastLogin = new Date().toISOString();
    logAdminAction(admin.username, admin.id, 'ADMIN_LOGIN', `Admin account: ${admin.username}`, 'Successful login', req.ip);

    // Return admin info without exposing password hash
    return res.json({
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        mustChangePassword: false,
        email: admin.email,
        lastLogin: admin.lastLogin
      }
    });
  });

  // Forced password change for administrators on first login
  app.post('/api/auth/admin-change-password', (req: Request, res: Response) => {
    const { adminId, currentPassword, newPassword } = req.body;
    if (!adminId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = FIXED_ADMIN_ACCOUNTS.find((a) => a.id === adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Administrator account not found.' });
    }

    // Check current password
    if (currentPassword !== '1234567' && admin.passwordHash !== hashPassword(currentPassword)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    admin.passwordHash = hashPassword(newPassword);
    admin.mustChangePassword = false;
    logAdminAction(admin.username, admin.id, 'ADMIN_PASSWORD_CHANGE', `Admin account: ${admin.username}`, 'Administrator updated their password successfully', req.ip);
    saveDatabase();

    return res.json({
      success: true,
      message: 'Password updated successfully. Account fully activated.',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        mustChangePassword: false,
        email: admin.email
      }
    });
  });

  // Rider Dedicated Login
  app.post('/api/auth/rider-login', (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Rider account name, mobile number, or email is required.' });
    }

    const clean = identifier.trim().toLowerCase();

    // Check if an admin is logging in through the form
    const adminMatch = FIXED_ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === clean);
    if (adminMatch && (password === '1234567' || adminMatch.passwordHash === hashPassword(password))) {
      return res.json({
        user: {
          id: adminMatch.id,
          fullName: adminMatch.name,
          mobileNumber: '09000000000',
          email: adminMatch.email,
          role: 'admin',
          municipality: 'Tandag City',
          barangay: 'Capitol Hills',
          completeAddress: 'Provincial Capitol, Tandag City, Surigao del Sur',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        admin: {
          id: adminMatch.id,
          username: adminMatch.username,
          name: adminMatch.name,
          role: adminMatch.role,
          mustChangePassword: false,
          email: adminMatch.email,
          lastLogin: new Date().toISOString()
        },
        isAdmin: true
      });
    }

    const rider = db.riders.find(
      (r) =>
        r.email.toLowerCase() === clean ||
        r.mobileNumber === clean ||
        r.mobileNumber.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '') ||
        r.riderName.toLowerCase() === clean ||
        r.riderName.toLowerCase().includes(clean)
    );

    if (!rider) {
      return res.status(404).json({ error: 'Delivery rider account not found. Please register as a rider first.' });
    }

    const user = db.users.find((u) => u.id === rider.userId || u.email.toLowerCase() === rider.email.toLowerCase()) || {
      id: rider.userId,
      fullName: rider.riderName,
      mobileNumber: rider.mobileNumber,
      email: rider.email,
      role: 'rider' as const,
      municipality: rider.municipality,
      barangay: rider.barangay,
      completeAddress: `${rider.barangay}, ${rider.municipality}, Surigao del Sur`,
      createdAt: rider.createdAt
    };

    return res.json({
      rider,
      user
    });
  });

  // Buyer & Seller General Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password } = req.body; // mobile, email, or name
    if (!identifier) {
      return res.status(400).json({ error: 'Mobile number, email, or account name is required.' });
    }

    const clean = identifier.trim().toLowerCase();

    // Check if this is an admin logging in
    const adminMatch = FIXED_ADMIN_ACCOUNTS.find((a) => a.username.toLowerCase() === clean);
    if (adminMatch && (password === '1234567' || adminMatch.passwordHash === hashPassword(password))) {
      adminMatch.lastLogin = new Date().toISOString();
      return res.json({
        user: {
          id: adminMatch.id,
          fullName: adminMatch.name,
          mobileNumber: '09000000000',
          email: adminMatch.email,
          role: 'admin',
          municipality: 'Tandag City',
          barangay: 'Capitol Hills',
          completeAddress: 'Provincial Capitol, Tandag City, Surigao del Sur',
          createdAt: '2026-01-01T00:00:00.000Z'
        },
        admin: {
          id: adminMatch.id,
          username: adminMatch.username,
          name: adminMatch.name,
          role: adminMatch.role,
          mustChangePassword: false,
          email: adminMatch.email,
          lastLogin: adminMatch.lastLogin
        },
        isAdmin: true
      });
    }

    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.mobileNumber === clean ||
        u.mobileNumber.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '') ||
        u.fullName.toLowerCase() === clean
    );
    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please check your credentials or register.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
    }

    let sellerProfile: SellerProfile | undefined;
    let riderProfile: RiderProfile | undefined;
    if (user.role === 'seller') {
      sellerProfile = db.sellers.find((s) => s.userId === user.id);
    } else if (user.role === 'rider') {
      riderProfile = db.riders.find((r) => r.userId === user.id || r.email.toLowerCase() === user.email.toLowerCase());
    }

    return res.json({
      user,
      sellerProfile,
      riderProfile
    });
  });

  // Register Buyer
  app.post('/api/auth/register-buyer', (req: Request, res: Response) => {
    const { fullName, mobileNumber, email, municipality, barangay, completeAddress, profilePhoto } = req.body;

    if (!fullName || !mobileNumber || !municipality || !barangay || !completeAddress) {
      return res.status(400).json({ error: 'Please provide all required registration fields.' });
    }

    // Verify municipality is strictly within Surigao del Sur
    const isValidMuni = SURIGAO_DEL_SUR_MUNICIPALITIES.some((m) => m.name.toLowerCase() === municipality.trim().toLowerCase());
    if (!isValidMuni) {
      return res.status(400).json({ error: 'Registration is strictly limited to municipalities and cities of Surigao del Sur.' });
    }

    const existing = db.users.find((u) => u.mobileNumber === mobileNumber.trim() || (email && u.email.toLowerCase() === email.trim().toLowerCase()));
    if (existing) {
      return res.status(409).json({ error: 'An account with this mobile number or email already exists.' });
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : `${mobileNumber.trim()}@buyer.sds`,
      role: 'buyer',
      municipality: municipality.trim(),
      barangay: barangay.trim(),
      completeAddress: completeAddress.trim(),
      profilePhoto: profilePhoto || '',
      createdAt: new Date().toISOString(),
      paymentMethods: {
        gcash: { linked: false },
        maya: { linked: false }
      }
    };

    db.users.push(newUser);
    saveDatabase();

    return res.status(201).json({ user: newUser });
  });

  // Register Seller
  app.post('/api/auth/register-seller', (req: Request, res: Response) => {
    const {
      ownerName,
      shopName,
      mobileNumber,
      email,
      municipality,
      barangay,
      businessAddress,
      shopDescription,
      profilePhoto,
      idDocumentUrl,
      businessPermitUrl
    } = req.body;

    if (!ownerName || !shopName || !mobileNumber || !municipality || !barangay || !businessAddress) {
      return res.status(400).json({ error: 'All primary seller registration fields are required.' });
    }

    const isValidMuni = SURIGAO_DEL_SUR_MUNICIPALITIES.some((m) => m.name.toLowerCase() === municipality.trim().toLowerCase());
    if (!isValidMuni) {
      return res.status(400).json({ error: 'Sellers must be physically located within Surigao del Sur unless specifically pre-approved.' });
    }

    const userId = `user_${Date.now()}`;
    const sellerId = `seller_${Date.now()}`;

    const newUser: User = {
      id: userId,
      fullName: ownerName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : `${mobileNumber.trim()}@seller.sds`,
      role: 'seller',
      municipality: municipality.trim(),
      barangay: barangay.trim(),
      completeAddress: businessAddress.trim(),
      profilePhoto: profilePhoto || '',
      createdAt: new Date().toISOString()
    };

    const newSeller: SellerProfile = {
      id: sellerId,
      userId,
      ownerName: ownerName.trim(),
      shopName: shopName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : `${mobileNumber.trim()}@seller.sds`,
      municipality: municipality.trim(),
      barangay: barangay.trim(),
      businessAddress: businessAddress.trim(),
      shopDescription: shopDescription ? shopDescription.trim() : 'Local merchant in Surigao del Sur.',
      profilePhoto: profilePhoto || '',
      idDocumentUrl: idDocumentUrl || '',
      businessPermitUrl: businessPermitUrl || '',
      status: 'pending', // PENDING APPROVAL
      verified: false,
      rating: 0,
      reviewCount: 0,
      featured: false,
      paymentMethods: {
        gcash: { linked: false, enabled: false },
        maya: { linked: false, enabled: false },
        cod: { enabled: true }
      },
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.sellers.push(newSeller);

    // Create notification for admins
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: 'admin_all',
      title: 'New Seller Application',
      message: `${shopName} (${ownerName}) from ${municipality} submitted a seller application pending your review.`,
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase();

    return res.status(201).json({
      user: newUser,
      seller: newSeller,
      message: 'Seller application submitted! Status is PENDING APPROVAL until verified by an administrator.'
    });
  });

  // Register Rider
  app.post('/api/auth/register-rider', (req: Request, res: Response) => {
    const {
      riderName,
      mobileNumber,
      email,
      municipality,
      barangay,
      vehicleType,
      plateNumber,
      licenseNumber,
      profilePhoto
    } = req.body;

    if (!riderName || !mobileNumber || !municipality || !barangay || !vehicleType || !plateNumber) {
      return res.status(400).json({ error: 'Please provide all required delivery rider fields.' });
    }

    const isValidMuni = SURIGAO_DEL_SUR_MUNICIPALITIES.some((m) => m.name.toLowerCase() === municipality.trim().toLowerCase());
    if (!isValidMuni) {
      return res.status(400).json({ error: 'Riders must operate within Surigao del Sur LGUs.' });
    }

    const userId = `user_${Date.now()}`;
    const riderId = `rider_${Date.now()}`;

    const newUser: User = {
      id: userId,
      fullName: riderName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : `${mobileNumber.trim()}@rider.sds`,
      role: 'rider',
      municipality: municipality.trim(),
      barangay: barangay.trim(),
      completeAddress: `${barangay.trim()}, ${municipality.trim()}, Surigao del Sur`,
      profilePhoto: profilePhoto || '',
      createdAt: new Date().toISOString()
    };

    const newRider: RiderProfile = {
      id: riderId,
      userId,
      riderName: riderName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : `${mobileNumber.trim()}@rider.sds`,
      municipality: municipality.trim(),
      barangay: barangay.trim(),
      vehicleType: vehicleType.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      licenseNumber: licenseNumber ? licenseNumber.trim().toUpperCase() : 'SUR-LIC-PENDING',
      active: true,
      totalDeliveries: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.riders.push(newRider);

    // Notify admins of new rider partner
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: 'admin_all',
      title: 'New Delivery Rider Registered',
      message: `${riderName} (${vehicleType} - ${plateNumber}) registered as a delivery partner in ${municipality}.`,
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase();

    return res.status(201).json({
      user: newUser,
      rider: newRider,
      message: 'Delivery rider registered successfully! 100% of delivery fee is credited directly to you.'
    });
  });

  // ==========================================
  // PAYMENT LINKING (GCASH & MAYA)
  // ==========================================

  // Link GCash or Maya for Buyer
  app.post('/api/payments/buyer-link', (req: Request, res: Response) => {
    const { userId, paymentMethod, accountName, mobileNumber } = req.body;
    if (!userId || !paymentMethod || !accountName || !mobileNumber) {
      return res.status(400).json({ error: 'Missing account linking details.' });
    }

    if (paymentMethod !== 'gcash' && paymentMethod !== 'maya') {
      return res.status(400).json({ error: 'Only GCash and Maya can be electronically linked.' });
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.paymentMethods) {
      user.paymentMethods = {};
    }

    const masked = maskMobile(mobileNumber);
    user.paymentMethods[paymentMethod as 'gcash' | 'maya'] = {
      linked: true,
      accountName: accountName.toUpperCase().trim(),
      maskedMobile: masked,
      unmaskedMobile: mobileNumber.trim()
    };

    saveDatabase();
    return res.json({ success: true, paymentMethods: user.paymentMethods });
  });

  // Unlink payment method for Buyer
  app.post('/api/payments/buyer-unlink', (req: Request, res: Response) => {
    const { userId, paymentMethod } = req.body;
    const user = db.users.find((u) => u.id === userId);
    if (!user || !user.paymentMethods) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.paymentMethods[paymentMethod as 'gcash' | 'maya']) {
      user.paymentMethods[paymentMethod as 'gcash' | 'maya'] = { linked: false };
    }

    saveDatabase();
    return res.json({ success: true, paymentMethods: user.paymentMethods });
  });

  // Link GCash or Maya for Seller
  app.post('/api/payments/seller-link', (req: Request, res: Response) => {
    const { sellerId, paymentMethod, accountName, mobileNumber, enabled } = req.body;
    if (!sellerId || !paymentMethod || !accountName || !mobileNumber) {
      return res.status(400).json({ error: 'Missing account linking details.' });
    }

    if (paymentMethod !== 'gcash' && paymentMethod !== 'maya') {
      return res.status(400).json({ error: 'Only GCash and Maya can be linked.' });
    }

    const seller = db.sellers.find((s) => s.id === sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }

    const masked = maskMobile(mobileNumber);
    seller.paymentMethods[paymentMethod as 'gcash' | 'maya'] = {
      linked: true,
      enabled: enabled !== undefined ? enabled : true,
      accountName: accountName.toUpperCase().trim(),
      maskedMobile: masked,
      unmaskedMobile: mobileNumber.trim()
    };

    saveDatabase();
    return res.json({ success: true, paymentMethods: seller.paymentMethods });
  });

  // Toggle seller payment methods (GCash, Maya, COD)
  app.post('/api/payments/seller-config', (req: Request, res: Response) => {
    const { sellerId, gcashEnabled, mayaEnabled, codEnabled } = req.body;
    const seller = db.sellers.find((s) => s.id === sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }

    if (gcashEnabled && !seller.paymentMethods.gcash.linked) {
      return res.status(400).json({ error: 'Please link your GCash account before enabling GCash payments.' });
    }

    if (mayaEnabled && !seller.paymentMethods.maya.linked) {
      return res.status(400).json({ error: 'Please link your Maya account before enabling Maya payments.' });
    }

    seller.paymentMethods.gcash.enabled = !!gcashEnabled;
    seller.paymentMethods.maya.enabled = !!mayaEnabled;
    seller.paymentMethods.cod.enabled = !!codEnabled;

    saveDatabase();
    return res.json({ success: true, paymentMethods: seller.paymentMethods });
  });

  // Admin official payment receiving accounts
  app.post('/api/payments/admin-link', (req: Request, res: Response) => {
    const { adminId, paymentMethod, accountName, mobileNumber } = req.body;
    const admin = db.adminAccounts.find((a) => a.id === adminId);
    if (!admin) {
      return res.status(403).json({ error: 'Unauthorized. Admin credentials required.' });
    }

    if (paymentMethod !== 'gcash' && paymentMethod !== 'maya') {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    const masked = maskMobile(mobileNumber);
    if (paymentMethod === 'gcash') {
      db.settings.adminGcash = {
        linked: true,
        accountName: accountName.toUpperCase().trim(),
        maskedMobile: masked,
        unmaskedMobile: mobileNumber.trim()
      };
    } else {
      db.settings.adminMaya = {
        linked: true,
        accountName: accountName.toUpperCase().trim(),
        maskedMobile: masked,
        unmaskedMobile: mobileNumber.trim()
      };
    }

    logAdminAction(admin.username, admin.id, 'UPDATE_ADMIN_PAYMENT', `Configured Marketplace ${paymentMethod.toUpperCase()}`, `Updated official account to ${accountName} (${masked})`, req.ip);
    saveDatabase();

    return res.json({ success: true, settings: db.settings });
  });

  // ==========================================
  // PRODUCTS APIS
  // ==========================================

  // Get all approved products (with filters)
  app.get('/api/products', (req: Request, res: Response) => {
    const { municipality, category, search, sellerId, sort, featuredOnly, limit = 50 } = req.query;

    let list = db.products.filter((p) => p.status === 'approved');

    if (sellerId) {
      list = db.products.filter((p) => p.sellerId === sellerId);
    }

    if (municipality && municipality !== 'All') {
      list = list.filter((p) => p.municipality.toLowerCase() === (municipality as string).toLowerCase());
    }

    if (category && category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (featuredOnly === 'true') {
      list = list.filter((p) => p.isFeatured);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.municipality.toLowerCase().includes(q) ||
          p.sellerShopName.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // default: featured & newest
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return res.json({ products: list.slice(0, Number(limit)) });
  });

  // Get single product
  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    // Increment view
    product.views = (product.views || 0) + 1;
    saveDatabase();
    return res.json({ product });
  });

  // Create product (Seller)
  app.post('/api/products', (req: Request, res: Response) => {
    const {
      sellerId,
      name,
      category,
      description,
      price,
      discountPrice,
      stock,
      photos,
      municipality,
      deliveryAvailable,
      pickupAvailable
    } = req.body;

    if (!sellerId || !name || !category || !price || stock === undefined || !municipality) {
      return res.status(400).json({ error: 'Please provide all required product details.' });
    }

    const seller = db.sellers.find((s) => s.id === sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found.' });
    }

    if (seller.status !== 'approved') {
      return res.status(403).json({ error: 'Only approved sellers can publish products. Your seller account status is: ' + seller.status.toUpperCase() });
    }

    // Prohibited categories / products check
    const prohibited = db.settings.prohibitedCategories || PROHIBITED_CATEGORIES;
    const isProhibited = prohibited.some((pc) => {
      const lowerPC = pc.toLowerCase();
      return (
        category.toLowerCase().includes(lowerPC) ||
        name.toLowerCase().includes(lowerPC) ||
        description.toLowerCase().includes(lowerPC)
      );
    });

    if (isProhibited) {
      return res.status(400).json({
        error: 'This product cannot be listed on Surigao del Sur Marketplace. It matches prohibited goods guidelines.'
      });
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      sellerId: seller.id,
      sellerShopName: seller.shopName,
      sellerMunicipality: seller.municipality,
      sellerVerified: seller.verified,
      sellerRating: seller.rating || 5.0,
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'],
      municipality: municipality.trim(),
      deliveryAvailable: deliveryAvailable !== undefined ? deliveryAvailable : true,
      pickupAvailable: pickupAvailable !== undefined ? pickupAvailable : true,
      status: 'approved', // initially approved for verified sellers, or pending if admin configured
      isFeatured: false,
      views: 0,
      orderCount: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    saveDatabase();

    return res.status(201).json({ product: newProduct });
  });

  // Update product
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const fields = ['name', 'category', 'description', 'price', 'discountPrice', 'stock', 'photos', 'deliveryAvailable', 'pickupAvailable', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (product as any)[f] = req.body[f];
      }
    });

    saveDatabase();
    return res.json({ product });
  });

  // ==========================================
  // ORDERS & 3% COMMISSION ENGINE (SERVER-SIDE)
  // ==========================================

  // Create Order (strictly calculates 3% commission server-side)
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      buyerId,
      sellerId,
      items,
      deliveryAddress,
      notesToSeller,
      paymentMethod,
      fulfillmentType = 'delivery'
    } = req.body;

    if (!buyerId || !sellerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order parameters.' });
    }

    const buyer = db.users.find((u) => u.id === buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    const seller = db.sellers.find((s) => s.id === sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller shop not found.' });
    }

    // Only allow GCash, Maya, COD
    if (paymentMethod !== 'gcash' && paymentMethod !== 'maya' && paymentMethod !== 'cod') {
      return res.status(400).json({ error: 'Unsupported payment method. Only GCash, Maya, and COD are permitted.' });
    }

    // Validate seller has configured this payment method
    if (paymentMethod === 'gcash' && (!seller.paymentMethods.gcash.linked || !seller.paymentMethods.gcash.enabled)) {
      return res.status(400).json({ error: 'This seller cannot accept GCash at this time.' });
    }
    if (paymentMethod === 'maya' && (!seller.paymentMethods.maya.linked || !seller.paymentMethods.maya.enabled)) {
      return res.status(400).json({ error: 'This seller cannot accept Maya at this time.' });
    }
    if (paymentMethod === 'cod' && !seller.paymentMethods.cod.enabled) {
      return res.status(400).json({ error: 'This seller does not offer Cash on Delivery.' });
    }

    // STRICT SERVER-SIDE CALCULATION OF SUBTOTAL
    let productSubtotal = 0;
    const validatedItems = items.map((it: any) => {
      const prod = db.products.find((p) => p.id === it.productId);
      const unitPrice = prod ? (prod.discountPrice || prod.price) : Number(it.price);
      const qty = Math.max(1, Number(it.quantity) || 1);
      productSubtotal += unitPrice * qty;

      // Update product inventory & orderCount
      if (prod) {
        prod.stock = Math.max(0, prod.stock - qty);
        prod.orderCount = (prod.orderCount || 0) + qty;
      }

      return {
        productId: it.productId,
        name: prod ? prod.name : it.name,
        price: unitPrice,
        quantity: qty,
        photo: prod && prod.photos[0] ? prod.photos[0] : it.photo,
        category: prod ? prod.category : it.category
      };
    });

    // Distance-based Grab Philippines delivery fee calculation
    const deliveryCalc = calculateGrabDeliveryFee(
      seller.municipality,
      buyer.municipality,
      fulfillmentType
    );
    const deliveryFee = deliveryCalc.totalDeliveryFee;
    const deliveryDistanceKm = deliveryCalc.distanceKm;
    const riderEarnings = deliveryFee; // Rider is not charged any delivery fee, keeps 100% of delivery fee
    const totalPaid = productSubtotal + deliveryFee;

    // STRICT 3% COMMISSION CALCULATION (exclusively on product subtotal, delivery fee is exempt)
    const commissionRate = db.settings.commissionRate || 0.03;
    const commissionAmount = Math.round(productSubtotal * commissionRate * 100) / 100;
    const sellerNetAmount = Math.round((productSubtotal - commissionAmount) * 100) / 100;

    let initialPaymentStatus: any = 'pending';
    if (paymentMethod === 'cod') {
      initialPaymentStatus = 'cod';
    } else {
      initialPaymentStatus = 'awaiting_payment';
    }

    const orderId = `ord_${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      buyerMobile: buyer.mobileNumber,
      buyerAddress: deliveryAddress || buyer.completeAddress,
      buyerMunicipality: buyer.municipality,
      buyerBarangay: buyer.barangay,
      notesToSeller: notesToSeller || '',
      sellerId: seller.id,
      sellerShopName: seller.shopName,
      sellerMunicipality: seller.municipality,
      items: validatedItems,
      productSubtotal,
      deliveryFee,
      deliveryDistanceKm,
      riderEarnings,
      totalPaid,
      commissionRate,
      commissionAmount,
      sellerNetAmount,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: 'order_placed',
      fulfillmentType,
      rated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // Create notification for seller
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: seller.userId,
      title: 'New Order Received!',
      message: `You received Order #${orderId} from ${buyer.fullName} in ${buyer.municipality}. Total: ₱${totalPaid.toLocaleString()}`,
      type: 'order',
      read: false,
      link: `/seller/orders`,
      createdAt: new Date().toISOString()
    });

    saveDatabase();

    return res.status(201).json({
      order: newOrder,
      sellerPaymentInfo: {
        method: paymentMethod,
        accountName: paymentMethod === 'gcash' ? seller.paymentMethods.gcash.accountName : seller.paymentMethods.maya.accountName,
        maskedMobile: paymentMethod === 'gcash' ? seller.paymentMethods.gcash.maskedMobile : seller.paymentMethods.maya.maskedMobile
      }
    });
  });

  // Submit payment reference (GCash / Maya)
  app.post('/api/orders/:id/payment-reference', (req: Request, res: Response) => {
    const { refNumber, proofUrl } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.paymentMethod === 'cod') {
      return res.status(400).json({ error: 'Cash on delivery does not require digital reference.' });
    }

    order.paymentReference = {
      refNumber: refNumber ? refNumber.trim() : `REF-${Date.now().toString().slice(-6)}`,
      proofUrl: proofUrl || '',
      submittedAt: new Date().toISOString()
    };
    order.paymentStatus = 'payment_submitted';
    order.updatedAt = new Date().toISOString();

    // Notify seller
    const seller = db.sellers.find((s) => s.id === order.sellerId);
    if (seller) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: seller.userId,
        title: 'Payment Reference Submitted',
        message: `Buyer for Order #${order.id} submitted ${order.paymentMethod.toUpperCase()} reference #${order.paymentReference.refNumber}.`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDatabase();
    return res.json({ order });
  });

  // Update order status (Seller or Admin)
  app.post('/api/orders/:id/status', (req: Request, res: Response) => {
    const newStatus = req.body.newStatus || req.body.status || req.body.orderStatus;
    const { adminUsername } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = newStatus as OrderStatus;
    order.updatedAt = new Date().toISOString();

    // Handle payment status syncing when order progresses
    if (newStatus === 'completed' || newStatus === 'delivered') {
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'completed';
      } else if (order.paymentStatus === 'payment_submitted') {
        order.paymentStatus = 'payment_confirmed';
      }
    }

    // When order is marked completed:
    // Generate permanent, immutable Commission Transaction record!
    if (newStatus === 'completed' && previousStatus !== 'completed') {
      const alreadyLogged = db.commissionTransactions.some((t) => t.orderId === order.id);
      if (!alreadyLogged) {
        const commTx: CommissionTransaction = {
          transactionId: `tx_comm_${Date.now()}`,
          orderId: order.id,
          sellerId: order.sellerId,
          sellerShopName: order.sellerShopName,
          buyerId: order.buyerId,
          buyerName: order.buyerName,
          productAmount: order.productSubtotal,
          deliveryFee: order.deliveryFee,
          commissionRate: order.commissionRate,
          commissionAmount: order.commissionAmount,
          sellerNetAmount: order.sellerNetAmount,
          paymentMethod: order.paymentMethod,
          transactionDate: new Date().toISOString(),
          orderStatus: 'completed',
          category: order.items[0]?.category || 'General',
          municipality: order.sellerMunicipality
        };
        db.commissionTransactions.unshift(commTx);

        // Notify Buyer to review
        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: order.buyerId,
          title: 'Order Completed! Leave a Review',
          message: `Your order #${order.id} from ${order.sellerShopName} has been completed. Please rate your experience!`,
          type: 'order',
          read: false,
          link: `/orders`,
          createdAt: new Date().toISOString()
        });
      }
    }

    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', 'UPDATE_ORDER_STATUS', `Order #${order.id}`, `Status changed from ${previousStatus} to ${newStatus}`, req.ip);
    }

    saveDatabase();
    return res.json({ order });
  });

  // Get orders list (with filters)
  app.get('/api/orders', (req: Request, res: Response) => {
    const { buyerId, sellerId, status } = req.query;
    let list = [...db.orders];

    if (buyerId) {
      list = list.filter((o) => o.buyerId === buyerId);
    }
    if (sellerId) {
      list = list.filter((o) => o.sellerId === sellerId);
    }
    if (status) {
      list = list.filter((o) => o.orderStatus === status);
    }

    return res.json({ orders: list });
  });

  // Rider: Get orders list (available jobs and assigned deliveries)
  app.get('/api/rider/orders', (req: Request, res: Response) => {
    const { riderId } = req.query;
    // Orders with delivery fulfillment
    const deliveryOrders = db.orders.filter((o) => o.fulfillmentType === 'delivery');

    if (!riderId) {
      return res.json({ orders: deliveryOrders });
    }

    // Return orders assigned to this rider OR open available jobs waiting for rider
    const relevant = deliveryOrders.filter((o) => {
      const isAssignedToRider = o.riderId === riderId;
      const isAvailableForPickup = !o.riderId && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled';
      return isAssignedToRider || isAvailableForPickup;
    });

    return res.json({ orders: relevant });
  });

  // Rider: Accept Delivery Job
  app.post('/api/orders/:id/accept-delivery', (req: Request, res: Response) => {
    const { riderId, riderName, riderMobile } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.fulfillmentType !== 'delivery') {
      return res.status(400).json({ error: 'This order is scheduled for store pickup, not rider delivery.' });
    }

    order.riderId = riderId;
    order.riderName = riderName;
    order.riderMobile = riderMobile;
    order.riderEarnings = order.deliveryFee; // 100% of delivery fee goes to rider
    order.orderStatus = 'ready_for_pickup_out_for_delivery';
    order.updatedAt = new Date().toISOString();

    // Notify Buyer
    db.notifications.unshift({
      id: `notif_${Date.now()}_b`,
      userId: order.buyerId,
      title: 'Rider Assigned to Your Order!',
      message: `${riderName} has accepted your delivery order #${order.id}. Contact: ${riderMobile}.`,
      type: 'order',
      read: false,
      link: '/orders',
      createdAt: new Date().toISOString()
    });

    // Notify Seller
    db.notifications.unshift({
      id: `notif_${Date.now()}_s`,
      userId: order.sellerId,
      title: 'Rider En Route for Pickup',
      message: `Rider ${riderName} is arriving to pick up order #${order.id}.`,
      type: 'order',
      read: false,
      link: '/seller/orders',
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    return res.json({ order });
  });

  // Rider: Update Delivery Status (Out for Delivery or Delivered)
  app.post('/api/orders/:id/update-delivery-status', (req: Request, res: Response) => {
    const { riderId, status } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;
    if (status === 'delivered' || status === 'completed') {
      order.orderStatus = 'completed';
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'completed';
      }

      // Update rider earnings & delivery count
      const rider = db.riders.find((r) => r.id === riderId || r.id === order.riderId);
      if (rider) {
        rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;
        rider.totalEarnings = (rider.totalEarnings || 0) + (order.deliveryFee || 0);
      }

      // Generate Commission Transaction if not present
      const alreadyLogged = db.commissionTransactions.some((t) => t.orderId === order.id);
      if (!alreadyLogged) {
        const commTx: CommissionTransaction = {
          transactionId: `tx_comm_${Date.now()}`,
          orderId: order.id,
          sellerId: order.sellerId,
          sellerShopName: order.sellerShopName,
          buyerId: order.buyerId,
          buyerName: order.buyerName,
          productAmount: order.productSubtotal,
          deliveryFee: order.deliveryFee,
          commissionRate: order.commissionRate || 0.03,
          commissionAmount: order.commissionAmount || Math.round(order.productSubtotal * 0.03 * 100) / 100,
          sellerNetAmount: order.sellerNetAmount || Math.round((order.productSubtotal - (order.commissionAmount || 0)) * 100) / 100,
          paymentMethod: order.paymentMethod,
          transactionDate: new Date().toISOString(),
          orderStatus: 'completed',
          category: order.items[0]?.category || 'General',
          municipality: order.sellerMunicipality
        };
        db.commissionTransactions.unshift(commTx);
      }

      // Notify Buyer
      db.notifications.unshift({
        id: `notif_${Date.now()}_b_del`,
        userId: order.buyerId,
        title: 'Order Delivered Successfully!',
        message: `Your package #${order.id} was safely delivered by ${order.riderName || 'your rider'}. Enjoy your purchase!`,
        type: 'order',
        read: false,
        link: '/orders',
        createdAt: new Date().toISOString()
      });
    } else {
      order.orderStatus = status as OrderStatus;
    }

    order.updatedAt = new Date().toISOString();
    saveDatabase();
    return res.json({ order });
  });

  // Rider: Statistics
  app.get('/api/rider/stats', (req: Request, res: Response) => {
    const { riderId } = req.query;
    const rider = db.riders.find((r) => r.id === riderId);
    const completed = db.orders.filter((o) => o.riderId === riderId && o.orderStatus === 'completed');
    const totalEarnings = completed.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const active = db.orders.filter((o) => o.riderId === riderId && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled');

    return res.json({
      totalDeliveries: Math.max(rider?.totalDeliveries || 0, completed.length),
      totalEarnings: Math.max(rider?.totalEarnings || 0, totalEarnings),
      activeDeliveries: active.length
    });
  });

  // Get all registered riders (Admin and general partner list)
  app.get('/api/riders', (req: Request, res: Response) => {
    return res.json({ riders: db.riders });
  });

  // ==========================================
  // COMMISSION DASHBOARD & FINANCIAL STATS
  // ==========================================

  app.get('/api/finance/stats', (req: Request, res: Response) => {
    const { municipality, sellerId, category, paymentMethod, dateFilter } = req.query;

    let txs = [...db.commissionTransactions];

    if (municipality && municipality !== 'All') {
      txs = txs.filter((t) => t.municipality.toLowerCase() === (municipality as string).toLowerCase());
    }
    if (sellerId && sellerId !== 'All') {
      txs = txs.filter((t) => t.sellerId === sellerId);
    }
    if (category && category !== 'All') {
      txs = txs.filter((t) => t.category?.toLowerCase() === (category as string).toLowerCase());
    }
    if (paymentMethod && paymentMethod !== 'All') {
      txs = txs.filter((t) => t.paymentMethod === paymentMethod);
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const oneMonthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const oneYearAgo = new Date(now.getTime() - 365 * 86400000).toISOString();

    const todayCommission = txs
      .filter((t) => t.transactionDate.startsWith(todayStr))
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const weekCommission = txs
      .filter((t) => t.transactionDate >= oneWeekAgo)
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const monthCommission = txs
      .filter((t) => t.transactionDate >= oneMonthAgo)
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const yearCommission = txs
      .filter((t) => t.transactionDate >= oneYearAgo)
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const totalCommission = txs.reduce((sum, t) => sum + t.commissionAmount, 0);
    const totalSales = txs.reduce((sum, t) => sum + t.productAmount, 0);
    const totalSellerNet = txs.reduce((sum, t) => sum + t.sellerNetAmount, 0);
    const completedOrdersCount = txs.length;
    const averageOrderValue = completedOrdersCount > 0 ? totalSales / completedOrdersCount : 0;

    const byPaymentMethod: Record<string, { count: number; commission: number; sales: number }> = {
      gcash: { count: 0, commission: 0, sales: 0 },
      maya: { count: 0, commission: 0, sales: 0 },
      cod: { count: 0, commission: 0, sales: 0 }
    };
    txs.forEach((t) => {
      const pm = (t.paymentMethod || 'cod').toLowerCase();
      if (!byPaymentMethod[pm]) {
        byPaymentMethod[pm] = { count: 0, commission: 0, sales: 0 };
      }
      byPaymentMethod[pm].count++;
      byPaymentMethod[pm].commission += t.commissionAmount;
      byPaymentMethod[pm].sales += t.productAmount;
    });

    return res.json({
      todayCommission: Math.round(todayCommission * 100) / 100,
      weekCommission: Math.round(weekCommission * 100) / 100,
      monthCommission: Math.round(monthCommission * 100) / 100,
      yearCommission: Math.round(yearCommission * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      totalSales: Math.round(totalSales * 100) / 100,
      totalSellerNet: Math.round(totalSellerNet * 100) / 100,
      completedOrdersCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalCommissionRevenue: Math.round(totalCommission * 100) / 100,
      totalCompletedSales: Math.round(totalSales * 100) / 100,
      totalCompletedOrders: completedOrdersCount,
      avgCommissionPerOrder: completedOrdersCount > 0 ? Math.round((totalCommission / completedOrdersCount) * 100) / 100 : 0,
      byPaymentMethod,
      transactions: txs
    });
  });

  // ==========================================
  // REVIEWS & RATINGS
  // ==========================================

  app.post('/api/reviews', (req: Request, res: Response) => {
    const { orderId, productId, sellerId, buyerId, buyerName, rating, comment } = req.body;

    if (!orderId || !sellerId || !buyerId || !rating) {
      return res.status(400).json({ error: 'Missing review information.' });
    }

    const order = db.orders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.orderStatus !== 'completed') {
      return res.status(400).json({ error: 'Reviews can only be submitted for completed orders.' });
    }

    // Prevent repeated review on the same order
    const existing = db.reviews.find((r) => r.orderId === orderId);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a review for this order.' });
    }

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      orderId,
      productId: productId || order.items[0]?.productId || 'general',
      productName: order.items[0]?.name || 'Purchased Item',
      sellerId,
      buyerId,
      buyerName: buyerName || order.buyerName,
      rating: Number(rating),
      comment: comment ? comment.trim() : 'Great service and quality products!',
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);
    order.rated = true;

    // Recalculate seller rating
    const sellerReviews = db.reviews.filter((r) => r.sellerId === sellerId);
    const seller = db.sellers.find((s) => s.id === sellerId);
    if (seller && sellerReviews.length > 0) {
      const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
      seller.rating = Math.round(avg * 100) / 100;
      seller.reviewCount = sellerReviews.length;
    }

    // Recalculate product rating
    if (productId) {
      const prod = db.products.find((p) => p.id === productId);
      const prodReviews = db.reviews.filter((r) => r.productId === productId);
      if (prod && prodReviews.length > 0) {
        const pAvg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        prod.rating = Math.round(pAvg * 100) / 100;
        prod.reviewCount = prodReviews.length;
      }
    }

    saveDatabase();
    return res.status(201).json({ review: newReview });
  });

  app.get('/api/reviews', (req: Request, res: Response) => {
    const { sellerId, productId } = req.query;
    let list = [...db.reviews];
    if (sellerId) {
      list = list.filter((r) => r.sellerId === sellerId);
    }
    if (productId) {
      list = list.filter((r) => r.productId === productId);
    }
    return res.json({ reviews: list });
  });

  // ==========================================
  // CHAT MESSAGING SYSTEM
  // ==========================================

  app.get('/api/chat/messages', (req: Request, res: Response) => {
    const { userId, recipientId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    let msgs = db.chatMessages.filter(
      (m) =>
        (m.senderId === userId && (!recipientId || m.recipientId === recipientId)) ||
        (m.recipientId === userId && (!recipientId || m.senderId === recipientId))
    );

    msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return res.json({ messages: msgs });
  });

  app.post('/api/chat/send', (req: Request, res: Response) => {
    const { senderId, senderName, senderRole, recipientId, text, productRef, orderRef } = req.body;

    if (!senderId || !recipientId || !text) {
      return res.status(400).json({ error: 'Sender, recipient, and message text are required.' });
    }

    const conversationId = [senderId, recipientId].sort().join('_');
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      recipientId,
      text: text.trim(),
      productRef,
      orderRef,
      timestamp: new Date().toISOString(),
      read: false
    };

    db.chatMessages.push(msg);

    // Create in-app notification for recipient
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: recipientId,
      title: `Message from ${senderName}`,
      message: text.substring(0, 80),
      type: 'message',
      read: false,
      link: '/messages',
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    return res.status(201).json({ message: msg });
  });

  // ==========================================
  // REPORTS SYSTEM
  // ==========================================

  app.post('/api/reports', (req: Request, res: Response) => {
    const { reporterId, reporterName, targetType, targetId, targetTitle, reason, details } = req.body;

    if (!reporterId || !targetType || !targetId || !reason || !details) {
      return res.status(400).json({ error: 'All report fields are required.' });
    }

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId,
      reporterName: reporterName || 'Community Member',
      targetType,
      targetId,
      targetTitle: targetTitle || 'Marketplace Item',
      reason,
      details: details.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    };

    db.reports.unshift(newReport);
    saveDatabase();

    return res.status(201).json({ report: newReport, message: 'Thank you for keeping Surigao del Sur Marketplace trustworthy. Admin has received your report.' });
  });

  app.get('/api/reports', (req: Request, res: Response) => {
    return res.json({ reports: db.reports });
  });

  app.post('/api/reports/:id/resolve', (req: Request, res: Response) => {
    const { status, resolutionNotes, adminUsername } = req.body;
    const rep = db.reports.find((r) => r.id === req.params.id);
    if (!rep) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    rep.status = status;
    rep.resolutionNotes = resolutionNotes || '';

    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', 'RESOLVE_REPORT', `Report #${rep.id}`, `Marked as ${status}: ${resolutionNotes}`, req.ip);
    }

    saveDatabase();
    return res.json({ report: rep });
  });

  // ==========================================
  // ADMIN MANAGEMENT (SELLERS, PRODUCTS, ADS, SETTINGS)
  // ==========================================

  // Admin seller verification
  app.post('/api/admin/sellers/:id/verification', (req: Request, res: Response) => {
    const { status, rejectionReason, adminUsername } = req.body;
    const seller = db.sellers.find((s) => s.id === req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found.' });
    }

    seller.status = status;
    if (status === 'approved') {
      seller.verified = true;
      seller.rejectionReason = undefined;
    } else {
      seller.verified = false;
      seller.rejectionReason = rejectionReason;
    }

    // Notify seller
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: seller.userId,
      title: status === 'approved' ? 'Seller Account Approved! 🎉' : `Seller Account ${status.toUpperCase()}`,
      message: status === 'approved' ? 'Congratulations! You can now start listing products on Surigao del Sur Marketplace.' : `Reason: ${rejectionReason || 'Please review provincial verification requirements.'}`,
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString()
    });

    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', `SELLER_${status.toUpperCase()}`, `Seller: ${seller.shopName} (${seller.id})`, rejectionReason || 'Approved for provincial marketplace', req.ip);
    }

    saveDatabase();
    return res.json({ seller });
  });

  // Admin product moderation
  app.post('/api/admin/products/:id/moderation', (req: Request, res: Response) => {
    const { status, moderationReason, adminUsername } = req.body;
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    prod.status = status;
    prod.moderationReason = moderationReason;

    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', `PRODUCT_${status.toUpperCase()}`, `Product: ${prod.name} (${prod.id})`, moderationReason || '', req.ip);
    }

    saveDatabase();
    return res.json({ product: prod });
  });

  // Admin settings update (e.g. commission rate, etc.)
  app.post('/api/admin/settings', (req: Request, res: Response) => {
    const { commissionRate, marketplaceName, codEnabled, adminUsername } = req.body;

    if (commissionRate !== undefined) {
      const prev = db.settings.commissionRate;
      db.settings.commissionRate = Number(commissionRate);
      if (adminUsername) {
        logAdminAction(adminUsername, 'admin', 'UPDATE_COMMISSION_RATE', 'Platform Settings', `Changed commission rate from ${prev * 100}% to ${Number(commissionRate) * 100}%`, req.ip);
      }
    }

    if (marketplaceName) {
      db.settings.marketplaceName = marketplaceName;
    }
    if (codEnabled !== undefined) {
      db.settings.codEnabled = codEnabled;
    }

    saveDatabase();
    return res.json({ settings: db.settings });
  });

  // Get admin overview stats
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    const totalUsers = db.users.length;
    const totalSellers = db.sellers.length;
    const pendingSellers = db.sellers.filter((s) => s.status === 'pending').length;
    const totalProducts = db.products.length;
    const pendingProducts = db.products.filter((p) => p.status === 'pending').length;
    const totalOrders = db.orders.length;
    const completedOrders = db.orders.filter((o) => o.orderStatus === 'completed').length;
    const cancelledOrders = db.orders.filter((o) => o.orderStatus === 'cancelled').length;
    const platformRevenue = db.commissionTransactions.reduce((sum, t) => sum + t.commissionAmount, 0);
    const grossMarketplaceSales = db.commissionTransactions.reduce((sum, t) => sum + t.productAmount, 0);
    const reportedAccounts = db.reports.filter((r) => r.status === 'new' && r.targetType === 'seller').length;
    const reportedProducts = db.reports.filter((r) => r.status === 'new' && r.targetType === 'product').length;

    return res.json({
      totalUsers,
      totalSellers,
      pendingSellers,
      pendingSellerApprovals: pendingSellers,
      totalProducts,
      pendingProducts,
      totalOrders,
      completedOrders,
      completedOrdersCount: completedOrders,
      cancelledOrders,
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      totalCommissionRevenue: Math.round(platformRevenue * 100) / 100,
      grossMarketplaceSales: Math.round(grossMarketplaceSales * 100) / 100,
      totalGrossSales: Math.round(grossMarketplaceSales * 100) / 100,
      reportedAccounts,
      reportedProducts,
      settings: db.settings,
      auditLogsCount: db.auditLogs.length
    });
  });

  // Get all sellers
  app.get('/api/sellers', (req: Request, res: Response) => {
    const { status, municipality } = req.query;
    let list = [...db.sellers];
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    if (municipality && municipality !== 'All') {
      list = list.filter((s) => s.municipality.toLowerCase() === (municipality as string).toLowerCase());
    }
    return res.json({ sellers: list });
  });

  // Get single seller profile
  app.get('/api/sellers/:id', (req: Request, res: Response) => {
    const seller = db.sellers.find((s) => s.id === req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found.' });
    }
    return res.json({ seller });
  });

  // Advertisements CRUD
  app.get('/api/advertisements', (req: Request, res: Response) => {
    return res.json({ advertisements: db.advertisements });
  });

  app.post('/api/advertisements', (req: Request, res: Response) => {
    const { businessName, image, link, placement, startDate, endDate, adminUsername } = req.body;
    const ad: Advertisement = {
      id: `ad_${Date.now()}`,
      businessName: businessName || 'Local Business Sponsor',
      image: image || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      link: link || '#',
      placement: placement || 'home_banner',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || '2026-12-31',
      active: true,
      clicks: 0,
      impressions: 0
    };
    db.advertisements.unshift(ad);
    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', 'CREATE_AD', `Ad: ${ad.businessName}`, `Created new advertisement slot (${ad.placement})`, req.ip);
    }
    saveDatabase();
    return res.status(201).json({ advertisement: ad });
  });

  // Announcements CRUD
  app.get('/api/announcements', (req: Request, res: Response) => {
    return res.json({ announcements: db.announcements });
  });

  app.post('/api/announcements', (req: Request, res: Response) => {
    const { title, content, targetAudience, priority, adminUsername } = req.body;
    const ann: Announcement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || 'all',
      priority: priority || 'normal',
      createdAt: new Date().toISOString()
    };
    db.announcements.unshift(ann);
    if (adminUsername) {
      logAdminAction(adminUsername, 'admin', 'BROADCAST_ANNOUNCEMENT', `Announcement: ${ann.title}`, `Published announcement to ${ann.targetAudience}`, req.ip);
    }
    saveDatabase();
    return res.status(201).json({ announcement: ann });
  });

  // Admin audit logs list
  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    return res.json({ auditLogs: db.auditLogs.slice(0, 100) });
  });

  // Notifications endpoint
  app.get('/api/notifications', (req: Request, res: Response) => {
    const { userId } = req.query;
    let list = db.notifications;
    if (userId) {
      list = list.filter((n) => n.userId === userId || n.userId === 'admin_all');
    }
    return res.json({ notifications: list.slice(0, 30) });
  });

  // Municipality Activity breakdown
  // 19 Municipalities list & stats
  app.get('/api/municipalities', (req: Request, res: Response) => {
    return res.json({ municipalities: SURIGAO_DEL_SUR_MUNICIPALITIES });
  });

  app.get('/api/municipalities/stats', (req: Request, res: Response) => {
    const stats = SURIGAO_DEL_SUR_MUNICIPALITIES.map((m) => {
      const muniSellers = db.sellers.filter((s) => s.municipality.toLowerCase() === m.name.toLowerCase() && s.status === 'approved').length;
      const muniProducts = db.products.filter((p) => p.municipality.toLowerCase() === m.name.toLowerCase() && p.status === 'approved').length;
      const muniOrders = db.orders.filter((o) => o.sellerMunicipality.toLowerCase() === m.name.toLowerCase()).length;
      const muniSales = db.commissionTransactions
        .filter((t) => t.municipality.toLowerCase() === m.name.toLowerCase())
        .reduce((sum, t) => sum + t.productAmount, 0);

      return {
        name: m.name,
        municipality: m.name,
        isCity: m.isCity,
        description: m.description,
        popularItems: m.popularItems,
        sellersCount: muniSellers,
        productsCount: muniProducts,
        ordersCount: muniOrders,
        salesAmount: muniSales,
        totalSales: muniSales,
        totalCommission: Math.round(muniSales * 0.03 * 100) / 100,
        activeSellers: muniSellers,
        completedOrders: muniOrders
      };
    });

    return res.json({ municipalities: stats });
  });

  // Client settings endpoint
  app.get('/api/settings', (req: Request, res: Response) => {
    return res.json({
      settings: {
        marketplaceName: db.settings.marketplaceName,
        commissionRate: db.settings.commissionRate,
        supportedPaymentMethods: db.settings.supportedPaymentMethods,
        adminGcash: {
          linked: db.settings.adminGcash?.linked ?? false,
          accountName: db.settings.adminGcash?.accountName ?? '',
          maskedMobile: db.settings.adminGcash?.maskedMobile ?? ''
        },
        adminMaya: {
          linked: db.settings.adminMaya?.linked ?? false,
          accountName: db.settings.adminMaya?.accountName ?? '',
          maskedMobile: db.settings.adminMaya?.maskedMobile ?? ''
        },
        codEnabled: db.settings.codEnabled,
        currency: db.settings.currency,
        prohibitedCategories: db.settings.prohibitedCategories
      }
    });
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Surigao del Sur Marketplace] Server active on http://0.0.0.0:${PORT}`);
    console.log(`[Commission Engine] Active rate: ${(db.settings.commissionRate * 100).toFixed(1)}%`);
    console.log(`[Admin Bootstrapped] 5 Administrator accounts loaded (Admin1 - Admin5)`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
