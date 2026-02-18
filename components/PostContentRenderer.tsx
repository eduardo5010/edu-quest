
import React, { useState } from 'react';
import Latex from 'react-latex-next';

interface PostContentRendererProps {
  content: string;
}

const MAX_LENGTH = 350;

const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const isImageUrl = (url: string): boolean => {
    return /\.(jpg|jpeg|png|gif)$/.test(url);
};

const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => (
    <div className="aspect-video w-full my-3">
        <iframe
            className="w-full h-full rounded-lg shadow-md"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    </div>
);

const PostContentRenderer: React.FC<PostContentRendererProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isLongText = content.length > MAX_LENGTH;
    const textToShow = isLongText && !isExpanded ? content.substring(0, MAX_LENGTH) : content;

    const renderContent = () => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = textToShow.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                const youtubeId = getYouTubeId(part);
                if (youtubeId) {
                    return <YouTubeEmbed key={index} videoId={youtubeId} />;
                }
                if (isImageUrl(part)) {
                    return (
                        <div key={index} className="my-3">
                            <img src={part} alt="User post content" className="max-w-full h-auto rounded-lg shadow-md" />
                        </div>
                    );
                }
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline break-all">
                        {part}
                    </a>
                );
            }
            // Render text part with LaTeX support
            return <span key={index}><Latex>{part}</Latex></span>;
        });
    };

    return (
        <div className="my-4 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {renderContent()}
            {isLongText && !isExpanded && <span className="text-slate-500">...</span>}
            {isLongText && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-indigo-500 hover:underline font-semibold text-sm ml-2"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
};

export default PostContentRenderer;
