'use client'

import { X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function StartGuide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#1F4E78]">פרוטוקול START</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          <p className="text-gray-600">
            START (Simple Triage And Rapid Treatment) — ט"ל מהיר לאירועי רב-נפגעים.
            כל נפגע מוערך תוך 30–60 שניות לפי 3 פרמטרים:
          </p>

          {/* Step 1 */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="font-bold text-green-800 mb-1">שלב 1 — נשימה</p>
            <ul className="text-green-700 space-y-1">
              <li>• לא נושם → פתח נתיב אוויר</li>
              <li className="mr-4">עדיין לא נושם → <span className="font-semibold text-gray-800 bg-gray-200 px-1.5 py-0.5 rounded">שחור</span></li>
              <li className="mr-4">נושם → <span className="font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">אדום</span></li>
              <li>• נושם &gt; 30/דקה → <span className="font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">אדום</span></li>
              <li>• נושם &lt; 30/דקה → המשך לשלב 2</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="font-bold text-red-800 mb-1">שלב 2 — זרימת דם (הספקה)</p>
            <ul className="text-red-700 space-y-1">
              <li>• דופק רדיאלי נעדר → <span className="font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">אדום</span></li>
              <li>• CRT &gt; 2 שניות → <span className="font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">אדום</span></li>
              <li>• דופק תקין / CRT ≤ 2 שניות → המשך לשלב 3</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="font-bold text-yellow-800 mb-1">שלב 3 — מצב הכרה</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• אינו מצייתלפקודות פשוטות → <span className="font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">אדום</span></li>
              <li>• מציית לפקודות → <span className="font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">צהוב</span></li>
            </ul>
          </div>

          {/* Walking wounded */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="font-bold text-gray-700 mb-1">הליכון (לפני הכל)</p>
            <p className="text-gray-600">
              בקש מכל הנפגעים ללכת לנקודה קבועה. מי שהולך ←{' '}
              <span className="font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">ירוק</span>
            </p>
          </div>

          {/* Color legend */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">סיכום צבעים:</p>
            {[
              { color: 'bg-red-500',    label: 'אדום',   desc: 'מיידי — טיפול חיוני מיידי' },
              { color: 'bg-yellow-400', label: 'צהוב',   desc: 'דחוי — יציב, טיפול ניתן לדחות' },
              { color: 'bg-green-500',  label: 'ירוק',   desc: 'קל — הולך, פציעות קלות' },
              { color: 'bg-gray-800',   label: 'שחור',   desc: 'נפטר / ללא סיכוי הצלה' },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded ${color} shrink-0`} />
                <span className="font-medium w-14 shrink-0">{label}</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 pt-0">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-md bg-[#1F4E78] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
