import React, { useEffect, useRef } from 'react';
import { setVolume } from '../../settings/settingsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../app/store';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';
import 'videojs-youtube';

interface VideoPlayerProps {
  src: string | undefined;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const dispatch = useDispatch();
  const volume = useSelector((state: RootState) => state.settings.volume);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const YouTube = src.includes('youtube.com') || src.includes('youtu.be');

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      fluid: true,
      responsive: true,
      aspectRatio: '16:9',
      sources: YouTube
        ? [
            {
              src,
              type: 'video/youtube',
            },
          ]
        : [
            {
              src,
              type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
            },
          ],
      techOrder: YouTube ? ['youtube', 'html5'] : ['html5'],
    });
    
    //This Fixes The Black Bar Bug
    const resizePlayerOnSourceChange = () => {
      if (playerRef.current) {
        playerRef.current.fill(true);
      }
    };

    if (src) {
      resizePlayerOnSourceChange();
    }

    if (playerRef.current) {
      playerRef.current.volume(volume);
    }
    
    playerRef.current?.on('volumechange', () => {
      const currentVolume = playerRef.current.volume();
      dispatch(setVolume(currentVolume));
    });

    if (onEnded) {
      playerRef.current?.on('ended', onEnded);
    }
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  
  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};

export default VideoPlayer;
