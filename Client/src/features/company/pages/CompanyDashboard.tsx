import { useState, useEffect, useMemo } from "react";
import { 
    Users, Briefcase, Layout, PieChart, BarChart3,
    Activity, Zap, Calendar, AlertCircle
} from "lucide-react";
import { 
    getCompanyDashboardApi, 
    type CompanyDashboardData 
} from "../api/dashboardApi";
import { toast } from "sonner";
import {
    BarChart, Bar, XAxis, YAxis, 
    Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie
} from 'recharts';




const STATUS_COLORS = {
    todo: '#6366f1',
    inProgress: '#fa8029',
    inReview: '#8b5cf6',
    blocked: '#ef4444',
    done: '#10b981',
};

const PIE_COLORS = ['#fa8029', '#1a1c1f', '#6366f1', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, description, isPrimary }: any) => (
    <div className={`rounded-2xl p-5 border transition-all ${
        isPrimary 
        ? 'bg-[#1a1c1f] text-white border-transparent shadow-lg shadow-orange-900/10' 
        : 'bg-white border-gray-100 shadow-sm'
    }`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isPrimary ? 'bg-[#fa8029] text-white' : 'bg-[#fff5ef] text-[#fa8029]'}`}>
                <Icon size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">{title}</h3>
        </div>
        <div className="text-2xl font-black tracking-tight">{value}</div>
        <p className="text-[10px] font-medium text-gray-400 mt-1">{description}</p>
    </div>
);

export default function CompanyDashboard() {
    const [data, setData] = useState<CompanyDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getCompanyDashboardApi();
                if (res.success) setData(res.data);
            } catch (err) {
                toast.error("Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const statusData = useMemo(() => {
        if (!data) return [];
        return [
            { name: 'To Do', value: data.statusDistribution.todo, color: STATUS_COLORS.todo },
            { name: 'In Progress', value: data.statusDistribution.inProgress, color: STATUS_COLORS.inProgress },
            { name: 'In Review', value: data.statusDistribution.inReview, color: STATUS_COLORS.inReview },
            { name: 'Blocked', value: data.statusDistribution.blocked, color: STATUS_COLORS.blocked },
            { name: 'Done', value: data.statusDistribution.done, color: STATUS_COLORS.done },
        ];
    }, [data]);

    const barData = useMemo(() => {
        if (!data) return [];
        return [
            { name: 'Stories', count: data.issueStats.stories },
            { name: 'Tasks', count: data.issueStats.tasks },
            { name: 'Bugs', count: data.issueStats.bugs },
        ];
    }, [data]);

    if (loading) return <div className="p-6 space-y-6 animate-pulse bg-[#fafafa] min-h-screen">
        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-80 bg-white rounded-2xl border border-gray-100" />
            <div className="h-80 bg-white rounded-2xl border border-gray-100" />
        </div>
    </div>;

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-[#fafafa] min-h-screen font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1c1f] tracking-tight flex items-center gap-2">
                        <Zap size={22} className="text-[#fa8029]" fill="#fa8029" />
                        Dashboard
                    </h1>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Company Overview</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <Calendar size={14} className="text-[#fa8029]" />
                    <span className="text-[11px] font-black text-[#1a1c1f] uppercase tracking-tighter">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Workforce" value={data?.totalEmployees || 0} icon={Users} description="Active employees" isPrimary />
                <StatCard title="Projects" value={data?.totalProjects || 0} icon={Briefcase} description="Total initiatives" />
                <StatCard title="Teams" value={data?.totalTeams || 0} icon={Layout} description="Operational units" />
                <StatCard title="Sprints" value={`${data?.completedSprints || 0} / ${data?.totalSprints || 0}`} icon={Activity} description="Completed / Total Sprints" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-[#1a1c1f] uppercase tracking-widest flex items-center gap-2">
                            <PieChart size={16} className="text-[#fa8029]" /> Workflow Distribution
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="h-[240px] relative min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-2xl font-black text-[#1a1c1f]">{data?.issueStats.total}</div>
                                <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Items</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {statusData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[11px] font-black text-[#1a1c1f]">{item.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-[#fa8029]">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-sm font-black text-[#1a1c1f] uppercase tracking-widest flex items-center gap-2 mb-6">
                        <BarChart3 size={16} className="text-[#fa8029]" /> Categories
                    </h2>
                    <div className="flex-1 h-[200px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                                    {barData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
}