'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when user data is loaded
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhoneNumber(user.phoneNumber || '');
      setBio(user.bio || '');
      if (user.avatar?.url) {
        setAvatarPreview(`${API_URL}${user.avatar.url}`);
      }
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      if (!isEditing) setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const token = Cookies.get('jwt');
      let avatarId = user.avatar?.id;

      // 1. Upload new avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('files', avatarFile);
        
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadRes.json();
        avatarId = uploadData[0].id;
      }

      // 2. Update user profile
      const updateData: any = {
        username,
        bio,
        phoneNumber,
      };
      if (avatarId) updateData.avatar = avatarId;

      const updateRes = await fetch(`${API_URL}/api/custom-auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');
      
      // Reload page to fetch updated user info via AuthContext
      window.location.reload();
      
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(user?.username || '');
    setPhoneNumber(user?.phoneNumber || '');
    setBio(user?.bio || '');
    setAvatarFile(null);
    setAvatarPreview(user?.avatar?.url ? `${API_URL}${user.avatar.url}` : null);
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Profile</h2>
        <button 
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          disabled={isLoading}
          className="px-5 py-2.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-200/50 dark:border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 shrink-0" style={{ minWidth: '200px' }}>
            <div 
              className="relative shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-5xl font-black shadow-inner border-4 border-white dark:border-slate-800 overflow-hidden group"
              style={{ width: '144px', height: '144px' }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
              )}
              
              <div 
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${isEditing ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                <span className="text-white text-sm font-semibold">Change Picture</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="inline-block px-4 py-1.5 text-xs font-bold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/60 rounded-full uppercase tracking-wider">
              {user?.roleType || 'Student'}
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Upload new picture
              </button>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="flex-1 space-y-8 w-full min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Username</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900 dark:text-white p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-transparent">
                    {user?.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email Address (Gmail)</label>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 p-3 bg-gray-100/50 dark:bg-slate-800/30 rounded-xl border border-transparent cursor-not-allowed">
                  {user?.email}
                </p>
                {isEditing && <p className="text-xs text-gray-400">Email cannot be changed directly.</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900 dark:text-white p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-transparent">
                    {user?.phoneNumber || <span className="italic text-gray-400">Not provided</span>}
                  </p>
                )}
              </div>
              
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Bio</label>
              {isEditing ? (
                <textarea 
                  rows={4} 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..." 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                ></textarea>
              ) : (
                <p className="text-md text-gray-700 dark:text-gray-300 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl border border-transparent whitespace-pre-wrap">
                  {user?.bio || <span className="italic text-gray-400">No bio provided yet. Click 'Edit Profile' to add one.</span>}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800/50 mt-6">
                <button 
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
