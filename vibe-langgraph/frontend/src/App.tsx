import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  Plus,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Workspace } from './components/Workspace';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  project_id: string;
  name: string;
  status: string;
  created_at: string;
  intent?: string;
  description?: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/v1/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((p: any) => ({ ...p, project_id: p.id }));
          setProjects(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);

    try {
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: prompt })
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      const newProject = {
        project_id: data.project_id,
        name: prompt.substring(0, 20) + (prompt.length > 20 ? '...' : ''),
        status: 'active',
        created_at: new Date().toISOString(),
        intent: prompt
      };

      setProjects([newProject, ...projects]);
      setActiveProject(newProject);
      setPrompt('');
    } catch (err) {
      console.error('Generation error:', err);
      alert('Failed to generate project. Check console.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans selection:bg-violet-500/30 overflow-hidden relative">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[120px] animate-aurora mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-aurora mix-blend-screen" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[100px] animate-aurora mix-blend-screen" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-[280px] flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl z-20 relative"
      >
        <div className="p-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-2 mb-6 cursor-pointer"
            onClick={() => setActiveProject(null)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white/90">VibeCoder</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActiveProject(null); setTimeout(() => document.querySelector('textarea')?.focus(), 100); }}
            className="w-full h-10 flex items-center gap-2 px-3 bg-white/5 border border-white/5 rounded-lg text-sm text-slate-300 transition-colors group"
          >
            <Plus className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            <span>New Project</span>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-2 pb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Recents</div>
          <AnimatePresence>
            {loading ? (
              <div className="px-4 text-sm text-slate-500">Loading...</div>
            ) : projects.map((p: any, i) => (
              <motion.button
                key={p.project_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveProject(p)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all relative overflow-hidden group ${activeProject?.project_id === p.project_id
                  ? 'bg-violet-500/10 text-violet-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                {activeProject?.project_id === p.project_id && (
                  <motion.div layoutId="activeProject" className="absolute inset-0 bg-violet-500/10 border-l-2 border-violet-500" />
                )}
                <MessageSquare className="w-4 h-4 opacity-50 relative z-10" />
                <span className="truncate relative z-10">{p.name || p.intent || 'Untitled Project'}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer opacity-60 hover:opacity-100">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-300">User</div>
              <div className="text-xs text-slate-500">Pro Plan</div>
            </div>
            <Settings className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 min-w-0 flex flex-col">
        <AnimatePresence mode="wait">
          {activeProject ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col h-full"
            >
              <Workspace project={activeProject} onBack={() => setActiveProject(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="flex-1 flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-2xl w-full space-y-8 text-center relative z-20">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
                >
                  What can I help you <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">build?</span>
                </motion.h1>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-1000 blur-lg animate-pulse" />
                  <div className="relative glass-panel rounded-2xl p-4 flex flex-col gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="Describe your web app idea..."
                      className="w-full bg-transparent border-none outline-none text-xl text-white placeholder:text-slate-500 resize-none min-h-[60px]"
                      disabled={generating}
                      autoFocus
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5" />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {['Portfolio Site', 'SaaS Dashboard', 'Landing Page', 'E-commerce'].map((tag, i) => (
                    <motion.button
                      key={tag}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => setPrompt(`Create a ${tag}...`)}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
