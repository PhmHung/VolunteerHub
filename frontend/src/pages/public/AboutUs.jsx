import { motion } from "framer-motion";
import {
  Heart,
  Users,
  ArrowRight,
  ShieldCheck,
  Handshake,
  Star,
  Leaf,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroAbout from "../../assets/hd3.png";
import Hero from "../../components/home/Hero.jsx";
import Slider from "../../components/common/Slider.jsx";
import AboutPillars from "../../components/home/AboutPillars.jsx";
import CoreValuesSection from "../../components/home/CoreValuesSection.jsx";
import ContactSection from "../../components/home/ContactSection.jsx";
import FAQSection from "../../components/home/FAQSection.jsx";

export default function About({ user, openAuth }) {
  const pillars = [
    {
      icon: Heart,
      title: "Tầm nhìn đến 2030",
      tagline: "Lan tỏa cơ hội bình đẳng cho mọi cộng đồng dễ bị tổn thương",
      description:
        "Chúng tôi xây dựng hệ sinh thái tình nguyện bền vững, nơi trẻ em và phụ nữ ở mọi vùng miền đều được tiếp cận với y tế, giáo dục và những cơ hội phát triển dài hạn.",
      highlights: [
        "32 tỉnh thành đã có dấu chân các dự án tình nguyện",
        "2 triệu giờ đóng góp mỗi năm bởi mạng lưới tình nguyện viên",
        "90% chương trình duy trì tác động sau 12 tháng triển khai",
      ],
      accent: "from-warning-200 via-danger-300 to-success-200",
    },
    {
      icon: Users,
      title: "Sứ mệnh mỗi ngày",
      tagline: "Kết nối nguồn lực – Bồi đắp kỹ năng – Nuôi dưỡng cộng đồng",
      description:
        "VolunteerHub thiết kế các chương trình linh hoạt, đặt người thụ hưởng ở trung tâm và đồng hành cùng đối tác địa phương để giải quyết bài toán y tế, giáo dục và sinh kế một cách toàn diện.",
      highlights: [
        "Học bổng STEAM & kỹ năng mềm cho thanh thiếu niên",
        "Phòng khám lưu động chăm sóc sức khỏe phụ nữ và trẻ em",
        "Quỹ khẩn cấp hỗ trợ thiên tai, kích hoạt trong 48 giờ",
      ],
      accent: "from-secondary-200 via-secondary-600 to-secondary-900",
    },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      title: "Trách nhiệm",
      description:
        "Cam kết bảo vệ quyền lợi của cộng đồng và minh bạch trong mọi hoạt động vận hành.",
    },
    {
      icon: Handshake,
      title: "Kết nối",
      description:
        "Nuôi dưỡng mạng lưới đối tác và tình nguyện viên để cùng tạo nên sức mạnh tập thể.",
    },
    {
      icon: Star,
      title: "Xuất sắc",
      description:
        "Không ngừng cải tiến chương trình và theo dõi tác động để đem đến trải nghiệm tốt nhất.",
    },
    {
      icon: Leaf,
      title: "Bền vững",
      description:
        "Thiết kế giải pháp dài hạn, thân thiện với môi trường và phù hợp với địa phương.",
    },
    {
      icon: Globe,
      title: "Lan tỏa",
      description:
        "Chia sẻ kiến thức, câu chuyện truyền cảm hứng để khuyến khích cộng đồng cùng hành động.",
    },
  ];

  const contactMethods = [
    {
      icon: MapPin,
      label: "Văn phòng",
      value: "Tầng 12, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    },
    {
      icon: Phone,
      label: "Điện thoại",
      value: "+84 28 1234 5678",
      href: "tel:+842812345678",
    },
    {
      icon: Mail,
      label: "Email",
      value: "hello@volunteerhub.org",
      href: "mailto:hello@volunteerhub.org",
    },
    {
      icon: Clock,
      label: "Giờ làm việc",
      value: "Thứ 2 - Thứ 6 | 8:30 - 17:30",
    },
  ];

  const faqs = [
    {
      question: "Tôi cần chuẩn bị gì để tham gia tình nguyện?",
      answer:
        "Chúng tôi sẽ gửi hướng dẫn chi tiết về yêu cầu kỹ năng, thời gian và trách nhiệm cho từng chương trình. Bạn chỉ cần mang theo tinh thần sẵn sàng học hỏi và hỗ trợ cộng đồng.",
    },
    {
      question: "Volunteer Hub hoạt động ở những khu vực nào?",
      answer:
        "Mạng lưới dự án của chúng tôi trải dài 32 tỉnh thành. Bạn có thể chọn tham gia tại địa phương hoặc đăng ký chương trình trực tuyến tùy khả năng.",
    },
    {
      question: "Tôi có thể đóng góp ngoài việc tình nguyện trực tiếp không?",
      answer:
        "Hoàn toàn có thể. Bạn có thể tham gia gây quỹ, hỗ trợ chuyên môn hoặc giới thiệu đối tác để mở rộng tác động của Volunteer Hub.",
    },
    {
      question: "Thông tin cá nhân của tôi có được bảo mật không?",
      answer:
        "Chúng tôi tuân thủ các nguyên tắc bảo mật dữ liệu và chỉ sử dụng thông tin của bạn cho mục đích kết nối hoạt động tình nguyện đã đăng ký.",
    },
  ];

  return (
    <div className="w-full">
      <Hero
        user={user}
        openAuth={openAuth}
        heroImage={heroAbout}
        title="Chúng tôi là ai"
        subtitle="Được thành lập năm 2006, Volunteer Hub là một tổ chức phi lợi nhuận được cấp phép tại Mỹ và hoạt động tại Việt Nam. Sứ mệnh của Volunteer Hub là tạo ra các giải pháp về sức khỏe và giáo dục nhằm thay đổi cuộc sống của trẻ em và phụ nữ có hoàn cảnh khó khăn tại Việt Nam. Các hoạt động của Volunteer Hub giúp thay đổi cuộc sống của hàng triệu người Việt trên khắp 32/34 tỉnh thành mỗi năm."
        primaryLabel="Khám phá câu chuyện"
        primaryAction={() =>
          document.getElementById("our-story")?.scrollIntoView({ behavior: "smooth" })
        }
        showSecondary={false}
        contentAlign="left"
      />

      <motion.section
        id="our-story"
        className="px-4 py-12 text-center sm:px-10 lg:px-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-text-main">Cùng nhau tạo ra sự khác biệt.</h2>
        <p className="mt-2 text-base text-text-secondary">
          Kỹ năng và đam mê của bạn có thể giúp định hình một tương lai tốt đẹp hơn cho cộng đồng của chúng ta.
        </p>
      </motion.section>

  <div className="w-full px-4 py-10 sm:px-8 lg:px-20">
        <div className="flex flex-col gap-10 pb-12">
          <AboutPillars pillars={pillars} />

          <CoreValuesSection coreValues={coreValues} />

          <Slider />

          <ContactSection contactMethods={contactMethods} user={user} openAuth={openAuth} />

          <FAQSection faqs={faqs} />

          <motion.section
            className="rounded-3xl border border-primary-200/70 bg-surface-white/70 p-6 text-center shadow-lg shadow-primary-200/30 sm:p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
              Làm thế nào để tham gia với chúng tôi
            </h2>
            <p className="mt-3 text-base text-text-secondary">
              Kết nối đam mê của bạn với các dự án cộng đồng. Bắt đầu hành trình tạo nên sự thay đổi ngay hôm nay.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link
                  to="/information"
                  className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:shadow-primary-400/20 active:scale-95"
                >
                  View profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => openAuth("register")}
                  className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:shadow-primary-400/20 active:scale-95"
                >
                  Tạo tài khoản
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
