import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, PhoneCall, CalendarDays, Stethoscope, 
  ChevronDown, MessageSquareHeart, Activity,
  FileText, ArrowRight, UserPlus, FileSearch, Building2, MapPin
} from 'lucide-react';
import AuthModal from '../components/AuthModal';
import MainNav from '../components/MainNav';
import axios from 'axios';

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [userState, setUserState] = useState('--Select--');
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Hello! I am Tony, your AI Health assistant. How can I help you today?' }
  ]);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [statesList] = useState(['Delhi', 'Punjab', 'Haryana', 'Rajasthan', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat']);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLat(latitude);
          setUserLon(longitude);
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const stateName = res.data.address.state;
          if (stateName) {
            setUserState(stateName);
          }
        } catch (error) {
          console.error("Error fetching location", error);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* --- Phase 1: Navigation Hierarchy --- */}
      
      {/* 1. TopNav */}
      <div className="bg-gray-50 border-b border-gray-100 text-xs py-2 px-6 flex justify-between items-center hidden md:flex">
        <div className="flex space-x-6 text-gray-500 font-medium">
          <Link to="/analysis" className="hover:text-brand transition">Find a Doctor</Link>
          <Link to="/analysis" className="hover:text-brand transition">Investors</Link>
          <Link to="/analysis" className="hover:text-brand transition">About us</Link>
          <Link to="/analysis" className="hover:text-brand transition">Careers</Link>
          <Link to="/analysis" className="hover:text-brand transition">CSR</Link>
          <Link to="/analysis" className="hover:text-brand transition">Contact us</Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <select 
              value={userState}
              onChange={(e) => setUserState(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer hover:text-brand font-medium"
            >
              <option>--Select--</option>
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="text-gray-500 hover:text-brand"><Search className="w-4 h-4" /></button>
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-brand">
            <Activity className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 2. MainNav */}
      <MainNav detectedState={userState} userLat={userLat} userLon={userLon} />

      {/* 3. ActionBar */}
      <div className="bg-gray-50 border-b border-gray-200 py-3 px-4 flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <button 
          onClick={() => {
            setCallbackSuccess(false);
            setCallbackName('');
            setCallbackPhone('');
            setIsCallbackOpen(true);
          }}
          className="flex items-center gap-2 text-slate-600 hover:text-brand transition"
        >
          <PhoneCall className="w-4 h-4" /> Request a Callback
        </button>
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="flex items-center gap-2 bg-red-100 text-brand px-6 py-1.5 rounded-full hover:bg-brand hover:text-white transition-colors"
        >
          <CalendarDays className="w-4 h-4" /> Book Appointment
        </button>
        <Link to="/services?tab=checkups" className="flex items-center gap-2 text-slate-600 hover:text-brand transition">
          <Stethoscope className="w-4 h-4" /> Get Health Checkup
        </Link>
      </div>

      {/* --- Phase 2: Hero & Quick Links --- */}
      
      {/* 4. Hero Section */}
      <div className="relative min-h-[300px] md:h-[500px] w-full flex flex-col items-center justify-center bg-slate-100 overflow-hidden">
        {/* Placeholder for actual background image of doctors */}
        <img 
          src="https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop" 
          alt="Doctors" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/40"></div>
        
        {/* Hero Text Box */}
        <div className="relative z-10 bg-white/80 backdrop-blur-md px-4 py-6 md:px-12 md:py-8 rounded-2xl shadow-xl border border-white/50 text-center max-w-4xl mx-4">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Healthcare for Good<br/>Today. Tomorrow. Always
          </h1>
        </div>

        {/* Search Bar Overlay */}
        <div className="relative z-10 mt-8 w-full max-w-3xl px-6">
          <div className="bg-white rounded-full flex items-center p-2 shadow-2xl">
            <input 
              type="text" 
              placeholder="Search for Doctors, Specialities and Hospitals" 
              className="flex-1 bg-transparent px-6 py-3 text-lg outline-none text-slate-700"
            />
            <button className="bg-brand text-white p-4 rounded-full hover:bg-brand-dark transition">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 & 6. Quick Actions & Help Book Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div 
              onClick={() => setIsAuthOpen(true)}
              className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer rounded-2xl p-6 transition flex justify-between items-start group border border-yellow-100"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand transition">Book an Appointment</h3>
                <p className="text-sm text-slate-600">With country's leading experts</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>

            <Link to="/hospitals" className="bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-2xl p-6 transition flex justify-between items-start group border border-blue-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand transition">Hospitals</h3>
                <p className="text-sm text-slate-600">Health needs under one roof</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
            </Link>

            <Link to="/analysis" className="bg-indigo-50 hover:bg-indigo-100 cursor-pointer rounded-2xl p-6 transition flex justify-between items-start group border border-indigo-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand transition">Specialities</h3>
                <p className="text-sm text-slate-600">Our expertise in Healthcare</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Activity className="w-6 h-6" />
              </div>
            </Link>

            <div 
              onClick={() => setIsAuthOpen(true)}
              className="bg-red-50 hover:bg-red-100 cursor-pointer rounded-2xl p-6 transition flex justify-between items-start group border border-red-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-brand transition">Doctors</h3>
                <p className="text-sm text-slate-600">Top experts for your health</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-brand">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* We can help you book */}
          <div className="xl:w-1/3">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">We can help you book</h2>
            <div className="flex gap-4">
              <Link 
                to="/services?tab=checkups"
                className="flex-1 bg-white border border-gray-200 hover:border-brand rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm hover:shadow-md">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800">Health Checkups</h4>
              </Link>
              <Link 
                to="/services?tab=tests"
                className="flex-1 bg-white border border-gray-200 hover:border-brand rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm hover:shadow-md">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4">
                  <FileSearch className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800">Tests & Services</h4>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- Phase 3: Content & Imagery --- */}

      {/* 7. Promotional Banners (Scrollable) */}
      <div className="container mx-auto px-6 mb-20 overflow-x-auto pb-4">
        <div className="flex gap-6 w-max">
          <div className="w-[280px] md:w-[400px] h-[200px] rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Psychiatry<br/>& De-addiction Hospital</h3>
              <p className="text-indigo-200 text-sm mb-4">Personalised inpatient treatment</p>
              <button className="bg-white text-indigo-900 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                Discover Adayu <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-50 mix-blend-overlay" alt="" />
          </div>

          <div className="w-[280px] md:w-[400px] h-[200px] rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-50 p-8 relative overflow-hidden shadow-lg border border-emerald-100 flex items-center">
            <div className="relative z-10 w-full text-center">
              <h1 className="text-7xl font-black text-emerald-600 drop-shadow-md">20</h1>
              <p className="text-emerald-800 font-bold uppercase tracking-widest mt-2">Years of Trusted Care</p>
            </div>
          </div>

          <div className="w-[280px] md:w-[400px] h-[200px] rounded-2xl bg-gradient-to-r from-amber-900 to-red-900 p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-center">
            <h3 className="text-2xl font-black uppercase tracking-wide leading-tight mb-2">The Future of Care<br/>Now Expanding</h3>
            <span className="bg-brand text-white text-xs font-bold px-3 py-1 self-start rounded">UNVEILING SOON</span>
          </div>
        </div>
      </div>

      {/* 8. Stories & Breakthroughs */}
      <div className="bg-slate-50 py-20 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            <div className="lg:w-1/4">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Breakthrough Cases</h2>
              <Link to="/patient-corner?tab=breakthroughs" className="inline-block border border-brand text-brand font-bold px-8 py-2.5 rounded-full hover:bg-brand hover:text-white transition">
                View all
              </Link>
            </div>
            <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 leading-tight">Patient Recovers After Rare Combined Cardiac and Liver Transplant...</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-3">Tony Health successfully performed a rare, combined liver transplant for a patient suffering from advanced liver failure and cardiac complications.</p>
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 fill-brand text-brand" />
                  <div className="text-sm font-semibold text-gray-500">Tony Hospital,<br/>Central Branch</div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 leading-tight">Advanced Ewing Sarcoma Success: Patient Recovers Following Complex Oncology...</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-3">A multi-disciplinary approach led to the complete remission of a complex sarcoma tumor in a young adult patient.</p>
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 fill-brand text-brand" />
                  <div className="text-sm font-semibold text-gray-500">Tony Hospital,<br/>North Branch</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/4">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Patient's Stories</h2>
              <Link to="/patient-corner?tab=stories" className="inline-block border border-brand text-brand font-bold px-8 py-2.5 rounded-full hover:bg-brand hover:text-white transition">
                View all
              </Link>
            </div>
            <div className="lg:w-3/4">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-red-50 border-[6px] border-white shadow-xl flex-shrink-0 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Patient" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <MessageSquareHeart className="w-12 h-12 text-brand/20 mb-4" />
                  <p className="text-slate-600 text-lg leading-relaxed italic">
                    "After 20 years of struggle, my recovery journey reflects hope and resilience. Brought to Tony Health in critical condition with cardiac complications, I received expert multi-specialty care leading to a remarkable recovery."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Feel Free to ask us */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-800 mb-10">Feel Free to ask us</h2>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
            <div className="bg-teal-50 rounded-3xl overflow-hidden relative h-64 mb-4">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" alt="Ask Question" className="w-full h-full object-cover"/>
            </div>
            <div className="bg-white border border-gray-200 rounded-full p-2 flex shadow-sm">
              <input type="text" placeholder="Ask your question" className="flex-1 px-4 outline-none text-slate-700" />
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-brand transition"><Search className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="lg:w-2/3 space-y-4">
            {[
              {
                title: 'About Us',
                content: 'Tony Health is a premier multi-specialty healthcare provider dedicated to bringing state-of-the-art medical services, advanced robotic surgeries, and personalized genomic medicine to patients worldwide. Driven by innovation, excellence, and empathy, we strive to touch lives and restore hope.'
              },
              {
                title: 'Patient Care and Services',
                content: 'We prioritize patient comfort and convenience. Our services include 24/7 emergency response, digitized medical records accessible via the personal Dashboard, remote consultations, home checkups, and comprehensive post-operative care support.'
              },
              {
                title: 'Statutory Compliances',
                content: 'Tony Health strictly complies with international medical protocols, safety standards, and local healthcare regulations. All clinical diagnostic labs, pharmacy services, and medical procedures are licensed under governing bodies to guarantee the highest quality care.'
              },
              {
                title: 'Clinical Outcomes',
                content: 'Our clinical outcomes speak for themselves. With a 98.4% success rate in complex cardiac interventions and robotic-assisted surgeries, we lead the industry in surgical success, patient survival rates, and minimization of post-operative complications.'
              }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-white shadow-sm hover:shadow-md">
                <div 
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="p-6 flex justify-between items-center cursor-pointer group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-brand transition-colors">{faq.title}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-brand transition-transform duration-300 ${activeFAQ === i ? 'rotate-180' : ''}`} />
                </div>
                <div className={`grid transition-all duration-300 ease-in-out ${activeFAQ === i ? 'grid-rows-[1fr] border-t border-gray-100' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="p-6 text-sm text-slate-600 leading-relaxed bg-slate-50">
                      {faq.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Phase 4: Footer --- */}
      <footer className="bg-slate-50 border-t border-gray-200 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="font-bold text-slate-900 mb-6">For Patients</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><Link to="/analysis" className="hover:text-brand transition">Find a Doctor</Link></li>
                <li><Link to="/services?tab=checkups" className="hover:text-brand transition">Health Check Packages</Link></li>
                <li><Link to="/patient-corner?tab=stories" className="hover:text-brand transition">Patient Testimonials</Link></li>
                <li><Link to="/services" className="hover:text-brand transition">Immigration Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Centers of Excellence</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><Link to="/analysis" className="hover:text-brand transition">Tony Institute of Genomic Medicine</Link></li>
                <li><Link to="/analysis" className="hover:text-brand transition">Tony Cancer Institute</Link></li>
                <li><Link to="/analysis" className="hover:text-brand transition">Tony Institute of Robotic Surgery</Link></li>
                <li><Link to="/analysis" className="hover:text-brand transition">Centre for Gynae Oncology</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Policies</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><Link to="/dashboard" className="hover:text-brand transition">Privacy Policy</Link></li>
                <li><Link to="/services" className="hover:text-brand transition">Online Payment &amp; Refund Policy</Link></li>
                <li><Link to="/dashboard" className="hover:text-brand transition">Terms &amp; Conditions</Link></li>
                <li><Link to="/dashboard" className="hover:text-brand transition">Anti-Bribery Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Medical Procedures</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><Link to="/services?tab=tests" className="hover:text-brand transition">Car-T Cell Therapy</Link></li>
                <li><Link to="/services?tab=tests" className="hover:text-brand transition">Gamma Knife Radiosurgery</Link></li>
                <li><Link to="/services?tab=tests" className="hover:text-brand transition">HIPEC Surgery</Link></li>
                <li><Link to="/services?tab=tests" className="hover:text-brand transition">ECMO</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-brand font-black text-2xl tracking-tighter">
              <Heart className="w-6 h-6 fill-brand" /> Tony Health
            </div>
            <div className="text-slate-500 text-sm text-center md:text-left">
              Email: <a href="mailto:rawatnaksh67@gmail.com" className="hover:text-brand font-semibold">rawatnaksh67@gmail.com</a> | 
              Phone: <a href="tel:8866671624" className="hover:text-brand font-semibold ml-1">8866671624</a>
            </div>
            <div className="text-slate-400 text-xs">
              &copy; 2026 Tony Healthcare Center. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating Chat Button & Live Chat Drawer */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white rounded-3xl w-80 md:w-96 h-[450px] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="bg-brand text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">T</div>
                <div>
                  <h4 className="font-bold text-sm">Tony AI Assistant</h4>
                  <span className="text-xs text-red-100">Online</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-brand text-white' : 'bg-white text-slate-700 shadow-sm border border-gray-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatMessage.trim()) return;
                const newMsg = { sender: 'user', text: chatMessage };
                setChatHistory(prev => [...prev, newMsg]);
                setChatMessage('');
                
                // Simulate simple chatbot answers
                setTimeout(() => {
                  let reply = "Thanks for asking! I'm verifying that info. You can also explore our medical procedures, tests & checkups on the Medical Services page.";
                  if (chatMessage.toLowerCase().includes('heart') || chatMessage.toLowerCase().includes('cardiac')) {
                    reply = "Our Tony Institute of Cardiac Excellence offers state-of-the-art diagnostics and treatments. Would you like me to guide you to book a Cardiac Package?";
                  } else if (chatMessage.toLowerCase().includes('price') || chatMessage.toLowerCase().includes('cost')) {
                    reply = "You can search and check prices for all tests under the 'Tests & Services' tab on the Services page.";
                  } else if (chatMessage.toLowerCase().includes('doctor') || chatMessage.toLowerCase().includes('appointment')) {
                    reply = "You can schedule an appointment by clicking 'Book Appointment' or heading over to the Doctor Finder.";
                  }
                  setChatHistory(prev => [...prev, { sender: 'bot', text: reply }]);
                }, 1000);
              }}
              className="p-3 border-t border-gray-100 bg-white flex gap-2"
            >
              <input 
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button type="submit" className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition">
                Send
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-700 transition hover:scale-105"
        >
          <MessageSquareHeart className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* --- Callback Modal Overlay --- */}
      {isCallbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCallbackOpen(false)}
              className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {callbackSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
                <p className="text-slate-600 text-sm">
                  Thank you, <strong>{callbackName}</strong>. Our care team will call you back at <strong>{callbackPhone}</strong> shortly.
                </p>
                <button
                  onClick={() => setIsCallbackOpen(false)}
                  className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Request a Callback</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Provide your contact details below. Our healthcare specialists will call you back within 15 minutes.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!callbackName.trim() || !callbackPhone.trim()) return;
                    setCallbackSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={callbackName}
                      onChange={e => setCallbackName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={callbackPhone}
                      onChange={e => setCallbackPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-200 mt-2"
                  >
                    Get Call Back
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
