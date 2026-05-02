// כל הרשימות הסגורות מנספח A של האפיון

export const SHIFTS = ['בוקר', 'ערב', 'לילה'] as const
export type Shift = (typeof SHIFTS)[number]

export const CALL_LOCATIONS = [
  'בבית', 'ברה"ר', 'קופ"ח', 'בית אבות', 'מוסד רפואי',
  'בית ספר', 'גן ילדים', 'מקום עבודה', 'אולם אירועים',
  'כביש/תאונה', 'מקום ציבורי', 'אחר',
] as const

export const CALL_TYPES = [
  'רפואה דחופה', 'טראומה', 'לידה', 'פסיכיאטרי', 'בין-מוסדי', 'אחר',
] as const

export const CALL_PRIORITIES = [
  { value: 'code1', label: 'קוד 1 — דחוף מיידי' },
  { value: 'code2', label: 'קוד 2 — דחוף' },
  { value: 'code3', label: 'קוד 3 — רגיל' },
  { value: 'code4', label: 'קוד 4 — חזרה' },
] as const

export const HEALTH_FUNDS = [
  'כללית', 'מכבי', 'מאוחדת', 'לאומית', 'צה"ל',
  'מוסד אשפוזי', 'ביטוח חו"ל', 'חברת ביטוח פרטית',
  'ללא קופת חולים', 'לא ידוע',
] as const

export const ID_TYPES = [
  { value: 'israeli_id', label: 'ת"ז ישראלית' },
  { value: 'passport', label: 'דרכון' },
  { value: 'green_id', label: 'ת"ז ירוק (פלסטיני)' },
  { value: 'residence_permit', label: 'תעודת שהייה' },
  { value: 'none', label: 'אין תעודה' },
] as const

export const PATIENT_SEX = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר' },
  { value: 'unknown', label: 'לא ידוע' },
] as const

export const PREFERRED_LANGUAGES = ['עברית', 'ערבית', 'אנגלית', 'רוסית', 'אמהרית', 'אחר'] as const

export const CONTACT_RELATIONS = [
  'בן/בת זוג', 'הורה', 'בן/בת', 'אח/אחות', 'ידיד', 'שכן', 'אפוטרופוס', 'אחר',
] as const

export const CHRONIC_CONDITIONS = [
  'סוכרת', 'יתר ל"ד', 'מחלת לב איסכמית', 'אי-ספיקת לב', 'הפרעת קצב',
  'שבץ', 'אפילפסיה', 'אסתמה', 'COPD', 'אי-ספיקת כליות', 'דיאליזה',
  'כבד', 'סרטן (פעיל)', 'הפרעת קרישה', 'הריון', 'פסיכיאטרי',
  'דמנציה', 'אחר', 'ללא מחלות רקע',
] as const

export const MED_ALLERGIES = [
  'פניצילין', 'אספירין', 'NSAIDs', 'ספרים', 'מורפיום', 'הרדמה', 'יוד', 'אחר',
] as const

export const FOOD_ALLERGIES = [
  'בוטנים', 'אגוזים', 'שומשום', 'חלב', 'ביצים', 'דגים', 'פירות ים', 'חיטה', 'אחר',
] as const

export const AVPU = [
  { value: 'alert', label: 'A — ערני' },
  { value: 'verbal', label: 'V — מגיב לדיבור' },
  { value: 'pain', label: 'P — מגיב לכאב' },
  { value: 'unresponsive', label: 'U — לא מגיב' },
] as const

export const GCS_EYE = [
  { value: 1, label: '1 — לא פותח' },
  { value: 2, label: '2 — לכאב' },
  { value: 3, label: '3 — לקול' },
  { value: 4, label: '4 — ספונטני' },
] as const

export const GCS_VERBAL = [
  { value: 1, label: '1 — אין' },
  { value: 2, label: '2 — קולות לא מובנים' },
  { value: 3, label: '3 — מילים לא קשורות' },
  { value: 4, label: '4 — מבולבל' },
  { value: 5, label: '5 — רגיל' },
] as const

export const GCS_MOTOR = [
  { value: 1, label: '1 — אין' },
  { value: 2, label: '2 — אקסטנסיה' },
  { value: 3, label: '3 — פלקסיה חריגה' },
  { value: 4, label: '4 — נסיגה מכאב' },
  { value: 5, label: '5 — ממקם כאב' },
  { value: 6, label: '6 — מציית לפקודה' },
] as const

export const PULSE_QUALITY = ['חזק', 'חלש', 'אי-סדיר', 'חוטי', 'לא נמוש'] as const

export const RESP_QUALITY = ['תקינה', 'שטחית', 'עמוקה', 'מאומצת', 'מגעת קולות'] as const

export const OXYGEN_DELIVERY = [
  'אוויר חדר', 'קנולה 2L', 'קנולה 4L', 'קנולה 6L',
  'מסיכה 8L', 'NRB 15L', 'BVM', 'אחר',
] as const

export const MED_ROUTES = ['IV', 'IM', 'PO', 'SL', 'SC', 'IN', 'PR', 'אינהלציה'] as const

export const EVACUATION_STATUS = [
  { value: 'transported_basic', label: 'פונה בניידת' },
  { value: 'transported_advanced', label: 'פונה בנט"ן' },
  { value: 'transported_by_mda', label: 'פונה ע"י מד"א' },
  { value: 'transported_by_uh', label: 'פונה ע"י איחוד הצלה' },
  { value: 'transported_private', label: 'פונה ע"י רכב פרטי' },
  { value: 'transferred_to_other_team', label: 'חבירה (העברה לצוות אחר)' },
  { value: 'refused_transport', label: 'סירב פינוי' },
  { value: 'refused_treatment', label: 'סירב טיפול' },
  { value: 'doa', label: 'הרוג בזירה (DOA)' },
] as const

export const EVACUATION_DESTINATIONS = [
  'בית חולים', 'טרם', 'מוסד רפואי', 'קופת חולים', 'הבית', 'אחר',
] as const

export const INJURY_MECHANISMS = [
  'תאונת דרכים', 'נפילה מגובה', 'חפץ חד', 'חפץ קהה', 'ירי',
  'פיצוץ', 'שריפה', 'טביעה', 'חשמל', 'חנק', 'אלימות', 'אחר',
] as const

export const ECG_RHYTHMS = [
  'סינוס', 'סינוס טכיקרדיה', 'סינוס ברדיקרדיה',
  'אסיסטולה', 'VF', 'VT', 'SVT', 'פרפור פרוזדורים',
  'PEA', 'חסם', 'אחר',
] as const

export const CHIEF_COMPLAINTS = [
  'כאב ראש', 'כאב חזה', 'קוצר נשימה', 'סחרחורת', 'בחילה',
  'חום', 'תאונה', 'נפילה', 'אובדן הכרה', 'כאב בטן',
  'חולשה', 'כאב גב', 'כאב רגל', 'כאב יד', 'פצע',
  'דימום', 'עווית', 'אלרגיה', 'הרעלה', 'כאב ראש חמור',
] as const

export const ASSOCIATED_SYMPTOMS = [
  'בחילה', 'הקאה', 'שלשול', 'זיעה', 'סחרחורת', 'חולשה',
  'עילפון', 'דפיקות לב', 'קוצר נשימה', 'שיעול', 'כאב בטן',
  'עוות פנים', 'חוסר תחושה', 'חולשת גפיים', 'דיבור משובש', 'אחר',
] as const

export const PAIN_QUALITY = [
  'דוקר', 'לוחץ', 'כבד', 'שורף', 'קהה', 'פועם', 'תחושתי', 'אחר',
] as const

export const COMMON_MEDICATIONS = [
  'אספירין', 'ניטרו', 'מורפיום', 'פנטנול', 'מידזולם', 'אדרנלין',
  'אטרופין', 'אמיודרון', 'נורדרנלין', 'גלוקגון', 'דקסטרוז 50%',
  'דיאזפאם', 'Atrovent', 'נלוקסון', 'סלבוטמול', 'Clopidogrel',
  'Ondansetron', 'אחר',
] as const

export const HOSPITALS = [
  'איכילוב (תל אביב)', 'שיבא (תל השומר)', 'וולפסון (חולון)', 'קפלן (רחובות)',
  'אסף הרופא (צריפין)', 'שערי צדק (ירושלים)', 'הדסה עין כרם', 'הדסה הר הצופים',
  'מאיר (כפר סבא)', 'בלינסון (פתח תקווה)', 'שניידר (פתח תקווה)',
  'לניאדו (נתניה)', 'לין (חיפה)', 'רמב"ם (חיפה)', 'כרמל (חיפה)',
  'זיו (צפת)', 'פוריה (טבריה)', 'סורוקה (באר שבע)', 'ברזילי (אשקלון)',
  'אחר',
] as const

export const HOSPITAL_DEPARTMENTS = [
  'חדר מיון', 'חדר הלם', 'טראומה', 'נוירו', 'קרדיו',
  'יולדות', 'פדיאטרי', 'פסיכיאטרי', 'אחר',
] as const

export const TRIAGE_COLORS = [
  { value: 'red', label: 'אדום — Immediate', color: '#DC2626' },
  { value: 'orange', label: 'כתום — Delayed', color: '#F97316' },
  { value: 'yellow', label: 'צהוב — Minor', color: '#EAB308' },
  { value: 'green', label: 'ירוק — Walking Wounded', color: '#10B981' },
  { value: 'black', label: 'שחור — Deceased/Expectant', color: '#111827' },
] as const

export const MEDICAL_INFO_SOURCES = [
  'המטופל', 'בן משפחה', 'מסמך רפואי', 'אחר', 'לא זמין',
] as const

export const VEHICLE_TYPES = [
  'פרטי', 'מסחרי', 'משאית', 'אוטובוס', 'טרקטור',
  'אופנוע', 'אופניים חשמליים', 'קורקינט', 'רגלי', 'רכב רכיבה', 'אחר',
] as const

export const MATERNAL_STATUS = [
  'הפלה', 'לידה פעילה', 'דימום', 'צירים', 'פוסט-פרטום', 'לא רלוונטי',
] as const
