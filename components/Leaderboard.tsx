
import React from 'react';
import { User, LeagueTier } from '../types';

interface LeaderboardProps {
  currentUser: User;
  allUsers: User[];
}

const LEAGUE_CONFIG: Record<LeagueTier, { icon: string; color: string; }> = {
    Bronze: { icon: '🥉', color: 'text-yellow-600' },
    Silver: { icon: '🥈', color: 'text-slate-400' },
    Gold: { icon: '🥇', color: 'text-amber-400' },
    Diamond: { icon: '💎', color: 'text-sky-400' },
    Obsidian: { icon: '⚫', color: 'text-indigo-400' },
};

const PROMOTION_ZONE_SIZE = 3;
const DEMOTION_ZONE_SIZE = 3;

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, allUsers }) => {
    const currentLeague = currentUser.league || 'Bronze';
    const leagueUsers = allUsers
        .filter(u => u.league === currentLeague)
        .sort((a, b) => (b.weeklyXp || 0) - (a.weeklyXp || 0));
    
    const config = LEAGUE_CONFIG[currentLeague];

    const getRowStyle = (rank: number, user: User) => {
        let classes = 'p-3 rounded-lg flex items-center space-x-4 transition-all duration-200 ';
        if (user.id === currentUser.id) {
            classes += 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500';
        } else {
            classes += 'bg-white dark:bg-slate-800';
        }
        return classes;
    }
    
    const getZoneIndicator = (rank: number, totalUsers: number) => {
        if (rank < PROMOTION_ZONE_SIZE) {
            return <div className="w-1.5 h-full bg-green-500 rounded-l-lg absolute left-0 top-0" title="Promotion Zone"></div>
        }
        if (rank >= totalUsers - DEMOTION_ZONE_SIZE) {
             return <div className="w-1.5 h-full bg-red-500 rounded-l-lg absolute left-0 top-0" title="Demotion Zone"></div>
        }
        return null;
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
                <h2 className={`text-3xl font-extrabold ${config.color}`}>{config.icon} {currentLeague} League</h2>
                <p className="text-slate-500 dark:text-slate-400 font-semibold">League ends on Sunday at midnight</p>
            </div>
            
            <div className="space-y-3">
                {leagueUsers.map((user, index) => {
                    const rank = index + 1;
                    return (
                        <div key={user.id} className="relative">
                            {getZoneIndicator(index, leagueUsers.length)}
                            <div className={getRowStyle(rank, user)}>
                                <div className="font-bold text-lg w-8 text-center">{rank}</div>
                                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                                <div className="flex-grow">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                                </div>
                                <div className="font-bold text-indigo-500 text-lg">{user.weeklyXp || 0} XP</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-1 text-center">
                <p><span className="font-bold text-green-500">Top {PROMOTION_ZONE_SIZE}</span> learners will be promoted to the next league.</p>
                <p><span className="font-bold text-red-500">Bottom {DEMOTION_ZONE_SIZE}</span> learners will be demoted to the previous league.</p>
            </div>
        </div>
    );
};

export default Leaderboard;
