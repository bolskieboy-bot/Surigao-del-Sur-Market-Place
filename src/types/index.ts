export type UserRole = 'buyer' | 'seller' | 'admin' | 'rider';

export type PaymentMethodType = 'gcash' | 'maya' | 'cod';

export type OrderStatus =
  | 'order_placed'
  | 'seller_confirmed'
  | 'preparing'
  | 'ready_for_pickup_out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_confirmed'
  | 'cod'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type SellerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'hidden' | 'active';

export type ReportStatus = 'new' | 'under_review' | 'resolved' | 'dismissed' | 'pending';

export interface LinkedAccount {
  linked: boolean;
  accountName?: string;
  maskedMobile?: string;
  unmaskedMobile?: string; // stored securely server-side
}

export interface User {
  id: string;
  username?: string;
  password?: string;
  passwordHash?: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  role: UserRole;
  municipality: string;
  barangay: string;
  completeAddress: string;
  profilePhoto?: string;
  isSuspended?: boolean;
  createdAt: string;
  paymentMethods?: {
    gcash?: LinkedAccount;
    maya?: LinkedAccount;
  };
}

export interface SellerProfile {
  id: string;
  userId: string;
  username?: string;
  password?: string;
  passwordHash?: string;
  ownerName: string;
  shopName: string;
  mobileNumber: string;
  email: string;
  municipality: string;
  barangay: string;
  businessAddress: string;
  shopDescription: string;
  profilePhoto?: string;
  idDocumentUrl?: string;
  businessPermitUrl?: string;
  status: SellerVerificationStatus;
  verificationStatus?: SellerVerificationStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
  paymentMethods: {
    gcash: LinkedAccount & { enabled: boolean };
    maya: LinkedAccount & { enabled: boolean };
    cod: { enabled: boolean };
  };
  rejectionReason?: string;
  createdAt: string;
}

export interface RiderProfile {
  id: string;
  userId: string;
  username?: string;
  password?: string;
  passwordHash?: string;
  riderName: string;
  mobileNumber: string;
  email: string;
  municipality: string;
  barangay: string;
  vehicleType: string;
  plateNumber: string;
  licenseNumber: string;
  active: boolean;
  totalDeliveries: number;
  totalEarnings: number; // 100% of delivery fee - no fee charged to rider
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  username: 'admin1' | 'admin2' | 'admin3' | 'admin4' | 'admin5' | 'admin6' | 'admin7' | 'admin8' | string;
  name: string;
  role: 'admin';
  mustChangePassword: boolean;
  lastLogin?: string;
  email?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerShopName: string;
  sellerMunicipality: string;
  sellerVerified: boolean;
  sellerRating: number;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  photos: string[];
  municipality: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  status: ProductStatus;
  moderationReason?: string;
  isFeatured: boolean;
  views: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  photo?: string;
  category?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerMobile: string;
  buyerAddress: string;
  deliveryAddress?: string;
  buyerMunicipality: string;
  buyerBarangay: string;
  notesToSeller?: string;
  sellerId: string;
  sellerShopName: string;
  sellerMunicipality: string;
  items: OrderItem[];
  productSubtotal: number;
  deliveryFee: number;
  deliveryDistanceKm?: number;
  riderId?: string;
  riderName?: string;
  riderMobile?: string;
  riderEarnings?: number; // 100% of delivery fee - no fee charged to rider
  totalPaid: number;
  commissionRate: number; // 0.03
  commissionAmount: number; // Product Subtotal * 0.03
  sellerNetAmount: number; // Product Subtotal - Commission Amount
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentReferenceNumber?: string;
  paymentReference?: {
    refNumber?: string;
    proofUrl?: string;
    submittedAt?: string;
    verifiedAt?: string;
    notes?: string;
  };
  orderStatus: OrderStatus;
  fulfillmentType: 'delivery' | 'pickup';
  rated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTransaction {
  transactionId: string;
  orderId: string;
  sellerId: string;
  sellerShopName: string;
  buyerId: string;
  buyerName: string;
  productAmount: number;
  deliveryFee: number;
  commissionRate: number; // 0.03
  commissionAmount: number;
  sellerNetAmount: number;
  paymentMethod: PaymentMethodType;
  transactionDate: string;
  orderStatus: OrderStatus;
  category?: string;
  municipality: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  text: string;
  productRef?: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  orderRef?: {
    id: string;
    status: string;
    total: number;
  };
  timestamp: string;
  read: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'seller' | 'product' | 'message';
  targetId: string;
  targetTitle: string;
  reason: 'fake_listing' | 'scam' | 'prohibited_item' | 'misleading' | 'inappropriate' | 'other';
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolutionNotes?: string;
}

export interface Advertisement {
  id: string;
  businessName: string;
  image: string;
  link: string;
  placement: 'home_banner' | 'category_top' | 'near_you';
  startDate: string;
  endDate: string;
  active: boolean;
  clicks: number;
  impressions: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience?: 'all' | 'buyers' | 'sellers';
  priority?: 'normal' | 'urgent';
  authorAdmin?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'verification' | 'message' | 'promo';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  affectedRecord: string;
  details?: string;
  notes?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PlatformSettings {
  marketplaceName: string;
  commissionRate: number; // 0.03
  supportedPaymentMethods: PaymentMethodType[];
  adminGcash?: LinkedAccount;
  adminMaya?: LinkedAccount;
  adminPaymentMethods?: {
    gcash?: LinkedAccount;
    maya?: LinkedAccount;
  };
  codEnabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  currency: string;
  prohibitedCategories: string[];
}

export interface MunicipalityInfo {
  name: string;
  isCity: boolean;
  popularItems: string[];
  description: string;
}
