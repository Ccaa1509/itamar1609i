
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { House } from './components/House';
import { Player } from './components/Player';
import { RoomType } from './types';
import { 
    playEatSound, playDrinkSound, toggleWaterSound, 
    playPhoneRing, playCarSequence,
    playBarricadeSound, playHeavyKnock, playUltimateJumpscare, playHeavyBreathing,
    playStaticBurst, playPhoneGarble, playMenuMusic, stopMenuMusic, playFlushSound, playSizzleSound, playNevoDemonScream, playCreditsMusic
} from './components/AudioEngine';
import { PhoneOverlay } from './components/PhoneOverlay';
import { HouseLights } from './components/HouseLights';
import { hauntState } from './components/HauntState';

type GameState = 'MENU' | 'SETTINGS' | 'CUTSCENE' | 'PLAYING' | 'GAMEOVER' | 'WIN' | 'CREDITS';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  
  // Mission State
  const [missionText, setMissionText] = useState("");
  const [missionStage, setMissionStage] = useState(0); 
  const [isDoorBarricaded, setIsDoorBarricaded] = useState(false);

  // Subtitles & Cutscene State
  const [subtitle, setSubtitle] = useState("");
  const [cutsceneStage, setCutsceneStage] = useState<'RINGING' | 'TALKING' | 'ENDED'>('RINGING');

  // Story Choices
  const [contactChosen, setContactChosen] = useState<'GOLAN' | 'MIKE' | null>(null);

  // Timers
  const [missionTimer, setMissionTimer] = useState<number | null>(null);
  const [chaseTimer, setChaseTimer] = useState<number | null>(null);

  // Game Logic State
  const [currentRoom, setCurrentRoom] = useState<RoomType>(RoomType.LIVING_ROOM);
  const [paused, setPaused] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isWatchingTv, setIsWatchingTv] = useState(false); 
  const [cleaningMessage, setCleaningMessage] = useState("");
  const [isBedroomDoorOpen, setIsBedroomDoorOpen] = useState(false);
  
  // Interaction State
  const [hasFood, setHasFood] = useState(false);
  const [isFoodCooked, setIsFoodCooked] = useState(false);
  const [hasSaladIngredients, setHasSaladIngredients] = useState(false);
  const [hasSalad, setHasSalad] = useState(false);

  // New Items State
  const [hasEggs, setHasEggs] = useState(false);
  const [hasCookedEggs, setHasCookedEggs] = useState(false);
  const [hasChicken, setHasChicken] = useState(false);
  const [hasCookedChicken, setHasCookedChicken] = useState(false);
  const [hasMilk, setHasMilk] = useState(false);
  const [hasCoffee, setHasCoffee] = useState(false);
  const [hasCoffeeCup, setHasCoffeeCup] = useState(false);

  // --- NEW MISSIONS STATE ---
  const [isToiletClogged, setIsToiletClogged] = useState(false);
  const [hasPlunger, setHasPlunger] = useState(false);
  const [isPowerOff, setIsPowerOff] = useState(false);
  const [isRouterReset, setIsRouterReset] = useState(false);

  // Broom & Cleaning State
  const [hasBroom, setHasBroom] = useState(false);
  const [cleanedBloodCount, setCleanedBloodCount] = useState(0);

  // TV Spot State
  const [isStandingForTv, setIsStandingForTv] = useState(false);

  // Cleanliness State
  const [cleanUntil, setCleanUntil] = useState(0);
  const isClean = Date.now() < cleanUntil;

  // TV State
  const [isTvCrashed, setIsTvCrashed] = useState(false);

  // Clues State
  const [collectedClues, setCollectedClues] = useState<number[]>([]);

  // Phone State
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallerName, setActiveCallerName] = useState(""); 
  
  const skipPauseRef = useRef(false);

  // Night Logic
  const [gameMinutes, setGameMinutes] = useState(0);
  const [showDayTransition, setShowDayTransition] = useState(false);
  const [transitionText, setTransitionText] = useState("");

  // Jumpscare State
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [showSuperJumpscare, setShowSuperJumpscare] = useState(false); // For Mission 10.5
  const [forceMonsterAttack, setForceMonsterAttack] = useState(false); // 3D Monster

  // Settings State
  const [sensitivity, setSensitivity] = useState(50);
  const [volume, setVolume] = useState(80);

  // Handle Menu Music
  useEffect(() => {
      if (gameState === 'MENU' || gameState === 'SETTINGS') {
          playMenuMusic();
      } else {
          stopMenuMusic();
      }
  }, [gameState]);

  // Handle Credits Music
  useEffect(() => {
      if (gameState === 'CREDITS') {
          playCreditsMusic();
      }
  }, [gameState]);

  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D', 'KeyD'] },
    { name: 'interact', keys: ['e', 'E', 'KeyE'] },
    { name: 'crouch', keys: ['c', 'C', 'KeyC', 'Control', 'ControlLeft'] },
    { name: 'cycle', keys: ['l', 'L', 'KeyL'] }
  ];

  // Helper to advance time
  const advanceTime = (mins: number) => {
      setGameMinutes(prev => prev + mins);
  };

  // --- START MISSIONS (0.1, 0.2) ---
  const handleCloseEntryDoor = () => {
      if (missionStage === 0.1) {
          setMissionStage(0.2);
          setMissionText("משימה: הדלק את המנורה ליד הספה");
      }
  };

  const handleTurnOnLamp = () => {
      if (missionStage === 0.2) {
          setMissionStage(1);
          setMissionText("משימה: בדוק את המקרר");
      }
  };

  // --- MORNING MISSIONS (9.1, 9.2) ---
  const handleMorningWash = () => {
      if (missionStage === 9.1) {
          toggleWaterSound(true);
          setMissionText("שוטף פנים...");
          setTimeout(() => {
              toggleWaterSound(false);
              setMissionStage(9.2);
              setMissionText("משימה: הכן קפה להתעורר (במטבח)");
          }, 3000);
      }
  };

  // Check coffee completion (triggered by hasCoffeeCup state change effect below)

  // --- ORIGINAL MISSIONS ---
  const handleFridgeOpen = () => {
      if (missionStage === 1) {
          advanceTime(2); 
          setMissionStage(2);
          setMissionText("משימה: הכן אוכל");
      }
  };

  const handleGuitarPlay = () => {
      if (missionStage === 4) {
          advanceTime(2); 
          setMissionStage(5);
          setMissionText(""); 
          
          setTimeout(() => {
              setMissionStage(6);
              setMissionText("משימה: ענה לטלפון (מקש 1)");
              playPhoneRing(true);
              setIncomingCall("אמא"); 
          }, 3000);
      }
  };

  const handleBarricade = () => {
      if (missionStage === 7) {
          playBarricadeSound();
          setIsDoorBarricaded(true);
          advanceTime(5); 
          
          setMissionStage(7.5);
          setMissionText("משימה: שלח הודעה לאמא (פתח טלפון - 1)");
      }
  };

  const handleMessageSent = () => {
      if (missionStage === 7.5) {
          setMissionText("");
          setTimeout(() => {
              playHeavyKnock();
              setMissionStage(8);
              setMissionText("משימה: פתח את הטלפון (1) כדי לקבל החלטה");
          }, 3000);
      }
  };

  const handleVideoUploadSuccess = () => {
      if (missionStage === 15) {
          setMissionStage(16);
          setMissionText("משימה: ענה לשיחת המשטרה");
          setTimeout(() => {
              playPhoneRing(true);
              setIncomingCall("משטרה (100)");
          }, 3000);
      }
  };

  const handleYoutubeDone = () => {
      if (missionStage === 17) {
          // --- NEW MISSION: ROUTER FIX ---
          setMissionStage(17.5);
          setMissionText("שיט! ה-WiFi נפל. גש לחדר שינה ואתחל את הראוטר.");
      }
  };

  // --- NEW MISSIONS HANDLERS ---

  const handleTakePlunger = () => {
      if (missionStage === 8.6) {
          setHasPlunger(true);
          playEatSound();
          setMissionText("משימה: שחרר את הסתימה בשירותים");
      }
  };

  const handleUnclogToilet = () => {
      if (missionStage === 8.6 && hasPlunger) {
          playFlushSound(); // Using flush sound for plunge
          setIsToiletClogged(false);
          setHasPlunger(false);
          setMissionText("איכס... אבל לפחות זה עובד.");
          setTimeout(() => {
              // Proceed to original Mission 9
              setMissionStage(9);
              setMissionText("משימה: לך לישון כדי לעבור את הלילה");
          }, 3000);
      }
  };

  const handleFixPower = () => {
      if (missionStage === 10.5) {
          playStaticBurst(); // Initial Spark
          
          // Tiny delay for tension before impact (0.2s)
          setTimeout(() => {
              setIsPowerOff(false); // Lights back on!
              
              // --- THE ULTIMATE JUMPSCARE SEQUENCE ---
              playNevoDemonScream();
              setForceMonsterAttack(true); // 3D Monster appears
              setShowSuperJumpscare(true); // 2D Overlay
              
              setTimeout(() => {
                  setShowSuperJumpscare(false);
                  setForceMonsterAttack(false);
                  
                  setMissionStage(11);
                  setSubtitle("שרדת... בקושי...");
                  playPhoneGarble(2); 
                  
                  setTimeout(() => {
                      setSubtitle("");
                      setMissionText("משימה: מצא 4 רמזים מוחבאים בבית (0/4)");
                      setMissionTimer(240); 
                  }, 4000);
              }, 2500); // Hold the scare for 2.5 seconds
          }, 200);
      }
  };

  const handleFixRouter = () => {
      if (missionStage === 17.5) {
          setIsRouterReset(true);
          playPhoneGarble(1); // Electronic beep
          setMissionText("ממתין לחיבור...");
          setTimeout(() => {
              setMissionText("מחובר.");
              // Proceed to original Mission 18
              setMissionStage(18);
              setMissionText("משימה: חייג לעזרה בטלפון (מייק או גולן)");
          }, 3000);
      }
  };

  // --- CLEANING MISSIONS (19) ---
  const handlePickUpBroom = () => {
      if (missionStage === 19) {
          setHasBroom(true);
          playEatSound(); 
          setMissionStage(19.5);
          setMissionText("משימה: נקה את 3 כתמי הדם מהרצפה (0/3)");
      }
  };

  const handleCleanBlood = () => {
      if (missionStage === 19.5 && hasBroom) {
          const newCount = cleanedBloodCount + 1;
          setCleanedBloodCount(newCount);
          playFlushSound(); 
          
          if (newCount >= 3) {
              setMissionText("הבית נקי... לבינתיים.");
              // Transition to Mission 20: Go to sleep
              setTimeout(() => {
                  setMissionStage(20);
                  setMissionText("משימה: לך לישון כדי לסיים את היום");
              }, 2000);
          } else {
              setMissionText(`משימה: נקה את 3 כתמי הדם מהרצפה (${newCount}/3)`);
          }
      }
  };

  const handleCallContact = (contactName: string) => {
      if (missionStage === 18) {
          setIsCallActive(true);
          setActiveCallerName(contactName);
          
          // Save Choice for later (Mission 20)
          setContactChosen(contactName === 'גולן' ? 'GOLAN' : 'MIKE');

          setMissionText(`בשיחה עם ${contactName}...`);

          if (contactName === 'גולן') {
              playPhoneGarble(3);
              setSubtitle("איתמר: גולן אני ראיתי את הטטוראיל שלך ולא הבנתי איך אני אמור לשרוד...");
              setTimeout(() => { setSubtitle("איתמר: ויש מצב אתה שולח מישהו לעזור??"); playPhoneGarble(2); }, 4000);
              setTimeout(() => { setSubtitle("גולן: אני אבדוק... אבל תקשיב קטע, אתמול אכלתי שווארמה..."); playPhoneGarble(3); }, 8000);
              setTimeout(() => { setSubtitle("גולן: והטחינה נזלה לי על המכנס החדש! איזה באסה אה?"); playPhoneGarble(3); }, 12000);
              setTimeout(() => { setSubtitle("איתמר: גולן!! זה לא הזמן!!"); playPhoneGarble(1); }, 16000);
              setTimeout(() => { setSubtitle("גולן: טוב טוב ביי, אני הולך לכבס את זה."); playPhoneGarble(2); }, 19000);
              
              setTimeout(() => {
                  setIsCallActive(false);
                  setSubtitle("");
                  // Start Cleaning Mission
                  setMissionStage(19);
                  setMissionText("משימה: קח את המטאטא מהסלון");
              }, 22000);

          } else if (contactName === 'מייק') {
              playPhoneGarble(2);
              setSubtitle("מייק: אל תדאג, אני מעלה פוסטים לחפש איך להגיע אליך.");
              setTimeout(() => { setSubtitle("איתמר: אני חייב לשרוד..."); playPhoneGarble(2); }, 4000);
              setTimeout(() => { setSubtitle("מייק: אל תדאג, תישאר חזק. עזרה בדרך."); playPhoneGarble(3); }, 7000);
              
              setTimeout(() => {
                  setIsCallActive(false);
                  setSubtitle("");
                  // Start Cleaning Mission
                  setMissionStage(19);
                  setMissionText("משימה: קח את המטאטא מהסלון");
              }, 11000);
          }
      }
  };

  // --- TV LOGIC (Updated for Mission 10) ---
  const handleTvTurnOn = () => {
      // Must be standing in the spot
      if (missionStage === 10 && isStandingForTv) {
          setMissionText("צופה בחדשות...");
          setIsWatchingTv(true); 

          setTimeout(() => {
              playStaticBurst();
              setIsTvCrashed(true); 
              hauntState.triggerTvEvent = true; 
              setMissionText(""); 
              
              // --- NEW MISSION: POWER OUTAGE ---
              setTimeout(() => {
                  setIsWatchingTv(false); 
                  setIsPowerOff(true); // Lights out!
                  playSizzleSound(); // Fuse blown
                  setMissionStage(10.5);
                  setMissionText("משימה: החשמל נפל! תקן את ארון החשמל במטבח");
              }, 4000); 
          }, 10000);
      }
  };

  // --- COMPUTER LOGIC (New Missions 22-24) ---
  const handleComputerEvent = (eventType: 'SEARCH' | 'SCARE_DONE' | 'FINALE') => {
      if (missionStage === 22 && eventType === 'SEARCH') {
          setMissionStage(23); // Typing stage
          setMissionText("מקליד...");
      }
      else if (eventType === 'FINALE') {
          // --- THE REAL ENDING ---
          setMissionText("");
          // Show the chilling message
          setSubtitle("אתה באמת חושב שזה ייגמר כזה פשוט?");
          
          setTimeout(() => {
              // 1. Clear text (Black Screen Phase)
              setSubtitle("");
              document.exitPointerLock();
              
              // 2. Wait 3 seconds in darkness, then start credits
              setTimeout(() => {
                  setGameState('CREDITS');
              }, 3000);
          }, 4000);
      }
  };

  // --- REST OF LOGIC ---
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      // Mission 14 Chase Logic (TV Jumpscare)
      if (missionStage === 14 && !isHiding && gameState === 'PLAYING') {
          if (chaseTimer === null) setChaseTimer(10); 
          interval = setInterval(() => {
              setChaseTimer((prev) => {
                  if (prev === null) return 10;
                  if (prev <= 1) {
                      playUltimateJumpscare();
                      setShowJumpscare(true);
                      setPaused(true);
                      setTimeout(() => {
                          setShowJumpscare(false);
                          setGameState('GAMEOVER');
                          document.exitPointerLock();
                      }, 1500);
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      } 
      else {
          if (chaseTimer !== null) setChaseTimer(null);
      }
      return () => clearInterval(interval);
  }, [missionStage, isHiding, gameState]);

  useEffect(() => {
      // Hiding Logic Success
      if (missionStage === 14 && isHiding) {
          setChaseTimer(null); 
          setTimeout(() => {
              hauntState.tvEventFinished = true; 
              setMissionStage(15);
              setSubtitle("נבו: אני אבדוק בחוץ..."); 
              setTimeout(() => {
                  setSubtitle("");
                  setMissionText("משימה: העלה סרטון ל-TokTik כדי להזעיק עזרה (בטלפון)");
              }, 4000);
          }, 4000);
      }
  }, [missionStage, isHiding]);

  const handleInvestigateDoor = () => {
      if (missionStage === 8) {
          setIsPhoneOpen(false);
          setIsPhoneMode(false);
          setPaused(false);
          setMissionText("מחכה בשקט...");
          skipPauseRef.current = true; 
          playHeavyBreathing();
          setTimeout(() => {
              setPaused(true);
              setShowJumpscare(true);
              playUltimateJumpscare();
              setTimeout(() => {
                  setShowJumpscare(false);
                  setGameState('GAMEOVER');
                  document.exitPointerLock();
              }, 1500);
          }, 3000);
      }
  };

  const handleIgnoreAndShower = () => {
      if (missionStage === 8) {
          setIsPhoneOpen(false);
          setIsPhoneMode(false);
          setPaused(false);
          setTimeout(() => { try { document.getElementById('root')?.requestPointerLock(); } catch(e){} }, 100);
          setMissionStage(8.5);
          setMissionText("משימה: לך להתקלח כדי להירגע");
      }
  };

  const handleShowerDone = () => {
      if (missionStage === 8.5) {
          handleBath(); 
          // --- NEW MISSION: TOILET CLOGGED ---
          setMissionStage(8.6);
          setIsToiletClogged(true);
          setMissionText("משימה: השירותים סתומים! מצא את הפומפה (במסדרון)");
      }
  };

  const handleSleep = () => {
      // Mission 9: First Night Sleep
      if (missionStage === 9) {
          setIsResting(true);
          setTimeout(() => {
              setTransitionText("כעבור יום...");
              setShowDayTransition(true);
              setMissionText("");
              setTimeout(() => {
                  setShowDayTransition(false);
                  setIsResting(false);
                  setGameMinutes(480);
                  
                  // --- NEW MORNING ROUTINE (Mission 9.1) ---
                  setMissionStage(9.1);
                  setMissionText("משימה: שטוף פנים בכיור במטבח"); 
                  
                  // Reset coffee ingredients for realism (need to fetch them)
                  setHasCoffee(false);
                  setHasMilk(false);
              }, 4000);
          }, 1000);
      }
      // Mission 12: Second Sleep (After clues)
      else if (missionStage === 12) {
          setIsResting(true);
          setMissionText("");
          setMissionTimer(null);
          setTimeout(() => {
              setTransitionText(""); 
              setShowDayTransition(true);
              setTimeout(() => {
                  setShowDayTransition(false);
                  setIsResting(false); 
                  setMissionStage(13);
                  playUltimateJumpscare();
                  setSubtitle("מה זה היה?!");
                  setTimeout(() => {
                      setSubtitle("");
                      setMissionText("משימה: עקוב אחרי הדם...");
                  }, 3000);
              }, 3000);
          }, 1000);
      } 
      // Mission 20: Final Sleep (Phone Call Branch)
      else if (missionStage === 20) {
          setIsResting(true);
          setMissionText("");
          // Delay, then phone rings
          setTimeout(() => {
              const caller = contactChosen === 'GOLAN' ? 'גולן' : 'מייק';
              setMissionStage(21);
              setMissionText("משימה: ענה לשיחה הנכנסת");
              playPhoneRing(true);
              setIncomingCall(caller);
          }, 2000);
      }
      else {
          setIsResting(!isResting);
      }
  };

  useEffect(() => {
      if (missionStage === 13 && currentRoom === RoomType.BATHROOM) {
          setMissionStage(13.5); 
          setIsWatchingTv(true); 
          setMissionText("");
          setSubtitle("נבו: איתמר... מה אתה עושה בבית שלי?");
          playPhoneGarble(3);
          setTimeout(() => {
              setSubtitle("איתמר: נבו? חשבתי... חשבתי שזה נטוש...");
              setTimeout(() => {
                  setSubtitle("נבו: שום דבר לא נטוש. ועכשיו... אתה נשאר איתי.");
                  playPhoneGarble(3);
                  setTimeout(() => {
                      setSubtitle("");
                      setMissionStage(14); 
                      playStaticBurst();
                      playUltimateJumpscare(); 
                      setMissionText("!!! רוץ לספה והתחבא - 10 שניות !!!");
                      setIsWatchingTv(false); 
                      playHeavyBreathing();
                  }, 4000); 
              }, 3000); 
          }, 4000); 
      }
  }, [missionStage, currentRoom]);

  const handleCollectClue = (id: number) => {
      if (missionStage === 11 && !collectedClues.includes(id)) {
          const newClues = [...collectedClues, id];
          setCollectedClues(newClues);
          playEatSound(); 
          if (newClues.length === 4) {
              setMissionTimer(null);
              setMissionStage(12);
              setMissionText("משימה: לך לישון כדי לצבור כוח");
          } else {
              setMissionText(`משימה: מצא 4 רמזים מוחבאים בבית (${newClues.length}/4)`);
          }
      }
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (missionTimer !== null && missionTimer > 0 && gameState === 'PLAYING') {
          interval = setInterval(() => {
              setMissionTimer(prev => {
                  if (prev === null) return null;
                  if (prev <= 1) {
                      setMissionTimer(null);
                      setPaused(true);
                      setShowJumpscare(true);
                      playUltimateJumpscare();
                      setTimeout(() => {
                          setShowJumpscare(false);
                          setGameState('GAMEOVER');
                          document.exitPointerLock();
                      }, 1500);
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [missionTimer, gameState]);

  const handleAnswerCall = () => {
      if (missionStage === 6) {
          playPhoneRing(false);
          setIncomingCall(null);
          setIsCallActive(true);
          setMissionText("בשיחה עם אמא..."); 
          const line1 = "איתמר? אתה שומע? ראיתי את החדשות...";
          playPhoneGarble(3);
          setSubtitle(line1);
          setTimeout(() => {
              const line2 = "אומרים שנבו הרוצח ממש ליד הבית שלך! אני בלחץ!";
              playPhoneGarble(3);
              setSubtitle(line2);
          }, 3000);
          setTimeout(() => {
              const line3 = "תנעל את הדלתות ותישאר בפנים, בבקשה!";
              playPhoneGarble(3);
              setSubtitle(line3);
          }, 6000);
          setTimeout(() => {
              const line4 = "בן שלי, תשמור על עצמך.";
              playPhoneGarble(3);
              setSubtitle(line4);
          }, 9000);
          setTimeout(() => {
              setSubtitle("");
              setIsCallActive(false);
              advanceTime(2); 
              setMissionStage(7); 
              setMissionText("משימה: חסום את דלת הכניסה עם קרשים");
          }, 12000);
      } 
      else if (missionStage === 16) {
          playPhoneRing(false);
          setIncomingCall(null);
          setIsCallActive(true);
          setMissionText("בשיחה עם המשטרה...");
          const line1 = "משטרה: איתמר? אנחנו פה בחוץ.";
          playPhoneGarble(2);
          setSubtitle(line1);
          setTimeout(() => {
              const line2 = "משטרה: אל תדאג, אנחנו נכנסים...";
              playPhoneGarble(2);
              setSubtitle(line2);
          }, 3000);
          setTimeout(() => {
              const line3 = "משטרה: רגע... מה זה בחלון?!";
              playPhoneGarble(1.5);
              setSubtitle(line3);
          }, 6000);
          setTimeout(() => {
              const line4 = "משטרה: מה זה?! לא! לאאאאא!!!";
              playPhoneGarble(1); 
              setSubtitle(line4);
          }, 8000);
          setTimeout(() => {
              playUltimateJumpscare(); 
              playStaticBurst();
              setSubtitle("");
              setIsCallActive(false); 
              setMissionStage(17);
              setMissionText("משימה: פתח את יוטיוב בטלפון וחפש מדריך");
          }, 10000);
      }
      else if (missionStage === 21) {
          // Final Branching Call
          playPhoneRing(false);
          setIncomingCall(null);
          setIsCallActive(true);
          setActiveCallerName(contactChosen === 'GOLAN' ? 'גולן' : 'מייק');

          setMissionText(`בשיחה עם ${contactChosen === 'GOLAN' ? 'גולן' : 'מייק'}...`);

          if (contactChosen === 'GOLAN') {
              playPhoneGarble(3);
              setSubtitle("גולן: תקשיב, כיבסתי את המכנס ויצא אחלה!");
              setTimeout(() => { 
                  setSubtitle("גולן: ובדקתי עם מייק..."); 
                  playPhoneGarble(2); 
              }, 4000);
              setTimeout(() => { 
                  setSubtitle("גולן: הוא מנסה לשלוח מישהו, אבל לא עונים לו."); 
                  playPhoneGarble(3); 
              }, 8000);
              setTimeout(() => {
                  setSubtitle("");
                  setIsCallActive(false);
                  
                  // --- NEW EXTENSION: Go to Computer ---
                  setMissionStage(22);
                  setMissionText("משימה: גש למחשב בחדר השינה וחפש מידע על נבו");
              }, 12000);
          } 
          else { // MIKE
              playPhoneGarble(3);
              setSubtitle("מייק: תקשיב, יש לי חדשות טובות ורעות.");
              setTimeout(() => { 
                  setSubtitle("מייק: ענו לי, אבל אמרו שרק בעוד יומיים הם יגיעו לשם."); 
                  playPhoneGarble(4); 
              }, 4000);
              setTimeout(() => { 
                  setSubtitle("איתמר: שיט!"); 
                  playPhoneGarble(1); 
              }, 9000);
              setTimeout(() => { 
                  setSubtitle("מייק: לא לדאוג."); 
                  playPhoneGarble(2); 
              }, 11000);
              setTimeout(() => {
                  setSubtitle("");
                  setIsCallActive(false);
                  
                  // --- NEW EXTENSION: Go to Computer ---
                  setMissionStage(22);
                  setMissionText("משימה: גש למחשב בחדר השינה וחפש מידע על נבו");
              }, 14000);
          }
      }
  };

  useEffect(() => {
      // Check for Start missions
      if (missionStage === 2) {
          if ((hasFood && isFoodCooked) || hasCookedEggs || hasCookedChicken || hasSalad || hasCoffeeCup) {
              advanceTime(2); 
              setMissionStage(3);
              setMissionText("משימה: אכול את האוכל (H)");
          }
      }
      // Check for Morning missions (Coffee)
      if (missionStage === 9.2 && hasCoffeeCup) {
          setMissionStage(10);
          setMissionText("משימה: עמוד במרכז הסלון וצפה בחדשות"); 
      }
  }, [missionStage, hasFood, isFoodCooked, hasCookedEggs, hasCookedChicken, hasSalad, hasCoffeeCup]);

  const startCutscene = () => {
      setGameState('CUTSCENE');
      setCutsceneStage('RINGING');
      playPhoneRing(true);
  };

  const answerPhone = () => {
      playPhoneRing(false);
      setCutsceneStage('TALKING');
      const line1 = "שומע איתמר? מצאתי את הבית הנטוש שדיברנו עליו.";
      playPhoneGarble(4);
      setSubtitle(line1);
      setTimeout(() => {
          const line2 = "אולי תלך לבדוק אותו? אבל... מסוכן שם.";
          playPhoneGarble(4);
          setSubtitle(line2);
      }, 4000);
      setTimeout(() => {
          const line3 = "אז תיזהר.";
          playPhoneGarble(2);
          setSubtitle(line3);
      }, 8000);
      setTimeout(() => {
          setSubtitle("");
          setCutsceneStage('ENDED');
          playCarSequence();
          setTimeout(() => {
              setGameState('PLAYING');
              setPaused(false);
              // --- NEW START SEQUENCE ---
              setMissionText("משימה: סגור את דלת הכניסה");
              setMissionStage(0.1);
          }, 4000);
      }, 10000);
  };

  const getRoomName = (room: RoomType) => {
    switch (room) {
      case RoomType.LIVING_ROOM: return 'סלון';
      case RoomType.KITCHEN: return 'מטבח';
      case RoomType.BEDROOM: return 'חדר שינה';
      case RoomType.BATHROOM: return 'שירותים ומקלחת';
      default: return '';
    }
  };

  const handleBath = () => {
      if (isClean) return;
      setIsCleaning(true);
      setCleaningMessage("מתקלח...");
      toggleWaterSound(true);
      setTimeout(() => {
          toggleWaterSound(false);
          setCleaningMessage("עכשיו אתה נקי");
          setCleanUntil(Date.now() + 20 * 60 * 1000);
          setTimeout(() => {
              setIsCleaning(false);
              setCleaningMessage("");
          }, 3000);
      }, 5000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState !== 'PLAYING' || paused) return;
        if (e.code === 'KeyH') {
            let ate = false;
            if (hasCoffeeCup) { setHasCoffeeCup(false); playDrinkSound(); ate = true; } 
            else if (hasCookedEggs) { setHasCookedEggs(false); playEatSound(); ate = true; } 
            else if (hasCookedChicken) { setHasCookedChicken(false); playEatSound(); ate = true; } 
            else if (hasSalad) { setHasSalad(false); playEatSound(); ate = true; } 
            else if (hasFood && isFoodCooked) { setHasFood(false); setIsFoodCooked(false); playEatSound(); ate = true; }
            if (ate && missionStage === 3) {
                advanceTime(2); 
                setMissionStage(4);
                setMissionText("משימה: נגן בגיטרה בסלון");
            }
        }
        if ((e.key === 'y' || e.key === 'Y' || e.code === 'KeyY') && missionStage === 8) {
            handleInvestigateDoor();
        }
        if (e.key === '1') {
            if (isPhoneOpen) {
                setIsPhoneOpen(false);
                setIsPhoneMode(false);
                setPaused(false); 
                setTimeout(() => {
                    try { const root = document.getElementById('root'); if (root) root.requestPointerLock(); } catch (err) {}
                }, 50);
            } else {
                setIsPhoneOpen(true);
                setIsPhoneMode(true);
                skipPauseRef.current = true;
                document.exitPointerLock();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, paused, isPhoneOpen, hasFood, isFoodCooked, hasSalad, hasCoffeeCup, hasCookedEggs, hasCookedChicken, missionStage]);

  useEffect(() => {
      const handleRightClick = (e: MouseEvent) => {
          if (gameState !== 'PLAYING' || paused) return;
          if (isPhoneOpen) {
              e.preventDefault(); 
              if (document.pointerLockElement) {
                  skipPauseRef.current = true;
                  document.exitPointerLock();
                  setIsPhoneMode(true);
              }
          }
      };
      window.addEventListener('contextmenu', handleRightClick);
      return () => window.removeEventListener('contextmenu', handleRightClick);
  }, [gameState, paused, isPhoneOpen]);

  const formatTime = (totalMinutes: number) => {
    const startHour = 12;
    const addedHours = Math.floor(totalMinutes / 60);
    let displayHour = startHour + addedHours;
    if (displayHour > 12) displayHour -= 12;
    const ampm = "AM"; 
    const mins = totalMinutes % 60;
    const minsStr = mins < 10 ? `0${mins}` : mins;
    return `${displayHour}:${minsStr} ${ampm}`;
  };
  
  const formatSeconds = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0'+s : s}`;
  };

  const formattedGameTime = formatTime(gameMinutes);
  const canEat = (hasFood && isFoodCooked) || hasSalad || hasCookedEggs || hasCookedChicken || hasCoffeeCup;

  return (
    <div className="relative w-full h-screen font-sans bg-black select-none overflow-hidden">
      
      {/* 1. GAME VIEW */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: 60 }}>
          <HouseLights isPowerOff={isPowerOff} />
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 4, 18]} />
          
          <House 
            isHiding={isHiding} onToggleHide={setIsHiding} 
            isResting={isResting} onToggleRest={setIsResting} 
            isBedroomDoorOpen={isBedroomDoorOpen} onToggleBedroomDoor={setIsBedroomDoorOpen}
            hasFood={hasFood} setHasFood={setHasFood} setIsFoodCooked={setIsFoodCooked}
            onBath={handleBath} isClean={isClean}
            hasIngredients={hasSaladIngredients} setHasIngredients={setHasSaladIngredients} setHasSalad={setHasSalad}
            hasEggs={hasEggs} setHasEggs={setHasEggs}
            hasChicken={hasChicken} setHasChicken={setHasChicken}
            hasMilk={hasMilk} setHasMilk={setHasMilk}
            hasCoffee={hasCoffee} setHasCoffee={setHasCoffee}
            setHasCookedEggs={setHasCookedEggs} setHasCookedChicken={setHasCookedChicken}
            setHasCoffeeCup={setHasCoffeeCup}
            gameMinutes={gameMinutes}
            
            highlightFridge={missionStage === 1}
            onFridgeOpen={handleFridgeOpen}
            highlightGuitar={missionStage === 4}
            onGuitarPlay={handleGuitarPlay}
            
            isDoorBarricaded={isDoorBarricaded}
            onBarricade={handleBarricade}
            
            missionStage={missionStage} 
            onDoorInvestigate={handleInvestigateDoor} 
            onDoorIgnore={handleIgnoreAndShower} 
            onShowerDone={handleShowerDone} 
            onSleep={handleSleep}
            onTvScare={handleTvTurnOn}
            isTvCrashed={isTvCrashed} 
            
            // TV Spot Logic
            onEnterTvSpot={() => setIsStandingForTv(true)}
            onLeaveTvSpot={() => setIsStandingForTv(false)}
            isStandingForTv={isStandingForTv}

            collectedClues={collectedClues}
            onCollectClue={handleCollectClue}
            
            isBathroomLocked={missionStage >= 15}

            // Broom Logic
            hasBroom={hasBroom}
            onPickUpBroom={handlePickUpBroom}
            cleanedBloodCount={cleanedBloodCount}
            onCleanBlood={handleCleanBlood}

            // --- NEW PROPS ---
            isToiletClogged={isToiletClogged}
            hasPlunger={hasPlunger}
            onTakePlunger={handleTakePlunger}
            onUnclogToilet={handleUnclogToilet}
            
            isPowerOff={isPowerOff}
            onFixPower={handleFixPower}

            isRouterReset={isRouterReset}
            onFixRouter={handleFixRouter}

            // New Start Props
            onCloseEntryDoor={handleCloseEntryDoor}
            onTurnOnLamp={handleTurnOnLamp}
            
            // New Morning Props
            onMorningWash={handleMorningWash}

            // Force Monster Attack Logic (Mission 10.5 Jumpscare)
            triggerGlobalJumpscare={forceMonsterAttack}

            // Computer
            onComputerEvent={handleComputerEvent}
          />

          {gameState === 'PLAYING' && (
            <Player 
              onRoomChange={setCurrentRoom} 
              onUnlock={() => {
                  if (skipPauseRef.current) return;
                  setPaused(true);
              }}
              onLock={() => {
                  setPaused(false);
                  setIsPhoneMode(false);
                  skipPauseRef.current = false;
              }}
              isHiding={isHiding} isResting={isResting} isCleaning={isCleaning} 
              isWatchingTv={isWatchingTv} 
              isBedroomDoorOpen={isBedroomDoorOpen} isPhoneMode={isPhoneMode}
              isBathroomLocked={missionStage >= 15}
            />
          )}
        </Canvas>
      </KeyboardControls>

      {/* 2. MAIN MENU */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 text-red-600 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_tv.png')] bg-repeat">
          <div className="text-center p-8 border-2 border-red-900/50 rounded-lg bg-black/90 shadow-[0_0_100px_rgba(255,0,0,0.3)] max-w-md w-full backdrop-blur-sm">
            <h1 className="text-6xl mb-2 font-bold glitch" style={{ fontFamily: 'Courier New, monospace' }}>
              חמישה לילות
              <br />
              אצל נבו
            </h1>
            <h2 className="text-xl text-red-800 mb-12 font-serif tracking-widest">
              שרדו את הלילה...
            </h2>
            <div className="space-y-4">
                <button 
                  onClick={startCutscene}
                  className="w-full px-6 py-4 bg-red-900/20 text-red-500 font-bold border border-red-800 hover:bg-red-900/50 hover:text-red-300 transition-all duration-300 tracking-wider uppercase text-2xl"
                >
                  משחק חדש
                </button>
                <button 
                  onClick={() => setGameState('SETTINGS')}
                  className="w-full px-6 py-3 bg-gray-900/20 text-gray-500 font-bold border border-gray-800 hover:bg-gray-800/50 hover:text-gray-300 transition-all duration-300 tracking-wider uppercase"
                >
                  הגדרות
                </button>
            </div>
            <div className="mt-8 text-xs text-gray-700 font-mono">
                v1.0.0 | WARNING: SCARY CONTENT
            </div>
          </div>
        </div>
      )}

      {/* 3. SETTINGS MENU */}
      {gameState === 'SETTINGS' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 text-white">
              <div className="w-full max-w-md p-8 border border-gray-700 rounded bg-gray-900/50">
                  <h2 className="text-3xl font-bold mb-8 text-center text-red-500">הגדרות</h2>
                  <div className="mb-6">
                      <label className="block text-sm mb-2 text-gray-400">רגישות עכבר</label>
                      <input 
                        type="range" min="1" max="100" 
                        value={sensitivity} onChange={(e) => setSensitivity(parseInt(e.target.value))}
                        className="w-full accent-red-600"
                      />
                      <div className="text-right text-xs text-gray-500">{sensitivity}%</div>
                  </div>
                  <div className="mb-8">
                      <label className="block text-sm mb-2 text-gray-400">עוצמת שמע</label>
                      <input 
                        type="range" min="0" max="100" 
                        value={volume} onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-full accent-red-600"
                      />
                      <div className="text-right text-xs text-gray-500">{volume}%</div>
                  </div>
                  <button 
                    onClick={() => setGameState('MENU')}
                    className="w-full py-3 border border-white/20 hover:bg-white/10 transition"
                  >
                      חזור
                  </button>
              </div>
          </div>
      )}

      {/* 4. GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50 animate-fadeIn">
              <div className="text-center">
                  <h1 className="text-9xl text-red-600 font-bold mb-8 glitch" style={{ fontFamily: 'Courier New' }}>אתה מת</h1>
                  <p className="text-2xl text-gray-400 mb-12">נבו מצא אותך... לא היית צריך לפתוח.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-900/30 border border-red-600 text-red-500 hover:bg-red-900 hover:text-white transition"
                  >
                      נסה שוב
                  </button>
              </div>
          </div>
      )}
      
      {/* 5. CREDITS SCREEN (FINALE) - MOVIE SCROLL */}
      {gameState === 'CREDITS' && (
          <div className="absolute inset-0 flex flex-col items-center bg-black z-50 overflow-hidden">
              <style>{`
                  @keyframes crawl {
                      0% { transform: translateY(100vh); }
                      100% { transform: translateY(-150%); }
                  }
              `}</style>
              
              <div className="text-center text-white space-y-12 w-full max-w-2xl px-4 animate-[crawl_40s_linear_forwards]">
                  
                  {/* Header */}
                  <h1 className="text-8xl text-red-600 font-bold mb-24 mt-20 glitch" style={{ fontFamily: 'Courier New' }}>המשך יבוא...</h1>
                  
                  {/* Creator */}
                  <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">יוצר המשחק</h3>
                      <p className="text-5xl text-yellow-500 font-bold">איתמר</p>
                  </div>

                  {/* Cast */}
                  <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">משתתפים</h3>
                      <div className="text-3xl text-blue-400 font-bold space-y-2">
                          <p>נאור</p>
                          <p>מייק</p>
                          <p>גולן</p>
                      </div>
                  </div>

                  {/* Sound */}
                  <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">עיצוב סאונד</h3>
                      <p className="text-4xl text-purple-400">איתמר</p>
                  </div>

                  {/* Ideas */}
                  <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-400 tracking-widest uppercase">רעיונות</h3>
                      <p className="text-4xl text-green-400">איתי מזרחי</p>
                  </div>

                  {/* Special Thanks - Supporters */}
                  <div className="space-y-6 pt-8">
                      <h3 className="text-2xl font-bold text-gray-400 tracking-widest uppercase border-b border-gray-700 pb-2 inline-block">תודה לכל מי שתמך בי</h3>
                      <div className="text-2xl text-white font-medium grid grid-cols-2 gap-4 text-center leading-loose">
                          <p>נהוראי</p>
                          <p>יריב</p>
                          <p>אור גלנטי</p>
                          <p>איתי</p>
                          <p>נבו</p>
                          <p>נאור</p>
                          <p>שגיא</p>
                          <p>מייק</p>
                          <p>אריאל</p>
                          <p>בצאק</p>
                          <p>עוגן</p>
                          <p>יניב</p>
                          <p>רועי</p>
                          <p className="col-span-2 text-gray-400 italic mt-4">...ועוד</p>
                      </div>
                  </div>

                  {/* Closing */}
                  <div className="pt-32 pb-48 space-y-8">
                      <h3 className="text-2xl font-bold text-gray-400">מלך העולם</h3>
                      <p className="text-6xl text-red-500 font-black glitch">איתמר</p>
                      
                      <div className="pt-16">
                          <h1 className="text-5xl font-serif text-white">תודה רבה ששיחקתם!</h1>
                      </div>
                  </div>
              </div>

              {/* Fixed Exit Button - Fades in later */}
              <button 
                onClick={() => window.location.reload()}
                className="absolute bottom-8 right-8 px-6 py-2 border border-white/20 text-white/50 hover:text-white hover:bg-white/10 transition opacity-0 animate-[fadeIn_5s_ease-in_30s_forwards] text-sm"
              >
                  חזור לתפריט
              </button>
          </div>
      )}

      {/* JUMPSCARE OVERLAY */}
      {showJumpscare && (
          <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
              <div className="relative w-full h-full bg-red-900/20 animate-pulse">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] bg-black rounded-full border-4 border-red-500 flex items-center justify-center animate-bounce">
                      <div className="text-[40vmin]">💀</div>
                  </div>
              </div>
          </div>
      )}

      {/* SUPER JUMPSCARE OVERLAY (Mission 10.5) - STROBE EFFECT */}
      {showSuperJumpscare && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black pointer-events-none mix-blend-multiply overflow-hidden">
              {/* Red Flash Strobe */}
              <div className="absolute inset-0 bg-red-900 animate-[pulse_0.1s_infinite]"></div>
              
              {/* Shake Effect Container */}
              <div className="relative w-full h-full flex items-center justify-center animate-[bounce_0.1s_infinite]">
                  {/* Just chaotic glitch lines */}
                  <div className="w-[120%] h-[20px] bg-black rotate-12 absolute top-1/3"></div>
                  <div className="w-[120%] h-[50px] bg-black -rotate-6 absolute bottom-1/3"></div>
                  
                  {/* Text hidden in the flash */}
                  <h1 className="text-9xl text-black font-black z-10 scale-[5] opacity-20">NEVO</h1>
              </div>
          </div>
      )}

      {/* DAY TRANSITION OVERLAY */}
      {showDayTransition && (
          <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center animate-fadeInOut">
              <h1 className="text-6xl text-white font-serif tracking-widest italic">
                  {transitionText}
              </h1>
          </div>
      )}

      {/* 4. CUTSCENE OVERLAY */}
      {gameState === 'CUTSCENE' && (
          <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center">
              {cutsceneStage === 'RINGING' && (
                  <div className="text-center animate-pulse">
                      <div className="text-4xl text-white mb-4">שיחה נכנסת</div>
                      <div className="text-6xl text-white font-thin mb-12">Mike</div>
                      <div className="flex gap-8 justify-center">
                          <button 
                             onClick={answerPhone}
                             className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl hover:scale-110 transition animate-bounce"
                          >
                              📞
                          </button>
                          <button className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-4xl opacity-50 cursor-not-allowed">
                              📞
                          </button>
                      </div>
                  </div>
              )}
              {cutsceneStage === 'TALKING' && (
                  <div className="text-center">
                      <div className="text-2xl text-green-500 mb-2">בשיחה...</div>
                      <div className="text-4xl text-white font-thin mb-12">Mike</div> 
                      <div className="w-64 h-64 bg-gray-900 rounded-full mx-auto mb-8 flex items-center justify-center border border-gray-700">
                          <span className="text-6xl">👤</span>
                      </div>
                  </div>
              )}
              {subtitle && (
                  <div className="absolute bottom-20 left-0 w-full text-center px-8">
                      <span className="bg-black/80 text-white text-xl px-4 py-2 rounded font-serif tracking-wide border-t border-red-900/50">
                          {subtitle}
                      </span>
                  </div>
              )}
          </div>
      )}

      {/* 5. IN-GAME UI LAYERS */}
      {(missionTimer !== null || chaseTimer !== null) && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
              <div className={`text-6xl font-mono font-bold tracking-widest ${
                  (chaseTimer !== null || (missionTimer !== null && missionTimer < 30)) ? 'text-red-600 animate-pulse scale-125' : 'text-white'
              }`}>
                  {chaseTimer !== null ? `! ${formatSeconds(chaseTimer)} !` : formatSeconds(missionTimer!)}
              </div>
              {chaseTimer !== null && (
                  <div className="text-red-500 text-2xl font-bold text-center animate-bounce mt-2">
                      {missionStage === 24 ? "רוץ לספה!!!" : "רוץ לספה!"}
                  </div>
              )}
          </div>
      )}
      
      {gameState === 'PLAYING' && !paused && missionText && (
          <div className="absolute top-8 left-8 z-30 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-r-lg border-l-4 border-yellow-500 shadow-lg animate-slideIn">
                  <h3 className="text-yellow-500 text-sm font-bold tracking-wider mb-1">מטרה נוכחית</h3>
                  <div className="text-white text-xl font-serif">{missionText}</div>
              </div>
          </div>
      )}

      {gameState === 'PLAYING' && !paused && subtitle && (
          <div className="absolute bottom-32 left-0 w-full text-center px-8 z-40 pointer-events-none">
              <span className="bg-black/80 text-white text-xl px-4 py-2 rounded font-serif tracking-wide border-t border-red-900/50">
                  {subtitle}
              </span>
          </div>
      )}

      {gameState === 'PLAYING' && paused && !isPhoneMode && !showJumpscare && !showSuperJumpscare && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 cursor-pointer"
          onClick={() => { /* Handled by Player relock */ }}
        >
          <div className="text-white text-2xl font-bold tracking-widest animate-pulse pointer-events-none">
            לחצו על המסך כדי להמשיך
          </div>
        </div>
      )}

      {isCleaning && (
        <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center">
            <h1 className="text-white text-5xl font-serif tracking-widest animate-pulse">
                {cleaningMessage}
            </h1>
        </div>
      )}

      {gameState === 'PLAYING' && !paused && !isResting && !isCleaning && (
        <div className="absolute top-8 right-8 pointer-events-none z-20 flex flex-col items-end gap-2">
          <div className="bg-black/30 backdrop-blur-sm px-6 py-2 rounded border border-red-900/30">
            <span className="text-red-500 text-2xl font-mono tracking-widest drop-shadow-md">
              {getRoomName(currentRoom)}
            </span>
          </div>
          
          {hasFood && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-yellow-600/50 animate-pulse flex items-center gap-2">
               <span className="text-4xl">🍕</span>
               <div className="flex flex-col items-end">
                   <span className="text-yellow-400 text-lg">מחזיק פיצה</span>
                   <span className={`text-xs ${isFoodCooked ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                       {isFoodCooked ? '(מוכנה)' : '(קפואה)'}
                   </span>
               </div>
            </div>
          )}

          {hasBroom && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-orange-600/50 animate-pulse flex items-center gap-2">
               <span className="text-3xl">🧹</span>
               <span className="text-orange-300 text-lg">מטאטא</span>
            </div>
          )}

          {hasPlunger && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-pink-600/50 animate-pulse flex items-center gap-2">
               <span className="text-3xl">🪠</span>
               <span className="text-pink-300 text-lg">פומפה</span>
            </div>
          )}

          {hasSaladIngredients && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-green-600/50 animate-pulse flex items-center gap-2">
               <span className="text-3xl">🍅</span>
               <div className="flex flex-col items-end">
                   <span className="text-green-400 text-lg">ירקות לסלט</span>
               </div>
            </div>
          )}
          {hasSalad && (
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-green-500/50 animate-pulse flex items-center gap-2">
               <span className="text-3xl">🥗</span>
               <span className="text-green-300 text-lg">סלט מוכן</span>
            </div>
          )}

          {hasEggs && !hasCookedEggs && <div className="bg-black/60 px-4 py-1 rounded text-white border border-gray-500 text-right">ביצים (גש למחבת) 🥚</div>}
          {hasChicken && !hasCookedChicken && <div className="bg-black/60 px-4 py-1 rounded text-white border border-gray-500 text-right">כרעיים (גש למחבת) 🍗</div>}
          {hasMilk && <div className="bg-black/60 px-4 py-1 rounded text-white border border-blue-500 text-right">חלב 🥛</div>}
          {hasCoffee && <div className="bg-black/60 px-4 py-1 rounded text-white border border-yellow-900 text-right">קפה ☕</div>}
          
          {hasCookedEggs && <div className="bg-black/60 px-4 py-1 rounded text-green-400 border border-green-500 text-right">חביתה מוכנה 🍳</div>}
          {hasCookedChicken && <div className="bg-black/60 px-4 py-1 rounded text-green-400 border border-green-500 text-right">עוף מוכן 🍗</div>}
          {hasCoffeeCup && <div className="bg-black/60 px-4 py-1 rounded text-green-400 border border-green-500 text-right">כוס קפה חם ☕</div>}
        </div>
      )}

      {/* Eat Prompt */}
      {gameState === 'PLAYING' && !paused && canEat && !isCleaning && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
              <div className="text-white text-xl font-bold tracking-widest animate-bounce drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" 
                   style={{ textShadow: "0 0 10px #00ff00" }}>
                  לחץ H כדי לאכול/לשתות
              </div>
          </div>
      )}

      {/* Phone Overlay */}
      {gameState === 'PLAYING' && !paused && !isResting && !isCleaning && (
        <PhoneOverlay 
            isOpen={isPhoneOpen} 
            gameTime={formattedGameTime} 
            isMouseActive={isPhoneMode}
            incomingCall={incomingCall}
            onAnswer={handleAnswerCall}
            isCallActive={isCallActive}
            missionStage={missionStage}
            onDecisionWait={handleInvestigateDoor}
            onDecisionIgnore={handleIgnoreAndShower}
            onMessageSent={handleMessageSent}
            onVideoSuccess={handleVideoUploadSuccess}
            onVideoWatchComplete={handleYoutubeDone}
            onCallContact={handleCallContact}
            activeCallerName={activeCallerName}
        />
      )}

      {/* Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_tv.png')] bg-repeat mix-blend-overlay"></div>
    </div>
  );
}
