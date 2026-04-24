/**
 * Language Selector Component
 * Dropdown to switch between languages
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { LANGUAGES } from '../i18n';

interface LanguageSelectorProps {
  variant?: 'button' | 'icon';
  showLabel?: boolean;
}

/**
 * Language selector with dropdown menu
 * Persists selection in localStorage
 */
export const LanguageSelector = ({ 
  variant = 'button',
  showLabel = true,
}: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          onClick={handleClick}
          startIcon={<LanguageIcon />}
          endIcon={<ArrowDownIcon />}
          sx={{
            color: 'inherit',
            textTransform: 'none',
            minWidth: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
            {currentLanguage.flag}
          </Typography>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {LANGUAGES.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === i18n.language}
            >
              <ListItemIcon>
                <Typography sx={{ fontSize: '1.5rem' }}>{language.flag}</Typography>
              </ListItemIcon>
              <ListItemText>{language.name}</ListItemText>
              {language.code === i18n.language && (
                <CheckIcon fontSize="small" sx={{ ml: 2, color: 'primary.main' }} />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        startIcon={<LanguageIcon />}
        endIcon={<ArrowDownIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
        }}
      >
        {showLabel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
              {currentLanguage.flag}
            </Typography>
            <Typography variant="body2">{currentLanguage.name}</Typography>
          </Box>
        )}
        {!showLabel && (
          <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
            {currentLanguage.flag}
          </Typography>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary">
            {t('settings.selectLanguage')}
          </Typography>
        </Box>
        {LANGUAGES.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === i18n.language}
            sx={{
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <Typography sx={{ fontSize: '1.5rem' }}>{language.flag}</Typography>
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body1">{language.name}</Typography>
            </ListItemText>
            {language.code === i18n.language && (
              <CheckIcon fontSize="small" sx={{ ml: 2, color: 'primary.main' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
