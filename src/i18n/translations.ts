import type { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
  englishName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', nativeLabel: 'English', englishName: 'English' },
  { code: 'hi', nativeLabel: 'हिन्दी', englishName: 'Hindi' },
  { code: 'mr', nativeLabel: 'मराठी', englishName: 'Marathi' },
  { code: 'ta', nativeLabel: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', nativeLabel: 'తెలుగు', englishName: 'Telugu' },
  { code: 'bho', nativeLabel: 'भोजपुरी', englishName: 'Bhojpuri' },
];

export interface TranslationStrings {
  appName: string;
  navMap: string;
  navSettings: string;
  navChat: string;
  // Map workspace
  liveTractorMap: string;
  farmSelectionHint: string;
  dragBoxButton: string;
  drawingActiveButton: string;
  useMyLocation: string;
  locatingGps: string;
  clearFarmBox: string;
  startTractorRun: string;
  pauseTractorRun: string;
  resetPath: string;
  coveredPathLegend: string;
  suggestedPathLegend: string;
  tractorPositionLabel: string;
  fieldImageTitle: string;
  uploadFieldPhoto: string;
  farmAreaLabel: string;
  coverageLabel: string;
  remainingAreaLabel: string;
  estTimeRemaining: string;
  pathStrategyLabel: string;
  strategySerpentine: string;
  strategyContour: string;
  strategySpiral: string;
  farmPresetLabel: string;
  mapViewLabel: string;
  // Telemetry quick cards
  dosageShort: string;
  tankShort: string;
  batteryShort: string;
  injectedShort: string;
  // Robot Settings
  settingsTitle: string;
  settingsSubtitle: string;
  dosageSettingTitle: string;
  dosageSettingDesc: string;
  dosageHighWarning: string;
  tankSettingTitle: string;
  tankCapacityLabel: string;
  tankRemainingLabel: string;
  refillTankButton: string;
  batterySettingTitle: string;
  batteryVoltageLabel: string;
  batteryRuntimeLabel: string;
  rechargeBatteryButton: string;
  powerModeLabel: string;
  powerEco: string;
  powerStandard: string;
  powerTurbo: string;
  infectedCountTitle: string;
  broadleafLabel: string;
  grassyLabel: string;
  sedgeLabel: string;
  resetCounterButton: string;
  boomCalibrationTitle: string;
  boomWidthLabel: string;
  tractorSpeedLabel: string;
  visionSensitivityLabel: string;
  sprayerMasterLabel: string;
  sprayerActiveState: string;
  sprayerStandbyState: string;
  cropRowGuardLabel: string;
  brandLogoSectionTitle: string;
  brandLogoDesc: string;
  uploadLogoButton: string;
  restoreLogoButton: string;
  // AI Chatbot
  chatTitle: string;
  chatSubtitle: string;
  chatModelFast: string;
  chatModelDetailed: string;
  chatPlaceholder: string;
  chatSend: string;
  chatClear: string;
  chatWelcome: string;
  quickPrompts: string[];
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    appName: 'Agri Sathi',
    navMap: 'Live Field Map',
    navSettings: 'Robot Settings',
    navChat: 'AI Agronomist',
    liveTractorMap: 'Live Tractor & Weed-Bot Field Map',
    farmSelectionHint:
      'Click "Select Farm Box" then click and drag across your field on the map to mark boundaries. Drag corner handles anytime to adjust.',
    dragBoxButton: 'Select Farm Box',
    drawingActiveButton: 'Drag Box on Map...',
    useMyLocation: 'My Live GPS',
    locatingGps: 'Locating...',
    clearFarmBox: 'Clear Box',
    startTractorRun: 'Start Tractor Pass',
    pauseTractorRun: 'Pause Pass',
    resetPath: 'Reset Path',
    coveredPathLegend: 'Covered Swath Path',
    suggestedPathLegend: 'Suggested Alternative Path (100% Coverage)',
    tractorPositionLabel: 'Live Tractor + ERADIX Rig',
    fieldImageTitle: 'Farmer Field Visual',
    uploadFieldPhoto: 'Update Field Photo',
    farmAreaLabel: 'Selected Farm',
    coverageLabel: 'Area Covered',
    remainingAreaLabel: 'Remaining Uncovered',
    estTimeRemaining: 'Est. Time Left',
    pathStrategyLabel: 'Alternative Path Pattern',
    strategySerpentine: 'North-South Rows',
    strategyContour: 'East-West Contour',
    strategySpiral: 'Perimeter Spiral',
    farmPresetLabel: 'Region / Plot',
    mapViewLabel: 'Map Layer',
    dosageShort: 'Dosage / Plant',
    tankShort: 'Herbicide Tank',
    batteryShort: 'Battery Life',
    injectedShort: 'Infected Plants Injected',
    settingsTitle: 'ERADIX Weed-Bot Controls & Diagnostics',
    settingsSubtitle:
      'Calibrate per-plant herbicide micro-injection, tank reserves, battery power mode, and boom geometry.',
    dosageSettingTitle: 'Weedicide Dosage per Plant',
    dosageSettingDesc:
      'Precision micro-dose injected onto each detected weed crown.',
    dosageHighWarning:
      'High dosage (>16 mL/plant) increases tank consumption and crop splash risk.',
    tankSettingTitle: 'Herbicide Tank Reserve',
    tankCapacityLabel: 'Tank Capacity',
    tankRemainingLabel: 'Remaining Liquid',
    refillTankButton: 'Refill Tank (100%)',
    batterySettingTitle: 'Battery Pack & Power',
    batteryVoltageLabel: 'Pack Voltage',
    batteryRuntimeLabel: 'Est. Runtime',
    rechargeBatteryButton: 'Swap Full Battery',
    powerModeLabel: 'Pump Power Mode',
    powerEco: 'Eco',
    powerStandard: 'Standard',
    powerTurbo: 'Turbo',
    infectedCountTitle: 'Infected Plants Injected',
    broadleafLabel: 'Broadleaf Weeds',
    grassyLabel: 'Grassy Weeds',
    sedgeLabel: 'Sedges',
    resetCounterButton: 'Reset Field Count',
    boomCalibrationTitle: 'Boom & Optical Vision Calibration',
    boomWidthLabel: 'Sprayer Boom Width',
    tractorSpeedLabel: 'Target Tractor Speed',
    visionSensitivityLabel: 'Weed Vision Confidence',
    sprayerMasterLabel: 'Master Injection Valve',
    sprayerActiveState: 'Armed & Injecting',
    sprayerStandbyState: 'Standby (Safe)',
    cropRowGuardLabel: 'Crop-Row Shielding',
    brandLogoSectionTitle: 'ERADIX Company Logo',
    brandLogoDesc:
      'Upload a custom cooperative or distributor logo to display beside Agri Sathi.',
    uploadLogoButton: 'Upload Logo',
    restoreLogoButton: 'Restore ERADIX Logo',
    chatTitle: 'Agri Sathi AI Assistant',
    chatSubtitle:
      'Ask about weed identification, herbicide dosage, battery savings, or missed field paths.',
    chatModelFast: 'Fast Reply',
    chatModelDetailed: 'Detailed Agronomy',
    chatPlaceholder: 'Ask Agri Sathi in your language...',
    chatSend: 'Send',
    chatClear: 'New Chat',
    chatWelcome:
      'Namaste! I am Agri Sathi, your ERADIX precision weed-killing companion. Ask me about herbicide dosage per plant, tractor speed, weed species, or covering every corner of your farm.',
    quickPrompts: [
      'What is the safe dosage per plant for broadleaf weeds?',
      'How do I cover missed field corners efficiently?',
      'How many acres can I spray with my current tank & battery?',
      'What tractor speed gives best optical weed detection?',
    ],
  },
  hi: {
    appName: 'एग्री साथी',
    navMap: 'लाइव खेत मानचित्र',
    navSettings: 'रोबोट सेटिंग्स',
    navChat: 'एआई कृषि मित्र',
    liveTractorMap: 'लाइव ट्रैक्टर और वीड-बॉट खेत मानचित्र',
    farmSelectionHint:
      '"खेत बॉक्स चुनें" दबाएं और मानचित्र पर अपने खेत के ऊपर बॉक्स खींचें। कोनों को पकड़कर आकार बदलें।',
    dragBoxButton: 'खेत बॉक्स चुनें',
    drawingActiveButton: 'मानचित्र पर बॉक्स खींचें...',
    useMyLocation: 'मेरा लाइव GPS',
    locatingGps: 'खोज रहे हैं...',
    clearFarmBox: 'बॉक्स हटाएं',
    startTractorRun: 'ट्रैक्टर पास शुरू करें',
    pauseTractorRun: 'रोकें',
    resetPath: 'पथ रीसेट करें',
    coveredPathLegend: 'कवर किया गया मार्ग',
    suggestedPathLegend: 'सुझाया गया वैकल्पिक मार्ग (100% कवरेज)',
    tractorPositionLabel: 'लाइव ट्रैक्टर + ERADIX रोबोट',
    fieldImageTitle: 'किसान के खेत की तस्वीर',
    uploadFieldPhoto: 'खेत की फोटो बदलें',
    farmAreaLabel: 'चुना गया खेत',
    coverageLabel: 'कवर किया क्षेत्र',
    remainingAreaLabel: 'बाकी क्षेत्र',
    estTimeRemaining: 'अनुमानित समय',
    pathStrategyLabel: 'वैकल्पिक मार्ग पैटर्न',
    strategySerpentine: 'उत्तर-दक्षिण पंक्तियाँ',
    strategyContour: 'पूर्व-पश्चिम पंक्तियाँ',
    strategySpiral: 'बाहरी घेरा मार्ग',
    farmPresetLabel: 'क्षेत्र / प्लॉट',
    mapViewLabel: 'मैप दृश्य',
    dosageShort: 'दवा मात्रा / पौधा',
    tankShort: 'दवा टैंक',
    batteryShort: 'बैटरी जीवन',
    injectedShort: 'संक्रमित खरपतवार इंजेक्ट',
    settingsTitle: 'ERADIX वीड-बॉट नियंत्रण और डायग्नोस्टिक्स',
    settingsSubtitle:
      'प्रति पौधा खरपतवारनाशी खुराक, टैंक स्तर, बैटरी पावर मोड और बूम चौड़ाई सेट करें।',
    dosageSettingTitle: 'प्रति पौधा खरपतवारनाशी खुराक',
    dosageSettingDesc: 'प्रत्येक पहचाने गए खरपतवार पर सटीक माइक्रो-स्प्रे मात्रा।',
    dosageHighWarning:
      'अधिक खुराक (>16 mL/पौधा) से टैंक जल्दी खाली होगा और फसल को नुकसान हो सकता है।',
    tankSettingTitle: 'खरपतवारनाशी टैंक भंडार',
    tankCapacityLabel: 'टैंक क्षमता',
    tankRemainingLabel: 'बची हुई दवा',
    refillTankButton: 'टैंक भरें (100%)',
    batterySettingTitle: 'बैटरी पैक और पावर',
    batteryVoltageLabel: 'वोल्टेज',
    batteryRuntimeLabel: 'अनुमानित बैकअप',
    rechargeBatteryButton: 'नई बैटरी लगाएं',
    powerModeLabel: 'पंप पावर मोड',
    powerEco: 'इको',
    powerStandard: 'सामान्य',
    powerTurbo: 'टर्बो',
    infectedCountTitle: 'इंजेक्ट किए गए संक्रमित पौधे',
    broadleafLabel: 'चौड़ी पत्ती खरपतवार',
    grassyLabel: 'घास वाले खरपतवार',
    sedgeLabel: 'मोथा / सेज',
    resetCounterButton: 'गिनती रीसेट करें',
    boomCalibrationTitle: 'बूम और कैमरा संवेदनशीलता',
    boomWidthLabel: 'स्प्रेयर बूम चौड़ाई',
    tractorSpeedLabel: 'लक्षित ट्रैक्टर गति',
    visionSensitivityLabel: 'खरपतवार पहचान सटीकता',
    sprayerMasterLabel: 'मुख्य इंजेक्शन वाल्व',
    sprayerActiveState: 'सक्रिय और चालू',
    sprayerStandbyState: 'स्टैंडबाय (सुरक्षित)',
    cropRowGuardLabel: 'फसल पंक्ति सुरक्षा',
    brandLogoSectionTitle: 'ERADIX कंपनी लोगो',
    brandLogoDesc: 'एग्री साथी के साथ दिखाने के लिए कंपनी लोगो अपलोड करें।',
    uploadLogoButton: 'लोगो अपलोड करें',
    restoreLogoButton: 'डिफ़ॉल्ट ERADIX लोगो',
    chatTitle: 'एग्री साथी एआई सहायक',
    chatSubtitle:
      'खरपतवार की पहचान, दवा की मात्रा, बैटरी बचत या खेत के बाकी हिस्सों के बारे में पूछें।',
    chatModelFast: 'त्वरित उत्तर',
    chatModelDetailed: 'विस्तृत सलाह',
    chatPlaceholder: 'अपनी भाषा में प्रश्न पूछें...',
    chatSend: 'भेजें',
    chatClear: 'नई चैट',
    chatWelcome:
      'नमस्ते! मैं एग्री साथी हूँ, आपका ERADIX स्मार्ट खरपतवार नियंत्रण मित्र। प्रति पौधा दवा की मात्रा, ट्रैक्टर की गति या खेत के हर कोने को कवर करने के बारे में पूछें।',
    quickPrompts: [
      'चौड़ी पत्ती वाले खरपतवार के लिए सुरक्षित खुराक क्या है?',
      'खेत के छूटे हुए कोनों को सही तरीके से कैसे कवर करें?',
      'मौजूदा टैंक और बैटरी से कितनी एकड़ छिड़काव होगा?',
      'सटीक पहचान के लिए ट्रैक्टर की सही गति क्या रखें?',
    ],
  },
  mr: {
    appName: 'ॲग्री साथी',
    navMap: 'लाईव्ह शेत नकाशा',
    navSettings: 'रोबोट सेटिंग्ज',
    navChat: 'एआय कृषी सल्लागार',
    liveTractorMap: 'लाईव्ह ट्रॅक्टर आणि तणनाशक रोबोट नकाशा',
    farmSelectionHint:
      '"शेत बॉक्स निवडा" दाबा आणि नकाशावर तुमच्या शेताभोवती बॉक्स ओढा. कोपरे ओढून आकार बदला.',
    dragBoxButton: 'शेत बॉक्स निवडा',
    drawingActiveButton: 'नकाशावर बॉक्स ओढा...',
    useMyLocation: 'माझे लाईव्ह GPS',
    locatingGps: 'शोधत आहे...',
    clearFarmBox: 'बॉक्स काढा',
    startTractorRun: 'ट्रॅक्टर फेरी सुरू करा',
    pauseTractorRun: 'थांबवा',
    resetPath: 'मार्ग रीसेट करा',
    coveredPathLegend: 'पूर्ण झालेला मार्ग',
    suggestedPathLegend: 'सुचवलेला पर्यायी मार्ग (100% कव्हरेज)',
    tractorPositionLabel: 'लाईव्ह ट्रॅक्टर + ERADIX यंत्र',
    fieldImageTitle: 'शेतकऱ्याच्या शेताचा फोटो',
    uploadFieldPhoto: 'शेताचा फोटो बदला',
    farmAreaLabel: 'निवडलेले शेत',
    coverageLabel: 'पूर्ण क्षेत्र',
    remainingAreaLabel: 'उरलेले क्षेत्र',
    estTimeRemaining: 'अंदाजे वेळ',
    pathStrategyLabel: 'पर्यायी मार्ग रचना',
    strategySerpentine: 'उत्तर-दक्षिण रांगा',
    strategyContour: 'पूर्व-पश्चिम रांगा',
    strategySpiral: 'कडांपासून गोलाकार',
    farmPresetLabel: 'भाग / शेत प्लॉट',
    mapViewLabel: 'नकाशा प्रकार',
    dosageShort: 'मात्रा / रोप',
    tankShort: 'औषध टाकी',
    batteryShort: 'बॅटरी आयुष्य',
    injectedShort: 'तणनाशक दिलेली रोपे',
    settingsTitle: 'ERADIX रोबोट नियंत्रण आणि तपासणी',
    settingsSubtitle:
      'प्रति तण औषध मात्रा, टाकी साठा, बॅटरी पॉवर मोड आणि बूम रुंदी नियंत्रित करा.',
    dosageSettingTitle: 'प्रति रोप तणनाशक मात्रा',
    dosageSettingDesc: 'ओळखलेल्या प्रत्येक तणावर अचूक मायक्रो-इंजेक्शन मात्रा.',
    dosageHighWarning:
      'जास्त मात्रा (>16 mL/रोप) वापरल्यास टाकी लवकर संपेल आणि पिकावर परिणाम होऊ शकतो.',
    tankSettingTitle: 'तणनाशक टाकी साठा',
    tankCapacityLabel: 'टाकी क्षमता',
    tankRemainingLabel: 'शिल्लक औषध',
    refillTankButton: 'टाकी भरा (100%)',
    batterySettingTitle: 'बॅटरी पॅक आणि पॉवर',
    batteryVoltageLabel: 'व्होल्टेज',
    batteryRuntimeLabel: 'अंदाजे वेळ',
    rechargeBatteryButton: 'पूर्ण बॅटरी लावा',
    powerModeLabel: 'पंप पॉवर मोड',
    powerEco: 'इको',
    powerStandard: 'सामान्य',
    powerTurbo: 'टर्बो',
    infectedCountTitle: 'इंजेक्ट केलेली बाधित रोपे',
    broadleafLabel: 'रुंद पानांचे तण',
    grassyLabel: 'गवतवर्गीय तण',
    sedgeLabel: 'लव्हाळा / सेज',
    resetCounterButton: 'मोजणी रीसेट करा',
    boomCalibrationTitle: 'बूम आणि कॅमेरा सेटिंग्ज',
    boomWidthLabel: 'स्प्रेअर बूम रुंदी',
    tractorSpeedLabel: 'ट्रॅक्टरचा वेग',
    visionSensitivityLabel: 'तण ओळख अचूकता',
    sprayerMasterLabel: 'मुख्य स्प्रे व्हॉल्व्ह',
    sprayerActiveState: 'सक्रिय आणि चालू',
    sprayerStandbyState: 'स्टँडबाय (सुरक्षित)',
    cropRowGuardLabel: 'पीक रांग संरक्षण',
    brandLogoSectionTitle: 'ERADIX कंपनी लोगो',
    brandLogoDesc: 'ॲग्री साथी सोबत दाखवण्यासाठी लोगो अपलोड करा.',
    uploadLogoButton: 'लोगो अपलोड करा',
    restoreLogoButton: 'मूळ ERADIX लोगो',
    chatTitle: 'ॲग्री साथी एआय मदत',
    chatSubtitle:
      'तण ओळख, औषध प्रमाण, बॅटरी बचत किंवा शेतातील उरलेल्या मार्गाबद्दल विचारा.',
    chatModelFast: 'जलद उत्तर',
    chatModelDetailed: 'सविस्तर सल्ला',
    chatPlaceholder: 'मराठीत किंवा तुमच्या भाषेत विचारा...',
    chatSend: 'पाठवा',
    chatClear: 'नवीन चॅट',
    chatWelcome:
      'नमस्कार! मी ॲग्री साथी, तुमचा ERADIX तण-नियंत्रण सहकारी. प्रति तण औषध मात्रा, ट्रॅक्टर वेग किंवा संपूर्ण शेत कव्हर करण्याबद्दल मला काहीही विचारा.',
    quickPrompts: [
      'रुंद पानांच्या तणासाठी योग्य औषध मात्रा किती असावी?',
      'शेताचे सुटलेले कोपरे जलद कसे कव्हर करावेत?',
      'सध्याच्या टाकी आणि बॅटरीमध्ये किती एकर फवारणी होईल?',
      'अचूक तण ओळखीसाठी ट्रॅक्टरचा वेग किती ठेवावा?',
    ],
  },
  ta: {
    appName: 'அக்ரி சாத்தி',
    navMap: 'நேரடி வயல் வரைபடம்',
    navSettings: 'ரோபோ அமைப்புகள்',
    navChat: 'AI வேளாண் உதவியாளர்',
    liveTractorMap: 'நேரடி டிராக்டர் மற்றும் களை நீக்கி வரைபடம்',
    farmSelectionHint:
      '"வயல் பெட்டி தேர்வு" அழுத்தி வரைபடத்தில் உங்கள் வயலை இழுத்து தேர்ந்தெடுக்கவும்.',
    dragBoxButton: 'வயல் பெட்டி தேர்வு',
    drawingActiveButton: 'வரைபடத்தில் பெட்டியை இழுக்கவும்...',
    useMyLocation: 'என் நேரடி GPS',
    locatingGps: 'கண்டறிகிறது...',
    clearFarmBox: 'பெட்டியை நீக்கு',
    startTractorRun: 'டிராக்டர் ஓட்டம் தொடங்கு',
    pauseTractorRun: 'இடைநிறுத்து',
    resetPath: 'பாதையை மீட்டமை',
    coveredPathLegend: 'மூடப்பட்ட பாதை',
    suggestedPathLegend: 'பரிந்துரைக்கப்பட்ட மாற்று பாதை (100% கவரேஜ்)',
    tractorPositionLabel: 'நேரடி டிராக்டர் + ERADIX ரோபோ',
    fieldImageTitle: 'விவசாயி வயல் புகைப்படம்',
    uploadFieldPhoto: 'வயல் படத்தை மாற்று',
    farmAreaLabel: 'தேர்ந்தெடுத்த வயல்',
    coverageLabel: 'முடிந்த பகுதி',
    remainingAreaLabel: 'மீதமுள்ள பகுதி',
    estTimeRemaining: 'மீதமுள்ள நேரம்',
    pathStrategyLabel: 'மாற்று பாதை முறை',
    strategySerpentine: 'வடக்கு-தெற்கு வரிசைகள்',
    strategyContour: 'கிழக்கு-மேற்கு வரிசைகள்',
    strategySpiral: 'வெளிப்புற சுழல் பாதை',
    farmPresetLabel: 'பகுதி / வயல்',
    mapViewLabel: 'வரைபட வகை',
    dosageShort: 'மருந்து அளவு / செடி',
    tankShort: 'களைக்கொல்லி தொட்டி',
    batteryShort: 'பேட்டரி நிலை',
    injectedShort: 'மருந்து செலுத்திய களைகள்',
    settingsTitle: 'ERADIX ரோபோ கட்டுப்பாடு மற்றும் அமைப்புகள்',
    settingsSubtitle:
      'செடிக்கு தேவையான மருந்து அளவு, தொட்டி இருப்பு, பேட்டரி மற்றும் பூம் அகலத்தை அமைக்கவும்.',
    dosageSettingTitle: 'ஒரு செடிக்கு களைக்கொல்லி அளவு',
    dosageSettingDesc: 'கண்டறியப்பட்ட ஒவ்வொரு களையிலும் செலுத்தப்படும் துல்லிய அளவு.',
    dosageHighWarning:
      'அதிக அளவு (>16 mL/செடி) தொட்டியை விரைவில் காலி செய்யும்.',
    tankSettingTitle: 'களைக்கொல்லி தொட்டி இருப்பு',
    tankCapacityLabel: 'தொட்டி கொள்ளளவு',
    tankRemainingLabel: 'மீதமுள்ள மருந்து',
    refillTankButton: 'தொட்டியை நிரப்பு (100%)',
    batterySettingTitle: 'பேட்டரி மற்றும் மின்சாரம்',
    batteryVoltageLabel: 'மின்னழுத்தம்',
    batteryRuntimeLabel: 'இயங்கும் நேரம்',
    rechargeBatteryButton: 'முழு பேட்டரி மாற்று',
    powerModeLabel: 'பம்ப் சக்தி நிலை',
    powerEco: 'எக்கோ',
    powerStandard: 'சாதாரண',
    powerTurbo: 'டர்போ',
    infectedCountTitle: 'மருந்து செலுத்தப்பட்ட களைகள்',
    broadleafLabel: 'அகன்ற இலை களைகள்',
    grassyLabel: 'புல் வகை களைகள்',
    sedgeLabel: 'கோரை களைகள்',
    resetCounterButton: 'எண்ணிக்கையை மீட்டமை',
    boomCalibrationTitle: 'பூம் மற்றும் கேமரா அளவுத்திருத்தம்',
    boomWidthLabel: 'தெளிப்பான் பூம் அகலம்',
    tractorSpeedLabel: 'டிராக்டர் வேகம்',
    visionSensitivityLabel: 'களை கண்டறிதல் துல்லியம்',
    sprayerMasterLabel: 'முதன்மை தெளிப்பு வால்வு',
    sprayerActiveState: 'இயக்கத்தில் உள்ளது',
    sprayerStandbyState: 'காத்திருப்பு (பாதுகாப்பு)',
    cropRowGuardLabel: 'பயிர் வரிசை பாதுகாப்பு',
    brandLogoSectionTitle: 'ERADIX நிறுவன சின்னம்',
    brandLogoDesc: 'அக்ரி சாத்தியுடன் காட்ட உங்கள் நிறுவன சின்னத்தை பதிவேற்றவும்.',
    uploadLogoButton: 'சின்னம் பதிவேற்று',
    restoreLogoButton: 'ERADIX சின்னம் மீட்டமை',
    chatTitle: 'அக்ரி சாத்தி AI உதவியாளர்',
    chatSubtitle:
      'களை கட்டுப்பாடு, மருந்து அளவு, பேட்டரி அல்லது வயல் பாதை குறித்து கேளுங்கள்.',
    chatModelFast: 'விரைவு பதில்',
    chatModelDetailed: 'விரிவான ஆலோசனை',
    chatPlaceholder: 'தமிழில் அல்லது உங்கள் மொழியில் கேளுங்கள்...',
    chatSend: 'அனுப்பு',
    chatClear: 'புதிய உரையாடல்',
    chatWelcome:
      'வணக்கம்! நான் அக்ரி சாத்தி, உங்கள் ERADIX துல்லிய களை நீக்கி உதவியாளர். மருந்து அளவு, டிராக்டர் வேகம் அல்லது வயலின் அனைத்து பகுதிகளையும் மூடுவது பற்றி கேளுங்கள்.',
    quickPrompts: [
      'அகன்ற இலை களைகளுக்கு சரியான மருந்து அளவு என்ன?',
      'விடுபட்ட வயல் மூலைகளை எளிதாக எவ்வாறு மூடுவது?',
      'தற்போதைய தொட்டி மற்றும் பேட்டரியில் எத்தனை ஏக்கர் தெளிக்கலாம்?',
      'சிறந்த களை கண்டறிதலுக்கு டிராக்டர் வேகம் எவ்வளவு இருக்க வேண்டும்?',
    ],
  },
  te: {
    appName: 'అగ్రి సాథి',
    navMap: 'లైవ్ పొలం మ్యాప్',
    navSettings: 'రోబోట్ సెట్టింగ్స్',
    navChat: 'AI వ్యవసాయ మిత్రుడు',
    liveTractorMap: 'లైవ్ ట్రాక్టర్ & కలుపు నివారణ రోబో మ్యాప్',
    farmSelectionHint:
      '"పొలం బాక్స్ ఎంచుకోండి" నొక్కి మ్యాప్‌పై మీ పొలం చుట్టూ బాక్స్ గీయండి.',
    dragBoxButton: 'పొలం బాక్స్ ఎంచుకోండి',
    drawingActiveButton: 'మ్యాప్‌పై బాక్స్ గీయండి...',
    useMyLocation: 'నా లైవ్ GPS',
    locatingGps: 'గుర్తిస్తోంది...',
    clearFarmBox: 'బాక్స్ తొలగించు',
    startTractorRun: 'ట్రాక్టర్ నడక ప్రారంభించు',
    pauseTractorRun: 'ఆపు',
    resetPath: 'మార్గం రీసెట్',
    coveredPathLegend: 'కవర్ చేసిన మార్గం',
    suggestedPathLegend: 'సూచించిన ప్రత్యామ్నాయ మార్గం (100% కవరేజ్)',
    tractorPositionLabel: 'లైవ్ ట్రాక్టర్ + ERADIX రోబో',
    fieldImageTitle: 'రైతు పొలం ఫోటో',
    uploadFieldPhoto: 'పొలం ఫోటో మార్చు',
    farmAreaLabel: 'ఎంచుకున్న పొలం',
    coverageLabel: 'పూర్తయిన విస్తీర్ణం',
    remainingAreaLabel: 'మిగిలిన విస్తీర్ణం',
    estTimeRemaining: 'మిగిలిన సమయం',
    pathStrategyLabel: 'ప్రత్యామ్నాయ మార్గం విధానం',
    strategySerpentine: 'ఉత్తర-దక్షిణ వరుసలు',
    strategyContour: 'తూర్పు-పడమర వరుసలు',
    strategySpiral: 'చుట్టుకొలత స్పైరల్',
    farmPresetLabel: 'ప్రాంతం / ప్లాట్',
    mapViewLabel: 'మ్యాప్ రకం',
    dosageShort: 'మందు మోతాదు / మొక్క',
    tankShort: 'మందు ట్యాంక్',
    batteryShort: 'బ్యాటరీ స్థాయి',
    injectedShort: 'మందు వేసిన కలుపు మొక్కలు',
    settingsTitle: 'ERADIX రోబో నియంత్రణ & సెట్టింగ్స్',
    settingsSubtitle:
      'మొక్కకు మందు మోతాదు, ట్యాంక్ నిల్వ, బ్యాటరీ పవర్ మోడ్ మరియు బూమ్ వెడల్పును సెట్ చేయండి.',
    dosageSettingTitle: 'ప్రతి మొక్కకు కలుపు మందు మోతాదు',
    dosageSettingDesc: 'గుర్తించిన ప్రతి కలుపు మొక్కపై పిచికారీ చేసే ఖచ్చితమైన మోతాదు.',
    dosageHighWarning:
      'అధిక మోతాదు (>16 mL/మొక్క) ట్యాంక్‌ను త్వరగా ఖాళీ చేస్తుంది.',
    tankSettingTitle: 'కలుపు మందు ట్యాంక్ నిల్వ',
    tankCapacityLabel: 'ట్యాంక్ సామర్థ్యం',
    tankRemainingLabel: 'మిగిలిన మందు',
    refillTankButton: 'ట్యాంక్ నింపు (100%)',
    batterySettingTitle: 'బ్యాటరీ ప్యాక్ & పవర్',
    batteryVoltageLabel: 'వోల్టేజ్',
    batteryRuntimeLabel: 'అంచనా సమయం',
    rechargeBatteryButton: 'పూర్తి బ్యాటరీ మార్చు',
    powerModeLabel: 'పంప్ పవర్ మోడ్',
    powerEco: 'ఎకో',
    powerStandard: 'సాధారణం',
    powerTurbo: 'టర్బో',
    infectedCountTitle: 'మందు వేసిన కలుపు మొక్కల సంఖ్య',
    broadleafLabel: 'వెడల్పాటి ఆకు కలుపు',
    grassyLabel: 'గడ్డి జాతి కలుపు',
    sedgeLabel: 'తుంగ జాతి కలుపు',
    resetCounterButton: 'లెక్క రీసెట్ చేయి',
    boomCalibrationTitle: 'బూమ్ & కెమెరా అమరిక',
    boomWidthLabel: 'స్ప్రేయర్ బూమ్ వెడల్పు',
    tractorSpeedLabel: 'ట్రాక్టర్ వేగం',
    visionSensitivityLabel: 'కలుపు గుర్తింపు ఖచ్చితత్వం',
    sprayerMasterLabel: 'ప్రధాన స్ప్రే వాల్వ్',
    sprayerActiveState: 'యాక్టివ్ (పిచికారీ సిద్ధం)',
    sprayerStandbyState: 'స్టాండ్‌బై (సురక్షితం)',
    cropRowGuardLabel: 'పంట వరుస రక్షణ',
    brandLogoSectionTitle: 'ERADIX కంపెనీ లోగో',
    brandLogoDesc: 'అగ్రి సాథి పక్కన చూపించడానికి లోగో అప్‌లోడ్ చేయండి.',
    uploadLogoButton: 'లోగో అప్‌లోడ్',
    restoreLogoButton: 'ERADIX లోగో పునరుద్ధరించు',
    chatTitle: 'అగ్రి సాథి AI సహాయకుడు',
    chatSubtitle:
      'కలుపు గుర్తింపు, మందు మోతాదు, బ్యాటరీ లేదా పొలం మార్గాల గురించి అడగండి.',
    chatModelFast: 'వేగవంతమైన జవాబు',
    chatModelDetailed: 'పూర్తి వ్యవసాయ సలహా',
    chatPlaceholder: 'తెలుగులో లేదా మీ భాషలో అడగండి...',
    chatSend: 'పంపు',
    chatClear: 'కొత్త చాట్',
    chatWelcome:
      'నమస్కారం! నేను అగ్రి సాథి, మీ ERADIX కలుపు నివారణ సహాయకుడిని. మందు మోతాదు, ట్రాక్టర్ వేగం లేదా పొలం మొత్తం కవర్ చేయడం గురించి అడగండి.',
    quickPrompts: [
      'వెడల్పాటి ఆకు కలుపుకు సరైన మందు మోతాదు ఎంత?',
      'మిగిలిపోయిన పొలం మూలలను సులభంగా ఎలా కవర్ చేయాలి?',
      'ప్రస్తుత ట్యాంక్ & బ్యాటరీతో ఎన్ని ఎకరాలు స్ప్రే చేయవచ్చు?',
      'ఖచ్చితమైన కలుపు గుర్తింపుకు ట్రాక్టర్ వేగం ఎంత ఉండాలి?',
    ],
  },
  bho: {
    appName: 'एग्री साथी',
    navMap: 'लाइव खेत नक्सा',
    navSettings: 'रोबोट सेटिंग',
    navChat: 'एआई खेती गुरु',
    liveTractorMap: 'लाइव ट्रैक्टर आ खरपतवार रोबोट नक्सा',
    farmSelectionHint:
      '"खेत बॉक्स चुनीं" दबाईं आ नक्सा पर अपना खेत के चारो ओर बॉक्स खींचीं। कोना पकड़ के साइज बदलीं।',
    dragBoxButton: 'खेत बॉक्स चुनीं',
    drawingActiveButton: 'नक्सा पर बॉक्स खींचीं...',
    useMyLocation: 'हमर लाइव GPS',
    locatingGps: 'खोजत बा...',
    clearFarmBox: 'बॉक्स हटाईं',
    startTractorRun: 'ट्रैक्टर चलावल शुरू करीं',
    pauseTractorRun: 'रोकीं',
    resetPath: 'रस्ता रीसेट करीं',
    coveredPathLegend: 'छींटल गइल रस्ता',
    suggestedPathLegend: 'सुझावल नया रस्ता (पूरा खेत खातिर)',
    tractorPositionLabel: 'लाइव ट्रैक्टर + ERADIX मशीन',
    fieldImageTitle: 'किसान के खेत के फोटो',
    uploadFieldPhoto: 'खेत के फोटो बदलीं',
    farmAreaLabel: 'चुनल खेत',
    coverageLabel: 'पूरा भइल हिस्सा',
    remainingAreaLabel: 'बाकी बचल हिस्सा',
    estTimeRemaining: 'बचल समय',
    pathStrategyLabel: 'नया रस्ता के तरीका',
    strategySerpentine: 'उत्तर-दक्खिन लाइन',
    strategyContour: 'पूरब-पच्छिम लाइन',
    strategySpiral: 'मेड़ से गोल घूमके',
    farmPresetLabel: 'इलाका / खेत',
    mapViewLabel: 'नक्सा प्रकार',
    dosageShort: 'दवा मात्रा / पौधा',
    tankShort: 'दवा टंकी',
    batteryShort: 'बैटरी पावर',
    injectedShort: 'दवा पड़ल घास-पात',
    settingsTitle: 'ERADIX रोबोट कंट्रोल आ सेटिंग',
    settingsSubtitle:
      'हर पौधा पर दवा के मात्रा, टंकी के पानी-दवा, बैटरी आ बूम के चौड़ाई ठीक करीं।',
    dosageSettingTitle: 'हर पौधा पर दवा के मात्रा',
    dosageSettingDesc: 'पहिचानल हर खरपतवार पर सटीक दवा डाले के मात्रा।',
    dosageHighWarning:
      'जादा दवा (>16 mL/पौधा) से टंकी जल्दी खाली होई आ फसल के नुकसान हो सकेला।',
    tankSettingTitle: 'दवा टंकी के हाल',
    tankCapacityLabel: 'टंकी के क्षमता',
    tankRemainingLabel: 'बचल दवा',
    refillTankButton: 'टंकी भरीं (100%)',
    batterySettingTitle: 'बैटरी आ बिजली',
    batteryVoltageLabel: 'वोल्टेज',
    batteryRuntimeLabel: 'अंदाजा समय',
    rechargeBatteryButton: 'फुल बैटरी लगाईं',
    powerModeLabel: 'पंप पावर मोड',
    powerEco: 'बचत (Eco)',
    powerStandard: 'सामान्य',
    powerTurbo: 'तेज (Turbo)',
    infectedCountTitle: 'दवा पड़ल खराब पौधा गिनती',
    broadleafLabel: 'चौड़ा पत्ता घास',
    grassyLabel: 'पतला घास',
    sedgeLabel: 'मोथा घास',
    resetCounterButton: 'गिनती शून्य करीं',
    boomCalibrationTitle: 'बूम आ कैमरा सेटिंग',
    boomWidthLabel: 'स्प्रे बूम के चौड़ाई',
    tractorSpeedLabel: 'ट्रैक्टर के रफ्तार',
    visionSensitivityLabel: 'घास पहिचाने के ताकत',
    sprayerMasterLabel: 'मेन स्प्रे वाल्व',
    sprayerActiveState: 'चालू बा (तैयार)',
    sprayerStandbyState: 'बंद बा (सुरक्षित)',
    cropRowGuardLabel: 'फसल लाइन बचाव',
    brandLogoSectionTitle: 'ERADIX कंपनी लोगो',
    brandLogoDesc: 'एग्री साथी के साथ देखावे खातिर कंपनी लोगो अपलोड करीं।',
    uploadLogoButton: 'लोगो अपलोड करीं',
    restoreLogoButton: 'असली ERADIX लोगो',
    chatTitle: 'एग्री साथी एआई मदद',
    chatSubtitle:
      'घास-पात के दवा, ट्रैक्टर के रफ्तार, बैटरी बचावे या खेत के कोना छूटे के बारे में पूछीं।',
    chatModelFast: 'तुरंत जवाब',
    chatModelDetailed: 'पूरा जानकारी',
    chatPlaceholder: 'भोजपुरी या अपना भाषा में पूछीं...',
    chatSend: 'भेजीं',
    chatClear: 'नया बात',
    chatWelcome:
      'प्रणाम किसान भाई! हम एग्री साथी हईं, रउआ ERADIX रोबोट के संगी। हर पौधा पर दवा के मात्रा, ट्रैक्टर के रफ्तार आ पूरा खेत में दवा छींटे के तरीका पूछीं।',
    quickPrompts: [
      'चौड़ा पत्ता वाला घास खातिर कतना दवा सही रही?',
      'खेत के छूटल कोना सब बढ़िया से कइसे कवर होई?',
      'अबही के टंकी आ बैटरी से कतना एकड़ खेत हो जाई?',
      'बढ़िया घास पहिचान खातिर ट्रैक्टर कतना तेज चलाईं?',
    ],
  },
};
