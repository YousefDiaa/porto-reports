# 🏆 منصة تقارير نادي بورتو الرياضي (Porto Sporting Clubs Reports)

منصة متكاملة ومجانية 100% لإدارة وكتابة وعرض وتصدير التقارير الرسمية لنادي بورتو الرياضي (عامر جروب).

---

## 🌟 مميزات المشروع

- **تصميم مطابق لهوية نادي بورتو:** درجات الكحلي الملكي (`#003C71`) والذهبي الفاخر (`#E9B245`) مع دعم كامل للغة العربية (RTL) وخط Cairo.
- **محرر تقارير شبيه بـ Microsoft Word (Tiptap Editor):**
  - عناوين (H1, H2, H3) وتنسيق النصوص (Bold, Italic, Underline, Strike, Highlight).
  - ألوان نصوص متعددة.
  - محاذاة النص (يمين، وسط، يسار، ضبط).
  - قوائم نقطية ورقمية واقتباسات.
  - جداول متقدمة (إضافة وحذف أعمدة وصفوف).
  - إدراج روابط وصور مع الرفع المباشر على Cloudinary.
- **إدارة التخصصات الديناميكية:** الأدمن يضيف ويعدل التخصصات (مثل كرة القدم، السباحة، التنس، الإدارة، البادل) مع اختيار لون مميز لكل تخصص.
- **تصدير احترافي (PDF و Word):**
  - تصدير تقرير فردي بصيغة PDF أو Word (.docx) متناسق مع الترويسة وشعار النادي.
  - **تصدير مجمع:** تصدير مجموعة تقارير كاملة في ملف واحد وفق تخصص محدد وفترة زمنية (شهري، ربع سنوي، نصف سنوي، سنوي).
- **بوابة الزوار العامة:** تصفح التقارير المنشورة وقراءتها وتصفيتها بالتخصص والفترة الزمنية بدون الحاجة لتسجيل دخول.
- **لوحة تحكم الأدمن:** محمية بنظام مصادقة (NextAuth) لإدارة التقارير (مسودة / منشور)، التخصصات، والإحصائيات.
- **استضافة مجانية 100%:** جاهز للرفع على منصة **Vercel** مع **Supabase** و **Cloudinary**.

---

## 🛠️ التقنيات المستخدمة (Stack)

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** بتخصيص كامل لألوان بورتو
- **Tiptap Rich Text Editor** مع جميع الملحقات
- **Supabase** (PostgreSQL Database + Row Level Security)
- **Cloudinary** (تخزين الصور حتى 25GB مجاناً)
- **NextAuth.js** (مصادقة الأدمن)
- **html2pdf.js** (توليد وتصدير ملفات PDF)
- **docx & file-saver** (توليد وتصدير مستندات Word)

---

## 🚀 خطوات التشغيل والإعداد

### 1. إعداد قاعدة بيانات Supabase (مجاناً)
1. افتح [Supabase.com](https://supabase.com) وسجل حساب مجاني.
2. أنشئ مشروعاً جديداً (`New Project`).
3. ادخل إلى **SQL Editor** من القائمة الجانبية.
4. انسخ محتويات الملف `supabase-setup.sql` والصقه في المحرر واضغط **Run**.
5. اذهب إلى **Project Settings -> API** وانسخ:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

### 2. إعداد Cloudinary للصور (مجاناً)
1. افتح [Cloudinary.com](https://cloudinary.com) وسجل حساب مجاني.
2. من لوحة التحكم (Dashboard) انسخ:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

### 3. إعداد المتغيرات البيئية (.env.local)
قم بتعديل ملف `.env.local` داخل المجلد `porto-reports`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Auth (بيانات دخول الأدمن)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=porto_admin_2024
NEXTAUTH_SECRET=your_super_secret_random_string_here_change_this
NEXTAUTH_URL=http://localhost:3000

# App Info
NEXT_PUBLIC_APP_NAME=تقارير نادي بورتو الرياضي
```

### 4. التشغيل محلياً (Development)
```bash
cd porto-reports
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🌐 النشر على منصة Vercel (Deployment)

1. ارفع المشروع على حسابك في GitHub.
2. ادخل إلى [Vercel.com](https://vercel.com) واضغط **Add New -> Project**.
3. اختر المستودع الخاص بالمشروع.
4. في قسم **Environment Variables**، أضف جميع المتغيرات الموجودة في ملف `.env.local` (مع تغيير `NEXTAUTH_URL` ليكون رابط موقعك على Vercel).
5. اضغط **Deploy**.

---

## 🔐 بيانات دخول الأدمن الافتراضية
- **الرابط:** `/admin/login`
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `porto_admin_2024` *(يمكنك تغييرها في .env.local)*
