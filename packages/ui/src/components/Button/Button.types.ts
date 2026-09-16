import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';
export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  status?: ButtonStatus;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}
