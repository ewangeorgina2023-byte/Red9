import { X, User, Shield, CreditCard, Smartphone, LogOut } from 'lucide-react';
import { useAppStore } from '../store';

export function SettingsModal() {
  const { isSettingsModalOpen, setIsSettingsModalOpen, settingsModalTab, setSettingsModalTab } = useAppStore();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] w-full max-w-4xl h-[80vh] rounded-md border border-white/10 shadow-2xl overflow-hidden shadow-black flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/40 border-r border-white/10 p-6 flex flex-col gap-2 shrink-0">
          <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
          
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left font-medium ${
              settingsModalTab === 'account' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/10'
            }`}
            onClick={() => setSettingsModalTab('account')}
          >
            <User className="w-5 h-5" /> Account
          </button>
          
          <button 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors w-full text-left font-medium ${
              settingsModalTab === 'parental' ? 'bg-[#E50914] text-white' : 'text-gray-400 hover:bg-white/10'
            }`}
            onClick={() => setSettingsModalTab('parental')}
          >
            <Shield className="w-5 h-5" /> Parental Controls
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <button 
            onClick={() => setIsSettingsModalOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {settingsModalTab === 'account' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <h3 className="text-3xl font-light text-white">Account</h3>
              
              <div className="space-y-6">
                <div className="border border-white/10 rounded-md p-6 bg-black/20">
                  <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Membership & Billing</h4>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="font-bold text-white">spendawg420red9@gmail.com</p>
                      <p>Password: ********</p>
                      <p>Phone: 555-0198</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <button className="block text-blue-500 hover:underline">Change account email</button>
                      <button className="block text-blue-500 hover:underline">Change password</button>
                      <button className="block text-blue-500 hover:underline">Change phone number</button>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      **** **** **** 1234
                    </div>
                    <div className="space-y-2 text-sm">
                      <button className="block text-blue-500 hover:underline">Manage payment info</button>
                      <button className="block text-blue-500 hover:underline">Add backup payment method</button>
                      <button className="block text-blue-500 hover:underline">Billing details</button>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 rounded-md p-6 bg-black/20">
                  <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Plan Details</h4>
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div className="text-sm text-gray-300 font-bold flex items-center gap-2">
                       Premium 
                       <span className="border border-gray-500 px-1 py-0.5 rounded text-[10px] uppercase font-bold text-gray-400">4k Ultra HD</span>
                    </div>
                    <button className="text-blue-500 hover:underline text-sm">Change plan</button>
                  </div>
                </div>

                <div className="border border-white/10 rounded-md p-6 bg-black/20">
                  <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Security & Privacy</h4>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                     <p className="text-sm text-gray-300 max-w-sm">Control who can access your account and recent active devices.</p>
                     <div className="space-y-2 text-sm">
                      <button className="flex items-center gap-2 text-blue-500 hover:underline">
                        <Smartphone className="w-4 h-4" /> Manage access and devices
                      </button>
                      <button className="flex items-center gap-2 text-blue-500 hover:underline">
                        <LogOut className="w-4 h-4" /> Sign out of all devices
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {settingsModalTab === 'parental' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <h3 className="text-3xl font-light text-white">Parental Controls</h3>
              
              <div className="space-y-6">
                <div className="border border-white/10 rounded-md p-8 bg-black/20 text-center">
                   <Shield className="w-16 h-16 text-[#E50914] mx-auto mb-4" />
                   <h4 className="text-xl font-bold text-white mb-2">Protect your family</h4>
                   <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                     Require a PIN to add new profiles, restrict maturity ratings, and block specific titles from being watched.
                   </p>
                   
                   <button className="px-8 py-3 bg-[#E50914] hover:bg-red-700 text-white font-bold rounded-sm uppercase tracking-widest text-sm transition-colors mx-auto inline-block">
                     Enable Account PIN
                   </button>
                </div>
                
                <div className="border border-white/10 rounded-md p-6 bg-black/20">
                  <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Profile Restrictions</h4>
                  <p className="text-sm text-gray-300 mb-4">Adjust viewing restrictions & specific title locks for each profile.</p>
                  
                  <div className="flex flex-col gap-2">
                     <button className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center justify-between text-left transition-colors">
                       <span className="text-gray-200">Spendawg</span>
                       <span className="text-sm text-gray-500">No restrictions</span>
                     </button>
                     <button className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center justify-between text-left transition-colors">
                       <span className="text-gray-200">Kids</span>
                       <span className="text-sm text-[#E50914] font-medium">12+ and below</span>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
