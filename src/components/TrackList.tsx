import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

export interface Track {
  name: string;
  url: string;
}

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  onDeleteTrack: (filename: string) => void;
}

const List = styled.ul`
  list-style: none;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px; /* space for scrollbar */

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.primary};
    border-radius: 20px;
    border: 3px solid ${theme.colors.surface};
  }
`;

const ListItem = styled.li<{ isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.medium};
  border-bottom: 1px solid #333;
  cursor: pointer;
  background-color: ${props => props.isActive ? theme.colors.primary + '33' : 'transparent'};

  &:hover {
    background-color: ${theme.colors.surface};
  }
`;

const TrackName = styled.span`
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 1rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px;
  line-height: 1;

  &:hover {
    color: ${theme.colors.error};
  }
`;

const TrackList: React.FC<TrackListProps> = ({ tracks, currentTrack, onSelectTrack, onDeleteTrack }) => {
  if (tracks.length === 0) {
    return <p>No tracks found. Upload your first song!</p>;
  }

  return (
    <List>
      {tracks.map((track) => (
        <ListItem
          key={track.name}
          isActive={currentTrack?.name === track.name}
        >
          <TrackName onClick={() => onSelectTrack(track)}>{track.name.split('-').slice(1).join('-').replace(/_/g, ' ')}</TrackName>
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем проигрывание при клике на удаление
              if (window.confirm(`Are you sure you want to delete ${track.name}?`)) {
                onDeleteTrack(track.name);
              }
            }}
          >
            🗑️
          </DeleteButton>
        </ListItem>
      ))}
    </List>
  );
};

export default TrackList;
