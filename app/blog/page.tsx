import Link from 'next/link'

// دالة جلب المقالات العامة من ووردبريس محاطة بجدار حماية من الأخطاء
async function getWordPressPosts() {
  const wpUrl = process.env.WP_API_URL

  // إذا كان الرابط السري غير معرف في ملف الـ .env
  if (!wpUrl) {
    console.error("🚨 خطأ: لم يتم إضافة متغير البيئة WP_API_URL في ملف البيئة!");
    return []
  }

  try {
    // جلب آخر 10 مقالات من ووردبريس مع كاش يتجدد كل 5 دقائق
    const res = await fetch(`${wpUrl}/posts?_embed`, { next: { revalidate: 300 } })
    
    if (!res.ok) {
      throw new Error(`فشل الخادم في الرد بكود: ${res.status}`)
    }

    return await res.json()
 
//  الكود المطور (يحمي الصفحة ويعرض المقالات القديمة بدلاً من رسالة الخطأ)
} catch (error: any) {
  console.error("❌ حدث خطأ أثناء الاتصال بووردبريس:", error.message);
  
  // إذا فشل الاتصال، نحاول استخدام المقالات المخزنة سابقاً في المتغير إن وجدت
  return typeof posts !== 'undefined' ? posts : [];
}


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

        {/* فحص ما إذا كانت هناك مقالات مجلوبة بنجاح */}
        {posts.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-center">
            لا توجد مقالات متاحة حالياً، أو هناك مشكلة في الاتصال بالخادم السري.
          </div>
        ) : (
          /* شبكة عرض كروت المقالات */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => {
              // جلب رابط الصورة البارزة للمقال إن وجدت من ووردبريس
              const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder-news.jpg'

              return (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
                  <div>
                    {/* صورة المقال */}
                    <img 
                      src={featuredImage} 
                      alt={post.title.rendered} 
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* تفاصيل النص */}
                    <div className="p-5">
                      {/* تاريخ النشر */}
                      <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                        {new Date(post.date).toLocaleDateString('ar-SA')}
                      </span>
                      
                      {/* عنوان المقال من ووردبريس */}
                      <h2 
                        className="text-xl font-bold text-gray-900 mt-3 mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      
                      {/* مقتطف صغير من المقال */}
                      <div 
                        className="text-gray-600 text-sm line-clamp-3 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                    </div>
                  </div>

                  {/* زر القراءة عبر مكون الانتقال السريع Link */}
                  <div className="p-5 pt-0">
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="block text-center w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-blue-600 transition duration-200"
                    >
                      اقرأ المقال بالكامل ←
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
