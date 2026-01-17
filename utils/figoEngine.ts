import {
  MolecularStatus,
  Histology,
  LVSIStatus,
  Myoinvasion,
  CervicalInvasion,
  RiskGroup,
  PatientData,
  TumorData,
  TreatmentPlan
} from '../types';

export class Engine {
  static classifyMolecular(t: TumorData): MolecularStatus {
    if (t.poleMutation) return MolecularStatus.POLE_MUT;
    if (t.mmrDeficient) return MolecularStatus.MMR_D;
    if (t.p53Abnormal) return MolecularStatus.P53_ABN;
    return MolecularStatus.NSMP;
  }

  static determineStage(t: TumorData, mol: MolecularStatus): string {
    // Stage IV
    if (t.distantMetastasis) return "IVC";
    if (t.peritonealCarcinomatosis) return "IVB";
    if (t.bladderBowelMucosa) return mol === MolecularStatus.POLE_MUT ? "IVA (mPOLEmut)" : "IVA";

    // Stage III
    if (t.paraaorticNodesPositive) return "IIIC2";
    if (t.pelvicNodesPositive) return "IIIC1";
    if (t.peritonealInvolvement) return "IIIB2";
    if (t.vaginalInvolvement || t.parametrialInvolvement) return "IIIB1";
    if (t.adnexalInvolvement) return "IIIA1";

    // Stage II
    if (t.cervicalInvasion === CervicalInvasion.STROMAL) {
      if (mol === MolecularStatus.POLE_MUT) return "IAm (POLEmut)";
      if (mol === MolecularStatus.P53_ABN && t.myoinvasion !== Myoinvasion.NONE) return "IICm (p53abn)";
      return "IIA";
    }
    
    // Aggressive Features Early Stage
    const isAggressiveHist = [
      Histology.SEROUS, 
      Histology.CLEAR_CELL, 
      Histology.CARCINOSARCOMA, 
      Histology.UNDIFFERENTIATED
    ].includes(t.histology);
    
    if (t.lvsi === LVSIStatus.SUBSTANTIAL) {
      if (mol === MolecularStatus.POLE_MUT) return "IAm (POLEmut)";
      if (mol === MolecularStatus.P53_ABN && t.myoinvasion !== Myoinvasion.NONE) return "IICm (p53abn)";
      return "IIB";
    }

    if (isAggressiveHist && t.myoinvasion !== Myoinvasion.NONE) {
      if (mol === MolecularStatus.POLE_MUT) return "IAm (POLEmut)";
      return "IIC";
    }

    // Stage I
    if (t.myoinvasion === Myoinvasion.GREATER_EQUAL_50) {
      if (mol === MolecularStatus.POLE_MUT) return "IAm (POLEmut)";
      if (mol === MolecularStatus.P53_ABN) return "IICm (p53abn)";
      return t.histology === Histology.ENDOMETRIOID_LOW_GRADE ? "IB" : "IB (High Grade)";
    }

    // < 50% or None
    if (mol === MolecularStatus.POLE_MUT) return "IAm (POLEmut)";
    if (mol === MolecularStatus.P53_ABN && t.myoinvasion !== Myoinvasion.NONE) return "IICm (p53abn)";
    
    if (t.histology === Histology.ENDOMETRIOID_LOW_GRADE) {
      return t.myoinvasion === Myoinvasion.NONE ? "IA1" : "IA2";
    }
    
    // Aggressive histology but no deep invasion
    return "IC"; 
  }

  static getRisk(t: TumorData, stage: string, mol: MolecularStatus): RiskGroup {
    // 1. LOW RISK
    if (mol === MolecularStatus.POLE_MUT) {
      if (!stage.includes("III") && !stage.includes("IV")) return RiskGroup.LOW;
    }
    if ([MolecularStatus.MMR_D, MolecularStatus.NSMP].includes(mol)) {
      if (t.histology === Histology.ENDOMETRIOID_LOW_GRADE && t.erStatusPositive) {
        if (["IA1", "IA2"].includes(stage) && t.lvsi !== LVSIStatus.SUBSTANTIAL) return RiskGroup.LOW;
      }
    }

    // 2. INTERMEDIATE
    if ([MolecularStatus.MMR_D, MolecularStatus.NSMP].includes(mol)) {
      if (t.histology === Histology.ENDOMETRIOID_LOW_GRADE) {
        if (stage === "IB") return RiskGroup.INTERMEDIATE;
        if (stage === "IIA" && mol === MolecularStatus.NSMP) return RiskGroup.INTERMEDIATE;
      }
    }

    // 3. HIGH-INTERMEDIATE
    if (mol === MolecularStatus.MMR_D) {
      if (stage.includes("IIA") || stage.includes("IIB")) return RiskGroup.HIGH_INTERMEDIATE;
    }
    if (mol === MolecularStatus.NSMP) {
      if (stage.includes("IIB") && t.histology === Histology.ENDOMETRIOID_LOW_GRADE) return RiskGroup.HIGH_INTERMEDIATE;
    }

    // 4. HIGH
    if (mol === MolecularStatus.P53_ABN) {
      if (!stage.includes("III") && !stage.includes("IV")) return RiskGroup.HIGH;
    }
    if (stage.includes("III") || stage.includes("IV")) {
      return mol === MolecularStatus.POLE_MUT ? RiskGroup.UNCERTAIN : RiskGroup.HIGH;
    }
    
    if (mol === MolecularStatus.NSMP) {
      if (t.histology !== Histology.ENDOMETRIOID_LOW_GRADE || !t.erStatusPositive) return RiskGroup.HIGH;
    }

    return RiskGroup.HIGH;
  }

  static getTreatment(p: PatientData, t: TumorData, stage: string, risk: RiskGroup, mol: MolecularStatus): TreatmentPlan {
    const surgery: string[] = [];
    const adjuvant: string[] = [];
    
    // Surgery
    if (p.comorbidityScore === 1) {
      surgery.push("Patient is Medically Unfit for major surgery.");
      surgery.push("Primary Radiation (EBRT + Brachytherapy) is the alternative standard.");
    } else {
      surgery.push("Total Hysterectomy + Bilateral Salpingo-oophorectomy (Standard).");
      surgery.push("Minimally Invasive approach (Laparoscopy/Robotic) preferred.");
      
      if (risk === RiskGroup.LOW && p.age < 45) {
        surgery.push("Ovarian Preservation can be discussed (must exclude genetic syndromes).");
      }
      
      if (risk === RiskGroup.LOW) {
        surgery.push("Sentinel Lymph Node (SLN) biopsy: Optional/Not mandatory.");
      } else {
        surgery.push("Sentinel Lymph Node (SLN) biopsy: Recommended (ICG technique).");
        if (risk === RiskGroup.HIGH) {
          surgery.push("If SLN fails/not mapped: Perform systematic lymphadenectomy.");
          surgery.push("Infracolic Omentectomy indicated for serous/carcinosarcoma.");
        }
      }
    }

    // Adjuvant
    if (risk === RiskGroup.LOW) {
      adjuvant.push("No additional treatment required.");
    } else if (risk === RiskGroup.INTERMEDIATE) {
      adjuvant.push("Vaginal Brachytherapy (Internal Radiation) recommended.");
      adjuvant.push("Observation is an alternative for patients < 60 years.");
    } else if (risk === RiskGroup.HIGH_INTERMEDIATE) {
      if (t.pelvicNodesPositive || t.paraaorticNodesPositive) {
        adjuvant.push("Chemotherapy + External Beam Radiation.");
      } else {
        adjuvant.push("External Beam Radiotherapy (EBRT) to pelvis.");
        adjuvant.push("Vaginal Brachytherapy alone can be considered if extensive staging confirmed node-negative.");
      }
    } else if (risk === RiskGroup.HIGH) {
      adjuvant.push("External Beam Radiotherapy (EBRT) + Concurrent Chemotherapy.");
      adjuvant.push("Alternative: Sequential Chemotherapy (Carboplatin/Paclitaxel) -> Radiation.");
      if (mol === MolecularStatus.MMR_D && (stage.includes("III") || stage.includes("IV"))) {
        adjuvant.push("Immunotherapy (Pembrolizumab/Dostarlimab) combined with chemotherapy is a new standard.");
      }
      if (mol === MolecularStatus.P53_ABN && t.histology === Histology.SEROUS) {
        adjuvant.push("HER2 testing recommended; add Trastuzumab if HER2 positive.");
      }
    } else {
      adjuvant.push("Complex case (POLEmut Advanced Stage). Multidisciplinary Board discussion required.");
    }

    return { 
      surgery, 
      adjuvant, 
      surveillance: ["Years 1-3: Every 3-4 months", "Years 4-5: Every 6 months", "Annually thereafter"] 
    };
  }
}