import { useState, useEffect } from 'react';
import { User, Award, Target, Leaf, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';

interface ImpactStats {
    total_carbon_saved: number;
    weekly_report: string;
    active_goals: UserGoal[];
    total_baskets?: number;
    total_score?: number;
    average_score?: number | string;
}

interface UserGoal {
    id: number;
    type: string;
    description: string;
    target_value: number;
    progress: number;
    is_completed: boolean;
}

interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    criteria: string;
}

interface UserBadge {
    id: number;
    badge: Badge;
    earned_at: string;
}

import { API_BASE_URL } from "../../config";

export default function Impact() {
    const [stats, setStats] = useState<ImpactStats | null>(null);
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, badgesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/impact/stats`),
                fetch(`${API_BASE_URL}/api/badges`)
            ]);

            const statsData = await statsRes.json();
            const badgesData = await badgesRes.json();

            if (statsData.success) setStats(statsData.stats);
            if (badgesData.success) setBadges(badgesData.badges);

        } catch (error) {
            console.error('Failed to fetch impact data', error);
        } finally {
            setLoading(false);
        }
    };

    const createGoal = async () => {
        // Mock goal creation for demo
        try {
            const goal = {
                type: 'carbon_reduction',
                description: 'Reduce carbon footprint by 10%',
                target_value: 10,
                progress: 0
            };

            await fetch(`${API_BASE_URL}/api/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goal)
            });
            fetchData(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}><div className="animate-spin" style={{ color: 'var(--cream)' }}>Loading...</div></div>;

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--page-bg)' }}>
            {/* Header */}
            <div className="border-b" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <User className="w-8 h-8" style={{ color: 'var(--cream)' }} />
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--cream)' }}>Your Impact</h1>
                    </div>
                    <p className="text-gray-400">Track your journey to a greener lifestyle</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Card */}
                {stats && (
                    <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-emerald-100 font-medium mb-1">Total Carbon Saved</h2>
                                <div className="text-4xl font-bold">{Number(stats.total_carbon_saved || 0).toFixed(1)} <span className="text-xl font-normal opacity-80">kg</span></div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <Leaf className="w-8 h-8 text-emerald-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-xs text-emerald-100">Baskets Saved</div>
                                <div className="text-2xl font-bold">{stats.total_baskets ?? 0}</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-xs text-emerald-100">Average Score</div>
                                <div className="text-2xl font-bold">{typeof stats.average_score === 'string' ? stats.average_score : (Number(stats.average_score || 0).toFixed(1))}</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-xs text-emerald-100">Total Score</div>
                                <div className="text-2xl font-bold">{Number(stats.total_score || 0).toFixed(0)}</div>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                            <div className="flex gap-2 items-start">
                                <TrendingUp className="w-5 h-5 text-emerald-200 mt-0.5" />
                                <p className="text-sm text-emerald-50 leading-relaxed">{stats.weekly_report}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Goals Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-600" />
                            Eco Goals
                        </h2>
                        <button
                            onClick={createGoal}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Set New Goal
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {stats?.active_goals && stats.active_goals.length > 0 ? (
                            stats.active_goals.map(goal => (
                                <div key={goal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-2">{goal.description}</p>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(goal.progress / goal.target_value) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                            <span>{Math.round((goal.progress / goal.target_value) * 100)}% Complete</span>
                                            <span>Target: {goal.target_value}%</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No active goals. Start by setting one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Badges Section */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Badges & Achievements
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {badges && badges.length > 0 ? badges.map((userBadge, idx) => (
                                <div key={userBadge?.id ?? idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Award className="w-6 h-6 text-amber-500" />{/* Dynamic icon logic could go here */}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{userBadge?.badge?.name ?? userBadge?.name ?? 'Badge'}</h3>
                                    <p className="text-xs text-gray-500">{userBadge?.badge?.description ?? userBadge?.description ?? ''}</p>
                                </div>
                            )) : (
                            <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl">
                                <p className="text-gray-500 text-sm">Start scanning to earn badges!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Navigation />
        </div>
    );
}
