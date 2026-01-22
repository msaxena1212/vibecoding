import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  History,
  Plus,
  Send,
  Files,
  Play,
  Network,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:3000/api';

interface FileData {
  content: string;
}

interface Project {
  id: string;
  user_intent: string;
  description?: string;
  framework?: string;
  total_tokens?: number;
  created_at: string;
  files: Record<string, FileData>;
  assistant_response?: string;
}

export default function App() {
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [tab, setTab] = useState<'codebase' | 'preview' | 'state'>('codebase');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [liveReasoning, setLiveReasoning] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/projects`);
      setProjects(resp.data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input;
    setInput('');
    setStatus('Initializing agents...');

    try {
      const url = `${API_BASE}/generate?intent=${encodeURIComponent(currentInput)}${currentProject ? `&project_id=${currentProject.id}` : ''}`;
      const response = await fetch(url, { method: 'POST' });

      if (!response.body) throw new Error('No body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.type === 'status') {
              setStatus(chunk.content);
            } else if (chunk.type === 'reasoning') {
              setLiveReasoning(prev => prev + chunk.content);
            } else if (chunk.type === 'result') {
              const data = chunk.data;
              setCurrentProject(data);
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.assistant_response || 'Generation complete.' }
              ]);
              setLiveReasoning('');
              fetchHistory();
              const firstFile = Object.keys(data.files)[0];
              if (firstFile) setSelectedFile(firstFile);
            }
          } catch (e) {
            console.warn('Failed to parse chunk', e);
          }
        }
      }
    } catch (e) {
      console.error('Generation failed', e);
      setMessages(prev => [...prev, { role: 'system', content: 'An error occurred during generation.' }]);
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  const selectProject = (p: Project) => {
    setCurrentProject(p);
    setView('chat');
    const firstFile = Object.keys(p.files)[0];
    if (firstFile) setSelectedFile(firstFile);
  };

  return (
    <div className="h-screen flex flex-col bg-cosmic-bg text-cosmic-text font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center px-8 glass-panel z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            V
          </div>
          <h1 className="text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
            Vibe-Core
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Core Engine Online
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 min-w-[350px] max-w-[500px] border-r border-white/5 flex flex-col glass-panel shrink-0">
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            {view === 'chat' ? (
              <div className="flex flex-col gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                  <p className="text-sm text-indigo-200">Hi! I'm your AI architect. Describe what you'd like to build below.</p>
                </div>
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={cn(
                      "flex",
                      m.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap",
                        m.role === 'user'
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-lg border border-indigo-400/20"
                          : "bg-white/5 border border-white/10 rounded-tl-none text-indigo-100"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {liveReasoning && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Architect Thinking...</span>
                        </div>
                        <p className="text-xs text-indigo-200/70 italic leading-relaxed whitespace-pre-wrap">
                          {liveReasoning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-indigo-300 px-2">Project History</h2>
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4 text-center">No projects found</p>
                  ) : (
                    projects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selectProject(p)}
                        className="glass-panel p-4 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all border-white/5"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-semibold text-indigo-200 truncate pr-2">{p.user_intent}</h3>
                          <span className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{p.description || 'No description'}</p>
                        <div className="flex gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase font-bold">{p.framework || 'vanilla'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="px-6 py-4 border-t border-white/5 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setView('chat')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                  view === 'chat' ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setView('history')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                  view === 'history' ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                History
              </button>
            </div>
            <button
              onClick={() => { setCurrentProject(null); setMessages([]); setView('chat'); }}
              className="w-full py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg border border-white/10 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={12} />
              New Chat
            </button>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your app..."
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none h-24"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors shadow-lg disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col bg-[#0d0d14] relative overflow-hidden">
          {/* Tabs */}
          <div className="h-12 border-b border-white/5 flex items-center px-4 gap-1 bg-black/20 shrink-0">
            {(['codebase', 'preview', 'state'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2 text-sm capitalize transition-all",
                  tab === t ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View Area */}
          <div className="flex-1 overflow-hidden flex">
            {tab === 'codebase' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Explorer */}
                <div className="w-60 border-r border-white/5 bg-[#11111a] flex flex-col shrink-0">
                  <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explorer</div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {currentProject ? Object.keys(currentProject.files).map(path => (
                      <div
                        key={path}
                        onClick={() => setSelectedFile(path)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all",
                          selectedFile === path ? "text-indigo-400 bg-indigo-500/10" : "text-gray-400 hover:text-white"
                        )}
                      >
                        <Files size={14} className={selectedFile === path ? "opacity-100" : "opacity-40"} />
                        <span className="truncate">{path}</span>
                      </div>
                    )) : (
                      <div className="text-gray-600 text-sm italic p-2 text-center mt-10">No files generated yet</div>
                    )}
                  </div>
                </div>
                {/* Editor */}
                <div className="flex-1 flex flex-col bg-[#0a0a0f] overflow-hidden">
                  <div className="h-10 border-b border-white/5 flex items-center px-4 text-xs text-gray-400 shrink-0">
                    {selectedFile || 'No file selected'}
                  </div>
                  <pre className="flex-1 overflow-auto p-4 text-sm font-mono text-gray-300 leading-relaxed bg-[#0a0a0f]">
                    {currentProject && selectedFile ? currentProject.files[selectedFile].content : ''}
                  </pre>
                </div>
              </div>
            )}

            {tab === 'preview' && (
              <div className="flex-1 bg-white">
                <iframe
                  className="w-full h-full border-none"
                  title="Preview"
                  src={currentProject ? `http://localhost:3000/preview/p/${currentProject.id}/index.html` : ''}
                />
              </div>
            )}

            {tab === 'state' && (
              <div className="flex-1 overflow-auto p-6 bg-[#0a0a0f]">
                <pre className="text-xs font-mono text-gray-400 bg-black/30 p-4 rounded-xl border border-white/5">
                  {JSON.stringify(currentProject || {}, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Loader Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4 z-50 animate-fade-in text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
              </div>
              <div className="text-indigo-200 font-medium animate-pulse">{status}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
