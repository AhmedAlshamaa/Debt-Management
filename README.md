# 💰 ديوني - Debt Management App
<div align="center">
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
**منصة ذكية لإدارة الديون بواجهة حديثة وسهلة الاستخدام**
[العرض المباشر](#) · [الإبلاغ عن مشكلة](https://github.com/AhmedAlshamaa/Debt-Management/issues) · [طلب ميزة](https://github.com/AhmedAlshamaa/Debt-Management/issues)
</div>
---
## 📖 نظرة عامة
تطبيق **ديوني** ليس مجرد دفتر حسابات رقمي، بل منصة ذكية تساعد المستخدم على:
- 📝 تسجيل الديون بشكل منظم
- 👥 إدارة العملاء والمدينين
- 🔔 استلام تذكيرات قبل مواعيد السداد
- 📊 تحليل الحالة المالية بصرياً
- 🔒 حماية البيانات بأمان عالٍ
## ✨ المميزات الرئيسية
| الميزة | الوصف |
|--------|-------|
| 💳 **تسجيل الديون** | إضافة الديون مع تفاصيل كاملة (المبلغ، التاريخ، الوصف) |
| 👤 **إدارة العملاء** | قاعدة بيانات كاملة للعملاء مع معلومات التواصل |
| 🔔 **تذكيرات ذكية** | تنبيهات قبل موعد الاستحقاق |
| 📊 **تقارير تفاعلية** | رسوم بيانية وإحصائيات مالية |
| 💱 **عملات متعددة** | دعم 6 عملات (SAR, USD, EUR, AED, EGP, KWD) |
| 🌙 **الوضع الليلي** | واجهة مريحة للعين |
| 📤 **تصدير PDF/Excel** | تقارير قابلة للمشاركة |
| ☁️ **نسخ احتياطي سحابي** | حماية البيانات |
| 🔐 **قفل بالبصمة** | أمان إضافي للتطبيق |
## 🎯 الفئة المستهدفة
- 👨‍💼 الأفراد الذين يحتاجون لتنظيم ديونهم الشخصية
- 🏪 أصحاب المشاريع الصغيرة والمتوسطة
- 💼 المحاسبون والمستشارون الماليون
## 🛠️ التقنيات المستخدمة
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Custom React Hooks
- **Storage**: LocalStorage API
- **Fonts**: Cairo (Google Fonts)
## 🚀 طريقة التشغيل
### المتطلبات الأساسية
- Node.js (v18 أو أحدث)
- npm أو yarn
### خطوات التثبيت
```bash
# استنساخ المستودع
git clone https://github.com/AhmedAlshamaa/Debt-Management.git
# الدخول إلى مجلد المشروع
cd Debt-Management
# تثبيت الحزم
npm install
# تشغيل وضع التطوير
npm run dev
```
افتح المتصفح على: `http://localhost:5173`
### بناء نسخة الإنتاج
```bash
npm run build
```
ستجد الملفات الجاهزة في مجلد `dist/`
## 📱 تدفق المستخدم (User Flow)
1. **تسجيل الدخول** أو إنشاء حساب جديد
2. الوصول إلى **Dashboard** لرؤية الحالة المالية
3. إضافة **دين جديد** مع كافة التفاصيل
4. إدارة **العملاء والمدينين**
5. متابعة **السداد والأقساط**
6. استلام **تنبيهات ذكية** قبل الاستحقاق
7. الاطلاع على **التقارير والإحصائيات**
8. ضبط **الإعدادات والنسخ الاحتياطي**
## 🎨 التصميم (UI/UX)
- **الألوان**: 
  - 🔵 أزرق نيلي للثقة
  - 🟢 أخضر للنجاح والسداد
  - ⚪ رمادي فاتح للحيادية
- **الخطوط**: Cairo من Google Fonts
- **التنقل**: Bottom Navigation Bar مع زر إضافة عائم (FAB)
- **التجاوب**: محسّن للموبايل مع إطار هاتف على الديسكتوب
## 📂 هيكل المشروع
```
Debt-Management/
├── src/
│   ├── components/      # المكونات المشتركة
│   │   ├── Icons.tsx
│   │   ├── Modal.tsx
│   │   └── UI.tsx
│   ├── screens/         # شاشات التطبيق
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Debts.tsx
│   │   ├── Customers.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── AddDebt.tsx
│   │   └── DebtDetails.tsx
│   ├── utils/          # الأدوات المساعدة
│   │   ├── cn.ts
│   │   └── format.ts
│   ├── App.tsx         # المكون الرئيسي
│   ├── store.ts        # إدارة الحالة
│   ├── types.ts        # تعريفات TypeScript
│   └── main.tsx        # نقطة الدخول
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
## 🤝 المساهمة
المساهمات مرحب بها! إذا كانت لديك أفكار لتحسين التطبيق:
1. Fork المشروع
2. أنشئ فرعاً جديداً (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request
## 📄 الترخيص
هذا المشروع مرخّص تحت [MIT License](LICENSE)
## 👨‍💻 المطور
**Ahmed Alshamaa**
- GitHub: [@AhmedAlshamaa](https://github.com/AhmedAlshamaa)
---
<div align="center">
**صُنع بـ ❤️ لمساعدتك على إدارة ديونك**
⭐ إذا أعجبك المشروع، لا تنسَ إعطاءه نجمة!
</div>
