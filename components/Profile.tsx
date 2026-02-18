
import React from 'react';
import { User, Course, Post as PostType, Certificate } from '../types';
import ProgressDetails from './ProgressDetails';
import Post from './Post';

interface ProfileProps {
  profileUser: User;
  currentUser: User;
  courses: Course[];
  posts: PostType[];
  onToggleFollow: (userId: string) => void;
  onNavigateToProfile: (userId: string) => void;
  onNavigateToCourse: (courseId: string) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div className="text-center">
    <div className={`text-xl font-extrabold`}>{value}</div>
    <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
  </div>
);

const CertificateCard: React.FC<{certificate: Certificate, onNavigateToCourse: (courseId: string) => void}> = ({ certificate, onNavigateToCourse }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <span className="text-3xl">📜</span>
            <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{certificate.courseTitle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Issued on: {new Date(certificate.issuedDate).toLocaleDateString()}</p>
            </div>
        </div>
        <button onClick={() => onNavigateToCourse(certificate.courseId)} className="text-sm font-semibold text-indigo-500 hover:underline">View Course</button>
    </div>
);


const Profile: React.FC<ProfileProps> = ({ profileUser, currentUser, courses, posts, onToggleFollow, onNavigateToProfile, onNavigateToCourse }) => {
  const isCurrentUserProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);
  const userPosts = posts.filter(p => p.authorId === profileUser.id)
                        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
            <img src={profileUser.avatarUrl} alt={profileUser.name} className="w-32 h-32 rounded-full mb-4 sm:mb-0 border-4 border-indigo-500" />
            <div className="text-center sm:text-left flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-4xl font-extrabold">{profileUser.name}</h1>
                    {!isCurrentUserProfile && (
                        <button 
                            onClick={() => onToggleFollow(profileUser.id)}
                            className={`mt-4 sm:mt-0 px-6 py-2 font-semibold rounded-full transition-colors ${isFollowing ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{profileUser.email}</p>
                <div className="mt-4 flex justify-center sm:justify-start space-x-6">
                    <StatCard label="Followers" value={profileUser.followers.length} />
                    <StatCard label="Following" value={profileUser.following.length} />
                    <StatCard label="Level" value={profileUser.level} />
                </div>
                 {profileUser.bio && <p className="mt-4 text-slate-600 dark:text-slate-300">{profileUser.bio}</p>}
            </div>
        </div>
      </div>
      
      {profileUser.certifications.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Certifications</h2>
              <div className="space-y-3">
                {profileUser.certifications.map(cert => <CertificateCard key={cert.id} certificate={cert} onNavigateToCourse={onNavigateToCourse} />)}
              </div>
          </div>
      )}
      
      <ProgressDetails user={profileUser} courses={courses} />

      <div>
        <h2 className="text-2xl font-bold mb-4">Activity</h2>
        {userPosts.length > 0 ? (
            <div className="space-y-6">
            {userPosts.map(post => (
                <Post 
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onReaction={() => {}} // Placeholder, interaction will be handled in the main feed
                    onAddComment={() => {}}
                    onNavigateToProfile={onNavigateToProfile}
                />
            ))}
            </div>
        ) : (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400">No posts yet. Stay tuned!</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
