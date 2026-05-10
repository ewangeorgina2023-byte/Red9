import { useState } from 'react';
import { useAppStore, Profile } from '../store';
import { Pencil } from 'lucide-react';

const PRESET_AVATARS = [
  "https://upload.wikimedia.org/wikipedia/en/0/02/Homer_Simpson_2006.png",
  "https://upload.wikimedia.org/wikipedia/en/a/a6/Bender_Rodriguez.png"
];

export function ProfileSelector() {
  const { setCurrentProfile, profiles, addProfile, updateProfile, deleteProfile, isManagingProfiles, setIsManagingProfiles } = useAppStore();
  const [editingProfile, setEditingProfile] = useState<Partial<Profile> | null>(null); // if truthy and no id, creating

  if (editingProfile) {
    const isEditing = !!editingProfile.id;
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[200] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl animate-in fade-in duration-300">
          <h1 className="text-3xl md:text-5xl font-medium text-white mb-8 text-center">{isEditing ? 'Edit Profile' : 'Add Profile'}</h1>
          <div className="bg-[#141414] p-8 rounded-md border border-white/10">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-32 aspect-square rounded-md overflow-hidden shrink-0 mx-auto md:mx-0">
                <img 
                  src={editingProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                  alt="Profile" 
                  className="w-full h-full object-contain bg-zinc-900/50"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-4">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full bg-[#333] text-white px-4 py-2 border-none rounded-sm outline-none focus:ring-2 focus:ring-white/50"
                  value={editingProfile.name || ''}
                  onChange={e => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  autoFocus
                />
                
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="isKids"
                    checked={editingProfile.isKids || false}
                    onChange={e => setEditingProfile({ ...editingProfile, isKids: e.target.checked })}
                    className="w-5 h-5 accent-[#E50914] bg-[#333] border-none"
                  />
                  <label htmlFor="isKids" className="text-gray-300 text-sm md:text-base">Kid's Profile</label>
                </div>
                <div className="mt-6">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">Choose Avatar</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_AVATARS.map(url => (
                      <img 
                        key={url}
                        src={url} 
                        className={`w-10 h-10 object-contain bg-zinc-900/50 rounded-md cursor-pointer border-2 transition-colors ${editingProfile.avatar === url ? 'border-white' : 'border-transparent hover:border-white/50'}`}
                        onClick={() => setEditingProfile({ ...editingProfile, avatar: url })}
                        alt="Preset avatar"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Custom Avatar URL" 
                      className="w-full bg-[#333] text-white px-4 py-2 border-none rounded-sm outline-none focus:ring-2 focus:ring-white/50 text-sm"
                      value={editingProfile.avatar || ''}
                      onChange={e => setEditingProfile({ ...editingProfile, avatar: e.target.value })}
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="avatar-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                               setEditingProfile({ ...editingProfile, avatar: reader.result as string });
                               useAppStore.getState().addNotification('Profile photo processed!', 'success');
                             };
                             reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="avatar-upload"
                        className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-sm cursor-pointer transition-colors border border-white/10"
                      >
                        <Pencil className="w-3 h-3" />
                        UPLOAD PHOTO
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-white/10 pt-6">
              <div className="flex gap-4">
                <button 
                  className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    if (editingProfile.name) {
                      if (isEditing) {
                        updateProfile(editingProfile.id as string, editingProfile);
                        useAppStore.getState().addNotification('Profile updated!', 'success');
                      } else {
                        addProfile(editingProfile as Omit<Profile, 'id'>);
                        useAppStore.getState().addNotification('New profile created!', 'success');
                      }
                      setEditingProfile(null);
                      setIsManagingProfiles(false);
                    }
                  }}
                >
                  Save
                </button>
                <button 
                  className="px-6 py-2 border border-gray-500 text-gray-500 hover:text-white hover:border-white uppercase tracking-widest text-sm transition-colors"
                  onClick={() => setEditingProfile(null)}
                >
                  Cancel
                </button>
              </div>
              
              {isEditing && (
                <button 
                  className="px-6 py-2 border border-gray-500 text-gray-500 hover:text-white hover:border-white uppercase tracking-widest text-sm transition-colors"
                  onClick={() => {
                     deleteProfile(editingProfile.id as string);
                     setEditingProfile(null);
                     useAppStore.getState().addNotification('Profile deleted', 'info');
                  }}
                >
                  Delete Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[200] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-3xl md:text-5xl font-medium text-white text-center mb-8">
          {isManagingProfiles ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className="flex flex-col items-center group cursor-pointer w-24 md:w-36 animate-in slide-in-from-bottom-4 duration-500"
              onClick={() => {
                if (isManagingProfiles) {
                   setEditingProfile(profile);
                } else {
                   setCurrentProfile(profile);
                }
              }}
            >
              <div className="relative w-full aspect-square rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-colors duration-200 mb-4">
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className={`w-full h-full object-contain bg-zinc-900/50 transition-opacity ${isManagingProfiles ? 'opacity-50' : ''}`}
                  referrerPolicy="no-referrer"
                />
                {isManagingProfiles && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Pencil className="w-8 h-8 text-white opacity-100" />
                  </div>
                )}
              </div>
              <span className="text-gray-500 group-hover:text-white transition-colors text-sm md:text-lg">
                {profile.name}
              </span>
            </div>
          ))}
          
          <div 
            className="flex flex-col items-center group cursor-pointer w-24 md:w-36 animate-in slide-in-from-bottom-4 duration-500"
            onClick={() => setEditingProfile({ 
              name: '', 
              avatar: PRESET_AVATARS[0], 
              isKids: false 
            })}
          >
            <div className="w-full aspect-square rounded-md border-2 border-transparent group-hover:border-white bg-[#1a1a1a] flex justify-center items-center group-hover:bg-gray-200 transition-colors duration-200 mb-4">
               <svg 
                className="w-12 h-12 text-gray-500 group-hover:text-black transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
            </div>
            <span className="text-gray-500 group-hover:text-white transition-colors text-sm md:text-lg">
              Add Profile
            </span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            className="px-6 py-2 border border-gray-500 text-gray-500 hover:text-white hover:border-white uppercase tracking-widest text-sm transition-colors"
            onClick={() => setIsManagingProfiles(!isManagingProfiles)}
          >
            {isManagingProfiles ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>
    </div>
  );
}
