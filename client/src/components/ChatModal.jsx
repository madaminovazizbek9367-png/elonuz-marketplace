import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShoppingBag, ArrowLeft, CheckCheck, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

// Voice Message Audio Player Component
function VoicePlayer({ audioUrl, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
          isMe ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex flex-col gap-1">
        <span className={`text-[11px] font-bold ${isMe ? 'text-emerald-100' : 'text-gray-700 dark:text-slate-300'}`}>
          🎤 Ovozli xabar
        </span>
        <div className="flex items-center gap-1">
          {[4, 12, 8, 16, 10, 14, 6, 12, 8].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}px` }}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : ''
              } ${isMe ? 'bg-white/80' : 'bg-emerald-600'}`}
            />
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

export default function ChatModal({
  isOpen,
  onClose,
  initialTargetUserId = null,
  initialProduct = null
}) {
  const { user, refreshCounts } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadChat = async (otherUserId) => {
    setLoading(true);
    try {
      const res = await api.getChatHistory(otherUserId);
      setActivePartner(res.other_user);
      setMessages(res.messages || []);
      refreshCounts();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Start voice recording (Feature 8)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        }
      });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Convert blob to base64 data url for easy transport
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          if (activePartner && base64Audio) {
            try {
              const res = await api.sendMessage({
                receiver_id: activePartner.id,
                product_id: currentProduct?.id || null,
                message: '🎤 Ovozli xabar',
                msg_type: 'voice',
                audio_url: base64Audio
              });
              setMessages(prev => [...prev, res.data]);
              loadConversations();
            } catch (err) {
              alert('Ovozli xabarni yuborishda xatolik yuz berdi');
            }
          }
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Mikrafon ruxsati berilmadi yoki mavjud emas');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadConversations();

    if (initialTargetUserId) {
      loadChat(initialTargetUserId);
      setCurrentProduct(initialProduct);
    } else {
      setActivePartner(null);
      setMessages([]);
    }

    const interval = setInterval(() => {
      if (activePartner) {
        api.getChatHistory(activePartner.id).then(res => {
          setMessages(res.messages || []);
        }).catch(() => {});
      } else {
        loadConversations();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, initialTargetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.sendMessage({
        receiver_id: activePartner.id,
        product_id: currentProduct?.id || null,
        message: text
      });

      setMessages(prev => [...prev, res.data]);
      loadConversations();
    } catch (err) {
      alert(err.message || 'Xabar yuborishda xatolik yuz berdi');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-3xl w-full max-w-4xl h-[85vh] max-h-[700px] overflow-hidden shadow-2xl flex flex-col relative border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            {activePartner && (
              <button
                onClick={() => setActivePartner(null)}
                className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg sm:hidden cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>Xabarlar va Suhbat</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Chat Room */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Conversations Sidebar */}
          <div className={`w-full sm:w-80 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-gray-50/50 dark:bg-slate-850/50 ${
            activePartner ? 'hidden sm:flex' : 'flex'
          }`}>
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Suhbatlar ({conversations.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Xabarlar yo'q. Biror e'londagi "Sotuvchiga xabar yozish" orqali suhbat boshlang!
                </div>
              ) : (
                conversations.map((conv) => {
                  const partner = conv.other_user;
                  const isSelected = activePartner?.id === partner?.id;

                  return (
                    <button
                      key={partner.id}
                      onClick={() => {
                        loadChat(partner.id);
                        setCurrentProduct(null);
                      }}
                      className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600' 
                          : 'hover:bg-gray-100/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={partner.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.username}`}
                        alt={partner.username}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {partner.username}
                          </span>
                          {conv.last_message && (
                            <span className="text-[10px] text-gray-400">
                              {formatTime(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {conv.last_message?.message || 'Suhbat...'}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Chat Area */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            !activePartner ? 'hidden sm:flex items-center justify-center' : 'flex'
          }`}>
            {!activePartner ? (
              <div className="text-center p-8 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-bold text-gray-600 dark:text-slate-300">Suhbatni tanlang</p>
                <p className="text-xs text-gray-400 mt-1">Chap tomondagi ro'yxatdan suhbatdoshni tanlang</p>
              </div>
            ) : (
              <>
                {/* Chat Partner Header */}
                <div className="p-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={activePartner.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${activePartner.username}`}
                      alt={activePartner.username}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{activePartner.username}</h4>
                      <p className="text-[10px] text-gray-400">{activePartner.phone || 'Online'}</p>
                    </div>
                  </div>

                  {currentProduct && (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 max-w-xs truncate">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="text-left truncate">
                        <p className="text-[11px] font-bold text-gray-800 dark:text-slate-200 truncate">{currentProduct.title}</p>
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {new Intl.NumberFormat('uz-UZ').format(currentProduct.price)} {currentProduct.currency}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60 dark:bg-slate-950/50">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-xs">
                      Suhbat boshlanmagan. Birinchi bo'lib xabar yozing!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {msg.product_title && (
                            <div className="mb-1 text-[10px] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 max-w-xs">
                              📦 <span className="font-semibold">{msg.product_title}</span> ({msg.product_price} {msg.product_currency})
                            </div>
                          )}

                          <div
                            className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200/80 dark:border-slate-700 rounded-bl-xs'
                            }`}
                          >
                            {msg.msg_type === 'voice' && msg.audio_url ? (
                              <VoicePlayer audioUrl={msg.audio_url} isMe={isMe} />
                            ) : (
                              <p className="whitespace-pre-line">{msg.message}</p>
                            )}

                            <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMe ? 'text-emerald-100' : 'text-gray-400'
                            }`}>
                              <span>{formatTime(msg.created_at)}</span>
                              {isMe && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar with Voice Message support */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        <span className="text-xs font-bold">
                          Ovoz yozilmoqda... 00:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelRecording}
                          title="Bekor qilish"
                          className="p-1 text-gray-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          title="Yuborish"
                          className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold"
                        >
                          Yuborish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabaringizni yozing..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-xs sm:text-sm text-gray-800 dark:text-slate-100 focus:outline-none"
                      />

                      {/* Microphone button for voice message (Feature 8) */}
                      <button
                        type="button"
                        onClick={startRecording}
                        title="Ovozli xabar yozish"
                        className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
