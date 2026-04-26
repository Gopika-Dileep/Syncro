import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, Calendar, Clock, CheckCircle2, 
    BarChart3, Users, Layout, Bug, Target,
    TrendingUp, Shield, Mail, Phone, ExternalLink
} from "lucide-react";
import { getProjectInsightsApi, type ProjectInsights } from "../api/projectApi";
import { toast } from "sonner";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [insights, setInsights] = useState<ProjectInsights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) fetchInsights();
    }, [projectId]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await getProjectInsightsApi(projectId!);
            if (res.success) {
                setInsights(res.data);
            }
        } catch {
            toast.error("Failed to load project details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfdfd]">
                <div className="w-10 h-10 border-3 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] text-[#888] font-bold mt-4 animate-pulse">Gathering Insights...</p>
            </div>
        );
    }

    if (!insights) return null;

    const { project, stats, team } = insights;
    const progress = stats.total_points > 0 ? Math.round((stats.completed_points / stats.total_points) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#fdfdfd] pb-8">
            <div className="max-w-[1400px] mx-auto px-6 pt-4 space-y-4">
                {/* Simple Breadcrumb */}
                <button 
                    onClick={() => navigate('/company/projects')}
                    className="flex items-center gap-2 text-[#ccc] hover:text-[#fa8029] transition-colors font-black text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={12} strokeWidth={3} /> Back to Matrix
                </button>

                {/* Premium Project Control Center */}
                <div className="bg-white border border-[#f0f0f0] rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#fa8029]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-[#fa8029]/10" />
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[20px] font-black text-[#1f2124] tracking-tight leading-none">{project.name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                    project.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    project.status === 'On-Hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-[12px] text-[#888] font-medium max-w-xl line-clamp-1 italic">{project.description}</p>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex gap-6 border-r border-[#f0f0f0] pr-8">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-[#ccc] uppercase tracking-widest mb-0.5">Start Date</p>
                                    <p className="text-[11px] font-black text-[#555]">{new Date(project.start_date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-[#ccc] uppercase tracking-widest mb-0.5">Deadline</p>
                                    <p className="text-[11px] font-black text-[#555]">{new Date(project.target_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-[#ccc] uppercase tracking-widest mb-0.5">Project Manager</p>
                                    <p className="text-[11px] font-black text-[#1f2124]">{project.created_by?.name || "Unassigned"}</p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-[#fa8029] text-white flex items-center justify-center text-[12px] font-black shadow-lg shadow-[#fa8029]/20">
                                    {project.created_by?.name?.charAt(0) || "P"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3-Column Command Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { type: 'story', label: 'User Stories', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50', accent: '#3b82f6' },
                        { type: 'task', label: 'Active Tasks', icon: Layout, color: 'text-emerald-500', bg: 'bg-emerald-50', accent: '#10b981' },
                        { type: 'bug', label: 'Bugs & Issues', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50', accent: '#f43f5e' }
                    ].map((col) => (
                        <div key={col.type} className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1 py-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-4 rounded-full`} style={{ backgroundColor: col.accent }} />
                                    <h2 className="text-[13px] font-black text-[#1f2124] uppercase tracking-wider">{col.label}</h2>
                                    <span className="text-[10px] font-black text-[#ccc]">{insights.stories.filter(s => s.type === col.type).length}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {insights.stories.filter(s => s.type === col.type).map((story) => (
                                    <div key={story._id} className="bg-white border border-[#f0f0f0] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border-t-2" style={{ borderTopColor: col.accent + '20' }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-[12px] font-black text-[#1f2124] group-hover:text-[#fa8029] transition-colors leading-tight">
                                                {story.title}
                                            </h4>
                                            <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                                                story.priority === 'High' ? 'bg-rose-50 text-rose-500' :
                                                story.priority === 'Medium' ? 'bg-amber-50 text-amber-500' :
                                                'bg-emerald-50 text-emerald-500'
                                            }`}>
                                                {story.priority}
                                            </div>
                                        </div>

                                        {/* Nested Tasks Feed - Only for User Stories */}
                                        {story.type === 'story' && (
                                            <div className="space-y-1.5 mb-3">
                                                {insights.tasks.filter(t => t.user_story_id === story._id).length > 0 ? (
                                                    <div className="space-y-1 pl-1">
                                                        {insights.tasks
                                                            .filter(t => t.user_story_id === story._id)
                                                            .map(task => (
                                                                <div key={task._id} className="flex items-center justify-between group/task">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1 h-1 rounded-full bg-[#eee] group-hover/task:bg-[#fa8029] transition-colors" />
                                                                        <span className="text-[10px] font-bold text-[#888] group-hover/task:text-[#555] line-clamp-1">{task.title}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <div className="flex flex-col items-end gap-0">
                                                                            <div className="w-3.5 h-3.5 rounded-full bg-[#f8f8f8] flex items-center justify-center text-[6px] font-black text-[#aaa] overflow-hidden border border-white shadow-sm" title={task.assign_to?.name || 'Unassigned'}>
                                                                                {task.assign_to?.avatar ? <img src={task.assign_to.avatar} className="w-full h-full object-cover" /> : task.assign_to?.name?.charAt(0) || '?'}
                                                                            </div>
                                                                            {task.assign_to?.team_name && (
                                                                                <span className="text-[6px] font-black text-[#fa8029]/50 uppercase tracking-tighter leading-none mt-0.5">{task.assign_to.team_name}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                ) : (
                                                    <p className="text-[9px] text-[#ddd] font-medium italic pl-1">No sub-tasks yet</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-[#fcfcfc]">
                                            <div className="flex flex-col gap-0.5">
                                                {story.type !== 'story' && (
                                                    <>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded-lg bg-[#f8f8f8] flex items-center justify-center text-[7px] font-black text-[#aaa]">
                                                                {story.assign_to?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-[#555]">{story.assign_to?.name || 'Unassigned'}</span>
                                                        </div>
                                                        {story.team && (
                                                            <span className="text-[8px] font-black text-[#fa8029]/60 uppercase tracking-widest pl-5">{story.team.name} Team</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                                                story.status === 'DONE' ? 'text-emerald-500' :
                                                story.status === 'IN_PROGRESS' ? 'text-blue-500' :
                                                'text-[#ccc]'
                                            }`}>
                                                {story.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
