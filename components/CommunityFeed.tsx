
import React, { useState, useMemo } from 'react';
import { User, Post as PostType, ReactionType } from '../types';
import CreatePost from './CreatePost';
import Post from './Post';
import Leaderboard from './Leaderboard';

interface CommunityFeedProps {
    user: User;
    allUsers: User[];
    posts: PostType[];
    onCreatePost: (content: string) => void;
    onReaction: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, content: string) => void;
    onNavigateToProfile: (userId: string) => void;
}

type FeedType = 'For You' | 'Following';
type ActiveTab = 'feed' | 'leagues';


const TabButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; }> = ({ onClick, isActive, children }) => {
    const baseClasses = "px-4 py-2 font-semibold text-lg transition-colors";
    const activeClasses = "text-indigo-500 border-b-2 border-indigo-500";
    const inactiveClasses = "text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{children}</button>
}

const FeedTypeButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; }> = ({ onClick, isActive, children }) => {
    const baseClasses = "w-full py-3 font-semibold transition-colors";
    const activeClasses = "text-indigo-500 dark:text-white bg-slate-100 dark:bg-slate-700";
    const inactiveClasses = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{children}</button>
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ user, allUsers, posts, onCreatePost, onReaction, onAddComment, onNavigateToProfile }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
    const [feedType, setFeedType] = useState<FeedType>('For You');

    const filteredPosts = useMemo(() => {
        const sorted = [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (feedType === 'Following') {
            return sorted.filter(post => user.following.includes(post.authorId));
        }
        return sorted; // "For You" shows all posts for now
    }, [posts, feedType, user.following]);

    return (
        <div className="max-w-3xl mx-auto">
             <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton onClick={() => setActiveTab('feed')} isActive={activeTab === 'feed'}>Community</TabButton>
                    <TabButton onClick={() => setActiveTab('leagues')} isActive={activeTab === 'leagues'}>Leagues</TabButton>
                </nav>
             </div>

            {activeTab === 'feed' && (
                <div>
                    <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700 mb-6">
                        <FeedTypeButton onClick={() => setFeedType('For You')} isActive={feedType === 'For You'}>For You</FeedTypeButton>
                        <FeedTypeButton onClick={() => setFeedType('Following')} isActive={feedType === 'Following'}>Following</FeedTypeButton>
                    </div>
                    
                    <CreatePost user={user} onCreatePost={onCreatePost} />

                    <div className="mt-8 space-y-6">
                        {filteredPosts.map(post => (
                            <Post 
                                key={post.id}
                                post={post}
                                currentUser={user}
                                onReaction={onReaction}
                                onAddComment={onAddComment}
                                onNavigateToProfile={onNavigateToProfile}
                            />
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'leagues' && (
                <Leaderboard currentUser={user} allUsers={allUsers} />
            )}
        </div>
    );
};

export default CommunityFeed;