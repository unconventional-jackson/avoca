import './Modal.css';

import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PropsWithChildren } from 'react';
import ReactModal from 'react-modal';

export interface ModalProps {
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  primaryText?: string;
  primaryDisabled?: boolean;
  onPrimaryClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  secondaryText?: string;
  secondaryDisabled?: boolean;
  onSecondaryClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function Modal({
  onClose,
  isOpen,
  title,
  primaryText,
  onPrimaryClick,
  primaryDisabled = false,
  secondaryText,
  onSecondaryClick,
  secondaryDisabled = false,
  children,
}: PropsWithChildren<ModalProps>) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 8,
          minWidth: '40vw',
          position: undefined,
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <div className="Modal-header-container">
        <h2 className="Modal-header">{title}</h2>
        <button className="Modal-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faClose} />
        </button>
      </div>
      <div className="Modal-content">
        {children}
        <div className="Modal-action-container">
          <button
            className="Modal-action-secondary"
            onClick={onSecondaryClick ?? onClose}
            disabled={secondaryDisabled}
          >
            {secondaryText ?? 'Cancel'}
          </button>
          {onPrimaryClick && (
            <button
              className="Modal-action-primary"
              onClick={onPrimaryClick}
              disabled={primaryDisabled}
            >
              {primaryText ?? 'Submit'}
            </button>
          )}
        </div>
      </div>
    </ReactModal>
  );
}
