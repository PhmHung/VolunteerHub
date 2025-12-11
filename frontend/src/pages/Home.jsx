/** @format */

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
      description:
        "Khám phá hàng ngàn cơ hội tình nguyện đa dạng, từ các dự án bảo vệ môi trường, hỗ trợ giáo dục cho trẻ em vùng cao, đến các chiến dịch chăm sóc sức khỏe cộng đồng. Nền tảng của chúng tôi giúp bạn dễ dàng lọc và tìm thấy những hoạt động không chỉ phù hợp với kỹ năng, sở thích mà còn linh hoạt với quỹ thời gian của bạn. Hãy để đam mê dẫn lối và tìm đúng nơi bạn có thể tạo ra giá trị thiết thực nhất.",
      src: heroImage,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconColor: "text-white",
    },
    {
      icon: Users,
      title: "Chung tay cùng các tổ chức và đồng đội",
      description:
        "Tình nguyện là hành trình của sự kết nối. Tại đây, bạn có thể hợp tác chặt chẽ với các tổ chức phi lợi nhuận uy tín và gặp gỡ những người đồng đội có cùng chí hướng. Cùng nhau, chúng ta chia sẻ kinh nghiệm, học hỏi lẫn nhau và tham gia vào các dự án có tầm ảnh hưởng lớn, qua đó xây dựng một mạng lưới cộng đồng hỗ trợ lẫn nhau ngày càng vững mạnh và lan tỏa yêu thương.",
      src: heroImage,
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconColor: "text-white",
    },
    {
      icon: Calendar,
      title: "Ghi lại dấu ấn và quản lý hoạt động hiệu quả",
      description:
        "Dễ dàng quản lý lịch trình tình nguyện bận rộn của bạn với công cụ theo dõi cá nhân. Hệ thống cho phép bạn lưu lại các chương trình đã đăng ký, nhận thông báo nhắc nhở về sự kiện sắp tới và ghi lại những cột mốc quan trọng. Hãy nhìn lại hành trình của mình, đo lường số giờ đóng góp và thấy rõ sự thay đổi tích cực mà chính bạn đã mang lại cho cộng đồng.",
      src: heroImage,
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-100",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      iconColor: "text-white",
    },
  ];

  return (
    <div className='w-full'>
      {/* ==================== HERO SECTION - START (Full-width) ==================== */}
      {/* Pass `user` so Hero can decide auth buttons; openAuth is setAuthModal from App */}
      <Hero
        user={user}
        openAuth={openAuth}
        heroImage={heroImage}
        title='Connect your passion with VolunteerHub'
        subtitle='Discover hundreds of volunteer opportunities that match your interests.'
        primaryLabel={user ? "View profile" : "Join now"}
        secondaryLabel='I already have an account'
      />

      {/* ==================== FEATURES SECTIONS - ảnh ngang xen kẽ ==================== */}
      {features.map(({ icon, title, description, src }, index) => {
        const isEven = index % 2 === 0;
        const FeatureIcon = icon;
        return (
          <motion.section
            key={title}
            className='bg-surface-white py-12 sm:py-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}>
            <div className='w-full px-4 sm:px-6 lg:px-8'>
              <div
                className={`flex flex-col gap-6 ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center`}>
                {/* Ảnh - Chiếm nhiều không gian hơn */}
                <div className='w-full lg:w-[45%]'>
                  <img
                    src={src}
                    alt={title}
                    className='w-full h-[400px] sm:h-[500px] rounded-3xl shadow-2xl object-cover'
                  />
                </div>

                {/* Nội dung - Rộng hơn */}
                <div className='w-full lg:w-[55%] px-4 sm:px-8'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-4 rounded-full bg-primary-100 text-primary-600'>
                      <FeatureIcon className='h-7 w-7' />
                    </div>
                  </div>
                  <h2 className='text-3xl font-bold text-text-main mb-6'>
                    {title}
                  </h2>
                  <p className='text-base text-text-secondary leading-relaxed'>
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        );
      })}

      {/* ==================== SLIDER SECTION ==================== */}
      <section className='bg-surface-50 py-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <Slider />
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <motion.section
        className='bg-surface-white py-20 px-6 sm:px-12 lg:px-20'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-text-main'>
            Làm thế nào để tham gia với chúng tôi
          </h2>
          <p className='mt-4 text-lg text-text-secondary'>
            Kết nối đam mê của bạn với các dự án cộng đồng. Bắt đầu hành trình
            tạo nên sự thay đổi ngay hôm nay.
          </p>
          <div className='mt-8'>
            {user ? (
              <Link
                to='/information'
                className='inline-flex items-center gap-2 rounded-full btn-primary px-8 py-4 text-lg font-semibold transition-all hover:shadow-lg active:scale-95'>
                Xem hồ sơ
                <ArrowRight className='h-5 w-5' />
              </Link>
            ) : (
              <button
                onClick={() => openAuth("register")}
                className='inline-flex items-center gap-2 rounded-full btn-primary px-8 py-4 text-lg font-semibold transition-all hover:shadow-lg active:scale-95'>
                Tạo tài khoản
                <ArrowRight className='h-5 w-5' />
              </button>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
