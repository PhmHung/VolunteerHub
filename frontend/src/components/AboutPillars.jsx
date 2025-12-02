import React from "react";
import { Heart, Users, Globe, Award, Sparkles } from "lucide-react";

const fallbackPillars = [
  {
    icon: Heart,
    title: "Kết nối thiện nguyện",
    description:
      "VolunteerHub kết nối những trái tim yêu thương với các tổ chức uy tín, tạo điều kiện để mỗi đóng góp đều tạo nên hiệu quả thiết thực.",
  },
  {
    icon: Users,
    title: "Cộng đồng bền vững",
    description:
      "Chúng tôi xây dựng cộng đồng tình nguyện viên gắn kết, nơi mỗi cá nhân đều là nguồn cảm hứng và động lực cho người khác.",
  },
  {
    icon: Globe,
    title: "Tác động lan tỏa",
    description:
      "Mỗi hoạt động đều hướng đến việc tạo ra những thay đổi tích cực cho xã hội, môi trường và những người kém may mắn.",
  },
  {
    icon: Award,
    title: "Phát triển bản thân",
    description:
      "VolunteerHub đồng hành cùng mỗi tình nguyện viên trên hành trình học hỏi, trưởng thành và kiến tạo giá trị cho tương lai.",
  },
];

const AboutPillars = ({ pillars = fallbackPillars }) => {
  return (
    <section className="bg-surface-50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-text-main md:text-4xl">
            Những điều chúng tôi trân trọng
          </h2>
          <p className="mt-4 text-base text-text-secondary md:text-lg">
            VolunteerHub không chỉ là nguồn thông tin hoạt động thiện nguyện, mà còn là nơi chúng tôi xây dựng văn hóa chia sẻ, lan tỏa tình yêu thương và kết nối các trái tim thiện nguyện.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon || Sparkles;

            return (
              <article
                key={pillar.title}
                className="group h-full rounded-3xl border border-primary-200/15 bg-surface-white/80 p-8 shadow-lg shadow-primary-200/10 transition-all hover:-translate-y-1.5 hover:border-primary-200/30 hover:shadow-xl hover:shadow-primary-200/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  {pillar.tagline && (
                    <span className="rounded-full bg-secondary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-600">
                      {pillar.tagline}
                    </span>
                  )}
                </div>

                <h3 className="mt-6 text-xl font-semibold text-text-main">
                  {pillar.title}
                </h3>

                {pillar.description && (
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">
                    {pillar.description}
                  </p>
                )}

                {pillar.highlights?.length ? (
                  <ul className="mt-6 space-y-3">
                    {pillar.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3 text-sm text-text-secondary">
                        <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 text-warning-500" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutPillars;
