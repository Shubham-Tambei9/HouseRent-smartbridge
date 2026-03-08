import { Alert } from 'react-bootstrap';

export default function AlertMessage({ variant, message, onClose }) {
  if (!message) return null;
  return (
    <div className="fade-in-up mb-4" style={{ animationDuration: '0.3s' }}>
      <Alert variant={variant || 'info'} dismissible onClose={onClose} className="m-0 border-0 shadow-sm" style={{
        borderRadius: '0.75rem',
        background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface)',
        color: variant === 'danger' ? '#fca5a5' : 'var(--text-main)',
        backdropFilter: 'blur(10px)'
      }}>
        {message}
      </Alert>
    </div>
  );
}
