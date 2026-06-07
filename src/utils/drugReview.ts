import type { WarningItem, PrescriptionDrug, PurchaseRecord } from '@/types';

const contraindicatedPairs: Array<{ drugs: string[]; message: string }> = [
  {
    drugs: ['西地那非', '硝酸甘油', '硝酸异山梨酯'],
    message: '西地那非与硝酸酯类药物合用可能导致严重低血压',
  },
  {
    drugs: ['华法林', '阿司匹林'],
    message: '华法林与阿司匹林合用增加出血风险',
  },
  {
    drugs: ['华法林', '布洛芬', '双氯芬酸钠', '萘普生'],
    message: '华法林与非甾体抗炎药合用增加出血风险',
  },
  {
    drugs: ['二甲双胍', '碘造影剂'],
    message: '二甲双胍与碘造影剂合用可能导致乳酸酸中毒',
  },
  {
    drugs: ['ACEI', '保钾利尿剂', '螺内酯', '氨苯蝶啶'],
    message: 'ACEI与保钾利尿剂合用可能导致高钾血症',
  },
  {
    drugs: ['单胺氧化酶抑制剂', 'SSRIs', '氟西汀', '帕罗西汀', '舍曲林'],
    message: 'MAOI与SSRI合用可能导致5-羟色胺综合征',
  },
  {
    drugs: ['红霉素', '克拉霉素', '他汀类', '阿托伐他汀', '辛伐他汀'],
    message: '大环内酯类抗生素与他汀类合用增加横纹肌溶解风险',
  },
];

const allergyDrugClasses: Record<string, string[]> = {
  '青霉素': ['青霉素', '阿莫西林', '氨苄西林', '哌拉西林', '头孢'],
  '头孢菌素': ['头孢', '头孢氨苄', '头孢拉定', '头孢呋辛', '头孢克肟'],
  '磺胺类': ['磺胺', '复方新诺明', '磺胺甲恶唑'],
  '大环内酯类': ['红霉素', '克拉霉素', '阿奇霉素'],
  '喹诺酮类': ['左氧氟沙星', '环丙沙星', '诺氟沙星'],
};

const commonDrugAllergies = ['青霉素过敏', '头孢过敏', '磺胺过敏', '大环内酯过敏'];

export const detectContraindications = (drugs: PrescriptionDrug[]): WarningItem[] => {
  const warnings: WarningItem[] = [];
  const drugNames = drugs.map((d) => d.drugName);

  contraindicatedPairs.forEach((pair) => {
    const found = pair.drugs.filter((contraDrug) =>
      drugNames.some((name) => name.includes(contraDrug))
    );
    if (found.length >= 2) {
      warnings.push({
        type: 'contraindication',
        message: pair.message,
        level: 'error',
      });
    }
  });

  return warnings;
};

export const detectDuplicateMedication = (
  drugs: PrescriptionDrug[],
  purchaseHistory: PurchaseRecord[]
): WarningItem[] => {
  const warnings: WarningItem[] = [];
  const recentPurchases = purchaseHistory.slice(0, 5);

  drugs.forEach((drug) => {
    const drugKey = drug.drugName.replace(/片|胶囊|缓释|控释|肠溶片|分散片/g, '').trim();
    
    recentPurchases.forEach((record) => {
      const hasDuplicate = record.drugs.some((d) => {
        const recordKey = d.replace(/片|胶囊|缓释|控释|肠溶片|分散片/g, '').trim();
        return recordKey.includes(drugKey) || drugKey.includes(recordKey);
      });

      if (hasDuplicate) {
        warnings.push({
          type: 'duplicate',
          message: `患者近7天内(${record.date})已购买过${drug.drugName}，请注意重复用药`,
          level: 'error',
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
): WarningItem[] => {
  const warnings: WarningItem[] = [];

  allergies.forEach((allergy) => {
    const allergyClass = Object.keys(allergyDrugClasses).find((key) =>
      allergy.includes(key)
    );
    if (allergyClass) {
      const classDrugs = allergyDrugClasses[allergyClass];
      drugs.forEach((drug) => {
        const hasConflict = classDrugs.some((cd) => drug.drugName.includes(cd));
        if (hasConflict) {
          warnings.push({
            type: 'contraindication',
            message: `患者有${allergyClass}过敏史，${drug.drugName}可能引起过敏反应`,
            level: 'error',
          });
        }
      });
    }
  });

  return warnings;
};

export const detectDosageWarning = (drugs: PrescriptionDrug[]): WarningItem[] => {
  const warnings: WarningItem[] = [];

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
          });
        }
        if (drug.drugName.includes('二甲双胍') && dosage >= 2000) {
          warnings.push({
            type: 'dosage',
            message: `二甲双胍最大日剂量不超过2000mg，注意监测乳酸酸中毒`,
            level: 'warning',
          });
        }
      }
    }
  });

  return warnings;
};

export const runFullDrugReview = (
  drugs: PrescriptionDrug[],
  purchaseHistory: PurchaseRecord[] = [],
  allergies: string[] = []
): WarningItem[] => {
  const warnings: WarningItem[] = [];
  
  warnings.push(...detectContraindications(drugs));
  warnings.push(...detectDuplicateMedication(drugs, purchaseHistory));
  warnings.push(...detectAllergyConflict(drugs, allergies));
  warnings.push(...detectDosageWarning(drugs));
  
  return warnings;
};
