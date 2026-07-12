import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pause, Heart, BookOpen, Mic, FileText, User, ChevronRight, Award, Headphones, SkipForward, SkipBack, Search } from 'lucide-react';
import MainNav from '../components/MainNav';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Understanding Heart Arrhythmia: Symptoms and Causes',
    author: 'Dr. Sarah Jenkins',
    date: 'June 18, 2026',
    category: 'Cardiology',
    readTime: '5 min read',
    excerpt: 'An irregular heartbeat can feel like a fluttering, racing, or slow heart rate. Learn about the triggers, diagnostic methods, and modern treatment options for heart arrhythmias.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Dietary Changes that Lower Cholesterol Naturally',
    author: 'Elena Rostova (Dietitian)',
    date: 'May 29, 2026',
    category: 'Nutrition',
    readTime: '7 min read',
    excerpt: 'Discover the power of soluble fibers, healthy unsaturated fats, plant sterols, and omega-3 fatty acids to optimize your cholesterol profile without solely relying on medication.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'The Future of Robotic Cardiac Surgeries',
    author: 'Dr. Raymond Tony',
    date: 'April 14, 2026',
    category: 'Surgery Innovation',
    readTime: '10 min read',
    excerpt: 'Robotic-assisted procedures offer unmatched precision, smaller incisions, reduced post-operative pain, and faster recovery times. See how Tony Health is leading this revolution.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80'
  }
];

const PODCASTS = [
  {
    id: 'pod-1',
    title: 'Episode 12: Navigating High Blood Pressure and Stress',
    host: 'Dr. Raymond Tony & Guests',
    duration: '22:15',
    description: 'A deep dive into how chronic stress influences cardiovascular health, and practical lifestyle adjustments to lower hypertension risk.',
    file: 'Stress and HBP Podcast'
  },
  {
    id: 'pod-2',
    title: 'Episode 11: Deciphering Artificial Intelligence in Cardiology',
    host: 'Dr. Sarah Jenkins',
    duration: '18:40',
    description: 'Exploring how machine learning models analyze ECGs and patient histories to predict risk and personalize cardiology care plans.',
    file: 'AI and Cardiology Podcast'
  },
  {
    id: 'pod-3',
    title: 'Episode 10: Living Active Post Cardiac Rehabilitation',
    host: 'Physiotherapist Mark Gable',
    duration: '25:05',
    description: 'Expert advice on slowly returning to exercise and physical work routines safely after experiencing a major heart surgery.',
    file: 'Rehab Active Life Podcast'
  }
];

const STORIES = [
  {
    id: 'story-1',
    name: 'Emily Watson',
    age: 44,
    condition: 'Mitral Valve Regurgitation',
    quote: 'Thanks to the minimally invasive robotic surgery, I was back on my feet hiking in the hills within a fraction of the expected recovery time.',
    story: 'Emily was diagnosed with severe mitral valve regurgitation during a routine checkup. Fearing open-heart surgery, she came to Tony Health where our team suggested robotic-assisted valve repair. The procedure was completed through tiny incisions, allowing Emily to return home in just 3 days.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'story-2',
    name: 'Robert Vance',
    age: 62,
    condition: 'Chronic Coronary Artery Disease',
    quote: 'The AI-backed diagnostics caught my blockages before they became a fatal heart attack. I got my bypass timely and safe.',
    story: 'Robert felt minor breathing discomfort while walking. Our advanced Heart AI analytics detected a high probability of coronary obstruction based on his biomarkers and ECG profile. An angiogram confirmed three major artery blocks, leading to a successful bypass surgery.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

const BREAKTHROUGHS = [
  {
    id: 'bt-1',
    title: 'Rare Combined Cardiac and Liver Transplant Success',
    facility: 'Tony Hospital, Central Branch',
    details: 'A multi-disciplinary surgical team successfully completed a rare, simultaneous heart and liver transplant for a 38-year-old patient with congenital liver cirrhosis and advanced heart failure. This marks the third successful case in the region.',
    icon: '❤️'
  },
  {
    id: 'bt-2',
    title: 'First AI-Guided Arrhythmia Ablation Procedure',
    facility: 'Tony Institute of Genomic Medicine',
    details: 'Leveraging real-time electro-anatomical mapping and artificial intelligence predictive models, our cardiologists performed a precision ablation targeting atrial fibrillation, significantly minimizing procedure time and reducing recurrence rates to under 5%.',
    icon: '⚡'
  }
];

export default function PatientCorner() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'blogs';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Podcast Audio Player State
  const [playingPodcast, setPlayingPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(35); // mock initial progress %

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handlePlayPodcast = (podcast) => {
    if (playingPodcast && playingPodcast.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingPodcast(podcast);
      setIsPlaying(true);
      setPlayProgress(0);
    }
  };

  // Mock progress simulation when playing
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <MainNav />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 py-16 text-white text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
            Resource Center
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 tracking-tight">
            Patient Corner & Stories
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg">
            Stay informed with expert medical blogs, listen to podcasts, read inspiring recovery stories, and discover clinical breakthroughs.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 mt-10">
        <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200 pb-4 mb-8">
          {[
            { id: 'blogs', name: 'Blogs & Literature', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'podcasts', name: 'Podcasts', icon: <Mic className="w-4 h-4" /> },
            { id: 'stories', name: 'Patient Stories', icon: <User className="w-4 h-4" /> },
            { id: 'breakthroughs', name: 'Breakthrough Cases', icon: <Award className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-md shadow-red-50'
                  : 'text-slate-600 hover:text-brand hover:bg-white'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Tab 1: Blogs & Literature */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {BLOG_POSTS.map((blog) => (
              <article key={blog.id} className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    <span className="absolute top-4 left-4 bg-brand text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span>By {blog.author}</span>
                      <span>• {blog.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug hover:text-brand transition cursor-pointer mb-3">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <a href="#" className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1">
                    Read Article <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Tab 2: Podcasts with Interactive Player */}
        {activeTab === 'podcasts' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Audio Player Widget (Always visible if a podcast is playing) */}
            {playingPodcast && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand font-black">NOW PLAYING</span>
                    <h4 className="font-bold text-sm md:text-base text-slate-100 line-clamp-1">{playingPodcast.title}</h4>
                    <p className="text-xs text-slate-400">Hosted by {playingPodcast.host}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 max-w-md">
                  <div className="flex items-center gap-3 justify-center">
                    <button className="text-slate-400 hover:text-white transition"><SkipBack className="w-4 h-4" /></button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
                    </button>
                    <button className="text-slate-400 hover:text-white transition"><SkipForward className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">0:45</span>
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand h-full transition-all duration-1000" style={{ width: `${playProgress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{playingPodcast.duration}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Podcasts List */}
            <div className="space-y-4">
              {PODCASTS.map((pod) => {
                const isCurrent = playingPodcast?.id === pod.id;
                return (
                  <div
                    key={pod.id}
                    className={`bg-white border rounded-2xl p-6 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isCurrent ? 'border-brand shadow-md' : 'border-gray-150 hover:border-brand shadow-sm'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block mb-1">
                        EPISODE • Duration: {pod.duration}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800 mb-1">{pod.title}</h4>
                      <p className="text-xs text-slate-400 mb-2">Hosted by {pod.host}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{pod.description}</p>
                    </div>

                    <button
                      onClick={() => handlePlayPodcast(pod)}
                      className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 shrink-0 transition-all ${
                        isCurrent && isPlaying
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-red-50 text-brand hover:bg-brand hover:text-white'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Listen
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Patient Stories */}
        {activeTab === 'stories' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {STORIES.map((story) => (
              <div key={story.id} className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-red-50 border-4 border-white shadow-md flex-shrink-0 overflow-hidden">
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {story.condition}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-800 mt-2">{story.name}, {story.age} years</h3>
                  </div>
                  <blockquote className="text-slate-600 font-medium italic border-l-4 border-brand pl-4">
                    "{story.quote}"
                  </blockquote>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {story.story}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Breakthrough Cases */}
        {activeTab === 'breakthroughs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {BREAKTHROUGHS.map((bt) => (
              <div key={bt.id} className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm hover:shadow-md transition flex gap-5">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  {bt.icon}
                </div>
                <div className="space-y-3">
                  <span className="text-xs text-brand font-bold uppercase tracking-wider block">
                    {bt.facility}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 leading-snug">
                    {bt.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {bt.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
