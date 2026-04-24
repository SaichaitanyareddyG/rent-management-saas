/**
 * Currency Input Field with Indian Formatting
 * Fixes the "0" input issue and formats amounts as 2,00,000
 */

import { TextField, InputAdornment } from '@mui/material';
import { CurrencyRupee as CurrencyRupeeIcon } from '@mui/icons-material';
import { useState, useEffect, ComponentProps } from 'react';
import { formatIndianNumber, parseFormattedNumber } from '../utils/formatters';

interface CurrencyFieldProps extends Omit<ComponentProps<typeof TextField>, 'onChange' | 'value' | 'type'> {
  value: number | string;
  onChange: (value: number) => void;
  showIcon?: boolean;
}

/**
 * Currency field that:
 * - Displays formatted value (2,00,000)
 * - Allows easy editing
 * - Fixes "0" clearing issue
 * - Prevents "02" type entries
 */
export const CurrencyField = ({
  value,
  onChange,
  showIcon = true,
  slotProps,
  ...props
}: CurrencyFieldProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop value changes (only when not focused)
  useEffect(() => {
    if (!isFocused) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (numValue === 0 || isNaN(numValue)) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatIndianNumber(numValue));
      }
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue > 0) {
      setDisplayValue(numValue.toString());
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format when blur
    const parsed = parseFormattedNumber(displayValue);
    onChange(parsed);
    if (parsed > 0) {
      setDisplayValue(formatIndianNumber(parsed));
    } else {
      setDisplayValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string
    if (inputValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Prevent leading zeros (except for "0" itself)
    if (digitsOnly.length > 1 && digitsOnly[0] === '0') {
      const withoutLeadingZero = digitsOnly.replace(/^0+/, '');
      setDisplayValue(withoutLeadingZero);
      onChange(parseInt(withoutLeadingZero) || 0);
    } else {
      setDisplayValue(digitsOnly);
      onChange(parseInt(digitsOnly) || 0);
    }
  };

  return (
    <TextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          startAdornment: showIcon ? (
            <InputAdornment position="start">
              <CurrencyRupeeIcon color="primary" />
            </InputAdornment>
          ) : slotProps?.input?.startAdornment,
        },
        htmlInput: {
          inputMode: 'numeric',
          pattern: '[0-9]*',
        },
      }}
      placeholder="0"
    />
  );
};
