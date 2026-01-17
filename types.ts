export enum MolecularStatus {
  POLE_MUT = "POLE-mutated",
  MMR_D = "MMR Deficient (MMRd)",
  NSMP = "No Specific Molecular Profile (NSMP)",
  P53_ABN = "p53 Abnormal (p53abn)",
  UNKNOWN = "Unknown/Not Tested"
}

export enum Histology {
  ENDOMETRIOID_LOW_GRADE = "Endometrioid (Grade 1 or 2)",
  ENDOMETRIOID_HIGH_GRADE = "Endometrioid (Grade 3)",
  SEROUS = "Serous Carcinoma",
  CLEAR_CELL = "Clear Cell Carcinoma",
  CARCINOSARCOMA = "Carcinosarcoma",
  UNDIFFERENTIATED = "Undifferentiated",
  MIXED = "Mixed Histology"
}

export enum LVSIStatus {
  NONE = "No LVSI",
  FOCAL = "Focal LVSI",
  SUBSTANTIAL = "Substantial LVSI"
}

export enum Myoinvasion {
  NONE = "None (Confined to Endometrium)",
  LESS_50 = "Less than 50% (< 50%)",
  GREATER_EQUAL_50 = "50% or More (>= 50%)"
}

export enum CervicalInvasion {
  NONE = "None",
  GLANDULAR = "Glandular Only",
  STROMAL = "Stromal Invasion"
}

export enum RiskGroup {
  LOW = "Low Risk",
  INTERMEDIATE = "Intermediate Risk",
  HIGH_INTERMEDIATE = "High-Intermediate Risk",
  HIGH = "High Risk",
  UNCERTAIN = "Uncertain Risk",
  ADVANCED_METASTATIC = "Advanced/Metastatic"
}

export enum MenopausalStatus {
  PRE = "Pre-menopausal",
  POST = "Post-menopausal"
}

export interface PatientData {
  age: number;
  bmi: number;
  menopausalStatus: MenopausalStatus;
  comorbidityScore: number;
}

export interface TumorData {
  histology: Histology;
  myoinvasion: Myoinvasion;
  cervicalInvasion: CervicalInvasion;
  lvsi: LVSIStatus;
  tumorSizeCm: number;
  erStatusPositive: boolean;
  adnexalInvolvement: boolean;
  vaginalInvolvement: boolean;
  parametrialInvolvement: boolean;
  peritonealInvolvement: boolean;
  pelvicNodesPositive: boolean;
  paraaorticNodesPositive: boolean;
  bladderBowelMucosa: boolean;
  distantMetastasis: boolean;
  peritonealCarcinomatosis: boolean;
  poleMutation: boolean;
  mmrDeficient: boolean;
  p53Abnormal: boolean;
}

export interface ScanResult {
  histology?: string;
  myoinvasion?: string;
  lvsi?: string;
  poleMutation?: boolean;
  mmrDeficient?: boolean;
  p53Abnormal?: boolean;
}

export interface TreatmentPlan {
  surgery: string[];
  adjuvant: string[];
  surveillance: string[];
}