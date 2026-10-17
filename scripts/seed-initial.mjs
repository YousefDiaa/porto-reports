import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  const { data: existing } = await supabase.from("specializations").select("id");
  if (existing && existing.length > 0) {
    console.log(`Specializations already exist (${existing.length}). Skipping seed.`);
    return;
  }

  const defaultSpecs = [
    { name: "كرة القدم", description: "أكاديمية وفريق كرة القدم بنادي بورتو", color: "#E4007C" },
    { name: "السباحة", description: "أكاديمية السباحة والأنشطة المائية", color: "#00AEEF" },
    { name: "التنس والبادل", description: "ملاعب وبطولات التنس والبادل", color: "#E9B245" },
    { name: "الجمباز والفتنس", description: "صالات اللياقة البدنية والجمباز", color: "#0084B4" },
    { name: "الإدارة العامة", description: "التقارير الإدارية والتشغيلية للنادي", color: "#C20063" },
  ];

  const { data: specs, error: specErr } = await supabase
    .from("specializations")
    .insert(defaultSpecs)
    .select();

  if (specErr) {
    console.error("Error inserting specializations:", specErr);
    return;
  }

  console.log("Successfully seeded specializations:", specs.map((s) => s.name));

  // Add a sample report
  const footballSpec = specs.find((s) => s.name === "كرة القدم");
  const sampleReport = {
    title: "التقرير الشهري لأكاديمية كرة القدم — الربع الأول",
    specialization_id: footballSpec ? footballSpec.id : null,
    report_date: new Date().toISOString().split("T")[0],
    is_published: true,
    content_html: `
      <h2>ملخص نشاط أكاديمية كرة القدم</h2>
      <p>شهد هذا الشهر نشاطاً مكثفاً في تدريبات فرق الناشئين والبراعم بنادي بورتو الرياضي، حيث تم إنجاز خطة التطوير البدني والمهاري لجميع الفئات العمرية بنجاح.</p>
      <h3>أبرز الإنجازات والنتائج</h3>
      <ul>
        <li>مشاركة <strong>120 لاعباً</strong> في التقييمات الشهرية المعتمدة.</li>
        <li>خوض 4 مباريات ودية رسمية حققت فيها الفرق 3 انتصارات وتعادل وحيد.</li>
        <li>تحديث جداول الأحمال التدريبية وتطبيق معايير السلامة الرياضية.</li>
      </ul>
      <p>تستمر التدريبات بانتظام وفق الجدول المعتمد من الإدارة الفنية للنادي.</p>
    `,
    content: {},
  };

  const { error: repErr } = await supabase.from("reports").insert([sampleReport]);
  if (repErr) {
    console.error("Error inserting sample report:", repErr);
  } else {
    console.log("Successfully seeded sample report!");
  }
}

seed();
