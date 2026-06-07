import type { WarningItem, PrescriptionDrug, PurchaseRecord } from '@/types';

const contraindicatedPairs: Array<{
  drugs: string[];
  message: string;
  suggestion: string;
  severity: 'high' | 'medium';
}> = [
  {
    drugs: ['西地那非', '硝酸甘油', '硝酸异山梨酯', '单硝酸异山梨酯'],
    message: '西地那非与硝酸酯类药物合用可能导致严重低血压',
    suggestion: '建议驳回处方，两药联用绝对禁忌，可能引起致命性低血压',
    severity: 'high',
  },
  {
    drugs: ['华法林', '阿司匹林'],
    message: '华法林与阿司匹林合用显著增加出血风险',
    suggestion: '建议药师复核，如确需联用需密切监测INR和出血征象',
    severity: 'high',
  },
  {
    drugs: ['华法林', '布洛芬', '双氯芬酸钠', '萘普生', '塞来昔布'],
    message: '华法林与非甾体抗炎药合用增加出血风险',
    suggestion: '建议更换为对乙酰氨基酚镇痛，如必须联用需监测INR',
    severity: 'medium',
  },
  {
    drugs: ['二甲双胍', '碘造影剂'],
    message: '二甲双胍与碘造影剂合用可能导致乳酸酸中毒',
    suggestion: '建议造影前后48小时暂停二甲双胍，监测肾功能',
    severity: 'high',
  },
  {
    drugs: ['卡托普利', '依那普利', '贝那普利', '螺内酯', '氨苯蝶啶'],
    message: 'ACEI与保钾利尿剂合用可能导致高钾血症',
    suggestion: '建议监测血钾水平，考虑更换为排钾利尿剂',
    severity: 'medium',
  },
  {
    drugs: ['红霉素', '克拉霉素', '阿奇霉素', '阿托伐他汀', '辛伐他汀', '洛伐他汀'],
    message: '大环内酯类抗生素与他汀类合用增加横纹肌溶解风险',
    suggestion: '建议暂停他汀类药物或换用普伐他汀、瑞舒伐他汀',
    severity: 'high',
  },
  {
    drugs: ['头孢哌酮', '头孢孟多', '甲硝唑', '替硝唑', '酒精', '藿香正气水'],
    message: '含甲硫四氮唑侧链的头孢与酒精合用可发生双硫仑样反应',
    suggestion: '建议告知患者用药期间及停药后1周内禁止饮酒及含酒精饮料',
    severity: 'high',
  },
];

const allergyDrugClasses: Record<string, { keywords: string[]; suggestion: string }> = {
  '青霉素': {
    keywords: ['青霉素', '阿莫西林', '氨苄西林', '哌拉西林', '美洛西林', '苯唑西林'],
    suggestion: '青霉素类药物禁用，建议更换为大环内酯类或喹诺酮类',
  },
  '头孢': {
    keywords: ['头孢', '头孢氨苄', '头孢拉定', '头孢呋辛', '头孢克肟', '头孢哌酮', '头孢曲松', '头孢他啶', '头孢克洛', '头孢丙烯'],
    suggestion: '头孢菌素类禁用，青霉素过敏者约5%-10%对头孢交叉过敏，建议使用大环内酯类',
  },
  '磺胺': {
    keywords: ['磺胺', '复方新诺明', '磺胺甲恶唑', '磺胺嘧啶', '塞来昔布', '吲达帕胺'],
    suggestion: '磺胺类药物禁用，建议更换为其他类别药物',
  },
  '大环内酯': {
    keywords: ['红霉素', '克拉霉素', '阿奇霉素', '罗红霉素', '乙酰螺旋霉素'],
    suggestion: '大环内酯类禁用，建议更换为青霉素类或喹诺酮类（无相关过敏史前提下）',
  },
  '喹诺酮': {
    keywords: ['左氧氟沙星', '环丙沙星', '诺氟沙星', '莫西沙星', '氧氟沙星', '环丙沙星'],
    suggestion: '喹诺酮类禁用，建议更换为β-内酰胺类或大环内酯类',
  },
};

export interface ReviewResult extends WarningItem {
  suggestion?: string;
  severity?: 'high' | 'medium' | 'low';
  drugName?: string;
}

export const detectContraindications = (drugs: PrescriptionDrug[]): ReviewResult[] => {
  const warnings: ReviewResult[] = [];
  const drugNames = drugs.map((d) => d.drugName);

  contraindicatedPairs.forEach((pair) => {
    const found = pair.drugs.filter((contraDrug) =>
      drugNames.some((name) => name.includes(contraDrug))
    );
    if (found.length >= 2) {
      warnings.push({
        type: 'contraindication',
        message: pair.message,
        level: pair.severity === 'high' ? 'error' : 'warning',
        suggestion: pair.suggestion,
        severity: pair.severity,
      });
    }
  });

  return warnings;
};

export const detectDuplicateMedication = (
  drugs: PrescriptionDrug[],
  purchaseHistory: PurchaseRecord[]
): ReviewResult[] => {
  const warnings: ReviewResult[] = [];
  const recentPurchases = purchaseHistory.slice(0, 5);

  drugs.forEach((drug) => {
    const drugKey = drug.drugName.replace(/片|胶囊|缓释|控释|肠溶片|分散片|颗粒|注射液|丸/g, '').trim();
    
    recentPurchases.forEach((record) => {
      const hasDuplicate = record.drugs.some((d) => {
        const recordKey = d.replace(/片|胶囊|缓释|控释|肠溶片|分散片|颗粒|注射液|丸/g, '').trim();
        return recordKey.includes(drugKey) || drugKey.includes(recordKey);
      });

      if (hasDuplicate) {
        warnings.push({
          type: 'duplicate',
          message: `患者近7天内(${record.date})已购买过${drug.drugName}，请注意重复用药`,
          level: 'warning',
          suggestion: '建议确认用药疗程，如为续方请注明，避免重复用药导致过量',
          severity: 'medium',
          drugName: drug.drugName,
        });
      }
    });
  });

  const uniqueWarnings = Array.from(new Set(warnings.map((w) => w.message))).map(
    (msg) => warnings.find((w) => w.message === msg)!
  );

  return uniqueWarnings;
};

export const detectAllergyConflict = (
  drugs: PrescriptionDrug[],
  allergies: string[]
): ReviewResult[] => {
  const warnings: ReviewResult[] = [];

  allergies.forEach((allergy) => {
    Object.entries(allergyDrugClasses).forEach(([allergyClass, config]) => {
      if (allergy.includes(allergyClass)) {
        drugs.forEach((drug) => {
          const hasConflict = config.keywords.some((keyword) => 
            drug.drugName.includes(keyword)
          );
          if (hasConflict) {
            warnings.push({
              type: 'allergy',
              message: `患者有${allergy}史，${drug.drugName}属于${allergyClass}类，可能引起过敏反应`,
              level: 'error',
              suggestion: config.suggestion,
              severity: 'high',
              drugName: drug.drugName,
            });
          }
        });
      }
    });
  });

  const uniqueWarnings = Array.from(new Set(warnings.map((w) => w.message))).map(
    (msg) => warnings.find((w) => w.message === msg)!
  );

  return warnings;
};

export const detectDosageWarning = (drugs: PrescriptionDrug[]): ReviewResult[] => {
  const warnings: ReviewResult[] = [];

  drugs.forEach((drug) => {
    if (drug.dosage) {
      const match = drug.dosage.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const dosage = parseFloat(match[1]);
        if (drug.drugName.includes('阿司匹林') && dosage >= 300) {
          warnings.push({
            type: 'dosage',
            message: `阿司匹林用于心血管预防建议剂量为75-100mg/日，当前剂量${drug.dosage}偏高`,
            level: 'warning',
            suggestion: '建议调整剂量至75-100mg/日，长期大剂量增加出血风险',
            severity: 'low',
            drugName: drug.drugName,
          });
        }
        if (drug.drugName.includes('二甲双胍') && dosage >= 2000) {
          warnings.push({
            type: 'dosage',
            message: `二甲双胍最大日剂量不超过2000mg，注意监测乳酸酸中毒`,
            level: 'warning',
            suggestion: '建议分2-3次服用，监测肾功能和乳酸水平',
            severity: 'medium',
            drugName: drug.drugName,
          });
        }
      }
    }
  });

  return warnings;
};

export const getRiskLevel = (warnings: ReviewResult[]): 'normal' | 'low' | 'medium' | 'high' => {
  const highRiskCount = warnings.filter((w) => w.level === 'error').length;
  const mediumRiskCount = warnings.filter((w) => w.level === 'warning').length;
  
  if (highRiskCount >= 2) return 'high';
  if (highRiskCount >= 1) return 'medium';
  if (mediumRiskCount >= 2) return 'low';
  return 'normal';
};

export const getRiskLevelInfo = (level: string) => {
  switch (level) {
    case 'high':
      return { color: 'red', text: '高风险', icon: '🔴' };
    case 'medium':
      return { color: 'orange', text: '中风险', icon: '🟠' };
    case 'low':
      return { color: 'yellow', text: '低风险', icon: '🟡' };
    default:
      return { color: 'green', text: '正常', icon: '🟢' };
  }
};

export const runFullDrugReview = (
  drugs: PrescriptionDrug[],
  purchaseHistory: PurchaseRecord[] = [],
  allergies: string[] = []
): ReviewResult[] => {
  const warnings: ReviewResult[] = [];
  
  warnings.push(...detectContraindications(drugs));
  warnings.push(...detectDuplicateMedication(drugs, purchaseHistory));
  warnings.push(...detectAllergyConflict(drugs, allergies));
  warnings.push(...detectDosageWarning(drugs));
  
  return warnings;
};
