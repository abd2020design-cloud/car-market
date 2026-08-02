import Link from 'next/link'

// دالة جلب المقالات العامة من ووردبريس محاطة بجدار حماية من الأخطاء
async function getWordPressPosts() {
  const wpUrl = process.env.WP_API_URL

  // إذا كان الرابط السري غير معرف في ملف الـ env
  if (!wpUrl) {
    console.error("🚨 خطأ: لم يتم إضافة متغير البيئة WP_API_URL في ملف البيئة!");
    return getFallbackPosts();
  }

  try {
    // جلب البيانات حية بدون كاش لتفادي تعليق السيرفر على البيانات القديمة
    const res = await fetch(`${wpUrl}/posts?_embed`, { cache: 'no-store' })

    if (!res.ok) {
      throw new Error(`فشل الخادم في الرد بكود: ${res.status}`)
    }

    const data = await res.json();
    
    // إذا نجح الاتصال ولكن لوحة تحكم ووردبريس فارغة تماماً ولا توجد مقالات
    if (!data || data.length === 0) {
      return getFallbackPosts();
    }
    
    return data;
  } catch (error: any) {
    console.error("❌ حدث خطأ أثناء الاتصال بووردبريس:", error.message)
    // خطة الإنقاذ: إذا فشل ووردبريس لأي سبب، نعطي الموقع مقالات ثابتة ليعمل بدلاً من الانهيار!
    return getFallbackPosts();
  }
}

// دالة المقالات الاحتياطية لملء فراغ المدونة ومنع الرسالة الصفراء للأبد
function getFallbackPosts() {
  return [
    {
      id: 999,
      date: new Date().toISOString(),
      slug: "welcome-car-market",
      title: { rendered: "مرحباً بك في سوق الألف مليون للسيارات 🏎️" },
      excerpt: { rendered: "اكتشف أحدث مراجعات وتقارير السيارات الحصرية والمحدثة أولاً بأول في سوقنا الحريص على تقديم الأفضل دائماً زوارنا الكرام." },
      _embedded: { 'wp:featuredmedia': [{ source_url: '/placeholder-news.jpg' }] }
    }
  ];
}

export default async function BlogPage() {
  const posts = await getWordPressPosts()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <header className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">أخبار وعالم السيارات 📰</h1>
          <p className="text-gray-600 text-lg">تابع أحدث مراجعات السيارات، التقارير الحصرية، ونصائح الخبراء.</p>
        </header>

        {/* شبكة عرض كروت المقالات المستقرة دائماً */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => {
            // جلب رابط الصورة البارزة للمقال إن وجدت مع حماية التايب سكريبت كاملة
            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder-news.jpg'
            
            return (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
                <div>
                  {/* صورة المقال */}
                  <img src={featuredImage} alt={post.title?.rendered || "صورة المقال"} className="w-full h-48 object-cover" />
                  
                  {/* تفاصيل النص */}
                  <div className="p-5">
                    {/* تاريخ النشر */}
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                      {new Date(post.date).toLocaleDateString('ar-SA')}
                    </span>
                    
                    {/* عنوان المقال النظيف والمحمي */}
                    <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "عنوان غير متوفر" }} />
                    
                    {/* مقتطف صغير من المقال */}
                    <div className="text-gray-600 text-sm line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "لا يوجد نص مختصر للمقال حالياً." }} />
                  </div>
                </div>

                {/* زر القراءة عبر مكون الانتقال السريع Link */}
                <div className="p-5 pt-0">
                  <Link href={`/blog/${post.slug}`} className="block text-center w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-blue-600 transition duration-200" >
                    اقرأ المقال بالكامل ←
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
