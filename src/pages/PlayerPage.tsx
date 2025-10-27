import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getTracks, deleteTrack } from '../api';
import Player from '../components/Player';
import TrackList, { Track } from '../components/TrackList';
import TrackUploadTabs from '../components/TrackUploadTabs';
import { theme } from '../styles/theme';

const PlayerPageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.large};
  padding-bottom: 200px; // Оставляем место для плеера
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.large};
`;

const LogoutButton = styled.button`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${theme.colors.primary};
  background-color: transparent;
  color: ${theme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text};
  }
`;

const PlayerPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(() => {
      localStorage.removeItem('token');
      window.location.href = '/login';
  }, []);

  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTracks();
      setTracks(response.data.filter((el: Track) => el.name));
    } catch (error: any) {
      console.error('Failed to fetch tracks:', error);
      if (error.response?.status === 401 || error.response?.status === 400) {
          handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleDeleteTrack = async (filename: string) => {
    setIsLoading(true);
    try {
      await deleteTrack(filename);
      if (currentTrack?.name === filename) {
        setCurrentTrack(null);
      }
      await fetchTracks();
    } catch (error) {
      console.error('Failed to delete track:', error);
      setIsLoading(false);
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.name === currentTrack.name);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.name === currentTrack.name);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
  };

  return (
    <PlayerPageContainer>
      <Header>
        <h1>My Music</h1>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Header>
      <TrackUploadTabs onUploadComplete={fetchTracks} />
      <TrackList
        tracks={tracks}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
        onDeleteTrack={handleDeleteTrack}
        isLoading={isLoading}
      />
      <Player track={currentTrack} onNext={handleNextTrack} onPrev={handlePrevTrack} />
    </PlayerPageContainer>
  );
};

export default PlayerPage;
