/** User-facing Hebrew copy for the smart-home client UI. */

export const statusLabels = {
  AVAILABLE: 'זמין',
  CONSUMED: 'נגמר',
  ACTIVE: 'פעיל',
  READY: 'מוכן',
  ON: 'פועל',
  OFF: 'כבוי',
};

export const commandLabels = {
  OPEN_DOOR: 'פתח דלת',
  CLOSE_DOOR: 'סגור דלת',
  CHECK_CONTENTS: 'בדוק תכולה',
  SET_TEMPERATURE: 'כוון טמפרטורה',
  START_COOLING: 'הפעל קירור',
  PREHEAT: 'חימום מוקדם',
  TURN_ON: 'הפעל',
  TURN_OFF: 'כבה',
  START_BREW: 'הכן קפה',
  START_WASH: 'הפעל שטיפה',
  ECO_MODE: 'מצב חסכוני',
};

export const deviceDescriptions = {
  'cold-storage': 'מקרר חכם עם תכולה, פתיחת דלת ובקרת טמפרטורה',
  cooking: 'תנור חכם להפעלה וחימום מוקדם',
  cleaning: 'מדיח כלים חכם עם מצב רגיל וחסכוני',
  'drink-maker': 'מכונת קפה חכמה עם תכולת קפסולות',
  storage: 'ארון מזווה חכם לניהול מוצרים יבשים',
};

export const ui = {
  appTitle: 'הבית החכם',
  pageTitle: 'המקרר החכם',
  defaultGuestName: 'משתמש',
  defaultDeviceDescription: 'מכשיר חכם שמחובר למערכת',
  unknownStatus: 'לא ידוע',

  nav: {
    myDevices: 'המכשירים שלי',
    myProfile: 'הפרופיל שלי',
    logout: 'יציאה',
    greeting: (name) => `שלום, ${name}`,
  },

  login: {
    subtitle: 'צפו במכשירים, הפעילו פקודות ונהלו תכולה',
    loginTab: 'התחברות',
    registerTab: 'הרשמה',
    usernameLabel: 'שם',
    usernamePlaceholder: 'השם שלך',
    emailLabel: 'אימייל',
    passwordLabel: 'סיסמה',
    passwordPlaceholder: 'סיסמה חזקה',
    submitLogin: 'כניסה למערכת',
    submitRegister: 'יצירת חשבון',
    demoHintTitle: 'לניסוי עם נתוני הדמו:',
    demoEmailLabel: 'אימייל',
    demoPasswordLabel: 'סיסמה',
    usernameRequired: 'יש להזין שם משתמש',
    actionFailed: 'הפעולה נכשלה',
  },

  profile: {
    title: 'הפרופיל שלי',
    email: 'אימייל',
    role: 'תפקיד',
    displayNameLabel: 'שם תצוגה',
    currentPasswordLabel: 'סיסמה נוכחית',
    newPasswordLabel: 'סיסמה חדשה (אופציונלי)',
    save: 'שמור שינויים',
    disconnect: 'התנתק',
    passwordRequired: 'יש להזין סיסמה נוכחית',
    updateSuccess: 'הפרופיל עודכן בהצלחה',
    updateFailed: 'עדכון נכשל',
  },

  home: {
    title: 'הבית החכם שלי',
    loading: 'טוען...',
    loadingDevices: 'טוען מכשירים...',
    refresh: 'רענון',
    devicesSection: 'מכשירים ופעולות',
    noDevices: 'לא נמצאו מכשירים במערכת. ודא שה-backend רץ עם נתוני דמו.',
    itemCount: (n) => `${n} פריטים`,
    commandsForDevice: (name) => `פקודות עבור ${name}`,
    deviceDetailsLink: 'פרטי מכשיר ותכולה',
    statsSummary: (activeDevices, availableProducts) =>
      `${activeDevices} מכשירים פעילים, ${availableProducts} פריטים זמינים בתכולה`,
    footnote: 'משתמש רגיל יכול להפעיל פקודות ולצפות בתכולה. ניהול פריטים זמין למפעילים ומנהלים.',
    commandSuccess: (label, device) => `הפקודה "${label}" הופעלה על ${device}`,
    loadFailed: 'לא הצלחנו לטעון את המכשירים',
    commandFailed: 'הפעלת הפקודה נכשלה',
  },

  device: {
    loading: 'טוען מכשיר...',
    notFound: 'המכשיר לא נמצא',
    backToDevices: 'חזרה למכשירים',
    locatedIn: 'נמצא בתוך',
    commandsTitle: 'פקודות זמינות',
    contentsTitle: 'תכולה',
    emptyContents: 'אין כרגע פריטים בתוך המכשיר.',
    markConsumed: 'סמן כנגמר',
    markAvailable: 'החזר לזמין',
    addItemLabel: 'הוספת פריט לתכולה',
    addItemPlaceholder: 'לדוגמה: חלב, קפסולות קפה, ירקות',
    adding: 'מוסיף...',
    addItem: 'הוסף פריט',
    commandSuccess: (label) => `הפקודה "${label}" הופעלה בהצלחה`,
    itemUpdated: (name) => `הפריט "${name}" עודכן`,
    itemAdded: (name) => `"${name}" נוסף לתכולה`,
    loadFailed: 'לא הצלחנו לטעון את המכשיר',
    commandFailed: 'הפעלת הפקודה נכשלה',
    updateItemFailed: 'עדכון הפריט נכשל',
    addItemFailed: 'הוספת הפריט נכשלה',
  },

  product: {
    loading: 'טוען מוצר...',
    notFound: 'המוצר לא נמצא',
    backToDevices: 'חזרה למכשירים',
    locatedIn: 'נמצא ב',
    markConsumed: '✓ סימנתי שאכלתי / נגמר',
    markAvailable: '↩ החזר לזמין',
    markedConsumed: 'המוצר סומן כנגמר',
    markedAvailable: 'המוצר סומן כזמין',
    loadFailed: 'לא הצלחנו לטעון את המוצר',
    updateFailed: 'עדכון הסטטוס נכשל',
  },

  commandButton: {
    running: 'מפעיל...',
  },
};
