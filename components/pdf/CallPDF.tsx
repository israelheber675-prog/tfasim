import {
  Document, Page, View, Text, Image, StyleSheet, Font, Canvas,
} from '@react-pdf/renderer'

// ── Font registration ────────────────────────────────────────────────────────
// Server: absolute file path | Client (browser): absolute URL
const fontSrc =
  typeof window === 'undefined'
    ? (() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path') as typeof import('path')
        return path.join(process.cwd(), 'public', 'fonts', 'Heebo.ttf')
      })()
    : `${window.location.origin}/fonts/Heebo.ttf`

Font.register({
  family: 'Heebo',
  fonts: [
    { src: fontSrc, fontWeight: 400 },
    { src: fontSrc, fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback(w => [w]) // no hyphenation

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  navy:   '#1F4E78',
  blue:   '#2E75B6',
  light:  '#DDEBF7',
  white:  '#FFFFFF',
  gray1:  '#F3F4F6',
  gray2:  '#E5E7EB',
  gray3:  '#9CA3AF',
  text:   '#111827',
  red:    '#DC2626',
  amber:  '#D97706',
  green:  '#059669',
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    fontSize: 9,
    color: C.text,
    direction: 'rtl',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  // Header
  header: {
    backgroundColor: C.navy,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: C.white, fontSize: 16, fontWeight: 700 },
  headerSub:   { color: C.light, fontSize: 8, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerLeft:  { alignItems: 'flex-start' },

  // Section
  sectionBox: {
    borderRadius: 4,
    border: `1pt solid ${C.gray2}`,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    backgroundColor: C.light,
    color: C.navy,
    fontSize: 9,
    fontWeight: 700,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'right',
  },
  sectionBody: {
    padding: 8,
  },

  // Grid rows
  row: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  field: {
    flexDirection: 'row-reverse',
    gap: 3,
    minWidth: 100,
    flex: 1,
  },
  fieldLabel: { color: C.gray3, fontSize: 7.5 },
  fieldValue: { fontWeight: 700, fontSize: 8.5 },

  // Table
  table: { width: '100%', borderRadius: 3, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row-reverse',
    backgroundColor: C.navy,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomColor: C.gray2,
    borderBottomWidth: 1,
  },
  tableRowAlt: {
    backgroundColor: C.gray1,
  },
  th: {
    color: C.white,
    fontSize: 7.5,
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 5,
    textAlign: 'right',
    flex: 1,
  },
  td: {
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 5,
    textAlign: 'right',
    flex: 1,
  },

  // Triage badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    fontWeight: 700,
    color: C.white,
    alignSelf: 'flex-start',
  },

  // Signature
  sigBox: {
    border: `1pt dashed ${C.gray2}`,
    borderRadius: 4,
    height: 60,
    width: 160,
    overflow: 'hidden',
  },
  sigLabel: { fontSize: 7, color: C.gray3, marginTop: 2, textAlign: 'right' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24,
    borderTopColor: C.gray2,
    borderTopWidth: 1,
    paddingTop: 4,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7, color: C.gray3 },
  pageNum: { fontSize: 7, color: C.gray3 },
})

// ── Helpers ──────────────────────────────────────────────────────────────────
const get = (d: Record<string, unknown>, k: string): string =>
  (d[k] as string | undefined) ?? ''

const fmtDate = (v: string) => {
  if (!v) return ''
  try { return new Date(v).toLocaleDateString('he-IL') } catch { return v }
}

function Field({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  if (!value) return null
  return (
    <View style={[s.field, wide ? { minWidth: 200 } : {}]}>
      <Text style={s.fieldLabel}>{label}:</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  )
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionBox}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionBody}>{children}</View>
    </View>
  )
}

// Vital signs bar chart drawn on canvas
function VitalChart({ vitals }: { vitals: Array<Record<string, unknown>> }) {
  if (!vitals || vitals.length < 2) return null
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ fontSize: 7.5, color: C.navy, fontWeight: 700, marginBottom: 3, textAlign: 'right' }}>
        מגמת סימנים חיוניים
      </Text>
      <Canvas
        style={{ height: 60, width: '100%' }}
        paint={(painter, availableWidth): null => {
          const w = availableWidth
          const h = 60
          const padX = 10
          const padY = 8
          const chartW = w - padX * 2
          const chartH = h - padY * 2
          const n = vitals.length

          // Draw grid lines
          painter.strokeColor('#E5E7EB').lineWidth(0.5)
          for (let i = 0; i <= 4; i++) {
            const y = padY + (chartH / 4) * i
            painter.moveTo(padX, y).lineTo(w - padX, y).stroke()
          }

          // Helper to draw a line series
          function drawSeries(
            key: string,
            color: string,
            minVal: number,
            maxVal: number
          ) {
            const pts = vitals
              .map((v, i) => {
                const val = Number(v[key])
                if (isNaN(val)) return null
                const x = padX + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW)
                const y = padY + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
                return { x, y }
              })
              .filter(Boolean) as { x: number; y: number }[]

            if (pts.length < 1) return
            painter.strokeColor(color).lineWidth(1.5)
            pts.forEach((pt, i) => {
              if (i === 0) painter.moveTo(pt.x, pt.y)
              else painter.lineTo(pt.x, pt.y)
            })
            painter.stroke()
            // Dots
            pts.forEach(pt => {
              painter.circle(pt.x, pt.y, 2).fillColor(color).fill()
            })
          }

          drawSeries('pulseRate',      '#DC2626', 40,  180)
          drawSeries('spo2',           '#2563EB', 70,  100)
          drawSeries('respiratoryRate','#059669',  8,   40)

          // Legend
          const legends = [
            { color: '#DC2626', label: 'דופק' },
            { color: '#2563EB', label: 'SpO₂' },
            { color: '#059669', label: 'נשימה' },
          ]
          legends.forEach((l, i) => {
            const lx = w - 14 - i * 45
            painter.rect(lx - 10, h - 7, 8, 4).fillColor(l.color).fill()
            painter.fillColor('#9CA3AF').fontSize(5).text(l.label, lx - 10 - l.label.length * 3, h - 7)
          })
          return null
        }}
      />
    </View>
  )
}

// ── Main Document ─────────────────────────────────────────────────────────────
interface Props {
  callId: string
  data: Record<string, unknown>
}

export function CallPDFDocument({ callId, data: d }: Props) {
  const vitals = (d['vitals'] as Array<Record<string, unknown>> | undefined) ?? []
  const meds   = (d['medications_given'] as Array<Record<string, unknown>> | undefined) ?? []
  const txs    = (d['treatments'] as Array<Record<string, unknown>> | undefined) ?? []

  const patientName = [get(d,'patientFirstName'), get(d,'patientLastName')].filter(Boolean).join(' ') || 'לא ידוע'
  const formNum = get(d,'formNumber') || callId.slice(0, 8).toUpperCase()
  const callDate = fmtDate(get(d,'callDate')) || new Date().toLocaleDateString('he-IL')
  const nowStr = new Date().toLocaleString('he-IL')

  // Triage color
  const triageColors: Record<string, string> = {
    red: '#DC2626', orange: '#EA580C', yellow: '#CA8A04',
    green: '#16A34A', black: '#111827', white: '#6B7280',
  }
  const triageColor = triageColors[get(d,'triageColor')] ?? C.navy
  const triageLabels: Record<string, string> = {
    red: 'אדום — דחוף מאוד', orange: 'כתום — דחוף', yellow: 'צהוב — בינוני',
    green: 'ירוק — קל', black: 'שחור — נפטר', white: 'לבן — נדחה',
  }
  const triageLabel = triageLabels[get(d,'triageColor')] ?? ''

  return (
    <Document
      title={`PCR — ${patientName} — ${callDate}`}
      author="מערכת PCR אמבולנס"
      language="he"
    >
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>טופס טיפול בחולה — PCR</Text>
            <Text style={s.headerSub}>{get(d,'stationName') || 'תחנת אמבולנס'}</Text>
          </View>
          <View style={s.headerLeft}>
            <Text style={{ color: C.light, fontSize: 11, fontWeight: 700 }}>#{formNum}</Text>
            <Text style={{ color: C.light, fontSize: 7.5 }}>{callDate}</Text>
            {triageLabel ? (
              <View style={[s.badge, { backgroundColor: triageColor, marginTop: 4 }]}>
                <Text>{triageLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── 1. EVENT DETAILS ── */}
        <SectionBox title="פרטי האירוע">
          <View style={s.row}>
            <Field label="תאריך"        value={callDate} />
            <Field label="משמרת"         value={get(d,'shift')} />
            <Field label="סוג קריאה"     value={get(d,'callType')} />
            <Field label="דחיפות"        value={get(d,'callPriority')} />
            <Field label="מס׳ אירוע"     value={get(d,'incidentNumber')} />
          </View>
          <View style={s.row}>
            <Field label="שעת קבלה"      value={get(d,'callReceivedTime')} />
            <Field label="הגעה לזירה"    value={get(d,'arrivalTime')} />
            <Field label="מגע מטופל"     value={get(d,'patientContactTime')} />
            <Field label="עזיבת זירה"    value={get(d,'sceneTime')} />
            <Field label="הגעה לח״ב"     value={get(d,'hospitalArrivalTime')} />
          </View>
          <View style={s.row}>
            <Field label="כתובת" wide
              value={[get(d,'eventStreet'), get(d,'eventHouseNumber'), get(d,'eventCity')].filter(Boolean).join(' ')} />
            <Field label="אמבולנס"       value={get(d,'ambulanceNumber')} />
          </View>
          <View style={s.row}>
            <Field label="נהג"           value={get(d,'driver')} />
            <Field label="פרמדיק"        value={get(d,'paramedic')} />
            <Field label="חובש 1"        value={get(d,'emt1')} />
            <Field label="חובש 2"        value={get(d,'emt2')} />
          </View>
        </SectionBox>

        {/* ── 2. PATIENT ── */}
        <SectionBox title="פרטי המטופל">
          <View style={s.row}>
            <Field label="שם מלא" wide    value={patientName} />
            <Field label="ת.ז. / דרכון"  value={get(d,'patientId')} />
            <Field label="תאריך לידה"    value={fmtDate(get(d,'patientDob'))} />
            <Field label="גיל"           value={get(d,'patientAge') ? `${get(d,'patientAge')} שנים` : ''} />
            <Field label="מין"           value={get(d,'patientSex')} />
          </View>
          <View style={s.row}>
            <Field label="כתובת" wide
              value={[get(d,'patientStreet'), get(d,'patientHouseNumber'), get(d,'patientCity')].filter(Boolean).join(' ')} />
            <Field label="טלפון"         value={get(d,'patientPhone')} />
            <Field label="קופת חולים"    value={get(d,'healthFund')} />
          </View>
          <View style={s.row}>
            <Field label="איש קשר"       value={get(d,'contactName')} />
            <Field label="קרבה"          value={get(d,'contactRelation')} />
            <Field label="טלפון איש קשר" value={get(d,'contactPhone')} />
          </View>
        </SectionBox>

        {/* ── 3. COMPLAINT ── */}
        {Boolean(get(d,'caseNarrative') || get(d,'chiefComplaintFreeText') || d['chiefComplaint']) && (
          <SectionBox title="תלונה עיקרית">
            {Boolean(d['chiefComplaint']) && (
              <View style={s.row}>
                <Field label="תלונה" wide
                  value={Array.isArray(d['chiefComplaint'])
                    ? (d['chiefComplaint'] as string[]).join(' / ')
                    : get(d,'chiefComplaint')} />
              </View>
            )}
            {get(d,'caseNarrative') && (
              <View style={{ marginTop: 3 }}>
                <Text style={s.fieldLabel}>נרטיב:</Text>
                <Text style={{ fontSize: 8.5, marginTop: 2, lineHeight: 1.5 }}>{get(d,'caseNarrative')}</Text>
              </View>
            )}
            <View style={[s.row, { marginTop: 4 }]}>
              <Field label="עצמת כאב"    value={get(d,'painScore') ? `${get(d,'painScore')}/10` : ''} />
              <Field label="מנגנון"      value={get(d,'traumaMechanism')} />
            </View>
          </SectionBox>
        )}

        {/* ── 4. MEDICAL HISTORY ── */}
        {get(d,'hasMedicalHistory') === 'כן' && (
          <SectionBox title="רקע רפואי ואלרגיות">
            <View style={s.row}>
              <Field label="מחלות כרוניות" wide
                value={Array.isArray(d['chronicConditions'])
                  ? (d['chronicConditions'] as string[]).join(', ')
                  : get(d,'chronicConditions')} />
              <Field label="תרופות קבועות" value={get(d,'currentMedications')} />
            </View>
            {get(d,'hasAllergies') === 'כן' && (
              <View style={s.row}>
                <Field label="אלרגיות" wide
                  value={[
                    ...(Array.isArray(d['allergies']) ? (d['allergies'] as string[]) : []),
                    ...(Array.isArray(d['foodAllergies']) ? (d['foodAllergies'] as string[]) : []),
                  ].join(', ') || get(d,'allergyDetail')} />
              </View>
            )}
          </SectionBox>
        )}

        {/* ── 5. VITAL SIGNS ── */}
        {vitals.length > 0 && (
          <SectionBox title="סימנים חיוניים">
            <View style={s.table}>
              <View style={s.tableHead}>
                {['שעה','דופק','ל״ד','נשימה','SpO₂','גלוקוז','כאב','AVPU'].map(h => (
                  <Text key={h} style={[s.th, h === 'שעה' ? { flex: 0.8 } : {}]}>{h}</Text>
                ))}
              </View>
              {vitals.map((v, i) => (
                <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={[s.td, { flex: 0.8 }]}>{String(v.time ?? '')}</Text>
                  <Text style={s.td}>{String(v.pulseRate ?? '—')}</Text>
                  <Text style={s.td}>{v.bpSystolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—'}</Text>
                  <Text style={s.td}>{String(v.respiratoryRate ?? '—')}</Text>
                  <Text style={s.td}>{v.spo2 ? `${v.spo2}%` : '—'}</Text>
                  <Text style={s.td}>{String(v.bloodGlucose ?? '—')}</Text>
                  <Text style={s.td}>{v.painScore != null ? `${v.painScore}/10` : '—'}</Text>
                  <Text style={s.td}>{String(v.avpu ?? '—')}</Text>
                </View>
              ))}
            </View>
            <VitalChart vitals={vitals} />
            <View style={[s.row, { marginTop: 6 }]}>
              <Field label="GCS עיניים"  value={get(d,'gcsEye')} />
              <Field label="GCS דיבור"   value={get(d,'gcsVerbal')} />
              <Field label="GCS תנועה"   value={get(d,'gcsMotor')} />
              <Field label="אישונים"     value={get(d,'pupils')} />
            </View>
          </SectionBox>
        )}

        {/* ── 6. TREATMENT — מוצג רק אם יש נתונים ── */}
        {(meds.length > 0 || txs.length > 0 || get(d,'o2Delivery')) && (
          <SectionBox title="טיפול ותרופות">

            {/* חמצן — רק אם נבחר */}
            {get(d,'o2Delivery') && get(d,'o2Delivery') !== 'לא ניתן חמצן' && (
              <View style={[s.row, { marginBottom: 6 }]}>
                <Field label="חמצן"       value={get(d,'o2Delivery')} />
                <Field label="ספיקה"      value={get(d,'o2FlowRate') ? `${get(d,'o2FlowRate')} ל/דקה` : ''} />
              </View>
            )}

            {/* תרופות — רק אם ניתנו */}
            {meds.length > 0 && (
              <>
                <Text style={{ fontSize: 7.5, color: C.navy, fontWeight: 700, marginBottom: 3, textAlign: 'right' }}>
                  תרופות שניתנו
                </Text>
                <View style={s.table}>
                  <View style={s.tableHead}>
                    {['שעה','שם תרופה','מינון','דרך מתן','תגובה'].map(h => (
                      <Text key={h} style={s.th}>{h}</Text>
                    ))}
                  </View>
                  {meds.map((m, i) => (
                    <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                      <Text style={[s.td, { flex: 0.7 }]}>{String(m.time ?? '')}</Text>
                      <Text style={[s.td, { flex: 1.5 }]}>{String(m.name ?? '')}</Text>
                      <Text style={s.td}>{String(m.dose ?? '—')}</Text>
                      <Text style={[s.td, { flex: 0.8 }]}>{String(m.route ?? '—')}</Text>
                      <Text style={[s.td, { flex: 1.5 }]}>{String(m.response ?? '—')}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* פרוצדורות — רק אם בוצעו */}
            {txs.length > 0 && (
              <>
                <Text style={{ fontSize: 7.5, color: C.navy, fontWeight: 700, marginTop: meds.length > 0 ? 6 : 0, marginBottom: 3, textAlign: 'right' }}>
                  פרוצדורות שבוצעו
                </Text>
                <View style={s.table}>
                  <View style={s.tableHead}>
                    {['שעה','פרוצדורה','הערה'].map(h => <Text key={h} style={s.th}>{h}</Text>)}
                  </View>
                  {txs.map((t, i) => (
                    <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                      <Text style={[s.td, { flex: 0.7 }]}>{String(t.time ?? '')}</Text>
                      <Text style={[s.td, { flex: 2 }]}>{String(t.procedure ?? '')}</Text>
                      <Text style={[s.td, { flex: 1.5 }]}>{String(t.response ?? '—')}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </SectionBox>
        )}

        {/* ── 7. DISPOSITION ── */}
        <SectionBox title="פינוי וסיום קריאה">
          <View style={s.row}>
            <Field label="סטטוס פינוי"   value={get(d,'evacuationStatus')} />
            <Field label="יעד"            value={get(d,'evacuationDestination')} />
            <Field label="בית חולים"      value={get(d,'hospital')} />
            <Field label="מחלקה"          value={get(d,'hospitalDepartment')} />
          </View>
          <View style={s.row}>
            <Field label="מקבל המטופל"   value={get(d,'handoffPersonName')} />
            <Field label="תפקיד"          value={get(d,'handoffPersonRole')} />
            <Field label="שעת מסירה"      value={get(d,'handoffTime')} />
          </View>
          {get(d,'refusalReason') && (
            <View style={{ marginTop: 4, backgroundColor: '#FEF3C7', borderRadius: 3, padding: 5 }}>
              <Text style={{ fontSize: 7.5, color: '#92400E', fontWeight: 700 }}>סיבת סירוב:</Text>
              <Text style={{ fontSize: 8, marginTop: 2 }}>{get(d,'refusalReason')}</Text>
            </View>
          )}
          {get(d,'handoffNote') && (
            <View style={{ marginTop: 4 }}>
              <Text style={s.fieldLabel}>SBAR / דיווח מסירה:</Text>
              <Text style={{ fontSize: 8, marginTop: 2, lineHeight: 1.5 }}>{get(d,'handoffNote')}</Text>
            </View>
          )}
          {get(d,'notes') && (
            <View style={{ marginTop: 4 }}>
              <Text style={s.fieldLabel}>הערות:</Text>
              <Text style={{ fontSize: 8, marginTop: 2, lineHeight: 1.5 }}>{get(d,'notes')}</Text>
            </View>
          )}
          <View style={[s.row, { marginTop: 4 }]}>
            <Field label="שעת סגירת טופס" value={get(d,'formClosedTime')} />
          </View>
        </SectionBox>

        {/* ── 8. SIGNATURES ── */}
        <SectionBox title="הסכמות וחתימות">
          <View style={{ flexDirection: 'row-reverse', gap: 12, flexWrap: 'wrap' }}>
            {(
            [
              { label: 'הסכמה לטיפול — חתימת מטופל', key: 'consentSignature' },
              { label: 'חתימת אחראי קריאה', key: 'crewLeaderSignature' },
              { label: 'חתימת עד לסירוב', key: 'witnessSignature' },
              { label: 'חתימת אפוטרופוס', key: 'guardianSignature' },
            ] as { label: string; key: string }[]
          ).map(({ label, key }) => {
            const sig = get(d, key)
            if (!sig) return null
            return (
              <View key={key} style={{ alignItems: 'flex-end' }}>
                <Image src={sig} style={s.sigBox} />
                <Text style={s.sigLabel}>{label}</Text>
              </View>
            )
          })}
          </View>
          {get(d,'formClosedTime') && (
            <Text style={{ fontSize: 7, color: C.gray3, marginTop: 6, textAlign: 'right' }}>
              הטופס נסגר בשעה {get(d,'formClosedTime')} • הופק: {nowStr}
            </Text>
          )}
        </SectionBox>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            PCR #{formNum} | {patientName} | {callDate}
          </Text>
          <Text
            style={s.pageNum}
            render={({ pageNumber, totalPages }) => `עמוד ${pageNumber} מתוך ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
