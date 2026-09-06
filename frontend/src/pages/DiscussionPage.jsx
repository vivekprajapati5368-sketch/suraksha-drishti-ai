import React, { useState, useEffect } from 'react';
import {
  MessagesSquare,
  MessageSquarePlus,
  Send,
  Pin,
  Heart,
  Search,
  Filter,
  Users,
  Radio,
  AlertTriangle,
  Shield,
  Mountain,
  Truck,
  Building,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { DynamicPurpleBox } from '../components/common/DynamicPurpleBox';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function DiscussionPage({ onNavigate }) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    channel: 'evacuation',
    priority: 'High',
    agency: user?.department || 'NDMA Taskforce',
    author_name: user?.name || 'Senior Responder',
    author_role: user?.role === 'admin' ? 'Administrator' : user?.role === 'developer' ? 'Lead AI Architect' : user?.role === 'guest' ? 'Guest Observer' : 'Citizen Observer',
    tags: ''
  });
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    if (user) {
      setNewPost(prev => ({
        ...prev,
        agency: user.department || 'NDMA Taskforce',
        author_name: user.name || 'Authorized Responder',
        author_role: user.role === 'admin' ? 'Administrator' : user.role === 'developer' ? 'Lead AI Architect' : user.role === 'guest' ? 'Guest Observer' : 'Citizen Observer'
      }));
    }
  }, [user]);

  const channels = [
    { id: 'all', label: 'All Dispatches', icon: Radio, count: discussions.length },
    { id: 'evacuation', label: 'SDRF & Evacuation', icon: AlertTriangle, count: discussions.filter(d => d.channel === 'evacuation').length },
    { id: 'geological', label: 'Geological & InSAR', icon: Mountain, count: discussions.filter(d => d.channel === 'geological').length },
    { id: 'logistics', label: 'Haven Logistics', icon: Truck, count: discussions.filter(d => d.channel === 'logistics').length },
    { id: 'community', label: 'Panchayat & Relief', icon: Users, count: discussions.filter(d => d.channel === 'community').length },
    { id: 'policy', label: 'Policy & Sanctions', icon: Building, count: discussions.filter(d => d.channel === 'policy').length }
  ];

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const res = await api.getDiscussions({
        channel: selectedChannel !== 'all' ? selectedChannel : '',
        q: searchQuery
      });
      if (res.success) {
        setDiscussions(res.data);
      }
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, [selectedChannel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDiscussions();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setSubmittingPost(true);
    try {
      const res = await api.createDiscussion(newPost);
      if (res.success) {
        setShowPostModal(false);
        setNewPost({
          title: '',
          content: '',
          channel: 'evacuation',
          priority: 'High',
          agency: user?.department || 'NDMA Taskforce',
          author_name: user?.name || 'Senior Responder',
          author_role: user?.role === 'admin' ? 'Crisis Operations Director' : 'Field Operations Lead',
          tags: ''
        });
        loadDiscussions();
      }
    } catch (err) {
      alert('Failed to broadcast post: ' + err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await api.likeDiscussion(id);
      if (res.success) {
        setDiscussions(prev =>
          prev.map(d => (d.id === id ? { ...d, likes_count: res.likes_count } : d))
        );
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.toggleDiscussionPin(id);
      if (res.success) {
        setDiscussions(prev =>
          prev.map(d => (d.id === id ? { ...d, pinned: res.pinned } : d))
        );
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleAddReply = async (discussionId) => {
    const text = replyText[discussionId];
    if (!text || !text.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.addDiscussionReply(discussionId, {
        content: text.trim(),
        author_name: user?.name || 'Emergency Official',
        author_role: user?.role || 'Responder',
        agency: user?.department || 'Disaster Council'
      });

      if (res.success) {
        setDiscussions(prev =>
          prev.map(d =>
            d.id === discussionId ? { ...d, replies: res.allReplies } : d
          )
        );
        setReplyText(prev => ({ ...prev, [discussionId]: '' }));
      }
    } catch (err) {
      alert('Failed to submit reply: ' + err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const getAgencyBadge = (agency) => {
    if (agency.includes('SDRF') || agency.includes('NDRF')) {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-600/50';
    }
    if (agency.includes('Geological') || agency.includes('GSI') || agency.includes('ISRO')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-600/50';
    }
    if (agency.includes('District') || agency.includes('Administration') || agency.includes('Collector')) {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-600/50';
    }
    if (agency.includes('Panchayat') || agency.includes('Pradhan')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-yellow-300 dark:border-amber-600/50';
    }
    return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-600/50';
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500 text-white font-black animate-pulse shadow-sm shadow-red-500/30';
      case 'High':
        return 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30';
      default:
        return 'bg-blue-600 text-white font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dynamic Mouse Header */}
      <div className="border-b border-slate-200 dark:border-cyberblue-900/60 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                CRISIS COUNCIL & INTER-AGENCY COLLABORATION
              </span>
            </div>
            <DynamicMouseText
              as="h1"
              variant="hero"
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm"
            >
              Emergency Discussion & Strategy Whiteboard
            </DynamicMouseText>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
              Collaborative tactical exchange connecting NDMA, SDRF battalions, District Collectors, geological surveyors, and Gram Panchayat representatives in real time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageSquarePlus className="w-4 h-4 text-purple-200" />
              <span>Broadcast Directive</span>
            </button>
            <button
              onClick={loadDiscussions}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-cyberblue-900/60 hover:bg-slate-200 transition"
              title="Refresh Discussions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔮 Dynamic Purple Strategic Whiteboard Box */}
      <DynamicPurpleBox
        title="Tactical Crisis Whiteboard & Directives"
        subtitle="Live multi-agency operational priorities and telemetry briefings"
        badge="ACTIVE CRISIS BOARD"
        icon={Sparkles}
        actions={
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-600/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              18 Responders Live
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Directive Sticky 1 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/60 dark:from-purple-950/40 dark:to-command-900/80 border border-purple-200/80 dark:border-purple-800/40 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-800 dark:text-purple-300 mb-1.5">
              <span>PRIORITY-1 CORRIDOR</span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 text-[10px]">
                IMMEDIATE
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              Maintain NH-07 bypass transit route clearance between Joshimath and Pipalkoti. Heavy earthmovers staged at Km 42.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Issued by: SDRF Uttarakhand Command
            </div>
          </div>

          {/* Directive Sticky 2 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50/60 dark:from-indigo-950/40 dark:to-command-900/80 border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-800 dark:text-indigo-300 mb-1.5">
              <span>GEOTECHNICAL MONITORING</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                RADAR ACTIVE
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              ISRO NISAR radar overpass scheduled at 06:15 IST. Sub-centimeter subsidence displacement map will auto-sync to GIS layers.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Issued by: Geological Survey of India
            </div>
          </div>

          {/* Directive Sticky 3 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50/60 dark:from-violet-950/40 dark:to-command-900/80 border border-violet-200/80 dark:border-violet-800/40 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-violet-800 dark:text-violet-300 mb-1.5">
              <span>SAFE HAVEN INTAKE</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                82% THRESHOLD
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              Gopeshwar Haven intake nearing threshold. Rerouting subsequent Helang convoys to Chamoli Secondary Haven Block B.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Issued by: District Magistrate Chamoli
            </div>
          </div>
        </div>
      </DynamicPurpleBox>

      {/* Navigation Channels & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Channels Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {channels.map(c => {
            const Icon = c.icon;
            const isSelected = selectedChannel === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChannel(c.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-cyberblue-900/60 hover:border-purple-300 hover:text-purple-700 dark:hover:text-purple-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                <span>{c.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-command-800 dark:text-slate-400'
                }`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px] sm:min-w-[320px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directives, agencies, keywords..."
            className="w-full pl-9 pr-20 py-2 rounded-xl text-xs bg-white dark:bg-command-900 border border-slate-200 dark:border-cyberblue-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Discussion Threads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
            <p className="text-sm font-medium">Syncing live disaster discussion feeds...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-command-900/90 border border-slate-200 dark:border-cyberblue-900/60 text-center space-y-3">
            <MessagesSquare className="w-10 h-10 text-purple-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No discussions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No tactical dispatches match your channel filter or search criteria. Click below to initiate a discussion.
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Broadcast First Directive</span>
            </button>
          </div>
        ) : (
          discussions.map(item => (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                item.pinned
                  ? 'bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/50 dark:from-[#110d24] dark:via-command-900 dark:to-command-950 border-purple-300 dark:border-purple-600/60 shadow-md shadow-purple-500/10'
                  : 'bg-white dark:bg-command-900/90 border-slate-200/90 dark:border-cyberblue-900/60 shadow-sm hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-md'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-3">
                {/* Header Meta: Agency, Priority, Pinned, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono font-bold shadow-sm">
                        <Pin className="w-3 h-3 fill-white" />
                        PINNED DIRECTIVE
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getAgencyBadge(item.agency)}`}>
                      {item.agency}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${getPriorityBadge(item.priority)}`}>
                      {item.priority} PRIORITY
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {item.title}
                </h2>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                  {item.content}
                </p>

                {/* Tags */}
                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-command-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-cyberblue-900/50"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls: Author, Like, Reply Toggle, Pin Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-cyberblue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                      {item.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{item.author_name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.author_role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/40 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Heart className="w-3.5 h-3.5 fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400" />
                      <span>{item.likes_count || 0}</span>
                    </button>

                    {/* Reply Toggle Button */}
                    <button
                      onClick={() => setActiveReplyId(activeReplyId === item.id ? null : item.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-command-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-command-700 border border-slate-200 dark:border-cyberblue-900/60 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <MessagesSquare className="w-3.5 h-3.5 text-purple-500" />
                      <span>{item.replies?.length || 0} Replies</span>
                    </button>

                    {/* Pin Toggle Button for authority */}
                    {['admin', 'authority'].includes(user?.role) && (
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`p-1.5 rounded-xl border transition ${
                          item.pinned
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-100 dark:bg-command-800 text-slate-500 border-slate-200 dark:border-cyberblue-900/60 hover:text-purple-600'
                        }`}
                        title={item.pinned ? 'Unpin thread' : 'Pin to top of Whiteboard'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Replies Section */}
                {activeReplyId === item.id && (
                  <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/40 space-y-3 bg-purple-50/50 dark:bg-command-950/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <MessagesSquare className="w-3.5 h-3.5 text-purple-600" />
                      COUNCIL RESPONSES ({item.replies?.length || 0})
                    </h4>

                    {/* Replies List */}
                    {item.replies && item.replies.length > 0 ? (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {item.replies.map(rep => (
                          <div
                            key={rep.id}
                            className="p-3 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-cyberblue-900/60 shadow-sm space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {rep.author_name}
                                <span className="font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                                  ({rep.author_role} • {rep.agency})
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(rep.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              {rep.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        No responses yet. Provide initial assessment below.
                      </p>
                    )}

                    {/* Reply Input Box */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={replyText[item.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddReply(item.id);
                        }}
                        placeholder={`Reply as ${user?.name || 'Emergency Official'}...`}
                        className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-command-900 border border-purple-200 dark:border-purple-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
                      />
                      <button
                        onClick={() => handleAddReply(item.id)}
                        disabled={submittingReply || !replyText[item.id]?.trim()}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🚀 New Directive / Discussion Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-command-900 rounded-2xl border border-purple-300 dark:border-purple-600/60 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-cyberblue-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                  <MessageSquarePlus className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Broadcast Crisis Directive / Topic
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct dispatches will be pinned and synced across emergency command screens.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Directive Title *
                </label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. Urgent Road Clearance for Pipalkoti Convoy..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Channel Category
                  </label>
                  <select
                    value={newPost.channel}
                    onChange={(e) => setNewPost({ ...newPost, channel: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white"
                  >
                    <option value="evacuation">SDRF & Evacuation</option>
                    <option value="geological">Geological & InSAR</option>
                    <option value="logistics">Haven Logistics</option>
                    <option value="community">Panchayat & Relief</option>
                    <option value="policy">Policy & Sanctions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPost.priority}
                    onChange={(e) => setNewPost({ ...newPost, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical (Immediate Flash)</option>
                    <option value="High">High (Urgent Action)</option>
                    <option value="Medium">Medium (Routine Planning)</option>
                    <option value="Low">Low (Advisory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Represented Agency
                  </label>
                  <input
                    type="text"
                    value={newPost.agency}
                    onChange={(e) => setNewPost({ ...newPost, agency: e.target.value })}
                    placeholder="e.g. SDRF Battalion 3"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="e.g. Evacuation, Bus Fleet, Joshimath"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Dispatch Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Provide precise locations, casualty counts, troop movements, shelter requirements..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-command-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  {submittingPost ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{submittingPost ? 'Broadcasting...' : 'Publish Directive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
