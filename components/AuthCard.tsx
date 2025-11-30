import React, { useState } from 'react';
import { api } from '../api';
import { Spade, ArrowRight, Loader2 } from 'lucide-react';

interface AuthCardProps {
    onLoginSuccess: (user: any) => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLoginView) {
                const user = await api.login(username, password);
                onLoginSuccess(user);
            } else {
                await api.register(username, password);
                setIsLoginView(true);
                setSuccessMsg('Registration successful! Please log in.');
                setPassword(''); 
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 h-full w-full flex items-center justify-center perspective-1000 overflow-hidden relative">
             {/* Hint Text */}
             <div className={`
                absolute bottom-20 text-white/50 font-serif italic text-sm animate-pulse transition-opacity duration-500
                ${isHovered ? 'opacity-0' : 'opacity-100'}
             `}>
            
            </div>

            <div 
                className="relative transition-all duration-700 ease-out preserve-3d"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                // This applies the requested 60-degree tilt when not interacted with
                style={{
                    transform: isHovered 
                        ? 'rotate(0deg) scale(1.1) translateY(0)' 
                        : 'rotate(60deg) scale(0.8) translateY(50px)',
                    cursor: isHovered ? 'default' : 'pointer'
                }}
            >
                <div className={`
                    w-[280px] h-[400px] bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]
                    border-[8px] border-white ring-1 ring-gray-300
                    flex flex-col relative overflow-hidden select-none
                `}>
                    {/* --- Card Texture --- */}
                    <div className="absolute inset-2 border border-gray-200 rounded-xl pointer-events-none z-0" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <Spade size={200} />
                    </div>

                    {/* --- Corners --- */}
                    <div className="absolute top-4 left-4 flex flex-col items-center z-10 leading-none">
                        <span className="text-3xl font-serif font-bold text-card-black">A</span>
                        <Spade size={20} className="mt-1 text-card-black" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col items-center z-10 leading-none rotate-180">
                        <span className="text-3xl font-serif font-bold text-card-black">A</span>
                        <Spade size={20} className="mt-1 text-card-black" fill="currentColor" />
                    </div>

                    {/* --- Content --- */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 w-full">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                            {isLoginView ? 'Login' : 'Register'}
                        </h2>
                        <p className="text-xs text-gray-400 font-serif mb-6 italic">
                            {isLoginView ? 'Unlock your deck.' : 'Start a new collection.'}
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="Username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-gray-800 font-mono text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <input 
                                    type="password" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-gray-800 font-mono text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-card-red text-[10px] font-bold text-center mt-2">
                                    {error}
                                </div>
                            )}
                            
                            {successMsg && (
                                <div className="text-emerald-600 text-[10px] font-bold text-center mt-2">
                                    {successMsg}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-card-red text-white py-3 rounded-lg font-serif font-bold tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 group shadow-lg"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                    <>
                                        {isLoginView ? 'ENTER' : 'JOIN'} 
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button 
                                type="button"
                                onClick={() => { setError(''); setSuccessMsg(''); setIsLoginView(!isLoginView); }}
                                className="text-[10px] text-gray-400 hover:text-card-red underline decoration-dotted transition-colors uppercase tracking-wider"
                            >
                                {isLoginView ? 'Create an Account' : 'Back to Login'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthCard;