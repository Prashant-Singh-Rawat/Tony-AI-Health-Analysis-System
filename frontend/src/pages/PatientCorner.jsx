import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pause, Heart, BookOpen, Mic, FileText, User, ChevronRight, Award, Headphones, SkipForward, SkipBack } from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { motion, AnimatePresence } from 'framer-motion';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Understanding Heart Arrhythmia: Symptoms and Causes',
    author: 'Dr. Sarah Jenkins',
    date: 'June 18, 2026',
    category: 'Cardiology',
    readTime: '5 min read',
    excerpt: 'An irregular heartbeat can feel like a fluttering, racing, or slow heart rate. Learn about triggers and diagnostic methods.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Dietary Changes that Lower Cholesterol Naturally',
    author: 'Elena Rostova (Dietitian)',
    date: 'May 29, 2026',
    category: 'Nutrition',
    readTime: '7 min read',
    excerpt: 'Discover the power of soluble fibers, unsaturated fats, and plant sterols to optimize your blood lipid profile.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'The Future of Robotic Cardiac Surgeries',
    author: 'Dr. Raymond Tony',
    date: 'April 14, 2026',
    category: 'Surgery Innovation',
    readTime: '10 min read',
    excerpt: 'Robotic-assisted procedures offer unmatched precision, smaller incisions, and faster recovery times.',
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
  }
];

const STORIES = [
  {
    id: 'story-1',
    name: 'Emily Watson',
    age: 44,
    condition: 'Mitral Valve Regurgitation',
    quote: 'Thanks to the minimally invasive robotic surgery, I was back on my feet hiking in the hills within a fraction of the expected recovery time.',
    story: 'Emily was diagnosed with severe mitral valve regurgitation during a routine checkup. Fearing open-heart surgery, she came to Tony Health where our team suggested robotic-assisted valve repair.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  }
];

export default function PatientCorner() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'blogs';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [playingPodcast, setPlayingPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(35);

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden border border-border-subtle">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Badge variant="info">Resource Center</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight mt-3">Patient Corner & Stories</h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Stay informed with expert medical blogs, listen to podcasts, read inspiring recovery stories, and discover clinical breakthroughs.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        {[
          { id: 'blogs', name: 'Blogs & Literature', icon: BookOpen },
          { id: 'podcasts', name: 'Podcasts', icon: Mic },
          { id: 'stories', name: 'Patient Stories', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                ${activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'}`}
            >
              <Icon className="w-4 h-4" /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((blog) => (
              <Card key={blog.id} className="flex flex-col justify-between overflow-hidden p-0 border border-border-subtle">
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[10px] text-text-muted mb-2">
                      <span>By {blog.author}</span>
                      <span>• {blog.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-text-main leading-tight mb-2 hover:text-brand-primary cursor-pointer transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-1">
                  <a href="#" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                    Read Article <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'podcasts' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {playingPodcast && (
              <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary animate-pulse">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-brand-primary font-black">NOW PLAYING</span>
                    <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{playingPodcast.title}</h4>
                    <p className="text-xs text-slate-400">Hosted by {playingPodcast.host}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 max-w-xs">
                  <div className="flex items-center gap-3 justify-center">
                    <button className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform">
                      {isPlaying ? <Pause className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-slate-900 ml-0.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-brand-primary h-full transition-all duration-1000" style={{ width: `${playProgress}%` }}></div>
                    </div>
                    <span className="text-[9px] text-slate-400">{playingPodcast.duration}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {PODCASTS.map((pod) => {
                const isCurrent = playingPodcast?.id === pod.id;
                return (
                  <div key={pod.id} className="bg-bg-surface border border-border-subtle p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-text-main mb-1">{pod.title}</h4>
                      <p className="text-[10px] text-text-muted mb-2">Hosted by {pod.host} · {pod.duration}</p>
                      <p className="text-xs text-text-muted leading-relaxed">{pod.description}</p>
                    </div>
                    <Button
                      onClick={() => handlePlayPodcast(pod)}
                      variant={isCurrent && isPlaying ? 'secondary' : 'primary'}
                      size="sm"
                      className="shrink-0"
                    >
                      {isCurrent && isPlaying ? 'Pause' : 'Listen'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {STORIES.map((story) => (
              <Card key={story.id} className="flex gap-6 items-start">
                <img src={story.image} alt={story.name} className="w-20 h-20 rounded-xl object-cover border border-border-subtle" />
                <div className="space-y-2">
                  <Badge variant="success">{story.condition}</Badge>
                  <h3 className="text-base font-bold text-text-main">{story.name}, {story.age} years</h3>
                  <blockquote className="text-text-muted font-medium italic border-l-2 border-brand-primary pl-3 text-xs">
                    "{story.quote}"
                  </blockquote>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {story.story}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
