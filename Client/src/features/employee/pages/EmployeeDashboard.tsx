import { useState, useEffect, useMemo } from "react";
import { 
    AlertCircle, Zap, 
    CheckCircle2,
    Activity, Users,
    LayoutGrid, Filter, MoreHorizontal
} from "lucide-react";

import { 
    getEmployeeDashboardApi 
} from "../api/dashboardApi";
import { useSelector } from "react-redux";
import { toast } from "sonner";


// --- MINIMALIST COMPONENTS ---

const MetricCard = ({ title, value, icon: Icon, description, trend, isPrimary }: any) => (
    <div className={`p-5 rounded-xl border transition-all ${
        isPrimary 
        ? 'bg-[#1a1c1f] text-white border-transparent' 
        : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
    }`}>
        <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-[#fa8029] text-white' : 'bg-gray-50 text-gray-400'}`}>
                <Icon size={16} />
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isPrimary ? 'text-gray-400' : 'text-gray-400'}`}>
                {title}
            </p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black tracking-tight">{value}</h3>
                {description && <span className="text-[9px] font-medium opacity-50">{description}</span>}
            </div>
        </div>
    </div>
);

export default function EmployeeDashboard() {
    const employee = useSelector((state: any) => state.auth.user);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getEmployeeDashboardApi();
                if (res.success) setData(res.data);
            } catch (err) {
                toast.error("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const isManager = !!data?.managerMetrics;
    const isLead = !!data?.teamMetrics && !isManager;

    const completionRate = useMemo(() => {
        if (!data) return 0;
        const total = data.teamMetrics ? data.teamMetrics.totalAssigned : data.myStats.totalAssigned;
        const done = data.teamMetrics ? data.teamMetrics.completed : data.myStats.completed;
        return total > 0 ? Math.round((done / total) * 100) : 0;
    }, [data]);

    if (loading) return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-pulse">
            <div className="h-6 w-32 bg-gray-100 rounded-lg" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 h-96 bg-white border border-gray-100 rounded-2xl" />
                <div className="h-96 bg-white border border-gray-100 rounded-2xl" />
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-8 min-h-screen bg-[#fafafa]">
            
            {/* --- MINIMAL HEADER --- */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-black text-[#1a1c1f]">
                            {isManager || isLead ? `Welcome, ${employee?.name.split(' ')[0]}` : "My Work"}
                        </h1>
                        <span className="px-2 py-0.5 bg-[#1a1c1f] text-white text-[8px] font-black uppercase tracking-widest rounded">
                            {isManager ? 'MANAGER' : isLead ? 'LEAD' : 'DEVELOPER'}
                        </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 bg-white">
                        <Filter size={14} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* --- MINIMAL ALERT (Developer Only) --- */}
            {data?.myStats?.blocked > 0 && !isManager && (
                <div className="bg-white border border-rose-100 p-4 rounded-xl flex items-center justify-between shadow-sm shadow-rose-900/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                            <AlertCircle size={16} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-[#1a1c1f] uppercase tracking-wide">Blocked Tasks</p>
                            <p className="text-[11px] text-gray-400 font-medium">You have {data.myStats.blocked} tasks that are blocked and need attention.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black text-rose-500 uppercase hover:underline">View Blocked</button>
                </div>
            )}

            {/* --- METRICS BAR --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                    title={isManager ? "Total Projects" : isLead ? "Team Members" : "Total Tasks"}
                    value={isManager ? data.managerMetrics?.totalActiveProjects || 0 : isLead ? data.teamStats?.totalMembers || 0 : data.myStats.totalAssigned}
                    icon={isManager ? LayoutGrid : Users}
                    description="Active scope"
                />
                <MetricCard 
                    title={isManager ? "Sprints" : isLead ? "Pending Review" : "In Progress"}
                    value={isManager ? `${data.managerMetrics?.completedSprints || 0}/${data.managerMetrics?.totalSprints || 0}` : isLead ? data.teamMetrics?.statusDistribution?.inReview || 0 : data.myStats.inProgress}
                    icon={Activity}
                    description={isManager ? "Done / Total" : "Work flow"}
                />
                <MetricCard 
                    title={isManager ? "Total Teams" : isLead ? "Team Progress" : "Completed Tasks"}
                    value={isManager ? data.managerMetrics?.totalTeams || 0 : isLead ? `${data.teamMetrics?.completed || 0}/${data.teamMetrics?.totalAssigned || 0}` : data.myStats.completed}
                    icon={isManager ? Users : CheckCircle2}
                    description="Current status"
                />
                <MetricCard 
                    title="Overall Progress"
                    value={`${completionRate}%`}
                    icon={Zap}
                    description="Completion rate"
                    isPrimary
                />
            </div>

            {/* --- MAIN GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Primary Work List (70%) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-[#1a1c1f] uppercase tracking-widest">
                                {isManager ? "Project Status" : isLead ? "Team Progress" : "To-Do List"}
                            </h3>
                            <button className="p-1 hover:bg-gray-50 rounded text-gray-400">
                                <MoreHorizontal size={14} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {(isManager || isLead) ? (
                                <div className="space-y-6">
                                    {isManager && data.managerMetrics?.projectStatus ? (
                                        data.managerMetrics.projectStatus.map((project: any, idx: number) => (
                                            <div key={idx} className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500">
                                                            {project.name ? project.name.charAt(0) : 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-700">{project.name}</p>
                                                            <p className="text-[9px] text-gray-400 font-medium">{project.completedItems} / {project.totalItems} Items</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-indigo-500">
                                                        {project.progress}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-indigo-50/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 group-hover:bg-[#fa8029] transition-all duration-700" 
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        data.teamMetrics?.workloadDistribution?.slice(0, 5).map((member: any, idx: number) => {
                                            const isLeadership = member.designation?.toLowerCase().includes('manager') || member.designation?.toLowerCase().includes('lead');
                                            return (
                                                <div key={idx} className="group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                                {member.assigneeName ? member.assigneeName.charAt(0) : '?'}
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700">{member.assigneeName || 'Unknown'}</span>
                                                        </div>
                                                        {!isLeadership ? (
                                                            <span className="text-[10px] font-black text-gray-400">
                                                                {member.taskCount > 0 ? Math.round((member.completedCount / member.taskCount) * 100) : 0}%
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-wider rounded border border-indigo-100">
                                                                {member.designation}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isLeadership && (
                                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-[#1a1c1f] group-hover:bg-[#fa8029] transition-all duration-700" 
                                                                style={{ width: `${member.taskCount > 0 ? Math.round((member.completedCount / member.taskCount) * 100) : 0}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.upcomingDeadlines?.slice(0, 6).map((task: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-[#fa8029]' : 'bg-gray-300'}`} />
                                                <span className="text-xs font-bold text-gray-700">{task.title}</span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-gray-400">{task.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {(isManager || isLead) && (
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-black text-[#1a1c1f] uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={16} className="text-[#ef4444]" /> Recent Blocked {isManager ? "Issues" : "Team Tasks"}
                                </h2>
                            </div>
                            <div className="p-6">
                                {((isManager ? data.managerMetrics?.recentBlocked : data.teamMetrics?.recentBlocked) || []).length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-50">
                                                    <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                                    <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                                                    <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
                                                    <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                                                    <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(isManager ? data.managerMetrics.recentBlocked : data.teamMetrics.recentBlocked).map((issue: any) => (
                                                    <tr key={issue._id} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-3">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                                issue.type === 'bug' ? 'bg-rose-50 text-rose-500' :
                                                                issue.type === 'sub-task' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'
                                                            }`}>
                                                                {issue.type}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <p className="text-[12px] font-bold text-[#1a1c1f] line-clamp-1">{issue.title}</p>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                                issue.priority?.toLowerCase() === 'critical' ? 'bg-rose-50 text-rose-500' :
                                                                issue.priority?.toLowerCase() === 'high' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                                                            }`}>
                                                                {issue.priority}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <p className="text-[11px] text-gray-500 italic line-clamp-1">"{issue.blocked_reason}"</p>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <p className="text-[10px] font-bold text-gray-400">
                                                                {new Date(issue.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-xl">
                                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">No currently blocked items</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Intelligence Sidebar (30%) */}
                <div className="space-y-8">
                    {/* Stats Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                        <h3 className="text-xs font-black text-[#1a1c1f] uppercase tracking-widest mb-6">Task Breakdown</h3>
                        <div className="space-y-4">
                            {isManager ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Stories</span>
                                        <span className="text-xs font-black text-[#1a1c1f]">{data.managerMetrics?.globalTypeStats?.stories || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Bugs</span>
                                        <span className="text-xs font-black text-rose-500">{data.managerMetrics?.globalTypeStats?.bugs || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Tasks</span>
                                        <span className="text-xs font-black text-[#1a1c1f]">{data.managerMetrics?.globalTypeStats?.tasks || 0}</span>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between font-black">
                                        <span className="text-[11px] uppercase tracking-widest text-gray-400">Total Work</span>
                                        <span className="text-sm text-[#fa8029]">{data.teamMetrics?.totalAssigned || 0}</span>
                                    </div>
                                </>
                            ) : isLead ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Team Total</span>
                                        <span className="text-xs font-black text-[#1a1c1f]">{data.teamMetrics?.totalAssigned || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Working On</span>
                                        <span className="text-xs font-black text-[#fa8029]">{data.teamMetrics?.inProgress || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Finished</span>
                                        <span className="text-xs font-black text-emerald-500">{data.teamMetrics?.completed || 0}</span>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between font-black">
                                        <span className="text-[11px] uppercase tracking-widest text-gray-400">Team Success</span>
                                        <span className="text-sm text-[#fa8029]">{completionRate}%</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Total Tasks</span>
                                        <span className="text-xs font-black text-[#1a1c1f]">{data.myStats.totalAssigned}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Working On</span>
                                        <span className="text-xs font-black text-[#fa8029]">{data.myStats.inProgress}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400">Finished</span>
                                        <span className="text-xs font-black text-emerald-500">{data.myStats.completed}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Deadline Radar / Active Sprint */}
                    <div className="bg-[#1a1c1f] rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                                {data.teamMetrics?.activeSprint ? "Active Sprint Deadline" : "Upcoming Deadlines"}
                            </h3>
                            <div className="space-y-5">
                                {data.teamMetrics?.activeSprint ? (
                                    <>
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <span className="text-[11px] font-bold opacity-80 uppercase tracking-wider">End Date</span>
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-[#fa8029] rounded uppercase shadow-lg shadow-orange-900/20">
                                                {new Date(data.teamMetrics.activeSprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold opacity-60">Completed</span>
                                            <span className="text-xs font-black text-emerald-400">{data.teamMetrics.activeSprint.completedTasks} Tasks</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold opacity-60">Incomplete</span>
                                            <span className="text-xs font-black text-rose-400">{data.teamMetrics.activeSprint.incompleteTasks} Tasks</span>
                                        </div>
                                    </>
                                ) : (
                                    data.upcomingDeadlines?.slice(0, 3).map((task: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold opacity-80 truncate max-w-[120px]">{task.title}</span>
                                            <span className="text-[9px] font-black px-2 py-0.5 bg-white/10 rounded uppercase">
                                                {new Date(task.due_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fa8029] opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    </div>
                </div>
            </div>
            
            <div className="text-center pt-4">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">
                    Syncro Intelligence Engine • Build v2.5 • Minimal Mode Active
                </p>
            </div>
        </div>
    );
}