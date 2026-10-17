import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function runTests() {
  console.log("==========================================");
  console.log("🧪 بدء فحص شامل لجميع وظائف المشروع");
  console.log("==========================================\n");

  let allPassed = true;

  // 1. Test Supabase
  console.log("1️⃣ فحص الاتصال بقاعدة بيانات Supabase...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ متغيرات Supabase غير موجودة في .env.local");
    allPassed = false;
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Check specializations table
      const { data: specData, error: specError } = await supabase.from("specializations").select("*").limit(5);
      if (specError) {
        console.error("❌ خطأ في جدول التخصصات specializations:", specError.message);
        allPassed = false;
      } else {
        console.log(`✅ جدول التخصصات يعمل بنجاح! عدد التخصصات الحالية: ${specData.length}`);
      }

      // Check reports table
      const { data: reportData, error: reportError } = await supabase.from("reports").select("*").limit(5);
      if (reportError) {
        console.error("❌ خطأ في جدول التقارير reports:", reportError.message);
        allPassed = false;
      } else {
        console.log(`✅ جدول التقارير يعمل بنجاح! عدد التقارير الحالية: ${reportData.length}`);
      }

      // Test Insert & Delete on specializations (CRUD verification)
      const testSpecName = `تخصص تجريبي ${Date.now()}`;
      const { data: insertedSpec, error: insertError } = await supabase
        .from("specializations")
        .insert([{ name: testSpecName, color: "#E4007C", description: "فحص آلي" }])
        .select()
        .single();

      if (insertError) {
        console.error("❌ خطأ في إنشاء تخصص تجريبي (Insert):", insertError.message);
        allPassed = false;
      } else {
        console.log("✅ اختبار إضافة تخصص (Insert) نجح بنجاح! ID:", insertedSpec.id);

        // Delete test record
        const { error: deleteError } = await supabase.from("specializations").delete().eq("id", insertedSpec.id);
        if (deleteError) {
          console.error("⚠️ خطأ في مسح السجل التجريبي:", deleteError.message);
        } else {
          console.log("✅ اختبار حذف التخصص (Delete) نجح بنجاح وتم تنظيف السجل!");
        }
      }
    } catch (err) {
      console.error("❌ استثناء أثناء فحص Supabase:", err.message);
      allPassed = false;
    }
  }

  console.log("\n------------------------------------------\n");

  // 2. Test Cloudinary
  console.log("2️⃣ فحص خدمة تخزين الصور Cloudinary...");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ بيانات Cloudinary غير مكتملة في .env.local");
    allPassed = false;
  } else {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const pingResult = await cloudinary.api.ping();
      console.log("✅ الاتصال بـ Cloudinary ناجح تماماً! نتيجة Ping:", pingResult.status);

      // Upload tiny 1x1 base64 transparent PNG to verify real upload
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const uploadRes = await cloudinary.uploader.upload(tinyPng, {
        folder: "porto-reports-test",
      });
      console.log("✅ تجربة رفع صورة حقيقية نجحت! الرابط:", uploadRes.secure_url);

      // Clean up test image
      await cloudinary.uploader.destroy(uploadRes.public_id);
      console.log("✅ تم حذف الصورة التجريبية بنجاح من Cloudinary!");
    } catch (err) {
      console.error("❌ خطأ أثناء فحص Cloudinary:", err.message);
      allPassed = false;
    }
  }

  console.log("\n------------------------------------------\n");

  // 3. Test Docx Generation
  console.log("3️⃣ فحص مولد مستندات Word (.docx)...");
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "تقرير نادي بورتو الرياضي التجريبي",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "تم إنشاء هذا المستند بنجاح عبر نظام التصدير التلقائي.",
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    if (buffer && buffer.length > 0) {
      console.log(`✅ توليد مستند Word نجح 100%! حجم الملف: ${buffer.length} بايت`);
    } else {
      console.error("❌ توليد ملف Word أعاد بافر فارغ");
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ خطأ أثناء اختبار توليد Word:", err.message);
    allPassed = false;
  }

  console.log("\n==========================================");
  if (allPassed) {
    console.log("🎉 كل الوظائف تعمل بنجاح 100% بدون أي أخطاء!");
  } else {
    console.log("⚠️ هناك بعض الفحوصات التي تحتاج مراجعة (انظر التفاصيل أعلاه)");
  }
  console.log("==========================================\n");
}

runTests();
