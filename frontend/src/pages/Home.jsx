import { motion } from "framer-motion";
import { Heart, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import heroImage from "../assets/hd1.png";
import Hero from "../components/Hero.jsx";
import Slider from "../components/Slider.jsx";

export default function Home({ user, openAuth }) {

  const features = [
    {
      icon: Heart,
      title: "Tìm kiếm cơ hội phù hợp với đam mê của bạn",
      description: "Khám phá hàng ngàn cơ hội tình nguyện đa dạng, từ các dự án bảo vệ môi trường, hỗ trợ giáo dục cho trẻ em vùng cao, đến các chiến dịch chăm sóc sức khỏe cộng đồng. Nền tảng của chúng tôi giúp bạn dễ dàng lọc và tìm thấy những hoạt động không chỉ phù hợp với kỹ năng, sở thích mà còn linh hoạt với quỹ thời gian của bạn. Hãy để đam mê dẫn lối và tìm đúng nơi bạn có thể tạo ra giá trị thiết thực nhất.",
      src: heroImage,
    },
    {
      icon: Users,
      title: "Chung tay cùng các tổ chức và đồng đội",
      description: "Tình nguyện là hành trình của sự kết nối. Tại đây, bạn có thể hợp tác chặt chẽ với các tổ chức phi lợi nhuận uy tín và gặp gỡ những người đồng đội có cùng chí hướng. Cùng nhau, chúng ta chia sẻ kinh nghiệm, học hỏi lẫn nhau và tham gia vào các dự án có tầm ảnh hưởng lớn, qua đó xây dựng một mạng lưới cộng đồng hỗ trợ lẫn nhau ngày càng vững mạnh và lan tỏa yêu thương.",
      src: heroImage,
    },
    {
      icon: Calendar,
      title: "Ghi lại dấu ấn và quản lý hoạt động hiệu quả",
      description: "Dễ dàng quản lý lịch trình tình nguyện bận rộn của bạn với công cụ theo dõi cá nhân. Hệ thống cho phép bạn lưu lại các chương trình đã đăng ký, nhận thông báo nhắc nhở về sự kiện sắp tới và ghi lại những cột mốc quan trọng. Hãy nhìn lại hành trình của mình, đo lường số giờ đóng góp và thấy rõ sự thay đổi tích cực mà chính bạn đã mang lại cho cộng đồng.",
      src: heroImage,
    },
  ];

  return (
    <div className="w-full">
      {/* ==================== HERO SECTION - START (Full-width) ==================== */}
      {/* Pass `user` so Hero can decide auth buttons; openAuth is setAuthModal from App */}
      <Hero
        user={user}
        openAuth={openAuth}
        heroImage={heroImage}
        title="Kết nối đam mê với VolunteerHub"
        subtitle="Khám phá hàng trăm hoạt động tình nguyện phù hợp với bạn."
        primaryLabel={user ? "Xem trang cá nhân" : "Tham gia ngay"}
        secondaryLabel="Tôi đã có tài khoản"
      />
      {/* ==================== HERO SECTION - END ==================== */}

      {/* Content Full-width */}
      <motion.section
        className="p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-slate-900">Join us in making a difference.</h2>
        <p className="mt-2 text-base text-slate-600">
          Your skills and passions can help shape a better future for our community.
        </p>
      </motion.section>
      <div className="w-full px-6 sm:px-12 lg:px-20 py-10">
        <div className="flex flex-col gap-10 pb-12">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon, title, description, src }) => (
              <Card key={title} icon={icon} title={title} description={description} src={src} />
            ))}
          </section>
          <Slider />
          <motion.section
            className="rounded-3xl border border-[#A8D0E6]/70 bg-white/70 p-8 text-center shadow-lg shadow-blue-200/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Làm thế nào để tham gia với chúng tôi
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Kết nối đam mê của bạn với các dự án cộng đồng. Bắt đầu hành trình tạo nên sự thay đổi ngay hôm nay.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link
                  to="/information"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-base font-semibold text-white transition-all hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/50 active:scale-95 shadow-lg"
                >
                  View profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-base font-semibold text-white transition-all hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/50 active:scale-95 shadow-lg"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
