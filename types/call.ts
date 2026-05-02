// ============================================================
// Full PCR Call Data Type — based on PDF spec (230+ fields)
// ============================================================

export interface CallData {

  // ── SECTION 1a: Time & Location ──────────────────────────
  formNumber?: string
  incidentNumber?: string          // מס' אירוע/קריאה
  callDate?: string
  shift?: string
  callReceivedTime?: string        // שעת קבלת האירוע
  departureTime?: string           // שעת יציאה מהתחנה
  arrivalTime?: string             // שעת הגעה לזירה
  patientContactTime?: string      // שעת הגעה למטופל
  sceneTime?: string               // שעת תחילת פינוי
  hospitalArrivalTime?: string     // שעת הגעה לח"ב
  callEndTime?: string             // שעת סיום האירוע
  callType?: string
  callPriority?: string
  callLocation?: string

  // ── SECTION 1b: Full Address ─────────────────────────────
  eventCity?: string
  eventStreet?: string
  eventHouseNumber?: string
  eventApartment?: string
  eventGpsLat?: number
  eventGpsLng?: number
  navigationNotes?: string

  // ── SECTION 1c: Crew ─────────────────────────────────────
  ambulanceNumber?: string
  driver?: string
  paramedic?: string
  emt1?: string
  emt2?: string
  volunteer1?: string
  volunteer2?: string
  doctor?: string
  doctorLicenseNumber?: string

  // ── SECTION 1d: Billing ──────────────────────────────────
  invoiceNumber?: string
  receiptNumber?: string
  commitmentNumber?: string
  postalCommitmentNumber?: string
  paymentType?: string

  // Legacy fields
  callAddress?: string
  teamCompositionNote?: string
  teamComposition?: string[]

  // ── SECTION 2a: Patient ID ───────────────────────────────
  patientFirstName?: string
  patientLastName?: string
  patientFatherName?: string
  patientSex?: string
  patientIdType?: string
  patientId?: string
  patientDob?: string
  patientAge?: number
  patientAgeMonths?: number        // תינוקות מתחת לשנה
  patientWeight?: number           // משקל משוערמ

  // ── SECTION 2b: Home Address ─────────────────────────────
  patientCity?: string
  patientStreet?: string
  patientHouseNumber?: string
  patientApartment?: string
  patientPoBox?: string
  patientPostalCode?: string

  // ── SECTION 2c: Contact ──────────────────────────────────
  patientPhone?: string
  patientPhone2?: string
  patientEmail?: string
  contactName?: string
  contactRelation?: string
  contactPhone?: string
  preferredLanguage?: string

  // ── SECTION 2d: Insurance ────────────────────────────────
  healthFund?: string
  insuranceCompany?: string
  policyNumber?: string
  referralNumber?: string
  healthFundId?: string

  // ── SECTION 3a: Medical Background ──────────────────────
  infoSource?: string              // מקור המידע
  chronicConditions?: string[]
  chronicConditionsOther?: string
  previousSurgeries?: string
  recentHospitalizations?: string

  // ── SECTION 3b: Medications ──────────────────────────────
  takesMedications?: string        // כן/לא/לא ידוע
  medications?: string
  medicationsTable?: MedicationRecord[]

  // ── SECTION 3c: Allergies ────────────────────────────────
  hasMedicalHistory?: string
  hasAllergies?: string
  allergyStatus?: string
  allergies?: string[]
  foodAllergies?: string[]
  allergyDetail?: string
  medicalAlertBracelet?: string

  // ── SECTION 3d: Pregnancy ────────────────────────────────
  pregnancyStatus?: string
  pregnancyWeeks?: number
  pregnancyComplications?: string

  // ── SECTION 3e: Advance Directives ───────────────────────
  advanceDirectives?: string       // הוראות מקדימות/DNR
  advanceDirectivesDetail?: string
  familyDoctorName?: string
  familyDoctorPhone?: string
  smokingAlcoholDrugs?: string[]
  immunizations?: string

  // ── SECTION 4a: Chief Complaint ──────────────────────────
  chiefComplaint?: string[]
  chiefComplaintFreeText?: string
  caseNarrative?: string           // תיאור הרקמה
  symptomOnsetTime?: string
  symptomOnsetDate?: string
  lastKnownWell?: string

  // ── SECTION 4b: OPQRST ───────────────────────────────────
  opqrst_O?: string               // Onset
  opqrst_P?: string               // Provokes
  opqrst_Q?: string[]             // Quality (chips)
  opqrst_R?: string               // Radiation
  painScore?: number              // S — Severity
  opqrst_T?: string               // Time duration

  // ── SECTION 4c: SAMPLE ───────────────────────────────────
  associatedSymptoms?: string[]
  lastMeal?: string
  lastMealTime?: string
  eventsLeadingUp?: string

  // ── SECTION 4d: Trauma Mechanism ─────────────────────────
  traumaMechanism?: string[]
  fallHeight?: number

  // Legacy
  onsetTime?: string
  onsetDescription?: string
  painLocation?: string
  painQuality?: string[]
  painRadiation?: string

  // ── SECTION 5: Physical Exam ─────────────────────────────
  generalAppearance?: string[]     // BSI/מראה כללי
  headExam?: string
  faceSymmetry?: string
  pupils?: string
  rightPupilSize?: number
  leftPupilSize?: number
  rightPupilReaction?: string
  leftPupilReaction?: string
  noseEars?: string
  mouth?: string
  neck?: string
  chestMovement?: string
  chestAuscultation?: string
  abdomen?: string
  spine?: string
  pelvis?: string
  upperExtRight?: string
  upperExtLeft?: string
  lowerExtRight?: string
  lowerExtLeft?: string
  peripheralPulses?: string
  neuroExam?: string
  skinColor?: string
  skinTemperature?: string
  skinMoisture?: string
  crt?: number                    // Capillary Refill Time
  bodyMapNotes?: string
  physicalExamNotes?: string

  // ── SECTION 6: Vital Signs ───────────────────────────────
  vitals?: VitalSet[]
  gcsEye?: number
  gcsVerbal?: number
  gcsMotor?: number
  avpu?: string

  // ── SECTION 7a: Stroke Scale ─────────────────────────────
  strokeScaleFace?: string
  strokeScaleArm?: string
  strokeScaleSpeech?: string
  strokeSymptomOnset?: string
  strokeLastKnownWell?: string
  strokeSuspected?: string

  // ── SECTION 7c: Trauma Scores (auto-calculated) ──────────
  rts?: number
  shockIndex?: number

  // ── SECTION 8a: Airway & Resuscitation ───────────────────
  airwayManagement?: string[]
  airwayAdjunct?: string
  o2Delivery?: string
  o2FlowRate?: number
  cprPerformed?: boolean
  cprStartTime?: string
  cprEndTime?: string
  defibrillation?: boolean
  shocksDelivered?: number
  joulesPerShock?: number
  rhythmPreShock?: string
  rhythmPostShock?: string
  rosc?: boolean
  roscTime?: string

  // ── SECTION 8b: Bleeding Control ─────────────────────────
  bleedingControl?: string[]
  tourniquetSite?: string
  tourniquetTime?: string

  // ── SECTION 8c: IV Access ────────────────────────────────
  ivAccess?: IVAccess[]

  // ── SECTION 8d: Medications Given ────────────────────────
  medications_given?: MedicationGiven[]

  // ── SECTION 8e: Splinting & Bandaging ────────────────────
  spinalImmobilization?: boolean
  neckCollar?: string
  backboard?: boolean
  ked?: boolean
  splinting?: string
  bandaging?: string
  thermalBlanket?: boolean

  // ── SECTION 8f: Treatment Response ──────────────────────
  treatmentRefused?: boolean
  treatmentResponse?: string
  treatments?: Treatment[]

  // ── SECTION 9: Childbirth ────────────────────────────────
  motherStatus?: string
  para?: number
  gravida?: number
  watersBroke?: string
  watersBrokeTime?: string
  amnioticFluidColor?: string
  contractionInterval?: number
  contractionIntensity?: string
  vaginalBleeding?: string
  deliveryTime?: string
  deliveryType?: string
  newbornSex?: string
  newbornVitalsTime?: string
  newbornHeartRate?: number
  newbornRespRate?: number
  newbornSpo2?: number
  newbornBreathing?: string
  newbornTone?: string
  newbornColor?: string
  newbornCried?: string
  apgar1?: number
  apgar5?: number
  apgar10?: number
  apgarColor1?: number
  apgarPulse1?: number
  apgarReflex1?: number
  apgarTone1?: number
  apgarRespiration1?: number
  apgarColor5?: number
  apgarPulse5?: number
  apgarReflex5?: number
  apgarTone5?: number
  apgarRespiration5?: number
  apgarColor10?: number
  apgarPulse10?: number
  apgarReflex10?: number
  apgarTone10?: number
  apgarRespiration10?: number
  newbornActions?: string[]
  placentaDelivered?: string
  postPartumBleeding?: string
  deliveryNotes?: string

  // ── SECTION 10: MVC ──────────────────────────────────────
  isMVC?: string
  policeIncidentNumber?: string
  seatbelt?: string
  airbagDeployed?: string
  extrication?: string
  extractionTime?: number
  ejectedFromVehicle?: string
  fatalityAtScene?: string
  estimatedSpeed?: number
  impactDirection?: string
  scenePhotos?: string[]
  hospitalStickerPhotos?: string[]
  babyStickerPhotos?: string[]

  // ── SECTION 11: Evacuation ───────────────────────────────
  evacuationStatus?: string
  evacuationDestination?: string
  hospital?: string
  hospitalDepartment?: string
  hmoDestination?: string
  institutionName?: string
  otherDestinationDetail?: string
  handoffPersonName?: string
  handoffPersonRole?: string
  handoffTime?: string
  triageColor?: string
  handoffNote?: string

  refusalReason?: string

  // ── SECTION 12: Signatures ───────────────────────────────
  consentSignature?: string
  refusalTreatmentSignature?: string
  refusalEvacuationSignature?: string
  witnessName?: string
  witnessSignature?: string
  guardianSigned?: string
  guardianName?: string
  guardianRelation?: string
  guardianId?: string
  guardianSignature?: string
  crewSignatures?: CrewSignature[]
  formClosedBy?: string
  crewLeaderSignature?: string
  formClosedTime?: string

  // Meta
  notes?: string
}

// ── Sub-types ──────────────────────────────────────────────

export interface VitalSet {
  time: string
  avpu?: string
  gcsEye?: number
  gcsVerbal?: number
  gcsMotor?: number
  pulseRate?: number
  pulseQuality?: string
  bpSystolic?: number
  bpDiastolic?: number
  respiratoryRate?: number
  respQuality?: string
  spo2?: number
  o2DuringMeasurement?: string
  temperature?: number
  tempMethod?: string
  bloodGlucose?: number
  painScore?: number
  rightPupilSize?: number
  leftPupilSize?: number
  rightPupilReaction?: string
  leftPupilReaction?: string
  ecgRhythm?: string
  measuredBy?: string
  note?: string
}

export interface Treatment {
  time: string
  procedure: string
  response?: string
  performedBy?: string
}

export interface MedicationGiven {
  time: string
  name: string
  dose?: string
  unit?: string
  route?: string
  response?: string
  performedBy?: string
  batchNumber?: string
}

export interface MedicationRecord {
  name: string
  dose?: string
  frequency?: string
  route?: string
}

export interface IVAccess {
  time: string
  site: string
  gauge?: string
  attempts?: number
  fluid?: string
  fluidVolume?: number
  io?: boolean
}

export interface CrewSignature {
  name: string
  role: string
  signature: string
}
