import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Activity, Stethoscope, Shield,
  Award, Globe, Clock, ChevronRight, PhoneCall,
  CalendarDays, Sparkles, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

import MainNav from '../components/MainNav';
import HeroSection from '../components/landing/HeroSection';
import QuickActions from '../components/landing/QuickActions';
import HealthNewsFeed from '../components/landing/HealthNewsFeed';
import PatientStoriesSection from '../components/landing/PatientStoriesSection';
import FAQAccordion from '../components/landing/FAQAccordion';
import ChatWidget from '../components/landing/ChatWidget';
import { API_BASE_URL } from '../services/api';

const WHY_CHOOSE = [
  { icon: Shield, label: 'Clinically Safe AI', desc: 'AI checked against clinical ranges with source citations.' },
  { icon: Globe,  label: 'Real Data Only',    desc: 'No fake statistics or hardcoded counter logs.' },
  { icon: Clock,  label: '24/7 Availability', desc: 'Upload documents and get reports analyzed instantly.' },
  { icon: Award,  label: 'Privacy First',      desc: 'HIPAA-compliant document pipelines and encryption.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          setUserLat(lat);
          setUserLon(lon);
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' }, timeout: 6000 }
          );
          const addr = res.data?.address || {};
          const city = addr.city || addr.town || addr.village || '';
          const state = addr.state || '';
          setUserAddress(city ? `${city}, ${state}` : state);
        } catch { /* ignore */ }
      },
      () => { /* denied */ }
    );
  }, []);

  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main pb-0">
      <MainNav detectedState="" userLat={userLat} userLon={userLon} />

      {/* Hero */}
      <HeroSection
        detectedAddress={userAddress}
        onBookAppointment={() => navigate('/login')}
      />

      {/* Bento action deck */}
      <QuickActions />

      {/* Enterprise values (Bento-style choose grid) */}
      <section className="py-24 bg-bg-surface relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Enterprise Standards</p>
            <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight leading-none text-gray-900 dark:text-white">
              Built on Clinical Integrity
            </h2>
            <p className="text-gray-500 mt-4 text-sm font-medium">
              We replace standard filler components with verified healthcare metrics and secure frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
            {WHY_CHOOSE.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-bg-surface border border-border-subtle rounded-3xl p-7 flex flex-col justify-between items-start hover-lift shadow-sm"
                >
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base">{val.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">{val.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <PatientStoriesSection apiBase={API_BASE_URL} />

      {/* News Feed */}
      <HealthNewsFeed count={6} />

      {/* FAQs */}
      <FAQAccordion />

      {/* Enterprise Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-24 pb-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {[
              {
                heading: 'For Patients',
                links: ['Upload Lab Report', 'Find Local Hospitals', 'Order Medicines', 'Personal Dashboard'],
                tos: ['/analysis', '/hospitals', '/medicines', '/dashboard'],
              },
              {
                heading: 'Services',
                links: ['AI Report Summary', 'Consult Doctor', 'Specialty Center', 'Emergency Contacts'],
                tos: ['/analysis', '/hospitals', '/services', '/'],
              },
              {
                heading: 'Legal & Info',
                links: ['Privacy Policy', 'Terms of Service', 'HIPAA Guidelines', 'Partner Network'],
                tos: ['/', '/', '/', '/'],
              },
              {
                heading: 'Platform',
                links: ['Developer API', 'MCP Registries', 'Serena Assistant', 'Careers'],
                tos: ['/', '/', '/', '/'],
              },
            ].map(({ heading, links, tos }) => (
              <div key={heading} className="space-y-5">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-widest">{heading}</h4>
                <ul className="space-y-3.5 text-xs sm:text-sm font-semibold">
                  {links.map((link, i) => (
                    <li key={link}>
                      <Link to={tos[i]} className="hover:text-white transition duration-200">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-5 text-[11px] font-bold uppercase tracking-wider text-gray-650">
            <div className="flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-brand fill-brand" />
              <span>© {new Date().getFullYear()} Tony Health Platforms</span>
            </div>
            <span className="text-center md:text-right">
              Emergency assistance hotline: 🚨 Dial 102
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}
