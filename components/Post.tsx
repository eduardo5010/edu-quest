
import React, { useState } from 'react';
import { Post as PostType, User, Comment as CommentType, ReactionType } from '../types';
import PostContentRenderer from './PostContentRenderer';

interface PostProps {
    post: PostType;
    currentUser: User;
    onReaction: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, content: string) => void;
    onNavigateToProfile: (userId: string) => void;
}

const REACTION_MAP: Record<ReactionType, { icon: string; label: string; color: string; hoverBg: string; }> = {
    like: { icon: '👍', label: 'Like', color: 'text-indigo-500', hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50' },
    love: { icon: '❤️', label: 'Love', color: 'text-red-500', hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/50' },
    insightful: { icon: '💡', label: 'Insightful', color: 'text-amber-500', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50' },
    funny: { icon: '😂', label: 'Funny', color: 'text-yellow-500', hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50' }
};

const Post: React.FC<PostProps> = ({ post, currentUser, onReaction, onAddComment, onNavigateToProfile }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);

    const currentUserReaction = post.reactions[currentUser.id];

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        onAddComment(post.id, commentContent);
        setCommentContent('');
    }

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}m`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}min`;
        return `${Math.floor(seconds)}s`;
    }
    
    const reactionCounts = Object.values(post.reactions).reduce((acc, reaction: ReactionType) => {
        acc[reaction] = (acc[reaction] || 0) + 1;
        return acc;
    }, {} as Record<ReactionType, number>);

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
                <button onClick={() => onNavigateToProfile(post.authorId)}>
                    <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full" />
                </button>
                <div>
                    <button onClick={() => onNavigateToProfile(post.authorId)} className="font-bold text-slate-900 dark:text-white hover:underline">{post.authorName}</button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(post.timestamp)} ago</p>
                </div>
            </div>
            
            <PostContentRenderer content={post.content} />
            
            <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                    {Object.entries(reactionCounts).sort(([,a], [,b]) => b - a).map(([reaction, count]) => (
                        <div key={reaction} className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">
                            <span className="text-base">{REACTION_MAP[reaction as ReactionType].icon}</span>
                            <span className="font-semibold text-xs">{count}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowComments(true)}>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</button>
            </div>

            <div className="border-t border-b border-slate-200 dark:border-slate-700 my-2 flex justify-around">
                <div className="relative w-full" onMouseEnter={() => setPickerVisible(true)} onMouseLeave={() => setPickerVisible(false)}>
                    {pickerVisible && (
                        <div className="absolute bottom-full mb-2 w-full flex justify-center">
                            <div className="bg-white dark:bg-slate-700 shadow-lg rounded-full flex p-1 space-x-1 border border-slate-200 dark:border-slate-600">
                                {(Object.keys(REACTION_MAP) as ReactionType[]).map(reaction => (
                                    <button key={reaction} onClick={() => onReaction(post.id, reaction)} className="p-2 rounded-full text-2xl transform hover:scale-125 transition-transform">
                                        {REACTION_MAP[reaction].icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <button onClick={() => onReaction(post.id, currentUserReaction || 'like')} className={`w-full py-2 font-semibold flex items-center justify-center space-x-2 rounded-lg transition-colors ${currentUserReaction ? REACTION_MAP[currentUserReaction].color + ' ' + REACTION_MAP[currentUserReaction].hoverBg : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        <span className="text-xl">{currentUserReaction ? REACTION_MAP[currentUserReaction].icon : REACTION_MAP['like'].icon}</span>
                        <span>{currentUserReaction ? REACTION_MAP[currentUserReaction].label : 'Like'}</span>
                    </button>
                </div>
                 <button onClick={() => setShowComments(!showComments)} className="w-full py-2 font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                    <span>Comment</span>
                </button>
            </div>
            
            {showComments && (
                <div className="mt-4 space-y-4">
                     <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                        <div className="w-full"><input type="text" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Write a comment..." className="w-full p-2 text-sm border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
                     </form>
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                            <img src={comment.authorAvatar} alt={comment.authorName} className="w-9 h-9 rounded-full" />
                            <div><div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3"><p className="font-bold text-sm">{comment.authorName}</p><p className="text-sm">{comment.content}</p></div><p className="text-xs text-slate-500 dark:text-slate-400 ml-3 mt-1">{timeAgo(comment.timestamp)} ago</p></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Post;