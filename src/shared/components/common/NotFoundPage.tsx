import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
            <div className="relative w-full max-w-4xl cursor-default select-none">
                {/* Board Frame */}
                <div className="relative bg-[#5c4033] p-4 rounded-lg shadow-2xl">
                    {/* Chalk Ledge */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#4a332a] rounded-b-lg shadow-md border-t border-[#3e2b23]"></div>

                    {/* The Green Board */}
                    <div className="bg-[#1f3a2d] min-h-[400px] md:min-h-[500px] rounded border-[#15291f] border-4 shadow-inner p-8 flex flex-col items-center justify-center relative overflow-hidden">

                        {/* Chalk Dust Effects */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white blur-[80px] rounded-full"></div>
                            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-white blur-[60px] rounded-full"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 text-center space-y-8">
                            {/* 404 Text */}
                            <h1 className="text-8xl md:text-9xl font-bold text-white/90 tracking-widest relative" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                                4 0 4
                                <span className="absolute -bottom-4 left-0 w-full h-1 bg-white/20 blur-[1px] rounded transition-transform origin-left scale-x-75"></span>
                            </h1>

                            {/* Not Found Text */}
                            <h2 className="text-3xl md:text-5xl font-bold text-white/80 rotate-[-2deg]" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                                NOT FOUND
                            </h2>

                            {/* Divider Line */}
                            <div className="w-32 h-1 bg-white/30 mx-auto rounded-full blur-[0.5px]"></div>

                            {/* Message */}
                            <p className="text-xl text-white/70 max-w-md mx-auto leading-relaxed" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                                Except the education, everything else is missing here.
                            </p>

                            {/* Back Button (Chalk-styled) */}
                            <div className="pt-8">
                                <button
                                    onClick={() => navigate('/')}
                                    className="group relative inline-block focus:outline-none"
                                >
                                    <div className="absolute inset-0 border-2 border-white/40 rounded-full blur-[1px]"></div>
                                    <span className="relative block px-8 py-3 text-2xl font-bold text-white hover:text-white transition-colors" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                                        Go to Dashboard
                                    </span>
                                    {/* Chalk underline on hover */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white/60 blur-[1px] group-hover:w-3/4 transition-all duration-300"></div>
                                </button>
                            </div>
                        </div>

                        {/* Decoration: Chalk pieces and duster */}
                        <div className="absolute bottom-6 right-8 flex gap-4 opacity-80 rotate-3">
                            {/* Duster */}
                            <div className="w-16 h-8 bg-[#d4c5a9] rounded-sm shadow-lg border-b-4 border-[#5c4033] relative">
                                <div className="absolute inset-0 bg-black/5 rounded-sm"></div>
                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 blur-[1px]"></div>
                            </div>
                            {/* Chalk Piece */}
                            <div className="w-12 h-2 bg-white rounded-full shadow-md rotate-12 mt-4 ml-2"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
