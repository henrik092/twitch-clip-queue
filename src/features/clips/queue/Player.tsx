import { Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { Clip } from '../clipQueueSlice';
import {
  autoplayTimeoutHandleChanged,
  selectAutoplayEnabled,
  selectAutoplayTimeoutHandle,
  selectCurrentClip,
  selectNextId,
} from '../clipQueueSlice';
import clipProvider from '../providers/providers';
import AutoplayOverlay from './AutoplayOverlay';
import VideoPlayer from './VideoPlayer';
interface PlayerProps {
  className?: string;
}

const getPlayerComponent = (
  currentClip: Clip | undefined,
  videoSrc: string | undefined,
  autoplayEnabled: boolean,
  nextClipId: string | undefined,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (!currentClip) return null;

  const KickClip = currentClip.Platform === 'Kick';

  if (autoplayEnabled && currentClip.id) {
    return (
      <VideoPlayer
        key={`${currentClip.id}-${videoSrc}`}
        src={videoSrc}
        onEnded={() => nextClipId && dispatch(autoplayTimeoutHandleChanged({ set: true }))}
      />
    );
  }

  if (KickClip) {
    return <VideoPlayer key={currentClip.id} src={currentClip.url} />;
  }

  const embedUrl = clipProvider.getEmbedUrl(currentClip.id);
  return (
    <iframe
      key={currentClip.id}
      src={embedUrl}
      title={currentClip.title}
      style={{ height: '100%', width: '100%' }}
      frameBorder="0"
      allow="autoplay"
      allowFullScreen
    />
  );
};

function Player({ className }: PlayerProps) {
  const dispatch = useAppDispatch();
  const currentClip = useAppSelector(selectCurrentClip);
  const nextClipId = useAppSelector(selectNextId);
  const autoplayEnabled = useAppSelector(selectAutoplayEnabled);
  const autoplayTimeoutHandle = useAppSelector(selectAutoplayTimeoutHandle);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentClip) return;

    const fetchVideoUrl = async () => {
      const url = await clipProvider.getAutoplayUrl(currentClip.id);
      setVideoSrc(url);
    };

    fetchVideoUrl();
  }, [currentClip]);

  const player = getPlayerComponent(currentClip, videoSrc, autoplayEnabled, nextClipId, dispatch);

  return (
    <Stack
      align="center"
      sx={{ background: 'black', height: '100%', aspectRatio: '16 / 9', position: 'relative' }}
      className={className}
    >
      {player}
      <AutoplayOverlay
        visible={!!autoplayTimeoutHandle}
        onCancel={() => dispatch(autoplayTimeoutHandleChanged({ set: false }))}
      />
    </Stack>
  );
}

export default Player;
