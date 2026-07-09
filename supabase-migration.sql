-- Permionics BD Suite - Supabase Migration
-- Run this entire script in Supabase SQL Editor (https://app.supabase.com → Project → SQL Editor)

-- Case Studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  technology_stack TEXT NOT NULL DEFAULT '',
  capacity TEXT NOT NULL DEFAULT '',
  results TEXT NOT NULL DEFAULT '',
  testimonial TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  full_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  answers JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable Row Level Security (internal tool, service key used on backend only)
ALTER TABLE case_studies DISABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires DISABLE ROW LEVEL SECURITY;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_case_studies_sector ON case_studies(sector);
CREATE INDEX IF NOT EXISTS idx_case_studies_created_at ON case_studies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questionnaires_sector ON questionnaires(sector);
CREATE INDEX IF NOT EXISTS idx_questionnaires_created_at ON questionnaires(created_at DESC);

-- Seed data - Real Permionics case study placeholders (edit with actual data after setup)
INSERT INTO case_studies (client_name, sector, location, challenge, solution, technology_stack, capacity, results, testimonial, tags, full_text) VALUES
(
  'Waaree Energies Ltd.',
  'Industrial',
  'Surat, Gujarat',
  'Waaree Energies required high-purity process water for solar panel manufacturing. Existing municipal supply had TDS of 900-1200 mg/L with fluctuating quality, causing scaling on production equipment and impacting panel efficiency.',
  'Permionics designed and commissioned a two-pass Reverse Osmosis system with an upstream Ultrafiltration pretreatment stage. The system includes online TDS monitoring, automatic flush cycles, and a CIP module to maintain membrane performance.',
  'UF + 2-Pass RO',
  '50 m3/day',
  'Output water TDS consistently below 10 mg/L (99%+ rejection). Equipment scaling eliminated. Zero production downtime attributed to water quality since commissioning. ROI achieved within 18 months through reduced chemical cleaning costs and improved product yield.',
  'The Permionics system has been running without any major issues for two years. The water quality is consistently excellent and the after-sales support is responsive.',
  ARRAY['Solar', 'UF', 'RO', 'Process Water', 'Industrial', 'Gujarat'],
  'Waaree Energies solar panel manufacturing process water Surat Gujarat UF ultrafiltration RO reverse osmosis TDS 900 1200 mg/L scaling production equipment two-pass high purity 50 m3/day 99% rejection ROI 18 months CIP membrane'
),
(
  'Nandesari CETP',
  'CETP/Municipal',
  'Nandesari Industrial Estate, Vadodara, Gujarat',
  'The Nandesari Common Effluent Treatment Plant serves over 200 member industries with mixed chemical effluent. Legacy treatment system could not meet revised CPCB discharge norms, particularly for COD, TDS, and heavy metals. Risk of closure due to regulatory non-compliance.',
  'Permionics designed a tertiary treatment upgrade using Nanofiltration (NF) followed by Reverse Osmosis (RO) for the concentrated brine stream, with a Multi-Effect Evaporator (MEE) for ZLD compliance. System includes online real-time quality monitoring and automated dosing control.',
  'NF + RO + MEE (ZLD)',
  '3.5 MLD',
  'Treated effluent now meets all CPCB discharge standards with 40% margin. 70% of treated water recovered and sold back to member industries as process water. Full ZLD compliance achieved. Plant avoided regulatory closure and now operates as a model CETP in Gujarat.',
  NULL,
  ARRAY['CETP', 'ZLD', 'NF', 'RO', 'MEE', 'Gujarat', 'Municipal', 'Vadodara'],
  'Nandesari CETP common effluent treatment plant Vadodara Gujarat industrial estate 200 member industries chemical effluent CPCB discharge norms COD TDS heavy metals ZLD zero liquid discharge nanofiltration reverse osmosis MEE multi-effect evaporator 3.5 MLD tertiary treatment upgrade regulatory compliance'
),
(
  'Hyderabad CETP Consortium',
  'CETP/Municipal',
  'Patancheru, Hyderabad, Telangana',
  'Patancheru-Bollarum industrial cluster generates high-volume mixed effluent from pharmaceutical, chemical, and dye manufacturing units. Existing STP was not equipped for high COD and pharmaceutical micropollutants. Telangana PCB issued improvement notice.',
  'Permionics supplied a Membrane Bioreactor (MBR) system combined with RO polishing for pharmaceutical micropollutant removal. The MBR provides superior TSS and BOD removal over conventional activated sludge, while RO addresses dissolved organics and salts to achieve irrigation-quality reuse water.',
  'MBR + RO',
  '5 MLD',
  'BOD removal above 98%. TSS below 5 mg/L in permeate. 60% water reuse achieved for green belt irrigation around industrial zone. Telangana PCB compliance maintained continuously since commissioning. System has run for 3+ years without membrane replacement.',
  NULL,
  ARRAY['CETP', 'MBR', 'RO', 'Pharmaceutical', 'Hyderabad', 'Telangana', 'Municipal', 'ZLD'],
  'Hyderabad Patancheru CETP consortium pharmaceutical chemical dye manufacturing effluent MBR membrane bioreactor reverse osmosis micropollutant BOD COD TSS 5 MLD Telangana PCB compliance water reuse irrigation BOD 98% removal ZLD'
),
(
  'Himalaya Herbal Healthcare',
  'Pharma/Herbal',
  'Bangalore, Karnataka',
  'Himalaya required pharmaceutical-grade purified water for herbal extract processing and API formulation. Municipal water with seasonal variation in quality (TDS 350-700 mg/L, microbiological contamination spikes) was not acceptable for IP-grade production.',
  'Permionics designed a compact packaged RO system with upstream multimedia filtration, activated carbon, and softening, followed by UV sterilization and 0.2 micron polishing. System built to CGMP guidelines with 316L SS construction, PLC control, and complete documentation package for regulatory audit.',
  'MF + Softener + RO + UV',
  '15 m3/day',
  'Output water meets IP Purified Water specifications: conductivity below 1.3 microS/cm, TOC below 500 ppb, no microbial growth in 100 consecutive tests. System audit-ready with full IQ/OQ documentation. Two successful CDSCO and WHO-GMP audits passed post-installation.',
  'The documentation and system design quality from Permionics was at par with what we have seen from European suppliers, but at a fraction of the cost.',
  ARRAY['Pharma', 'Herbal', 'RO', 'UV', 'Purified Water', 'GMP', 'Bangalore', 'Karnataka', 'IP Grade'],
  'Himalaya herbal healthcare Bangalore Karnataka pharmaceutical grade purified water herbal extract API formulation IP grade TDS 350 700 microbiological contamination CGMP 316L SS PLC RO UV 0.2 micron 15 m3/day conductivity TOC CDSCO WHO-GMP audit purified water specifications'
)
ON CONFLICT DO NOTHING;

-- Confirm setup
SELECT 'case_studies' as table_name, COUNT(*) as row_count FROM case_studies
UNION ALL
SELECT 'questionnaires', COUNT(*) FROM questionnaires;
