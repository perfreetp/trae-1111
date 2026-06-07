export interface PrescriptionDrug {
  id: string;
  drugName: string;
  spec: string;
  dosage: string;
  frequency: string;
  quantity: number;
  isRx: boolean;
}

export interface WarningItem {
  type: 'contraindication' | 'duplicate' | 'dosage';
  message: string;
  level: 'warning' | 'error';
}

export interface Prescription {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  diagnosis: string;
  drugs: PrescriptionDrug[];
  doctor: string;
  createTime: string;
  status: 'pending' | 'approved' | 'rejected';
  warnings: WarningItem[];
  auditor?: string;
  auditTime?: string;
  rejectReason?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  drugs: string[];
  amount: number;
  store: string;
}

export interface MedicationReminder {
  id: string;
  drugName: string;
  time: string;
  frequency: string;
  enabled: boolean;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  memberLevel: 'normal' | 'silver' | 'gold' | 'platinum';
  totalConsumption: number;
  points: number;
  registerDate: string;
  purchaseRecords: PurchaseRecord[];
  medicationReminders: MedicationReminder[];
  tags: string[];
}

export interface ProcessRecord {
  id: string;
  date: string;
  type: 'return_supplier' | 'destroy' | 'discount_sale' | 'internal_use';
  quantity: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  drugName: string;
  spec: string;
  batchNo: string;
  stock: number;
  quantity: number;
  unit: string;
  expireDate: string;
  expiryDate: string;
  daysToExpire: number;
  daysToExpiry: number;
  status: 'normal' | 'warning' | 'urgent' | 'out_of_stock';
  purchasePrice: number;
  sellingPrice: number;
  isRx?: boolean;
  supplier?: string;
  stockInDate?: string;
  processRecords?: ProcessRecord[];
}

export interface FollowUpRecord {
  id: string;
  date: string;
  bloodPressure?: string;
  bloodSugar?: number;
  heartRate?: number;
  weight?: number;
  medicationAdherence: boolean;
  notes: string;
}

export interface ChronicRecord {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  phone: string;
  diseaseType: 'hypertension' | 'diabetes' | 'other';
  diseaseName: string;
  diagnosisDate: string;
  medications: string[];
  followUpRecords: FollowUpRecord[];
  medicationAdherence: number;
  nextFollowUpDate: string;
}

export interface PromotionProduct {
  id: string;
  drugName: string;
  spec: string;
  originalPrice: number;
  promotionPrice: number;
  isRx: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'fullReduce' | 'buyGift';
  typeName: string;
  discountValue?: number;
  fullAmount?: number;
  reduceAmount?: number;
  buyQuantity?: number;
  giftQuantity?: number;
  startTime: string;
  endTime: string;
  products: PromotionProduct[];
  status: 'draft' | 'active' | 'ended';
  totalSales?: number;
  totalOrders?: number;
}

export interface CheckItem {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'pending';
  problemDesc?: string;
  rectificationDesc?: string;
  rectificationPhotos?: string[];
}

export interface ComplianceCheck {
  id: string;
  checkName: string;
  checkDate: string;
  store: string;
  checker: string;
  checkItems: CheckItem[];
  status: 'pending' | 'inProgress' | 'completed';
  totalItems: number;
  passItems: number;
  failItems: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface FlowData {
  hour: string;
  count: number;
}

export interface RepurchaseData {
  category: string;
  rate: number;
}
