import {
  User,
  SellerProfile,
  AdminAccount,
  RiderProfile,
  Product,
  Order,
  Review,
  Report,
  Advertisement,
  Announcement,
  NotificationItem,
  AdminAuditLog,
  PlatformSettings,
  PaymentMethodType,
  OrderStatus
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = 'Something went wrong. Please try again.';
    try {
      const data = await res.json();
      if (data && data.error) {
        errMsg = data.error;
      }
    } catch {
      if (res.status === 0 || !navigator.onLine) {
        errMsg = 'Internet connection seems unavailable. Please check your connection and try again.';
      }
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async adminLogin(username: string, password: string): Promise<{ admin: AdminAccount }> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  async adminChangePassword(adminId: string, currentPassword: string, newPassword: string): Promise<{ admin: AdminAccount; message: string }> {
    const res = await fetch('/api/auth/admin-change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, currentPassword, newPassword })
    });
    return handleResponse(res);
  },

  async login(identifier: string, password?: string): Promise<{ user: User; sellerProfile?: SellerProfile; riderProfile?: RiderProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return handleResponse(res);
  },

  async riderLogin(identifier: string, password?: string): Promise<{ rider: RiderProfile; user: User }> {
    const res = await fetch('/api/auth/rider-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return handleResponse(res);
  },

  async getRiderOrders(riderId?: string): Promise<{ orders: Order[] }> {
    const url = riderId ? `/api/rider/orders?riderId=${encodeURIComponent(riderId)}` : '/api/rider/orders';
    const res = await fetch(url);
    return handleResponse(res);
  },

  async acceptDelivery(orderId: string, riderId: string, riderName: string, riderMobile: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/accept-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, riderName, riderMobile })
    });
    return handleResponse(res);
  },

  async updateRiderDeliveryStatus(orderId: string, riderId: string, status: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/update-delivery-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, status })
    });
    return handleResponse(res);
  },

  async getRiderStats(riderId: string): Promise<{ totalDeliveries: number; totalEarnings: number; activeDeliveries: number }> {
    const res = await fetch(`/api/rider/stats?riderId=${encodeURIComponent(riderId)}`);
    return handleResponse(res);
  },

  async registerBuyer(data: any): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register-buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async registerSeller(data: any): Promise<{ user: User; seller: SellerProfile; message: string }> {
    const res = await fetch('/api/auth/register-seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async registerRider(data: any): Promise<{ user: User; rider: RiderProfile; message: string }> {
    const res = await fetch('/api/auth/register-rider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Payment Linking
  async linkBuyerPayment(userId: string, paymentMethod: 'gcash' | 'maya', accountName: string, mobileNumber: string): Promise<{ success: boolean; paymentMethods: any }> {
    const res = await fetch('/api/payments/buyer-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, paymentMethod, accountName, mobileNumber })
    });
    return handleResponse(res);
  },

  async unlinkBuyerPayment(userId: string, paymentMethod: 'gcash' | 'maya'): Promise<{ success: boolean; paymentMethods: any }> {
    const res = await fetch('/api/payments/buyer-unlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, paymentMethod })
    });
    return handleResponse(res);
  },

  async linkSellerPayment(sellerId: string, paymentMethod: 'gcash' | 'maya', accountName: string, mobileNumber: string, enabled = true): Promise<{ success: boolean; paymentMethods: any }> {
    const res = await fetch('/api/payments/seller-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, paymentMethod, accountName, mobileNumber, enabled })
    });
    return handleResponse(res);
  },

  async configureSellerPaymentMethods(sellerId: string, gcashEnabled: boolean, mayaEnabled: boolean, codEnabled: boolean) {
    const res = await fetch('/api/payments/seller-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, gcashEnabled, mayaEnabled, codEnabled })
    });
    return handleResponse(res);
  },

  async linkAdminPayment(adminId: string, paymentMethod: 'gcash' | 'maya', accountName: string, mobileNumber: string) {
    const res = await fetch('/api/payments/admin-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, paymentMethod, accountName, mobileNumber })
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params: {
    municipality?: string;
    category?: string;
    search?: string;
    sellerId?: string;
    sort?: string;
    featuredOnly?: boolean;
  } = {}): Promise<{ products: Product[] }> {
    const q = new URLSearchParams();
    if (params.municipality) q.append('municipality', params.municipality);
    if (params.category) q.append('category', params.category);
    if (params.search) q.append('search', params.search);
    if (params.sellerId) q.append('sellerId', params.sellerId);
    if (params.sort) q.append('sort', params.sort);
    if (params.featuredOnly) q.append('featuredOnly', 'true');

    const res = await fetch(`/api/products?${q.toString()}`);
    return handleResponse(res);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${id}`);
    return handleResponse(res);
  },

  async createProduct(data: any): Promise<{ product: Product }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateProduct(id: string, data: any): Promise<{ product: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Orders
  async createOrder(data: {
    buyerId: string;
    sellerId: string;
    items: any[];
    deliveryAddress?: string;
    notesToSeller?: string;
    paymentMethod: PaymentMethodType;
    fulfillmentType?: 'delivery' | 'pickup';
  }): Promise<{ order: Order; sellerPaymentInfo: any }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async submitPaymentReference(orderId: string, refNumber: string, proofUrl?: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/payment-reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refNumber, proofUrl })
    });
    return handleResponse(res);
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, adminUsername?: string): Promise<{ order: Order }> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus, adminUsername })
    });
    return handleResponse(res);
  },

  async getOrders(params: { buyerId?: string; sellerId?: string; status?: string } = {}): Promise<{ orders: Order[] }> {
    const q = new URLSearchParams();
    if (params.buyerId) q.append('buyerId', params.buyerId);
    if (params.sellerId) q.append('sellerId', params.sellerId);
    if (params.status) q.append('status', params.status);

    const res = await fetch(`/api/orders?${q.toString()}`);
    return handleResponse(res);
  },

  // Finance & Commission
  async getFinanceStats(filters: {
    municipality?: string;
    sellerId?: string;
    category?: string;
    paymentMethod?: string;
  } = {}): Promise<any> {
    const q = new URLSearchParams();
    if (filters.municipality) q.append('municipality', filters.municipality);
    if (filters.sellerId) q.append('sellerId', filters.sellerId);
    if (filters.category) q.append('category', filters.category);
    if (filters.paymentMethod) q.append('paymentMethod', filters.paymentMethod);

    const res = await fetch(`/api/finance/stats?${q.toString()}`);
    return handleResponse(res);
  },

  // Reviews
  async createReview(data: any): Promise<{ review: Review }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getReviews(params: { sellerId?: string; productId?: string } = {}): Promise<{ reviews: Review[] }> {
    const q = new URLSearchParams();
    if (params.sellerId) q.append('sellerId', params.sellerId);
    if (params.productId) q.append('productId', params.productId);

    const res = await fetch(`/api/reviews?${q.toString()}`);
    return handleResponse(res);
  },

  // Chat
  async getMessages(userId: string, recipientId?: string): Promise<{ messages: any[] }> {
    const q = new URLSearchParams({ userId });
    if (recipientId) q.append('recipientId', recipientId);
    const res = await fetch(`/api/chat/messages?${q.toString()}`);
    return handleResponse(res);
  },

  async sendMessage(data: any): Promise<{ message: any }> {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Reports
  async submitReport(data: any): Promise<{ report: Report; message: string }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getReports(): Promise<{ reports: Report[] }> {
    const res = await fetch('/api/reports');
    return handleResponse(res);
  },

  async resolveReport(id: string, status: string, resolutionNotes: string, adminUsername?: string): Promise<{ report: Report }> {
    const res = await fetch(`/api/reports/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes, adminUsername })
    });
    return handleResponse(res);
  },

  // Admin APIs
  async getAdminOverview(): Promise<any> {
    const res = await fetch('/api/admin/overview');
    return handleResponse(res);
  },

  async updateSellerVerification(sellerId: string, status: string, rejectionReason?: string, adminUsername?: string): Promise<{ seller: SellerProfile }> {
    const res = await fetch(`/api/admin/sellers/${sellerId}/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason, adminUsername })
    });
    return handleResponse(res);
  },

  async moderateProduct(productId: string, status: string, moderationReason?: string, adminUsername?: string): Promise<{ product: Product }> {
    const res = await fetch(`/api/admin/products/${productId}/moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, moderationReason, adminUsername })
    });
    return handleResponse(res);
  },

  async updateSettings(data: any): Promise<{ settings: PlatformSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getSellers(params: { status?: string; municipality?: string } = {}): Promise<{ sellers: SellerProfile[] }> {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.municipality) q.append('municipality', params.municipality);
    const res = await fetch(`/api/sellers?${q.toString()}`);
    return handleResponse(res);
  },

  async getSeller(id: string): Promise<{ seller: SellerProfile }> {
    const res = await fetch(`/api/sellers/${id}`);
    return handleResponse(res);
  },

  async getAdvertisements(): Promise<{ advertisements: Advertisement[] }> {
    const res = await fetch('/api/advertisements');
    return handleResponse(res);
  },

  async createAdvertisement(data: any): Promise<{ advertisement: Advertisement }> {
    const res = await fetch('/api/advertisements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAnnouncements(): Promise<{ announcements: Announcement[] }> {
    const res = await fetch('/api/announcements');
    return handleResponse(res);
  },

  async createAnnouncement(data: any): Promise<{ announcement: Announcement }> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<{ auditLogs: AdminAuditLog[] }> {
    const res = await fetch('/api/admin/audit-logs');
    return handleResponse(res);
  },

  async getMunicipalityStats(): Promise<{ municipalities: any[] }> {
    const res = await fetch('/api/municipalities/stats');
    return handleResponse(res);
  },

  async getSettings(): Promise<{ settings: PlatformSettings }> {
    const res = await fetch('/api/settings');
    return handleResponse(res);
  },

  async getNotifications(userId?: string): Promise<{ notifications: NotificationItem[] }> {
    const q = new URLSearchParams();
    if (userId) q.append('userId', userId);
    const res = await fetch(`/api/notifications?${q.toString()}`);
    return handleResponse(res);
  },

  async getRiders(): Promise<{ riders: RiderProfile[] }> {
    const res = await fetch('/api/riders');
    return handleResponse(res);
  }
};
