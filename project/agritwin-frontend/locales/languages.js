(function () {
  const languages = [
    { code: 'en', nativeName: 'English', englishName: 'English', complete: true },
    { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', complete: false },
    { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', complete: false },
    { code: 'brx', nativeName: 'बरʼ', englishName: 'Bodo', complete: false },
    { code: 'doi', nativeName: 'डोगरी', englishName: 'Dogri', complete: false },
    { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', complete: false },
    { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', complete: false },
    { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', complete: false },
    { code: 'ks', nativeName: 'कॉशुर / کٲشُر', englishName: 'Kashmiri', complete: false },
    { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', complete: false },
    { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', complete: false },
    { code: 'mni', nativeName: 'মৈতৈলোন্', englishName: 'Manipuri', complete: false },
    { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', complete: false },
    { code: 'mai', nativeName: 'मैथिली', englishName: 'Maithili', complete: false },
    { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', complete: false },
    { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', complete: false },
    { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', complete: false },
    { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', complete: false },
    { code: 'sat', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santhali', complete: false },
    { code: 'sd', nativeName: 'سنڌي', englishName: 'Sindhi', complete: false },
    { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', complete: true },
    { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', complete: false },
    { code: 'ur', nativeName: 'اُردُو', englishName: 'Urdu', complete: false },
  ];

  window.agritwinLocales = window.agritwinLocales || {};
  window.agritwinLocales.languages = languages;
})();
