import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import Loader from './Loader';

export interface Track {
  name: string;
  url: string;
}

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  onDeleteTrack: (filename: string) => void;
  onRenameTrack: (oldFilename: string, newName: string) => void;
  isLoading?: boolean;
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBody = styled.div`
  background: ${theme.colors.background};
  border: 1px solid #333;
  border-radius: 8px;
  padding: ${theme.spacing.large};
  width: 90%;
  max-width: 420px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.medium};
  margin-top: ${theme.spacing.medium};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #444;
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px;
  line-height: 1;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const TrackList: React.FC<TrackListProps> = ({ tracks, currentTrack, onSelectTrack, onDeleteTrack, onRenameTrack, isLoading = false }) => {
  const [renaming, setRenaming] = React.useState<Track | null>(null);
  const [newName, setNewName] = React.useState('');
  const [deleting, setDeleting] = React.useState<Track | null>(null);

  const getDisplayName = (fullName: string) => fullName.split('-').slice(1).join('-').replace(/_/g, ' ').replace(/\.[^./]+$/, '');
  const openRename = (track: Track) => {
    setRenaming(track);
    setNewName(getDisplayName(track.name));
  };
  const closeRename = () => {
    setRenaming(null);
    setNewName('');
  };
  const confirmRename = () => {
    if (!renaming) return;
    const value = newName.trim();
    if (!value) return;
    onRenameTrack(renaming.name, value);
    closeRename();
  };
  const openDelete = (track: Track) => setDeleting(track);
  const closeDelete = () => setDeleting(null);
  const confirmDelete = () => {
    if (!deleting) return;
    onDeleteTrack(deleting.name);
    closeDelete();
  };
  if (isLoading) {
    return <Loader />;
  }

  if (tracks.length === 0) {
    return <p>No tracks found. Upload your first song!</p>;
  }

  return (
    <>
    <List>
      {tracks.map((track) => (
        <ListItem
          key={track.name}
          isActive={currentTrack?.name === track.name}
        >
          <TrackName onClick={() => onSelectTrack(track)}>{track.name.split('-').slice(1).join('-').replace(/_/g, ' ')}</TrackName>
          <IconButton
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              openRename(track);
            }}
          >
            ✏️
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем проигрывание при клике на удаление
              openDelete(track);
            }}
          >
            🗑️
          </IconButton>
        </ListItem>
      ))}
    </List>
    {renaming && (
      <ModalBackdrop onClick={closeRename}>
        <ModalBody onClick={(e) => e.stopPropagation()}>
          <h3>Rename track</h3>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRename();
              if (e.key === 'Escape') closeRename();
            }}
            placeholder="New name (without extension)"
          />
          <ModalActions>
            <IconButton onClick={closeRename}>Cancel</IconButton>
            <IconButton onClick={confirmRename}>Save</IconButton>
          </ModalActions>
        </ModalBody>
      </ModalBackdrop>
    )}
    {deleting && (
      <ModalBackdrop onClick={closeDelete}>
        <ModalBody onClick={(e) => e.stopPropagation()}>
          <h3>Delete track</h3>
          <p>Are you sure you want to delete {deleting.name.split('-').slice(1).join('-').replace(/_/g, ' ')}?</p>
          <ModalActions>
            <IconButton onClick={closeDelete}>Cancel</IconButton>
            <IconButton onClick={confirmDelete}>Delete</IconButton>
          </ModalActions>
        </ModalBody>
      </ModalBackdrop>
    )}
    </>
  );
};

export default TrackList;
