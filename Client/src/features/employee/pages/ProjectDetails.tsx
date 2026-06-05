import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Bug, 
    Target, 
    Layout, 
    User, 
    Calendar, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    Users, 
    ClipboardList,
    AlertTriangle
} from "lucide-react";
import { getProjectInsightsApi, type ProjectInsights } from "../api/projectApi";
import { toast } from "sonner";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [insights, setInsights] = useState<ProjectInsights | null>(null);
    const [loading, setLoading] = useState(true);
    
    // UI state
    const [activeTab, setActiveTab] = useState<"stories" | "tasks" | "bugs" | "team">("stories");
    const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
    const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProjectInsightsApi(projectId!);
            if (res.success) {
                setInsights(res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load project details");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) fetchInsights();
    }, [projectId, fetchInsights]);

    const toggleStoryExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedStories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleIssueExpand = (id: string) => {
        setExpandedIssues(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#fdfdfd]">
                <div className="w-10 h-10 border-[3px] border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] text-[#888] font-bold mt-4 animate-pulse">Gathering project data...</p>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#fdfdfd] p-6 text-center">
                <AlertTriangle size={36} className="text-[#fa8029] mb-3" />
                <h3 className="text-[16px] font-bold text-[#1f2124]">Project Not Found</h3>
                <p className="text-[13px] text-[#888] mt-1 max-w-sm">
                    We couldn't retrieve details for this project. Please check if you have the permission to access it.
                </p>
                <button
                    onClick={() => navigate('/employee/projects')}
                    className="mt-4 px-4 py-2 bg-[#fa8029] hover:bg-[#e07020] text-white text-[12px] font-semibold rounded-lg shadow transition-colors"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    const { project, stats, team, stories, standaloneTasks, bugs, tasks } = insights;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'on-hold': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'critical': 
                return 'bg-rose-50 text-rose-500 border border-rose-100';
            case 'medium': 
                return 'bg-amber-50 text-amber-500 border border-amber-100';
            case 'low': 
                return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
            default: 
                return 'bg-slate-50 text-slate-400 border border-slate-100';
        }
    };

    const getIssueStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'done': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'in progress': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'in review': return 'bg-purple-50 text-purple-600 border border-purple-100';
            case 'blocked': return 'bg-rose-50 text-rose-600 border border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    const progressPercentage = stats.total_points > 0 
        ? Math.round((stats.completed_points / stats.total_points) * 100) 
        : 0;

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-12 animate-in fade-in duration-300">
            <div className="max-w-[1400px] mx-auto px-6 pt-4 space-y-5">
                
                {/* Breadcrumb Header */}
                <button 
                    onClick={() => navigate('/employee/projects')}
                    className="flex items-center gap-2 text-[#ccc] hover:text-[#fa8029] transition-colors font-black text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={12} strokeWidth={3} /> Back to Projects Matrix
                </button>

                {/* Hero Dashboard Control Panel */}
                <div className="bg-white border border-[#f0f0f0] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa8029]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-[#fa8029]/10" />
                    
                    <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6 relative z-10">
                        {/* Title and Description */}
                        <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-[22px] font-black text-[#1f2124] tracking-tight leading-none">{project.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityBadge(project.priority)}`}>
                                    {project.priority} Priority
                                </span>
                            </div>
                            <p className="text-[13px] text-[#666] leading-relaxed max-w-2xl font-medium">{project.description}</p>
                            
                            {/* Dates & Timeline info */}
                            <div className="flex flex-wrap gap-5 text-[11px] text-[#888] pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-[#bbb]" />
                                    <span className="font-bold">Start:</span>
                                    <span>{new Date(project.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-[#bbb]" />
                                    <span className="font-bold">Target:</span>
                                    <span>{new Date(project.target_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Manager Profile Block */}
                        <div className="flex items-center lg:items-start lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-[#f5f5f5] pt-4 lg:pt-0 lg:pl-6 shrink-0 min-w-[240px]">
                            <div className="w-10 h-10 rounded-xl bg-[#fa8029]/10 border border-[#fa8029]/20 text-[#fa8029] flex items-center justify-center text-[14px] font-black shadow-inner overflow-hidden shrink-0">
                                {project.created_by?.avatar ? (
                                    <img src={project.created_by.avatar} alt={project.created_by.name} className="w-full h-full object-cover" />
                                ) : (
                                    project.created_by?.name?.charAt(0) || "P"
                                )}
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[8px] font-black text-[#ccc] uppercase tracking-widest leading-none mb-1">Project Creator</p>
                                <p className="text-[13px] font-black text-[#1f2124] leading-snug">{project.created_by?.name || "Unassigned"}</p>
                                <p className="text-[11px] text-[#fa8029] font-bold tracking-tight">{project.created_by?.designation || "Product Owner"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators and Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Progress Circle & Story Points Card */}
                    <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Story Point Burned</span>
                            <h2 className="text-[20px] font-black text-[#1f2124] tracking-tight">
                                {stats.completed_points} <span className="text-[11px] text-[#aaa] font-bold">/ {stats.total_points} pts</span>
                            </h2>
                            <p className="text-[10px] font-medium text-[#888]">{progressPercentage}% completion</p>
                        </div>
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="28" cy="28" r="22" className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="transparent" />
                                <circle cx="28" cy="28" r="22" className="text-[#fa8029]" strokeWidth="4" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - progressPercentage / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" />
                            </svg>
                            <span className="absolute text-[11px] font-black text-[#1f2124]">{progressPercentage}%</span>
                        </div>
                    </div>

                    {/* Stories Stats */}
                    <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                            <Target size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">User Stories</span>
                            <h2 className="text-[20px] font-black text-[#1f2124] tracking-tight">{stats.total_stories}</h2>
                            <p className="text-[10px] font-medium text-[#888]">Functional requirements</p>
                        </div>
                    </div>

                    {/* Active SubTasks Stats */}
                    <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                            <ClipboardList size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Development Subtasks</span>
                            <h2 className="text-[20px] font-black text-[#1f2124] tracking-tight">{stats.total_tasks}</h2>
                            <p className="text-[10px] font-medium text-[#888]">Decomposed work items</p>
                        </div>
                    </div>

                    {/* Bugs Stats */}
                    <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                            <Bug size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Bugs & Defect Issues</span>
                            <h2 className="text-[20px] font-black text-[#1f2124] tracking-tight">{stats.total_bugs}</h2>
                            <p className="text-[10px] font-medium text-[#888]">Reported defects</p>
                        </div>
                    </div>

                </div>

                {/* Tab Navigation Menu */}
                <div className="border-b border-[#f0f0f0] flex items-center gap-1 overflow-x-auto pb-px">
                    <button
                        onClick={() => setActiveTab("stories")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                            activeTab === "stories" 
                                ? "border-[#fa8029] text-[#fa8029]" 
                                : "border-transparent text-[#888] hover:text-[#555]"
                        }`}
                    >
                        <Target size={14} /> User Stories ({stories.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                            activeTab === "tasks" 
                                ? "border-[#fa8029] text-[#fa8029]" 
                                : "border-transparent text-[#888] hover:text-[#555]"
                        }`}
                    >
                        <Layout size={14} /> Standalone Tasks ({standaloneTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("bugs")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                            activeTab === "bugs" 
                                ? "border-[#fa8029] text-[#fa8029]" 
                                : "border-transparent text-[#888] hover:text-[#555]"
                        }`}
                    >
                        <Bug size={14} /> Bugs & Defects ({bugs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("team")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                            activeTab === "team" 
                                ? "border-[#fa8029] text-[#fa8029]" 
                                : "border-transparent text-[#888] hover:text-[#555]"
                        }`}
                    >
                        <Users size={14} /> Project Team ({team.length})
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="space-y-4">
                    
                    {/* STORIES TAB */}
                    {activeTab === "stories" && (
                        <div className="space-y-3.5">
                            {stories.length === 0 ? (
                                <div className="bg-white border border-[#f0f0f0] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                    <Target size={30} className="text-[#ccc] mb-2" />
                                    <p className="text-[13px] font-bold text-[#555]">No User Stories Defined</p>
                                    <p className="text-[11px] text-[#aaa] mt-0.5">There are no user stories registered in this project.</p>
                                </div>
                            ) : (
                                stories.map((story) => {
                                    const isExpanded = expandedStories[story._id];
                                    const isDetailExpanded = expandedIssues[story._id];
                                    const storyTasks = tasks.filter(t => t.issue_id === story._id);
                                    const storyHours = storyTasks.length > 0
                                        ? storyTasks.reduce((sum, st) => sum + (st.estimated_hours || 0), 0)
                                        : (story.story_points || 0) * 8;

                                    return (
                                        <div 
                                            key={story._id} 
                                            className="bg-white border border-[#ebebeb] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            {/* Story Header Summary Row */}
                                            <div 
                                                onClick={() => toggleIssueExpand(story._id)}
                                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#fafafa]/40 select-none"
                                            >
                                                {/* Left side details */}
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-50 text-blue-500 border border-blue-100 uppercase tracking-widest">
                                                            User Story
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getPriorityBadge(story.priority)}`}>
                                                            {story.priority} Priority
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getIssueStatusBadge(story.status)}`}>
                                                            {story.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-[13.5px] font-bold text-[#1f2124] leading-snug line-clamp-2">
                                                        {story.title}
                                                    </h3>
                                                </div>

                                                {/* Right side stats & action dropdown */}
                                                <div className="flex items-center gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[#bbb]">
                                                        <div>
                                                            <span className="text-[#ccc]">SP:</span> <span className="text-[#555]">{story.story_points || 0} pts</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[#ccc]">Hours:</span> <span className="text-[#555]">{storyHours} hrs</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {/* Assignee */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-[#fa8029]/10 border border-[#fa8029]/20 flex items-center justify-center text-[10px] font-black text-[#fa8029] overflow-hidden">
                                                                {story.assign_to?.avatar ? (
                                                                    <img src={story.assign_to.avatar} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    story.assign_to?.name?.charAt(0) || <User size={12} />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[10px] font-bold text-[#555] leading-none">{story.assign_to?.name || "Unassigned"}</span>
                                                                <span className="text-[8px] font-black text-[#aaa] uppercase tracking-wider leading-none mt-0.5">{story.assign_to?.designation || "Assignee"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Expand detail btn */}
                                                        <button 
                                                            className="p-1 rounded-lg text-[#ccc] hover:text-[#555] transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleIssueExpand(story._id);
                                                            }}
                                                        >
                                                            {isDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Detailed view */}
                                            {isDetailExpanded && (
                                                <div className="px-5 pb-5 pt-1 border-t border-[#f5f5f5] bg-[#fafafa]/20 space-y-4 text-left">
                                                    {/* Creator details */}
                                                    <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-lg border border-[#f0f0f0] max-w-max">
                                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-[#888] border overflow-hidden">
                                                            {story.created_by?.avatar ? (
                                                                <img src={story.created_by.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                story.created_by?.name?.charAt(0) || <User size={10} />
                                                            )}
                                                        </div>
                                                        <span className="text-[10.5px] font-bold text-[#666]">
                                                            Created by <span className="font-extrabold text-[#1f2124]">{story.created_by?.name || "Product Owner"}</span> ({story.created_by?.designation || "Product Owner"})
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    {story.description && (
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Description</span>
                                                            <p className="text-[12px] text-[#555] leading-relaxed bg-white p-3 rounded-lg border border-[#eee]">{story.description}</p>
                                                        </div>
                                                    )}

                                                    {/* Acceptance Criteria */}
                                                    {story.criteria && story.criteria.length > 0 && (
                                                        <div className="space-y-1.5">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Acceptance Criteria</span>
                                                            <div className="bg-white p-3.5 rounded-lg border border-[#eee] space-y-2">
                                                                {story.criteria.map((c, i) => (
                                                                    <div key={i} className="flex items-start gap-2 text-[12px] text-[#555]">
                                                                        <CheckCircle2 size={14} className="text-[#fa8029] shrink-0 mt-0.5" />
                                                                        <span>{c}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Subtasks dropdown toggle */}
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => toggleStoryExpand(story._id, e)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#fa8029]/5 border border-[#fa8029]/10 text-[#fa8029] hover:bg-[#fa8029]/10 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
                                                            {isExpanded ? "Collapse Tasks" : `View Sub-tasks (${storyTasks.length})`}
                                                        </button>
                                                    </div>

                                                    {/* Subtasks List panel */}
                                                    {isExpanded && (
                                                        <div className="pl-4 border-l-2 border-dashed border-[#fa8029]/20 space-y-2 mt-2">
                                                            {storyTasks.length === 0 ? (
                                                                <p className="text-[10.5px] text-[#bbb] font-bold uppercase tracking-wider italic py-1">No development sub-tasks added.</p>
                                                            ) : (
                                                                storyTasks.map((task) => (
                                                                    <div 
                                                                        key={task._id} 
                                                                        className="bg-white border border-[#eee] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner hover:border-[#fa8029]/25 transition-all duration-300"
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#fa8029]/40 group-hover:bg-[#fa8029] transition-colors shrink-0" />
                                                                            <span className="text-[11.5px] font-bold text-[#555] line-clamp-1">{task.title}</span>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-4 shrink-0">
                                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getIssueStatusBadge(task.status)}`}>
                                                                                {task.status}
                                                                            </span>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-6 h-6 rounded-lg bg-gray-50 border border-[#eee] flex items-center justify-center text-[9px] font-black text-[#fa8029] overflow-hidden">
                                                                                    {task.assign_to?.avatar ? (
                                                                                        <img src={task.assign_to.avatar} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        task.assign_to?.name?.charAt(0) || <User size={10} />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex flex-col text-left">
                                                                                    <span className="text-[9px] font-bold text-[#1f2124] leading-none">{task.assign_to?.name || 'Unassigned'}</span>
                                                                                    {task.assign_to?.team_name && (
                                                                                        <span className="text-[7px] font-black text-[#fa8029] uppercase tracking-widest leading-none mt-0.5">{task.assign_to.team_name}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* STANDALONE TASKS TAB */}
                    {activeTab === "tasks" && (
                        <div className="space-y-3.5">
                            {standaloneTasks.length === 0 ? (
                                <div className="bg-white border border-[#f0f0f0] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                    <Layout size={30} className="text-[#ccc] mb-2" />
                                    <p className="text-[13px] font-bold text-[#555]">No Standalone Tasks</p>
                                    <p className="text-[11px] text-[#aaa] mt-0.5">There are no individual tasks in this project.</p>
                                </div>
                            ) : (
                                standaloneTasks.map((task) => {
                                    const isDetailExpanded = expandedIssues[task._id];
                                    return (
                                        <div 
                                            key={task._id} 
                                            className="bg-white border border-[#ebebeb] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            {/* Summary line */}
                                            <div 
                                                onClick={() => toggleIssueExpand(task._id)}
                                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#fafafa]/40 select-none"
                                            >
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-50 text-emerald-500 border border-emerald-100 uppercase tracking-widest">
                                                            Task
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getPriorityBadge(task.priority)}`}>
                                                            {task.priority} Priority
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getIssueStatusBadge(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-[13.5px] font-bold text-[#1f2124] leading-snug line-clamp-2">
                                                        {task.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[#bbb]">
                                                        <div>
                                                            <span className="text-[#ccc]">SP:</span> <span className="text-[#555]">{task.story_points || 0} pts</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[#ccc]">Hours:</span> <span className="text-[#555]">{task.estimated_hours || 0} hrs</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {/* Assignee */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-[#fa8029]/10 border border-[#fa8029]/20 flex items-center justify-center text-[10px] font-black text-[#fa8029] overflow-hidden">
                                                                {task.assign_to?.avatar ? (
                                                                    <img src={task.assign_to.avatar} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    task.assign_to?.name?.charAt(0) || <User size={12} />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[10px] font-bold text-[#555] leading-none">{task.assign_to?.name || "Unassigned"}</span>
                                                                <span className="text-[8px] font-black text-[#aaa] uppercase tracking-wider leading-none mt-0.5">{task.assign_to?.designation || "Assignee"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Expand button */}
                                                        <button 
                                                            className="p-1 rounded-lg text-[#ccc] hover:text-[#555] transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleIssueExpand(task._id);
                                                            }}
                                                        >
                                                            {isDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details section */}
                                            {isDetailExpanded && (
                                                <div className="px-5 pb-5 pt-2 border-t border-[#f5f5f5] bg-[#fafafa]/20 space-y-3.5 text-left">
                                                    {/* Creator details */}
                                                    <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-lg border border-[#f0f0f0] max-w-max">
                                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-[#888] border overflow-hidden">
                                                            {task.created_by?.avatar ? (
                                                                <img src={task.created_by.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                task.created_by?.name?.charAt(0) || <User size={10} />
                                                            )}
                                                        </div>
                                                        <span className="text-[10.5px] font-bold text-[#666]">
                                                            Created by <span className="font-extrabold text-[#1f2124]">{task.created_by?.name || "Product Owner"}</span> ({task.created_by?.designation || "Product Owner"})
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    {task.description && (
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Description</span>
                                                            <p className="text-[12px] text-[#555] leading-relaxed bg-white p-3 rounded-lg border border-[#eee]">{task.description}</p>
                                                        </div>
                                                    )}

                                                    {/* Acceptance Criteria */}
                                                    {task.criteria && task.criteria.length > 0 && (
                                                        <div className="space-y-1.5">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Acceptance Criteria</span>
                                                            <div className="bg-white p-3.5 rounded-lg border border-[#eee] space-y-2">
                                                                {task.criteria.map((c, i) => (
                                                                    <div key={i} className="flex items-start gap-2 text-[12px] text-[#555]">
                                                                        <CheckCircle2 size={14} className="text-[#fa8029] shrink-0 mt-0.5" />
                                                                        <span>{c}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* BUGS TAB */}
                    {activeTab === "bugs" && (
                        <div className="space-y-3.5">
                            {bugs.length === 0 ? (
                                <div className="bg-white border border-[#f0f0f0] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                    <Bug size={30} className="text-[#ccc] mb-2" />
                                    <p className="text-[13px] font-bold text-[#555]">No Defects / Bugs</p>
                                    <p className="text-[11px] text-[#aaa] mt-0.5">There are no bugs reported in this project.</p>
                                </div>
                            ) : (
                                bugs.map((bug) => {
                                    const isDetailExpanded = expandedIssues[bug._id];
                                    return (
                                        <div 
                                            key={bug._id} 
                                            className="bg-white border border-[#ebebeb] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            {/* Summary line */}
                                            <div 
                                                onClick={() => toggleIssueExpand(bug._id)}
                                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#fafafa]/40 select-none"
                                            >
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-500 border border-rose-100 uppercase tracking-widest">
                                                            Bug
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getPriorityBadge(bug.priority)}`}>
                                                            {bug.priority} Priority
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getIssueStatusBadge(bug.status)}`}>
                                                            {bug.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-[13.5px] font-bold text-[#1f2124] leading-snug line-clamp-2">
                                                        {bug.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[#bbb]">
                                                        <div>
                                                            <span className="text-[#ccc]">SP:</span> <span className="text-[#555]">{bug.story_points || 0} pts</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[#ccc]">Hours:</span> <span className="text-[#555]">{bug.estimated_hours || 0} hrs</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {/* Assignee */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-[#fa8029]/10 border border-[#fa8029]/20 flex items-center justify-center text-[10px] font-black text-[#fa8029] overflow-hidden">
                                                                {bug.assign_to?.avatar ? (
                                                                    <img src={bug.assign_to.avatar} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    bug.assign_to?.name?.charAt(0) || <User size={12} />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-[10px] font-bold text-[#555] leading-none">{bug.assign_to?.name || "Unassigned"}</span>
                                                                <span className="text-[8px] font-black text-[#aaa] uppercase tracking-wider leading-none mt-0.5">{bug.assign_to?.designation || "Assignee"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Expand button */}
                                                        <button 
                                                            className="p-1 rounded-lg text-[#ccc] hover:text-[#555] transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleIssueExpand(bug._id);
                                                            }}
                                                        >
                                                            {isDetailExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details section */}
                                            {isDetailExpanded && (
                                                <div className="px-5 pb-5 pt-2 border-t border-[#f5f5f5] bg-[#fafafa]/20 space-y-4 text-left">
                                                    {/* Creator details */}
                                                    <div className="flex items-center gap-2 bg-white/60 p-2.5 rounded-lg border border-[#f0f0f0] max-w-max">
                                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-[#888] border overflow-hidden">
                                                            {bug.created_by?.avatar ? (
                                                                <img src={bug.created_by.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                bug.created_by?.name?.charAt(0) || <User size={10} />
                                                            )}
                                                        </div>
                                                        <span className="text-[10.5px] font-bold text-[#666]">
                                                            Created by <span className="font-extrabold text-[#1f2124]">{bug.created_by?.name || "QA Tester"}</span> ({bug.created_by?.designation || "QA Engineer"})
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    {bug.description && (
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Description</span>
                                                            <p className="text-[12px] text-[#555] leading-relaxed bg-white p-3 rounded-lg border border-[#eee]">{bug.description}</p>
                                                        </div>
                                                    )}

                                                    {/* Environment */}
                                                    {bug.environment && (
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Environment</span>
                                                            <p className="text-[11.5px] text-[#555] font-mono bg-white p-2.5 rounded-lg border border-[#eee]">{bug.environment}</p>
                                                        </div>
                                                    )}

                                                    {/* Reproduction Steps */}
                                                    {bug.reproduction_steps && (
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Reproduction Steps</span>
                                                            <p className="text-[12px] text-[#555] whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-[#eee]">{bug.reproduction_steps}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* PROJECT TEAM TAB */}
                    {activeTab === "team" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {team.length === 0 ? (
                                <div className="col-span-full bg-white border border-[#f0f0f0] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                    <Users size={30} className="text-[#ccc] mb-2" />
                                    <p className="text-[13px] font-bold text-[#555]">No Team Members Linked</p>
                                    <p className="text-[11px] text-[#aaa] mt-0.5">There are no team members associated with issues in this project.</p>
                                </div>
                            ) : (
                                team.map((member) => (
                                    <div 
                                        key={member._id}
                                        className="bg-white border border-[#ebebeb] rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-[#fa8029]/20 transition-all group duration-300 text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-[#eee] flex items-center justify-center text-[12px] font-black text-[#fa8029] shadow-inner overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                member.name?.charAt(0) || <User size={16} />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-black text-[#1f2124] group-hover:text-[#fa8029] transition-colors truncate">
                                                {member.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#fa8029] uppercase tracking-wide truncate mt-0.5 opacity-80">
                                                {member.role || "Member"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
