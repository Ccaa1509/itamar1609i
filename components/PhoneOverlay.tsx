
import React, { useEffect, useState } from 'react';
import { playTutorialMusic, stopTutorialMusic } from './AudioEngine';

interface PhoneProps {
  isOpen: boolean;
  gameTime: string;
  isMouseActive: boolean;
  incomingCall?: string | null;
  onAnswer?: () => void;
  isCallActive?: boolean;
  activeCallerName?: string;
  
  // Mission Logic
  missionStage?: number;
  onDecisionWait?: () => void;
  onDecisionIgnore?: () => void;
  onMessageSent?: () => void;
  onVideoSuccess?: () => void;
  onVideoWatchComplete?: () => void;
  onCallContact?: (name: string) => void;
}

interface SubAppProps {
  onBack: () => void;
  missionStage?: number;
  onMessageSent?: () => void;
  onVideoSuccess?: () => void;
  onVideoWatchComplete?: () => void;
  onCallContact?: (name: string) => void;
}

// --- App Views Components ---

const MessagesApp: React.FC<SubAppProps> = ({ onBack, missionStage, onMessageSent }) => {
  const [hasSent, setHasSent] = useState(false);

  const showHistory = (missionStage || 0) > 7.5 || hasSent;
  const showAction = (missionStage === 7.5) && !hasSent;

  return (
    <div className="w-full h-full bg-black flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="bg-[#1c1c1e] p-4 pt-12 flex items-center border-b border-[#2c2c2e] shrink-0">
        <div 
          className="text-blue-500 text-sm font-bold ml-2 cursor-pointer flex items-center active:opacity-50 transition-opacity"
          onClick={onBack}
        >
          <span className="text-2xl mr-1 relative top-[-2px]">‹</span>
          Back
        </div>
        <div className="flex-1 text-center font-bold text-white mr-8">אמא ❤️</div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
            אני מגיע הביתה עוד מעט, אל תדאגי
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-[#3a3a3c] text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
            למה אתה לא עונה לטלפונים??
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-[#3a3a3c] text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
            נבו נמלט מהכלא... אמרו בחדשות שהוא באזור שלך!
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-[#3a3a3c] text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
            תנעל את הדלתות!!!
          </div>
        </div>
        
        {/* User sent message history */}
        {showHistory && (
             <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                נעלתי את הדלת.
                </div>
            </div>
        )}

        {/* Action Button */}
        {showAction && (
             <div className="flex justify-end mt-4">
                 <button 
                    onClick={() => {
                        setHasSent(true);
                        if(onMessageSent) onMessageSent();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-bold animate-pulse shadow-[0_0_10px_blue]"
                 >
                    [שלח] נעלתי את הדלת
                 </button>
            </div>
        )}

      </div>
      {/* Input Area */}
      <div className="p-2 bg-[#1c1c1e] mb-6 shrink-0">
         <div className="bg-[#2c2c2e] h-8 rounded-full px-3 text-xs flex items-center text-gray-400">
           iMessage
         </div>
      </div>
    </div>
  );
};

const SocialApp: React.FC<SubAppProps> = ({ onBack, missionStage, onVideoSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<'success' | 'fail' | null>(null);
    const [views, setViews] = useState(0);
    const [likes, setLikes] = useState(0);

    const options = [
        { id: 1, text: "רוחות רפאים תקפו אותי! מפחיד!!! 😱", outcome: 'fail' },
        { id: 2, text: "תראו איזה בית יפה מצאתי 🏚️", outcome: 'fail' },
        { id: 3, text: "הצילו! נבו נעל אותי בבית! תזעיקו משטרה דחוף!", outcome: 'success' },
        { id: 4, text: "עושה את אתגר ה-24 שעות בבית נטוש 😂", outcome: 'fail' }
    ];

    const handleUpload = (outcome: 'success' | 'fail') => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            if (outcome === 'success') {
                setResult('success');
                setViews(1250304); // 1.2M
                setLikes(84022);
                if(onVideoSuccess) onVideoSuccess();
            } else {
                setResult('fail');
                setViews(0);
                setLikes(0);
            }
        }, 2000);
    };

    if (uploading) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center animate-fadeIn text-white">
                <div className="w-12 h-12 border-4 border-t-pink-500 border-gray-800 rounded-full animate-spin mb-4"></div>
                <div>מעלה סרטון...</div>
            </div>
        );
    }

    if (result === 'success') {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center pt-20 animate-fadeIn relative">
                <div className="absolute top-4 right-4 text-white text-xl cursor-pointer" onClick={onBack}>✕</div>
                
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h2 className="text-white text-2xl font-bold mb-8">ויראלי!</h2>
                
                <div className="flex gap-8 text-center mb-12">
                    <div>
                        <div className="text-3xl font-bold text-white">{views.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">צפיות</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-pink-500">{likes.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">לייקים</div>
                    </div>
                </div>

                <div className="w-[90%] bg-gray-900 rounded p-4 border-r-4 border-pink-500 text-right">
                    <div className="text-gray-400 text-xs mb-1">תגובה חדשה</div>
                    <div className="text-white font-bold text-sm">משטרת ישראל</div>
                    <div className="text-gray-200 text-sm">קיבלנו דיווחים. ניידת בדרך למיקום שלך. הישאר במקום בטוח!</div>
                </div>
            </div>
        );
    }

    if (result === 'fail') {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center pt-20 animate-fadeIn relative">
                <div className="absolute top-4 right-4 text-white text-xl cursor-pointer" onClick={onBack}>✕</div>
                
                <div className="text-red-500 text-6xl mb-4">☹</div>
                <h2 className="text-white text-2xl font-bold mb-2">נכשל</h2>
                <p className="text-gray-400 text-center px-4 mb-8">אף אחד לא צפה בסרטון. הוא נראה מזויף או משעמם.</p>
                
                <button 
                    onClick={() => setResult(null)}
                    className="bg-white text-black font-bold py-3 px-8 rounded-full"
                >
                    נסה שוב
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black flex flex-col animate-fadeIn relative">
            <div className="absolute top-4 right-4 text-white text-xl cursor-pointer z-10" onClick={onBack}>✕</div>
            
            {/* Camera Preview Placeholder */}
            <div className="h-1/2 w-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white/50 text-4xl">📷</span>
                </div>
                {/* Fake recording UI */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-2 rounded text-white text-xs">00:15</div>
            </div>

            {/* Options */}
            <div className="flex-1 bg-gray-900 p-4 pt-6">
                <h3 className="text-white text-right font-bold mb-4">בחר כיתוב לסרטון:</h3>
                <div className="space-y-3">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleUpload(opt.outcome as 'success' | 'fail')}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white text-right p-3 rounded text-sm border border-gray-700 transition"
                        >
                            {opt.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VideoApp: React.FC<SubAppProps> = ({ onBack, onVideoWatchComplete }) => {
    const [selectedVideo, setSelectedVideo] = useState<'golan' | 'naor' | null>(null);

    const handleWatch = (video: 'golan' | 'naor') => {
        setSelectedVideo(video);
        playTutorialMusic();
    };

    const handleStop = () => {
        setSelectedVideo(null);
        stopTutorialMusic();
        // Trigger completion logic when closing video view
        if (onVideoWatchComplete) onVideoWatchComplete();
    };

    // Stop music on unmount/back
    useEffect(() => {
        return () => {
            stopTutorialMusic();
        };
    }, []);

    if (selectedVideo) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-start pt-16 relative">
                <div className="absolute top-4 right-4 text-white text-xl cursor-pointer z-10" onClick={handleStop}>✕</div>
                
                {/* Video Placeholder */}
                <div className="w-full h-48 bg-gray-800 mb-4 flex items-center justify-center border-b border-gray-700 relative">
                    <div className="text-4xl animate-bounce z-10">🎬</div>
                    {/* Fake Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                        <div className="h-full bg-red-600 animate-[width_10s_linear_infinite]" style={{ width: '0%' }}></div>
                    </div>
                </div>

                {/* Content based on selection */}
                <div className="w-full px-4 text-right">
                    {selectedVideo === 'golan' ? (
                        <>
                            <h3 className="text-white font-bold text-xl mb-1">מדריך הישרדות בבית של נבו</h3>
                            <div className="text-gray-400 text-sm mb-6">50K צפיות • לפני שעה</div>
                            
                            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                                <div className="text-yellow-400 font-bold mb-2">טיפים חשובים:</div>
                                <div className="text-white text-lg mb-2">❌ טיפ ראשון: אל תיכנסו לשם!</div>
                                <div className="text-white text-lg">🍲 טיפ שני: אמא שלי הכינה לי צהריים אז ביי.</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-white font-bold text-xl mb-1">איך להפוך לגיטריסט על</h3>
                            <div className="text-gray-400 text-sm mb-6">1.2M צפיות • לפני שנתיים</div>
                            
                            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                                <div className="text-yellow-400 font-bold mb-2">שלבים להצלחה:</div>
                                <div className="text-white text-lg mb-2">🎸 דבר ראשון: ללמוד גיטרה</div>
                                <div className="text-white text-lg mb-2">❓ דבר שני: ללמוד גיטרה</div>
                                <div className="text-white text-lg mb-4">🍲 דבר שלישי: אני אוהב חמין</div>
                                <div className="text-green-400 font-bold">שיהיה לכם יום טוב חברים!</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-red-600 p-4 pt-12 flex justify-between items-center text-white font-bold shadow-md relative">
                <div className="cursor-pointer text-xl" onClick={onBack}>‹</div>
                <div>YouTube</div>
                <div className="text-xl">🔍</div>
            </div>

            {/* Video List */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#f1f1f1]">
                
                {/* Video 1 */}
                <div className="bg-white p-2 mb-3 rounded shadow cursor-pointer hover:bg-gray-50 transition" onClick={() => handleWatch('golan')}>
                    <div className="w-full h-24 bg-gray-800 mb-2 rounded flex items-center justify-center text-white">
                        <span className="text-2xl">🏚️</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">G</div>
                        <div>
                            <div className="font-bold text-sm text-black leading-4 mb-1 text-right">גולן: איך לשרוד בבית של נבו</div>
                            <div className="text-xs text-gray-500 text-right">GolanVlogs • 50K צפיות</div>
                        </div>
                    </div>
                </div>

                {/* Video 2 */}
                <div className="bg-white p-2 mb-3 rounded shadow cursor-pointer hover:bg-gray-50 transition" onClick={() => handleWatch('naor')}>
                    <div className="w-full h-24 bg-gray-800 mb-2 rounded flex items-center justify-center text-white">
                        <span className="text-2xl">🎸</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">N</div>
                        <div>
                            <div className="font-bold text-sm text-black leading-4 mb-1 text-right">נאור: להיות גיטריסט על</div>
                            <div className="text-xs text-gray-500 text-right">NaorGuitar • 1.2M צפיות</div>
                        </div>
                    </div>
                </div>

                {/* Filler Video */}
                <div className="bg-white p-2 mb-3 rounded shadow opacity-50">
                    <div className="w-full h-24 bg-gray-300 mb-2 rounded"></div>
                    <div className="h-4 bg-gray-200 w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 w-1/2"></div>
                </div>

            </div>
        </div>
    );
};

const PhoneApp: React.FC<SubAppProps> = ({ onBack, missionStage, onCallContact }) => (
  <div className="w-full h-full bg-white flex flex-col items-center pt-16 animate-fadeIn relative">
    {/* If Mission 18, Show Contact List */}
    {missionStage === 18 ? (
        <div className="w-full flex flex-col px-4">
            <h2 className="text-black text-2xl font-bold mb-6 text-right">אנשי קשר</h2>
            
            <div 
                className="w-full bg-gray-100 p-4 rounded-lg mb-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 active:bg-blue-100 transition"
                onClick={() => onCallContact && onCallContact('מייק')}
            >
                <span className="text-green-500 text-xl">📞</span>
                <span className="text-black font-bold text-lg">מייק (Mike)</span>
            </div>

            <div 
                className="w-full bg-gray-100 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 active:bg-blue-100 transition"
                onClick={() => onCallContact && onCallContact('גולן')}
            >
                <span className="text-green-500 text-xl">📞</span>
                <span className="text-black font-bold text-lg">גולן (Golan)</span>
            </div>
        </div>
    ) : (
        <>
            {/* Standard Keypad */}
            {/* Number Display */}
            <div className="text-4xl text-black mb-8 h-10 tracking-widest"></div>
            {/* Keypad */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                <div key={key} className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-medium active:bg-gray-400 transition cursor-pointer text-black">
                {key}
                </div>
            ))}
            </div>
            {/* Call Button */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 shadow-lg text-white text-2xl">
            📞
            </div>
        </>
    )}

    {/* Tabs */}
    <div className="absolute bottom-6 w-full flex justify-around text-gray-400 text-xs border-t pt-2">
       <div>מועדפים</div>
       <div>אחרונים</div>
       <div className={missionStage === 18 ? "text-blue-500 font-bold" : ""}>אנשי קשר</div>
       <div className={missionStage !== 18 ? "text-blue-500 font-bold" : ""}>מקלדת</div>
       <div>תא קולי</div>
    </div>
  </div>
);

const CameraApp: React.FC<SubAppProps> = ({ onBack }) => (
  <div className="w-full h-full bg-transparent flex flex-col justify-between animate-fadeIn relative">
    {/* The background is transparent so the game canvas shows through! */}
    
    {/* Top Controls */}
    <div className="bg-black/40 p-4 pt-12 flex justify-between px-6 backdrop-blur-sm">
        <span className="text-white cursor-pointer" onClick={onBack}>✕</span> {/* Close/Back for camera */}
        <span className="text-yellow-400">▲</span>
    </div>

    {/* Viewfinder Rect (Visual Only) */}
    <div className="absolute inset-0 border-[1px] border-white/20 pointer-events-none mt-20 mb-32 mx-2"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/50 rounded-full opacity-50"></div>

    {/* Bottom Controls */}
    <div className="bg-black/60 h-32 w-full flex items-center justify-center gap-8 backdrop-blur-md mb-4">
        <div className="w-10 h-10 bg-gray-600 rounded-md border border-white"></div> {/* Gallery */}
        <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center cursor-pointer active:scale-90 transition">
            <div className="w-14 h-14 bg-white rounded-full"></div>
        </div>
        <div className="w-10 h-10 text-white flex items-center justify-center text-xl">↻</div>
    </div>
  </div>
);

const BrowserApp: React.FC<SubAppProps> = ({ onBack }) => (
  <div className="w-full h-full bg-white flex flex-col animate-fadeIn">
     {/* Address Bar */}
     <div className="bg-[#f0f0f0] p-2 pt-12 border-b flex justify-center relative">
         <div 
            className="absolute left-3 top-13 text-blue-500 text-2xl cursor-pointer"
            onClick={onBack}
         >
            ‹
         </div>
         <div className="bg-[#e0e0e0] w-[80%] rounded-lg px-2 py-1 text-center text-xs text-black flex items-center justify-center gap-1">
             🔒 mako.co.il/news
         </div>
     </div>
     {/* Content */}
     <div className="flex-1 p-2 overflow-y-auto">
         <div className="w-full h-32 bg-red-800 mb-2 flex items-center justify-center text-white font-bold text-xl">
             חדשות חירום
         </div>
         <h1 className="text-2xl font-bold text-right text-black mb-2 leading-6">
             חשד: הרוצח הסדרתי "נבו" נצפה באזור המגורים
         </h1>
         <div className="text-xs text-gray-500 text-right mb-4">פורסם לפני 10 דקות</div>
         <p className="text-right text-sm text-black leading-5">
             המשטרה מבקשת מהתושבים להישאר בבתים, לנעול דלתות וחלונות. החשוד נחשב למסוכן ביותר.
             <br/><br/>
             דיווחים על פריצות באזור רחוב הרצל. כוחות מיוחדים בדרכם.
         </p>
         <div className="mt-4 w-full h-24 bg-gray-200 animate-pulse rounded"></div>
     </div>
  </div>
);

// --- Incoming Call Screen ---
const IncomingCallScreen: React.FC<{ caller: string, onAnswer?: () => void }> = ({ caller, onAnswer }) => (
    <div className="w-full h-full flex flex-col items-center justify-between pt-20 pb-12 bg-gray-900/90 backdrop-blur-xl animate-pulse">
        <div className="flex flex-col items-center">
             <div className="text-gray-300 text-sm mb-2">שיחה נכנסת...</div>
             <div className="text-3xl font-bold text-white mb-2">{caller}</div>
        </div>

        <div className="w-full px-8 flex justify-between items-center">
             <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition shadow-lg">
                    <span className="text-2xl text-white">✖</span>
                 </div>
                 <span className="text-white text-xs">דחה</span>
             </div>

             <div className="flex flex-col items-center gap-2">
                 <div 
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition shadow-lg animate-bounce"
                    onClick={onAnswer}
                 >
                    <span className="text-2xl text-white">📞</span>
                 </div>
                 <span className="text-white text-xs">ענה</span>
             </div>
        </div>
    </div>
);

// --- Decision Screen (Mission 8) ---
const DecisionScreen: React.FC<{ onWait: () => void, onIgnore: () => void }> = ({ onWait, onIgnore }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/90 text-white p-4 animate-fadeIn">
        <div className="text-3xl mb-2">⚠️</div>
        <h1 className="text-2xl font-bold mb-4 text-center">התראת אבטחה</h1>
        <p className="text-sm text-center mb-8 bg-black/40 p-2 rounded">
            מערכת הבית מזהה רעשים חשודים מחוץ לדלת הכניסה.
        </p>

        <div className="flex flex-col gap-4 w-full">
            <button 
                onClick={onWait}
                className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-center font-bold transition active:scale-95"
            >
                לחכות ולראות מי זה (Y)
                <div className="text-xs font-normal text-gray-400 mt-1">מסוכן מאוד</div>
            </button>

            <button 
                onClick={onIgnore}
                className="w-full py-4 bg-blue-800 hover:bg-blue-700 border border-blue-600 rounded text-center font-bold transition active:scale-95"
            >
                להתעלם ולהתקלח (E)
                <div className="text-xs font-normal text-blue-200 mt-1">הדלת כבר חסומה</div>
            </button>
        </div>
    </div>
);

// --- Active Call Screen ---
const ActiveCallScreen: React.FC<{ caller: string }> = ({ caller }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0'+sec : sec}`;
    };

    return (
        <div className="w-full h-full flex flex-col items-center pt-20 bg-gray-800/90 backdrop-blur-md">
            <div className="w-24 h-24 bg-gray-400 rounded-full mb-4 flex items-center justify-center text-4xl border-4 border-gray-600">
                👤
            </div>
            <div className="text-2xl font-bold text-white mb-2">{caller}</div>
            <div className="text-gray-300 text-sm">{formatTime(seconds)}</div>

            <div className="mt-auto mb-12 flex gap-6">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl">🔇</div>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">📞</div>
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl">🔊</div>
            </div>
        </div>
    );
};

// --- Main Component ---

export const PhoneOverlay: React.FC<PhoneProps> = ({ 
    isOpen, gameTime, isMouseActive,
    incomingCall, onAnswer, isCallActive, activeCallerName,
    missionStage, onDecisionWait, onDecisionIgnore,
    onMessageSent, onVideoSuccess, onVideoWatchComplete,
    onCallContact
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Reset phone state when closed
  useEffect(() => {
    if (!isOpen) {
        // Slight delay to reset after animation
        const t = setTimeout(() => {
            setActiveApp(null);
            stopTutorialMusic();
        }, 500);
        return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const realTimeStr = currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

  const renderContent = () => {
      // Priority 1: Incoming Call
      if (incomingCall) {
          return <IncomingCallScreen caller={incomingCall} onAnswer={onAnswer} />;
      }

      // Priority 2: Active Call
      if (isCallActive) {
          // Determine caller name based on context
          let callerName = activeCallerName || "אמא ❤️";
          if (missionStage === 16) callerName = "משטרה (100)";
          if (missionStage === 18) return <ActiveCallScreen caller="שיחה יוצאת..." />; 
          return <ActiveCallScreen caller={callerName} />;
      }
      
      // Priority 3: Mission Decision (Stage 8)
      if (missionStage === 8 && onDecisionWait && onDecisionIgnore) {
          return <DecisionScreen onWait={onDecisionWait} onIgnore={onDecisionIgnore} />;
      }

      // Priority 4: Apps
      const handleBack = () => setActiveApp(null);

      switch (activeApp) {
          case 'messages': return <MessagesApp onBack={handleBack} missionStage={missionStage} onMessageSent={onMessageSent} />;
          case 'phone': return <PhoneApp onBack={handleBack} missionStage={missionStage} onCallContact={onCallContact} />;
          case 'camera': return <CameraApp onBack={handleBack} />;
          case 'browser': return <BrowserApp onBack={handleBack} />;
          case 'social': return <SocialApp onBack={handleBack} missionStage={missionStage} onVideoSuccess={onVideoSuccess} />;
          case 'video': return <VideoApp onBack={handleBack} missionStage={missionStage} onVideoWatchComplete={onVideoWatchComplete} />;
          default: return (
            <>
                {/* Main Widget (Game Clock) */}
                <div className="absolute top-16 left-0 w-full text-center pointer-events-none">
                    <div className="text-white text-5xl font-thin tracking-wider drop-shadow-lg">
                        {gameTime.split(' ')[0]}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">
                        יום חמישי, 13 באוקטובר
                    </div>
                </div>

                {/* Notifications */}
                {missionStage === 8 ? (
                    // ALERT NOTIFICATION FOR MISSION 8
                    <div 
                        className={`absolute top-40 left-1/2 transform -translate-x-1/2 w-[90%] bg-red-900/80 backdrop-blur-md rounded-xl p-3 border border-red-500/50 animate-pulse`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-red-600 rounded-md flex items-center justify-center text-[10px]">⚠️</div>
                                <span className="text-white text-xs font-bold">אבטחה</span>
                            </div>
                            <span className="text-gray-400 text-[10px]">עכשיו</span>
                        </div>
                        <div className="text-white text-sm font-bold">התראה חמורה</div>
                        <div className="text-gray-200 text-xs">זוהו רעשים בדלת הכניסה. נדרשת פעולה.</div>
                    </div>
                ) : (
                    // NORMAL NOTIFICATION
                    <div 
                        className={`absolute top-40 left-1/2 transform -translate-x-1/2 w-[90%] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 ${isMouseActive ? 'cursor-pointer hover:bg-white/20 active:scale-95 transition-all' : ''}`}
                        onClick={() => isMouseActive && setActiveApp('messages')}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center text-[10px]">💬</div>
                                <span className="text-white text-xs font-bold">הודעות</span>
                            </div>
                            <span className="text-gray-400 text-[10px]">לפני 2 דק'</span>
                        </div>
                        <div className="text-white text-sm font-bold">אמא</div>
                        <div className="text-gray-200 text-xs">למה אתה לא עונה? תחזור הביתה...</div>
                    </div>
                )}

                {/* App Grid (Bottom) */}
                <div className="absolute bottom-6 w-full px-4">
                    <div className="grid grid-cols-4 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-3xl">
                        {/* Phone */}
                        <div 
                            className={`flex flex-col items-center gap-1 transition ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                            onClick={() => isMouseActive && setActiveApp('phone')}
                        >
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl text-white shadow-lg">
                                📞
                            </div>
                        </div>
                        {/* Messages */}
                        <div 
                            className={`flex flex-col items-center gap-1 transition relative ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                            onClick={() => isMouseActive && setActiveApp('messages')}
                        >
                            <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center text-xl text-white shadow-lg">
                                💬
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border border-black">1</div>
                        </div>
                        {/* Camera */}
                        <div 
                            className={`flex flex-col items-center gap-1 transition ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                            onClick={() => isMouseActive && setActiveApp('camera')}
                        >
                            <div className="w-10 h-10 bg-gray-300 rounded-xl flex items-center justify-center text-xl text-black shadow-lg">
                                📷
                            </div>
                        </div>
                        
                        {/* TokTik App (Mission 15) */}
                        {missionStage === 15 ? (
                            <div 
                                className={`flex flex-col items-center gap-1 transition animate-pulse ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                                onClick={() => isMouseActive && setActiveApp('social')}
                            >
                                <div className="w-10 h-10 bg-black border-2 border-pink-500 rounded-xl flex items-center justify-center text-xl text-white shadow-lg shadow-pink-500/50">
                                    🎵
                                </div>
                            </div>
                        ) : missionStage === 17 ? (
                            // YouTube App (Mission 17)
                            <div 
                                className={`flex flex-col items-center gap-1 transition animate-pulse ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                                onClick={() => isMouseActive && setActiveApp('video')}
                            >
                                <div className="w-10 h-10 bg-white border-2 border-red-600 rounded-xl flex items-center justify-center text-xl text-red-600 shadow-lg shadow-red-500/50">
                                    ▶️
                                </div>
                            </div>
                        ) : (
                            // Standard Browser/Other App
                            <div 
                                className={`flex flex-col items-center gap-1 transition ${isMouseActive ? 'cursor-pointer hover:scale-110' : ''}`}
                                onClick={() => isMouseActive && setActiveApp('browser')}
                            >
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl text-white shadow-lg">
                                    🌐
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </>
          );
      }
  };

  return (
    <div 
      className={`absolute bottom-[-50px] right-10 transition-transform duration-500 ease-in-out z-50 ${isOpen ? 'translate-y-[-60px]' : 'translate-y-[100%]'} ${isMouseActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Phone Body */}
      <div 
        className="relative w-64 h-[500px] bg-black rounded-[2.5rem] border-8 border-gray-800 shadow-2xl overflow-hidden"
        onClick={(e) => isMouseActive && e.stopPropagation()}
      >
        
        {/* Screen Background */}
        <div 
            className="w-full h-full bg-cover bg-center relative" 
            style={{ 
                backgroundImage: activeApp === 'phone' || activeApp === 'browser' || activeApp === 'messages' || activeApp === 'social' || activeApp === 'video' || incomingCall || isCallActive || (missionStage === 8)
                    ? 'none' 
                    : (activeApp === 'camera' ? 'none' : 'linear-gradient(to bottom, #2c3e50, #000000)') 
            }}
        >
          
            {/* Status Bar */}
            <div className={`absolute top-3 left-0 w-full px-6 flex justify-between items-center text-[10px] font-bold z-20 ${activeApp === 'phone' || activeApp === 'browser' || activeApp === 'video' ? 'text-black' : 'text-white'}`}>
                <span>{realTimeStr}</span>
                <div className="flex gap-1">
                    <span>5G</span>
                    <span>100%</span>
                    <div className={`w-4 h-2 rounded-sm ${activeApp === 'phone' || activeApp === 'browser' || activeApp === 'video' ? 'bg-black' : 'bg-white'}`}></div>
                </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-30"></div>

            {/* Render Active App or Home Screen */}
            {renderContent()}

        </div>

        {/* Home Bar (Click to go Home) */}
        {!incomingCall && !isCallActive && missionStage !== 8 && (
            <div 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50 z-40 cursor-pointer hover:opacity-100 transition"
                onClick={() => setActiveApp(null)}
            ></div>
        )}
        
        {/* Mouse Mode Indicator (When active) */}
        {isMouseActive && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime] z-50" title="מצב עכבר פעיל"></div>
        )}
      </div>
    </div>
  );
};
