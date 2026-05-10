import { X, Play, Plus, ThumbsUp, Check, PlayCircle, Download, Share2, Volume2, VolumeX, Maximize, Gamepad2, Edit, Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import { TRENDING_NOW, FOR_YOU, NEW_RELEASES } from '../data';

export function ContentModal() {
  const { activeModalContent, setActiveModalContent, watchlist, toggleWatchlist, ratings, rateContent, progress, updateProgress, lastSeriesEpisode, setLastSeriesEpisode, shouldAutoPlay, customContent, setEditingContent, setIsAddModalOpen, deleteCustomContent, addNotification, isMuted, setIsMuted } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRootRef = useRef<HTMLDivElement>(null);
  
  const isCustom = customContent.some(item => item.id === activeModalContent?.id);
  const isGame = activeModalContent?.genres?.includes('Game');

  const allPossibleContent = useMemo(() => {
    const combined = [...customContent, ...TRENDING_NOW, ...FOR_YOU, ...NEW_RELEASES];
    const unique = new Map();
    combined.forEach(item => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });
    return Array.from(unique.values());
  }, [customContent]);

  const normalizedTitle = useMemo(() => {
    if (!activeModalContent) return '';
    const normalize = (t: string) => t.toLowerCase().replace(/\s*(?:season|s|episode|ep|e)\.?\s*\d+/gi, '').trim();
    return normalize(activeModalContent.title);
  }, [activeModalContent]);

  const allEpisodesWithSameTitle = useMemo(() => {
    if (!activeModalContent) return [];
    
    return allPossibleContent.filter(item => {
      const normalize = (t: string) => t.toLowerCase().replace(/\s*(?:season|s|episode|ep|e)\.?\s*\d+/gi, '').trim();
      return normalize(item.title) === normalizedTitle;
    }).sort((a, b) => {
      const sA = a.season !== undefined ? a.season : 1;
      const sB = b.season !== undefined ? b.season : 1;
      if (sA !== sB) return sA - sB;
      return (a.episode || 0) - (b.episode || 0);
    });
  }, [activeModalContent, allPossibleContent]);
  
  const isSeries = allEpisodesWithSameTitle.length > 1;
  const isCustomShow = !isGame; 

  const episodes = useMemo(() => {
    return allEpisodesWithSameTitle.filter(item => item.id !== activeModalContent?.id);
  }, [allEpisodesWithSameTitle, activeModalContent?.id]);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Streamable
    const streamableMatch = url.match(/streamable\.com\/([a-z0-9]+)/i);
    if (streamableMatch) {
      return `https://streamable.com/e/${streamableMatch[1]}?autoplay=1`;
    }
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&controls=1`;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(activeModalContent?.videoUrl);
  const useIframe = isGame || !!embedUrl;
  const finalVideoUrl = embedUrl || activeModalContent?.videoUrl;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (activeModalContent && isSeries) {
      setLastSeriesEpisode(normalizedTitle, activeModalContent.id);
    }
  }, [activeModalContent?.id, normalizedTitle, isSeries, setLastSeriesEpisode]);

  useEffect(() => {
    let isMounted = true;
    
    // Auto-scroll to episodes if it's a series and we're not playing
    if (activeModalContent && !shouldAutoPlay && isSeries) {
      // Small delay to let modal animate in
      setTimeout(() => {
        const epSection = document.getElementById('episodes-section');
        if (epSection) epSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }

    if (activeModalContent && shouldAutoPlay) {
      setIsPlaying(true);
      if (!useIframe) {
        setIsLoading(true);
        // Small delay to ensure ref is attached and ready
        const playWithTimeout = setTimeout(async () => {
          if (videoRef.current && isMounted) {
            // Attempt landscape/fullscreen as part of autoplay if possible
            try {
              const videoElement = videoRef.current;
              const container = videoElement.parentElement;
              if (container && container.requestFullscreen) {
                await container.requestFullscreen().catch(() => {});
              }
              if (screen.orientation && (screen.orientation as any).lock) {
                await (screen.orientation as any).lock('landscape').catch(() => {});
              }
            } catch (e) {
              console.log("Autoplay orientation/fs failed:", e);
            }

            // Attempt 1: Try playing (respecting global mute state)
             videoRef.current.muted = isMuted;

             videoRef.current.play()
               .then(() => {
                 if (isMounted) setIsLoading(false);
               })
               .catch(err => {
                 if (err.name !== 'AbortError') {
                   console.log("Autoplay blocked, trying muted fallback:", err);
                   if (videoRef.current) {
                     videoRef.current.muted = true;
                     videoRef.current.play()
                       .then(() => {
                         if (isMounted) setIsLoading(false);
                       })
                       .catch(e => {
                         console.log("Muted autoplay also failed:", e);
                         if (isMounted) {
                           setIsLoading(false);
                           setIsPlaying(false); // Fallback to manual play button
                         }
                       });
                   }
                 } else {
                    if (isMounted) setIsLoading(false);
                 }
               });
          }
        }, 100);
        return () => clearTimeout(playWithTimeout);
      }
    } else {
      setIsLoading(false);
      setHasError(false);
    }
    return () => {
      isMounted = false;
    };
  }, [activeModalContent, shouldAutoPlay, useIframe]);

  if (!activeModalContent) return null;

  const inWatchlist = watchlist.includes(activeModalContent.id);
  const userRating = ratings[activeModalContent.id];

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    // Release orientation lock and exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (screen.orientation && (screen.orientation as any).unlock) {
      (screen.orientation as any).unlock();
    }
    setActiveModalContent(null);
    setIsPlaying(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      // On some mobile devices, unmuting requires a direct interaction with the video state
      if (!newMuted) {
        // Ensure playback continues unmuted by forcing a re-play attempt if needed
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Unmute play attempt failed", e));
        }
      }
    }
  };

  const toggleFullsreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRootRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (playerRootRef.current.requestFullscreen) {
          await playerRootRef.current.requestFullscreen();
        } else if ((playerRootRef.current as any).webkitRequestFullscreen) {
          await (playerRootRef.current as any).webkitRequestFullscreen();
        }
        
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle failed", err);
    }
  };

  const handlePlay = async () => {
    if (useIframe) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Automatic Landscape and Fullscreen attempt
      try {
        const videoElement = videoRef.current;
        const container = videoElement.parentElement;
        
        if (container && container.requestFullscreen) {
          await container.requestFullscreen().catch(e => console.log("Fullscreen failed", e));
        }
        
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch((e: any) => console.log("Orientation lock failed", e));
        }

        // Force volume sync when play is explicitly clicked (use stored preference)
        videoElement.muted = isMuted;

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(err => {
              if (err.name !== 'AbortError') {
                console.error("Playback failed, trying muted fallback:", err);
                // Fallback to muted if strictly required by browser
                videoElement.muted = true;
                videoElement.play().catch(e => console.log("Complete playback failure", e));
              }
            });
        }
      } catch (err) {
        console.error("Play interaction error:", err);
      }
    }
  };

  const currentProgress = progress[activeModalContent.id]?.percentage || 0;

  const handleVideoEnd = () => {
    if (episodes.length > 0) {
      // episodes is already sorted by season/episode
      // We want the next one after the current one
      const nextEpisode = episodes[0]; // Since 'episodes' excludes the current one and is sorted, 
      // but wait, 'episodes' is just all other episodes.
      // We need to find the specific next one.
      
      const currentIndex = allEpisodesWithSameTitle.findIndex(e => e.id === activeModalContent.id);
      if (currentIndex !== -1 && currentIndex < allEpisodesWithSameTitle.length - 1) {
        const next = allEpisodesWithSameTitle[currentIndex + 1];
        setActiveModalContent(next, true);
        addNotification(`Autoplaying: Episode ${next.episode || '?'}`, 'info');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start pt-10 px-4 overflow-y-auto w-full bg-black/70 backdrop-blur-sm transition-opacity">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleClose} 
      />
      <div className="relative bg-zinc-950 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden mb-10 z-10 animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-[110] bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full p-2 transition-colors border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Player / Hero Section */}
        <div 
          ref={playerRootRef}
          className={`relative ${useIframe && isPlaying ? 'h-[600px]' : 'aspect-video'} w-full bg-black group/player z-0`}
          onClick={() => {
            if (isPlaying) setShowControls(!showControls);
          }}
        >
          {activeModalContent.videoUrl ? (
            <>
              {useIframe && isPlaying ? (
                <iframe 
                  src={finalVideoUrl} 
                  className="w-full h-full border-none"
                  allow="gamepad; autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="relative w-full h-full">
                  {!useIframe || !isPlaying ? (
                    <>
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        poster={activeModalContent.thumbnail}
                        muted={isMuted}
                        playsInline
                        controls
                        autoPlay={shouldAutoPlay}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadedMetadata={() => {
                          if (videoRef.current) {
                            const saved = progress[activeModalContent.id];
                            if (saved && saved.time > 0) {
                              videoRef.current.currentTime = saved.time;
                            }
                          }
                        }}
                        onCanPlay={() => {
                          setIsLoading(false);
                          if (shouldAutoPlay && videoRef.current && isPlaying) {
                            videoRef.current.play().catch(err => {
                              console.log("onCanPlay auto-play failed:", err);
                            });
                          }
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={() => {
                          if (!useIframe) {
                            setHasError(true);
                            setIsLoading(false);
                          }
                        }}
                        onTimeUpdate={(e) => {
                          if (useIframe) return;
                          const el = e.currentTarget;
                          if (el.duration > 0) {
                            const pct = (el.currentTime / el.duration) * 100;
                            // Only update store if it's been at least 2 second or reached a new integer percentage
                            const current = progress[activeModalContent.id];
                            if (!current || Math.abs(el.currentTime - current.time) > 2) {
                               updateProgress(activeModalContent.id, el.currentTime, pct);
                            }
                          }
                        }}
                        onEnded={handleVideoEnd}
                      >
                        <source src={activeModalContent.videoUrl} />
                      </video>
                      
                      {/* Show play button overlay if it's an embed but not playing yet */}
                      {useIframe && !isPlaying && (
                         <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                          onClick={() => setIsPlaying(true)}
                         >
                            <PlayCircle className="w-20 h-20 text-white/80" />
                         </div>
                      )}
                    </>
                  ) : null}

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-[#E50914] rounded-full animate-spin"></div>
                    </div>
                  )}

                  {hasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 px-10 text-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <PlayCircle className="w-8 h-8 text-white/50" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
                      <p className="text-gray-400 text-sm">This video content couldn't be loaded. It might be too large for the app's current storage limit or the format is unsupported.</p>
                    </div>
                  )}
                </div>
              )}
              
              {!isGame && !useIframe && (
                <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                  {/* Title and matched details are moved to the details section below, so we can keep the overlay minimal or remove it */}
                </div>
              )}
            </>
          ) : (
             <img 
              src={activeModalContent.thumbnail} 
              alt={activeModalContent.title}
              className="w-full h-full object-cover"
             />
          )}

          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40">
              <button 
                className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/40 border-2 border-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                onClick={handlePlay}
              >
                <Play className="w-10 h-10 text-white fill-white" />
              </button>
              <h2 className="text-2xl font-black text-white drop-shadow-md mt-6 px-4 text-center">{activeModalContent.title}</h2>
            </div>
          )}

          {!isPlaying && (
            <div className="absolute inset-x-8 bottom-8 z-10 hidden lg:block">
              <div className="flex items-center gap-4">
                <button 
                  className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-gray-200 text-black rounded font-bold transition-colors"
                  onClick={() => {
                    setIsPlaying(true);
                    if (!useIframe && videoRef.current) {
                      const playPromise = videoRef.current.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(err => {
                          if (err.name !== 'AbortError') {
                            console.error("Playback failed:", err);
                          }
                        });
                      }
                    }
                  }}
                >
                  {isGame ? <Gamepad2 className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
                  {isGame ? 'Play Game' : (activeModalContent.videoUrl ? 'Resume' : 'Play')}
                </button>
                <button 
                  className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-colors ${inWatchlist ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'}`}
                  onClick={() => toggleWatchlist(activeModalContent.id)}
                >
                  {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {inWatchlist ? 'In My List' : 'Add to My List'}
                </button>
                <button 
                  className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/40 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-colors group relative md:hidden"
                  onClick={() => toggleWatchlist(activeModalContent.id)}
                >
                  {inWatchlist ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap hidden md:block">
                    {inWatchlist ? 'Remove from My List' : 'Add to My List'}
                  </span>
                </button>
                <button 
                  className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/40 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-colors"
                  onClick={() => rateContent(activeModalContent.id, userRating === 1 ? 0 : 1)}
                >
                  <ThumbsUp className={`w-5 h-5 ${userRating === 1 ? 'fill-white text-white' : 'text-white'}`} />
                </button>
                {isCustom && (
                  <>
                    <button 
                      className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/40 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-colors"
                      onClick={() => {
                        setEditingContent(activeModalContent);
                        setIsAddModalOpen(true);
                        handleClose();
                      }}
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      className="w-10 h-10 rounded-full bg-zinc-800/80 border border-red-500/40 flex items-center justify-center hover:border-red-500 hover:bg-red-900 transition-colors"
                      onClick={() => {
                        deleteCustomContent(activeModalContent.id);
                        handleClose();
                        addNotification("Content deleted", "success");
                      }}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </>
                )}
                <button className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/40 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-colors group relative hidden sm:flex">
                  <Download className="w-5 h-5 text-white" />
                  <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    Download
                  </span>
                </button>
                <button className="w-10 h-10 rounded-full bg-zinc-800/80 border border-white/40 flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-colors group relative hidden sm:flex">
                  <Share2 className="w-5 h-5 text-white" />
                   <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    Share
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
              <span className="text-[#E50914] font-bold text-base bg-[#E50914]/10 border border-[#E50914]/20 px-2 py-0.5 rounded-full uppercase tracking-widest text-[10px]">{activeModalContent.match}% Match</span>
              <span className="text-gray-300">{activeModalContent.year}</span>
              <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-gray-300">{activeModalContent.maturity}</span>
              {(activeModalContent.season !== undefined || activeModalContent.episode !== undefined || activeModalContent.releaseDate) && (
                <span className="text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded flex items-center gap-2 font-medium">
                  {activeModalContent.season !== undefined && <span>S{activeModalContent.season}</span>}
                  {activeModalContent.episode !== undefined && <span>E{activeModalContent.episode}</span>}
                  {activeModalContent.releaseDate && (
                    <span className="text-zinc-400 italic text-[12px]">{new Date(activeModalContent.releaseDate).toLocaleDateString()}</span>
                  )}
                </span>
              )}
              <span className="text-gray-300">{activeModalContent.duration}</span>
              <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-gray-300 text-xs">HD</span>
              
              {isCustom && (
                <div className="flex gap-2 ml-auto">
                  <button 
                    className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-gray-200 text-black rounded text-xs font-bold transition-colors"
                    onClick={() => {
                      setEditingContent(activeModalContent);
                      setIsAddModalOpen(true);
                      handleClose();
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    EDIT CONTENT
                  </button>
                  <button 
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors"
                    onClick={() => {
                      deleteCustomContent(activeModalContent.id);
                      handleClose();
                      addNotification("Content deleted successfully", "success");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    DELETE
                  </button>
                </div>
              )}
            </div>
            {currentProgress > 0 && !isPlaying && (
              <div className="mb-6 bg-zinc-900 border border-white/10 p-4 rounded-md">
                <p className="text-sm text-gray-300 mb-2 font-medium">Continue Watching</p>
                <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E50914]" style={{width: `${currentProgress}%`}}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">{Math.round(currentProgress)}% Completed</p>
              </div>
            )}
            <p className="text-gray-100 text-lg leading-relaxed">
              {isSeries && !isPlaying && activeModalContent.seriesDescription 
                ? activeModalContent.seriesDescription 
                : activeModalContent.description}
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <span className="text-zinc-500">Cast: </span>
              <span className="text-gray-300">Actor One, Actor Two, Actor Three</span>
            </div>
            <div>
              <span className="text-zinc-500">Genres: </span>
              <span className="text-gray-300 hover:underline cursor-pointer">{activeModalContent.genres.join(', ')}</span>
            </div>
            <div>
              <span className="text-zinc-500">This show is: </span>
              <span className="text-gray-300 hover:underline cursor-pointer">Exciting, Action-Packed, Sci-Fi</span>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        {isCustomShow && (
          <div id="episodes-section" className="px-8 pb-12 scroll-mt-20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-white">
                  {episodes.length > 0 || isCustom ? 'Episodes' : 'Series Details'}
                </h3>
                <button 
                  className="flex items-center gap-1 px-2 py-1 bg-[#E50914] hover:bg-[#b00710] text-white rounded text-[10px] font-bold transition-colors shadow-lg"
                  onClick={() => {
                    const maxEp = Math.max(activeModalContent.episode || 0, ...allEpisodesWithSameTitle.map(e => e.episode || 0));
                    setEditingContent({
                      ...activeModalContent,
                      id: undefined as any,
                      episode: maxEp + 1,
                      videoUrl: '',
                    });
                    setIsAddModalOpen(true);
                    handleClose();
                  }}
                >
                  <Plus className="w-3 h-3" />
                  ADD {allEpisodesWithSameTitle.length > 0 ? 'ANOTHER' : 'NEW'} EPISODE
                </button>
              </div>
              {(activeModalContent.season !== undefined || activeModalContent.episode !== undefined) && (
                <div className="text-zinc-400 font-medium">
                  Season {activeModalContent.season || 1}
                </div>
              )}
            </div>
            
            {allEpisodesWithSameTitle.length > 0 ? (
              <div className="flex flex-col gap-1 ring-1 ring-white/10 rounded-lg overflow-hidden">
                {/* Now Playing / Highlighted Episode (only if it's one of the custom ones or we're on it) */}
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 border-b border-white/5 group/ep-current">
                  <span className="text-xl font-bold text-[#E50914] w-6 text-center">{activeModalContent.episode || 1}</span>
                  <div className="relative aspect-video w-32 sm:w-40 rounded overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setIsPlaying(true)}>
                    <img src={activeModalContent.thumbnail} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white truncate">
                        {isPlaying ? 'Now Playing:' : 'Current Selection:'} Episode {activeModalContent.episode || 1}
                      </h4>
                      <span className="text-sm text-zinc-400">{activeModalContent.duration}</span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{activeModalContent.description}</p>
                  </div>
                </div>

                {/* Other Episodes */}
                {episodes.map((episode) => (
                  <div 
                    key={episode.id}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-800/80 transition-colors cursor-pointer group/ep"
                    onClick={() => {
                      setActiveModalContent(episode, true);
                    }}
                  >
                    <span className="text-xl font-bold text-zinc-500 w-6 text-center">{episode.episode || '?'}</span>
                    <div className="relative aspect-video w-32 sm:w-40 rounded overflow-hidden flex-shrink-0">
                      <img src={episode.thumbnail} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover/ep:bg-black/40 flex items-center justify-center transition-opacity">
                        <Play className="w-6 h-6 text-white fill-white opacity-0 group-hover/ep:opacity-100" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white truncate">Episode {episode.episode || '?'}</h4>
                        <span className="text-sm text-zinc-400">{episode.duration}</span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{episode.description}</p>
                  </div>
                </div>
              ))}
            </div>
            ) : (
                <div className="p-8 border border-white/10 rounded bg-zinc-900/30 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-500 text-sm mb-4">No episodes added for this series yet.</p>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
