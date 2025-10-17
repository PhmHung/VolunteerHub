import { motion } from "framer-motion";
import { Heart, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import heroImage from "../assets/hd1.png";
import Hero from "../components/Hero.jsx";
export default function Home({ token, openAuth }) {

  const features = [
    {
      icon: Heart,
      title: "Match with causes",
      description: "Find volunteer opportunities that resonate with your interests and availability.",
      src: heroImage,
    },
    {
      icon: Users,
      title: "Grow communities",
      description: "Collaborate with local organizations and meet peers who care just like you do.",
      src: heroImage,
    },
    {
      icon: Calendar,
      title: "Track your impact",
      description: "Stay organized with upcoming events, saved programs, and personal milestones.",
      src: heroImage,
    },
  ];

  return (
    <div className="w-full">
      {/* ==================== HERO SECTION - START (Full-width) ==================== */}
      <Hero token={token} openAuth={openAuth} />
      {/* ==================== HERO SECTION - END ==================== */}

      {/* Content Full-width */}
      <div className="w-full px-6 sm:px-12 lg:px-20 py-10">
        <div className="flex flex-col gap-10 pb-12">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon, title, description, src }) => (
              <Card key={title} icon={icon} title={title} description={description} src={src} />
            ))}
          </section>

          <motion.section
            className="rounded-3xl border border-[#A8D0E6]/70 bg-white/70 p-8 text-center shadow-lg shadow-blue-200/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
        >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Your community is waiting.</h2>
        <p className="mt-3 text-base text-slate-600">
          Start exploring opportunities, connect with organizers, and discover new ways to give back.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {token ? (
            <Link
              to="/information"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-base font-semibold text-white hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/50 active:scale-95 transition-all shadow-lg"
            >
              View profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => openAuth("register")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-base font-semibold text-white hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/50 active:scale-95 transition-all shadow-lg"
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
