import React, { useState } from 'react';
import { User } from '../types';
import { geminiService } from '../services/geminiService';

interface CreatePostProps {
    user: User;
    onCreatePost: (content: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ user, onCreatePost }) => {
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onCreatePost(content);
        setContent('');
    };

    const handleGenerateIdea = async () => {
        setIsGenerating(true);
        const idea = await geminiService.generatePostIdea();
        setContent(idea);
        setIsGenerating(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
            <div className="flex items-start space-x-4">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                <form onSubmit={handleSubmit} className="w-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows={3}
                        placeholder="Share your progress, ask a question, or paste a link to an image or YouTube video!"
                    />
                    <div className="mt-2 flex justify-between items-center">
                         <button 
                            type="button" 
                            onClick={handleGenerateIdea}
                            disabled={isGenerating}
                            className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-wait flex items-center"
                         >
                            <span className="text-lg mr-1">✨</span> 
                            {isGenerating ? 'Inspiring...' : 'Inspire Me'}
                         </button>
                         <button 
                            type="submit"
                            disabled={!content.trim()}
                            className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
                         >
                            Post
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;