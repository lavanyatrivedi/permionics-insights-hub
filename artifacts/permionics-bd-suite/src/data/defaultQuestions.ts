import { Question, Section, SectorState } from '@/types/questionnaire';

let qId = 0;
const newQ = (text: string, sectionId: string, num: number, type: Question['type'] = 'Text', required = false): Question => ({
  id: `q-${++qId}-${Math.random().toString(36).slice(2, 6)}`,
  number: num,
  text,
  type,
  required,
  sectionId,
});

const section = (title: string): Section => ({
  id: `s-${Math.random().toString(36).slice(2, 8)}`,
  title,
  isExpanded: true,
});

function makeSector(questionGroups: { title: string; questions: string[] }[]): SectorState {
  const sections: Section[] = questionGroups.map((g) => section(g.title));
  const questions: Question[] = [];
  let num = 1;
  questionGroups.forEach((g, i) => {
    g.questions.forEach((text) => {
      questions.push(newQ(text, sections[i].id, num++, 'Text', false));
    });
  });
  return { sections, questions, clientInfo: { companyName: '', contactPerson: '', date: '', location: '' } };
}

export const DEFAULT_SECTOR_STATES: Record<string, SectorState> = {
  pharma: makeSector([
    {
      title: 'Water Source & Quality',
      questions: [
        'Water source (municipal, borewell, RO reject, river)? Current TDS, conductivity, pH?',
        'Seasonal variation in source water quality (TDS range, microbial counts)?',
        'Daily/hourly flow rate requirement (m3/day or LPH)?',
        'Temperature of feed water (min/max)?',
      ],
    },
    {
      title: 'Process Requirements',
      questions: [
        'Required water quality standard (USP Purified Water, IP, WFI, WHO-GMP)?',
        'End use: process water, buffer prep, cleaning, CIP, WFI generation?',
        'Regulated contaminants of concern (endotoxins, heavy metals, TOC, conductivity)?',
        'Storage and distribution loop requirement (stainless steel, hot sanitizable)?',
      ],
    },
    {
      title: 'Site & Compliance',
      questions: [
        'Plant location and utility availability (power phase/voltage, compressed air at _____ bar)?',
        'CGMP documentation required (IQ/OQ/PQ, DQ)? Any regulatory audit upcoming?',
        'Compliance certifications required (WHO-GMP, USFDA, Schedule M)?',
        'Space constraints for plant installation (floor area available in sq ft/m)?',
        'Budget range (indicative CAPEX) and expected project timeline?',
      ],
    },
  ]),

  dairy: makeSector([
    {
      title: 'Product & Process',
      questions: [
        'Dairy product type (whole milk, skim milk, whey, cheese, butter, ice cream, powder)?',
        'Processing objective (concentration, fractionation, protein enrichment, demineralization)?',
        'Daily volume to be processed (litres/day or KLD)?',
        'Seasonal or year-round processing? Peak production period?',
      ],
    },
    {
      title: 'Technical Parameters',
      questions: [
        'Feed temperature range and any temperature-sensitive components?',
        'Target total solids, protein %, fat % in retentate/permeate?',
        'Existing pre-treatment (clarifier, centrifuge, pasteuriser)?',
        'CIP (Clean-In-Place) requirements — chemicals used, frequency, temperature?',
        'Membrane material preference (ceramic/polymer) and any prior membrane experience?',
      ],
    },
    {
      title: 'Regulatory & Site',
      questions: [
        'Regulatory standards to comply with (FSSAI, ISO 22000, BIS, export markets)?',
        'Utilities available at site (power, steam, chilled water, RO water for CIP)?',
        'Budget and commissioning timeline?',
      ],
    },
  ]),

  water: makeSector([
    {
      title: 'Effluent Characterisation',
      questions: [
        'Source of wastewater (industrial process, municipal sewage, CETP combined stream)?',
        'Current inlet quality: COD, BOD, TSS, TDS, TN, TP, pH (provide lab analysis if available)?',
        'Volume to be treated per day (KLD or MLD)?',
        'Key contaminants of concern (heavy metals, pharmaceuticals, dyes, oils/greases)?',
      ],
    },
    {
      title: 'Treatment Objective',
      questions: [
        'Discharge standard to comply with (CPCB E-Std, MoEF, state PCB specific norms)?',
        'ZLD (Zero Liquid Discharge) requirement? Target recovery %?',
        'Water reuse target — process reuse, cooling tower makeup, irrigation, potable?',
        'Existing treatment infrastructure in place (primary, secondary, tertiary)?',
      ],
    },
    {
      title: 'Site & Operations',
      questions: [
        'Available land area for plant installation (sq m or acres)?',
        'Availability of skilled operators or outsourced O&M preference?',
        'Power availability and reliability (grid, DG backup capacity)?',
        'Future expansion provisions needed (design for phase 2 capacity)?',
        'Budget range (CAPEX) and commissioning timeline?',
      ],
    },
  ]),

  food: makeSector([
    {
      title: 'Process & Product',
      questions: [
        'F&B process type (beverages, brewing, edible oil, juice, packaged food, spices)?',
        'Processing objective: concentration, clarification, decolourisation, water reuse?',
        'Volume to be processed per day (litres/day)?',
        'Seasonal variation in production and volumes?',
      ],
    },
    {
      title: 'Technical Parameters',
      questions: [
        'Key contaminants in process stream (BOD, fats/oils/grease, sugars, salts, colour)?',
        'Feed temperature and any heat-sensitive components?',
        'Required permeate/retentate quality targets?',
        'Food-grade membrane material requirement (FDA-compliant, NSF/ANSI 61)?',
        'Existing treatment or filtration in place?',
      ],
    },
    {
      title: 'Compliance & Site',
      questions: [
        'Regulatory compliance requirements (FSSAI, BIS, ISO 22000, export market norms)?',
        'CIP process details (chemicals, temperature, frequency)?',
        'Utility availability (power, steam, compressed air, RO water)?',
        'Budget and timeline?',
      ],
    },
  ]),

  textile: makeSector([
    {
      title: 'Effluent Details',
      questions: [
        'Textile process type (dyeing, printing, sizing, washing, finishing)?',
        'Effluent volume generated per day (KLD)?',
        'Current COD, BOD, TDS, TSS, colour levels in effluent (provide lab analysis if available)?',
        'Type of dyes used (reactive, vat, acid, disperse, direct)?',
        'Type of chemicals in discharge (salt, alkali, surfactants, enzymes)?',
      ],
    },
    {
      title: 'Treatment Objective',
      questions: [
        'ZLD requirement — yes/no? Target reuse percentage back to process?',
        'Discharge standard to comply with (CPCB E-Std, state PCB)?',
        'Existing primary/secondary treatment in place (ETP details)?',
        'Colour removal priority (decolourisation target)?',
      ],
    },
    {
      title: 'Site & Infrastructure',
      questions: [
        'Available land area for ZLD plant (sq m)?',
        'Power availability — connected load and reliability?',
        'Timeline, budget range (CAPEX), and financing preference (EPC/BOO/lease)?',
      ],
    },
  ]),

  cetp: makeSector([
    {
      title: 'Cluster Profile',
      questions: [
        'Total design capacity required (MLD)?',
        'Number of member industries and their sectors (pharma, chemical, textile, food, mixed)?',
        'Current inlet quality parameters (COD, BOD, TSS, TDS, heavy metals) — combined stream?',
        'Seasonal variation in member industry production and effluent volumes?',
      ],
    },
    {
      title: 'Regulatory & Treatment',
      questions: [
        'Discharge standard to comply with (CPCB E-Std, State PCB specific, river zone)?',
        'ZLD mandate from PCB or NGT? Timeline for compliance?',
        'Existing infrastructure available (screens, equalisation tank, biological)?',
        'Treated water disposal/reuse plan (river, recycle to members, agriculture)?',
      ],
    },
    {
      title: 'Site & Operations',
      questions: [
        'Land availability and site constraints (GPS location, area in acres)?',
        'Operating budget (OPEX capacity) and member levy structure?',
        'Skilled manpower availability for O&M or preference for outsourced O&M?',
        'Future expansion provisions for additional member industries?',
        'Budget (CAPEX) and project completion timeline?',
      ],
    },
  ]),

  chemical: makeSector([
    {
      title: 'Process & Objective',
      questions: [
        'Chemical process type (solvent recovery, product concentration, crystallisation, specialty separation)?',
        'Feed stream composition (solvents, APIs, intermediates, catalysts, salts)?',
        'Volume to be processed per day and continuous or batch?',
        'Recovery objective: target product purity %, yield %?',
      ],
    },
    {
      title: 'Technical Parameters',
      questions: [
        'Temperature, pressure, and pH of feed stream?',
        'Chemical compatibility requirements (aggressive solvents, acids, alkalis)?',
        'Membrane material preference (ceramic, PVDF, PTFE, other solvent-resistant polymer)?',
        'Existing separation technology in use (distillation, centrifugation, evaporation)?',
        'Any explosion-proof or ATEX requirements for equipment?',
      ],
    },
    {
      title: 'Compliance & Site',
      questions: [
        'Regulatory approvals required (PCB consent, REACH, HAZMAT storage)?',
        'Utilities available (power, N2 blanket, steam, cooling water)?',
        'Budget, timeline, and EPC/LSTK/supply-only preference?',
      ],
    },
  ]),
};
