
import React, { useState } from 'react';
import { User, Course, Post as PostType, Certificate } from '../types';
import ProgressDetails from './ProgressDetails';
import Post from './Post';
import { databaseService } from '../services/databaseService';

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
                <p className="text-xs text-slate-500 dark:text-slate-400">Emitido em: {new Date(certificate.issuedDate).toLocaleDateString()}</p>
            </div>
        </div>
        <button onClick={() => onNavigateToCourse(certificate.courseId)} className="text-sm font-semibold text-indigo-500 hover:underline">Ver Curso</button>
    </div>
);


const Profile: React.FC<ProfileProps> = ({ profileUser, currentUser, courses, posts, onToggleFollow, onNavigateToProfile, onNavigateToCourse }) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const isCurrentUserProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);
  const isTeacher = profileUser.roles.includes('teacher');

  const userPosts = posts.filter(p => p.authorId === profileUser.id)
                        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleToggleEducatorRole = async () => {
    if (!isCurrentUserProfile) return;
    setIsUpdatingRole(true);
    setErrorMsg(null);
    try {
      const newRoles = isTeacher 
        ? profileUser.roles.filter(r => r !== 'teacher') 
        : [...profileUser.roles, 'teacher' as const];
      
      const updatedUser = { ...profileUser, roles: newRoles };
      await databaseService.updateUser(updatedUser);
      
      // Feedback visual antes do reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao atualizar papel do usuário:", error);
      setErrorMsg("Falha ao salvar no banco. Certifique-se de ter executado o script SQL no Supabase para adicionar as novas colunas.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
            <img src={profileUser.avatarUrl} alt={profileUser.name} className="w-32 h-32 rounded-full mb-4 sm:mb-0 border-4 border-indigo-500 shadow-xl" />
            <div className="text-center sm:text-left flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-4xl font-extrabold">{profileUser.name}</h1>
                    {!isCurrentUserProfile ? (
                        <button 
                            onClick={() => onToggleFollow(profileUser.id)}
                            className={`mt-4 sm:mt-0 px-6 py-2 font-semibold rounded-full transition-colors ${isFollowing ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        >
                            {isFollowing ? 'Seguindo' : 'Seguir'}
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                          <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Sua Conta</span>
                        </div>
                    )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{profileUser.email}</p>
                <div className="mt-4 flex justify-center sm:justify-start space-x-6">
                    <StatCard label="Seguidores" value={profileUser.followers.length} />
                    <StatCard label="Seguindo" value={profileUser.following.length} />
                    <StatCard label="Nível" value={profileUser.level} />
                </div>
                 {profileUser.bio && <p className="mt-4 text-slate-600 dark:text-slate-300">{profileUser.bio}</p>}
            </div>
        </div>
      </div>

      {isCurrentUserProfile && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-5">
              <div className="bg-indigo-500 text-white p-4 rounded-2xl text-3xl shadow-lg">🎓</div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Modo Educador</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ative para gerenciar alunos, branding e integração Hotmart.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <button 
                onClick={handleToggleEducatorRole}
                disabled={isUpdatingRole}
                className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 ${isTeacher ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                {isUpdatingRole ? 'Sincronizando...' : isTeacher ? 'Desativar Modo Educador' : 'Ativar Modo Educador'}
                </button>
                {isTeacher && <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest animate-pulse">Painel Liberado no Menu</p>}
            </div>
          </div>
          {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-500 text-xs font-bold leading-relaxed">{errorMsg}</p>
              </div>
          )}
        </div>
      )}
      
      {profileUser.certifications.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Certificações</h2>
              <div className="space-y-3">
                {profileUser.certifications.map(cert => <CertificateCard key={cert.id} certificate={cert} onNavigateToCourse={onNavigateToCourse} />)}
              </div>
          </div>
      )}
      
      <ProgressDetails user={profileUser} courses={courses} />

      <div>
        <h2 className="text-2xl font-bold mb-4">Atividade Recente</h2>
        {userPosts.length > 0 ? (
            <div className="space-y-6">
            {userPosts.map(post => (
                <Post 
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onReaction={() => {}} 
                    onAddComment={() => {}}
                    onNavigateToProfile={onNavigateToProfile}
                />
            ))}
            </div>
        ) : (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400">Nenhuma postagem ainda. Comece a jornada!</p>
            </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
