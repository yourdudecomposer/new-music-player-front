import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Track } from './TrackList';
import { theme } from '../styles/theme';

interface PlayerProps {
  track: Track | null;
  onNext: () => void;
  onPrev: () => void;
}

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #181818;
  padding: ${theme.spacing.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid #282828;
  z-index: 1000;
`;

const TrackInfo = styled.div`
  margin-bottom: 10px;
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.medium};
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.8em;
  cursor: pointer;
  line-height: 1;
  &:hover {
    color: ${theme.colors.primary};
  }
  &:disabled {
    color: #555;
    cursor: not-allowed;
  }
`;

const PlayPauseButton = styled(ControlButton)`
  font-size: 2.5em;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Time = styled.span`
  font-size: 0.8em;
  color: ${theme.colors.textSecondary};
  min-width: 40px;
  text-align: center;
`;

const ProgressInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  background: #444;
  border-radius: 5px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
  }
`;

const Player: React.FC<PlayerProps> = ({ track, onNext, onPrev }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.src = track.url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback failed", e));
    }
  }, [track]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleStop = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      <PlayerContainer>
        <TrackInfo>
          {track ? `Now Playing: ${track.name.split('-').slice(1).join('-').replace(/_/g, ' ')}` : 'No track selected'}
        </TrackInfo>
        <Controls>
          <ControlButton onClick={onPrev} disabled={!track}>⏮</ControlButton>
          <ControlButton onClick={handleStop} disabled={!track}>⏹</ControlButton>
          <PlayPauseButton onClick={togglePlayPause} disabled={!track}>
            {isPlaying ? '⏸' : '▶️'}
          </PlayPauseButton>
          <ControlButton onClick={onNext} disabled={!track}>⏭</ControlButton>
        </Controls>
        <ProgressBarContainer>
           <Time>{formatTime(currentTime)}</Time>
           <ProgressInput 
             type="range" 
             value={currentTime}
             max={duration || 0}
             onChange={handleProgressChange}
             disabled={!track}
           />
           <Time>{formatTime(duration)}</Time>
        </ProgressBarContainer>
      </PlayerContainer>
    </>
  );
};

export default Player;
