import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Code2,
    Play,
    Download,
    ChevronLeft,
    Send,
    Loader2,
    FolderOpen
} from 'lucide-react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceProps {
    project: any;
    onBack: () => void;
}

export function Workspace({ project, onBack }: WorkspaceProps) {
    const [activeTab, setActiveTab] = useState('code');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        if (project?.project_id) {
            setLoading(true);
            fetch(`/api/v1/projects/${project.project_id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.files) {
                        setFiles(data.files);
                        const firstFile = Object.keys(data.files).find(f => !f.startsWith('.')) || Object.keys(data.files)[0];
                        if (firstFile) setSelectedFile(firstFile);
                    }
                })
                .catch(err => console.error("Failed to fetch project details:", err));

            fetch(`/api/v1/projects/${project.project_id}/messages`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error("Failed to fetch messages:", err))
                .finally(() => setLoading(false));
        }
    }, [project]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, generating]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMsg = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setGenerating(true);

        try {
            const res = await fetch('/api/v1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: newMessage,
                    project_id: project.project_id
                })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();

            if (data.files) {
                setFiles(data.files);
            }

            fetch(`/api/v1/projects/${project.project_id}/messages`)
                .then(res => res.json())
                .then(data => setMessages(data));

        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error executing that request.' }]);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#09090b] text-slate-200 font-sans">
            {/* Sidebar / Chat */}
            <div className="w-[400px] flex flex-col border-r border-white/5 bg-[#0c0c0e] z-20 shadow-2xl">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <span className="font-semibold text-sm truncate max-w-[200px]">
                        {project.name || 'Untitled Project'}
                    </span>
                    <div className="w-9" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant' ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30' : 'bg-slate-700 text-slate-300 ring-1 ring-white/10'
                                    }`}>
                                    {msg.role === 'assistant' ? <Code2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap shadow-md backdrop-blur-md ${msg.role === 'assistant'
                                    ? 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                                    : 'bg-violet-600/20 border border-violet-500/20 text-white rounded-tr-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {(loading || generating) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 animate-pulse">
                                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-sm text-slate-400 animate-pulse shadow-sm">
                                {generating ? 'Thinking and coding...' : 'Loading history...'}
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-[#09090b]/50 backdrop-blur-xl">
                    <div className="relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !generating && handleSendMessage()}
                            placeholder={generating ? "Wait for generation..." : "Refine your code..."}
                            disabled={generating}
                            className="w-full glass-input rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none disabled:opacity-50 shadow-inner"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={generating || !newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content / Preview */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Toolbar */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-10 bg-[#050505]/80 backdrop-blur-md">
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Code
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/20' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Deploy
                        </motion.button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden z-10 flex">
                    {/* File List (Only visible in code mode) */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'code' && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 256, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-r border-white/5 bg-[#0a0a0c] flex flex-col"
                            >
                                <div className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4" /> Files
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {Object.keys(files).sort().map(fileName => (
                                        <button
                                            key={fileName}
                                            onClick={() => setSelectedFile(fileName)}
                                            className={`w-full text-left px-4 py-2 text-sm font-mono truncate transition-colors ${selectedFile === fileName
                                                ? 'bg-violet-500/10 text-violet-300 border-l-2 border-violet-500'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
                                                }`}
                                        >
                                            {fileName}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Editor / Preview */}
                    <div className="flex-1 overflow-hidden p-6 flex items-center justify-center">
                        {Object.keys(files).length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full max-w-5xl glass-panel overflow-hidden flex flex-col"
                            >
                                <Sandpack
                                    template="vite-react"
                                    theme={{
                                        colors: {
                                            surface1: '#0a0a0c',
                                            surface2: '#18181b',
                                            surface3: '#27272a',
                                            clickable: '#a1a1aa',
                                            base: '#808080',
                                            disabled: '#4A4A4A',
                                            hover: '#e4e4e7',
                                            accent: '#8b5cf6',
                                            error: '#ef4444',
                                            errorSurface: '#2b1d1d',
                                        },
                                        syntax: {
                                            plain: '#e4e4e7',
                                            comment: { color: '#71717a', fontStyle: 'italic' },
                                            keyword: '#c084fc',
                                            tag: '#60a5fa',
                                            punctuation: '#a1a1aa',
                                            definition: '#fff',
                                            property: '#fff',
                                            static: '#f472b6',
                                            string: '#34d399',
                                        },
                                        font: {
                                            body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                            mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
                                            size: '13px',
                                            lineHeight: '20px',
                                        },
                                    }}
                                    files={files}
                                    options={{
                                        showNavigator: true,
                                        showTabs: true,
                                        editorHeight: '100%',
                                        showLineNumbers: true,
                                        activeFile: selectedFile.startsWith('/') ? selectedFile : `/${selectedFile}`,
                                        visibleFiles: [selectedFile.startsWith('/') ? selectedFile : `/${selectedFile}`],
                                        classes: {
                                            "sp-wrapper": "h-full",
                                            "sp-layout": "h-full rounded-none border-none",
                                            "sp-tab-button": "text-xs",
                                        }
                                    }}
                                    customSetup={{
                                        dependencies: {
                                            "lucide-react": "latest",
                                            "clsx": "latest",
                                            "tailwind-merge": "latest"
                                        }
                                    }}
                                />
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading project files...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
