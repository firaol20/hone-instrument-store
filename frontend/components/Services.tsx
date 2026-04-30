"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/lang-store";
import {
  Wrench,
  Truck,
  Speaker,
  Construction,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

export const Services = () => {
  const sectionText = {
    label: "Hone Services",
    title: "Comprehensive",
    titleHighlight: "Music Solutions.",
    cta: "Learn More",
    services: [
      {
        title: "Instrument Sales",
        description:
          "Premium selection of all musical instruments with global delivery service.",
      },
      {
        title: "Sound & Lighting",
        description:
          "Professional sound systems and stage lighting available for sale or rental.",
      },
      {
        title: "Studio & Production",
        description:
          "High-end studio equipment sales and certified music production courses.",
      },
      {
        title: "Acoustic Engineering",
        description:
          "Professional soundproofing solutions and acoustic treatment for any space.",
      },
      {
        title: "Maintenance",
        description:
          "Expert restoration and maintenance to keep your gear in peak condition.",
      },
      {
        title: "Free Consultancy",
        description:
          "Expert advice on gear selection and setup at no cost to you.",
      },
    ],
  };

  const serviceIcons = [
    <Truck key="delivery" className="w-6 h-6 text-orange-600" />,
    <Speaker key="sound" className="w-6 h-6 text-orange-600" />,
    <GraduationCap key="course" className="w-6 h-6 text-orange-600" />,
    <Construction key="proof" className="w-6 h-6 text-orange-600" />,
    <Wrench key="wrench" className="w-6 h-6 text-orange-600" />,
    <HeartHandshake key="consult" className="w-6 h-6 text-orange-600" />,
  ];

  return (
    <section
      id="services"
      className="pt-10 md:pt-12 pb-10 md:pb-12 bg-slate-50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-200/20 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16 md:mb-24 flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="h-[2px] w-8 bg-orange-600" />
            <span className="text-orange-600 font-black uppercase tracking-[0.4em] text-[10px]">
              {sectionText.label}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]"
          >
            {sectionText.title}
            <br className="hidden md:block" />
            <span className="text-orange-600">
              {sectionText.titleHighlight}
            </span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {sectionText.services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-full"
            >
              <div className="relative h-full p-6 md:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-orange-600/10 group-hover:border-orange-200 group-hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-500 ease-out">
                    <div className="group-hover:text-white group-hover:rotate-[10deg] transition-all duration-500">
                      {serviceIcons[index]}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                    {service.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed font-medium mb-6 flex-grow">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors">
                      {sectionText.cta}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};