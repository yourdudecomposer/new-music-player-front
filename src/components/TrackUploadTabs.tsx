import React, { useState } from 'react';
import styled from 'styled-components';
import { uploadTrack, downloadFromYoutube } from '../api';
import { theme } from '../styles/theme';

const TabsContainer = styled.div`
  margin-bottom: ${theme.spacing.large};
  padding: ${theme.spacing.medium};
  background-color: ${theme.colors.surface};
  border-radius: 8px;
`;

const Title = styled.h3`
  margin-bottom: ${theme.spacing.medium};
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border-radius: 4px 4px 0 0;
  border: none;
  background-color: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${theme.colors.text};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const TabContent = styled.div`
  min-height: 100px;
`;

// Стили для файлового загрузчика
const UploadButton = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// Стили для YouTube загрузчика
const YoutubeInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 14px;
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: ${theme.colors.text};
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 5px;
  background-color: #444;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background-color: ${theme.colors.primary};
    transition: width 0.2s ease-in-out;
  }
`;

interface TrackUploadTabsProps {
  onUploadComplete: () => void;
}

const TrackUploadTabs: React.FC<TrackUploadTabsProps> = ({ onUploadComplete }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'youtube'>('file');
  
  // Состояния для файлового загрузчика
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Состояния для YouTube загрузчика
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('track', file);

    try {
      await uploadTrack(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      onUploadComplete();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Не удалось загрузить файл. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      alert('Введите ссылку на YouTube видео');
      return;
    }

    // Валидация URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      alert('Некорректная ссылка YouTube');
      return;
    }

    // Валидация названия трека
    if (!customTitle.trim()) {
      alert('Введите название трека');
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('Скачиваем и конвертируем видео...');

    try {
      await downloadFromYoutube(youtubeUrl, customTitle);
      setDownloadStatus('✅ Успешно загружено в плеер!');
      setYoutubeUrl(''); // Очищаем поле
      setCustomTitle(''); // Очищаем поле названия
      onUploadComplete();
      
      // Очищаем статус через 2 секунды
      setTimeout(() => {
        setDownloadStatus('');
      }, 2000);
    } catch (error: any) {
      console.error('Download failed:', error);
      setDownloadStatus('❌ Ошибка: ' + (error.response?.data?.error || 'Не удалось скачать видео'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <TabsContainer>
      <Title>Загрузить трек</Title>
      <TabsWrapper>
        <Tab active={activeTab === 'file'} onClick={() => setActiveTab('file')}>
          Загрузить файл
        </Tab>
        <Tab active={activeTab === 'youtube'} onClick={() => setActiveTab('youtube')}>
          Скачать с YouTube
        </Tab>
      </TabsWrapper>

      <TabContent>
        {activeTab === 'file' && (
          <>
            <HiddenInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp3"
              disabled={isUploading}
            />
            <UploadButton onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? `Загрузка... ${uploadProgress}%` : 'Выбрать MP3 файл'}
            </UploadButton>
            {isUploading && <ProgressBar progress={uploadProgress} />}
          </>
        )}

        {activeTab === 'youtube' && (
          <>
            <YoutubeInput
              type="text"
              placeholder="Вставьте ссылку на YouTube видео"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isDownloading}
            />
            <YoutubeInput
              type="text"
              placeholder="Введите название трека"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={isDownloading}
            />
            <DownloadButton onClick={handleYoutubeDownload} disabled={isDownloading}>
              {isDownloading ? 'Скачиваем...' : 'Скачать'}
            </DownloadButton>
            {downloadStatus && <StatusMessage>{downloadStatus}</StatusMessage>}
          </>
        )}
      </TabContent>
    </TabsContainer>
  );
};

export default TrackUploadTabs;

