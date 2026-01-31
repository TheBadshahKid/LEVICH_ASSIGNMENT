import { useState } from 'react';
import { User } from '../types';

interface UserProfileProps {
    user: User;
    onUpdateName: (newName: string) => void;
}

export function UserProfile({ user, onUpdateName }: UserProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = newName.trim();

        if (trimmed.length < 3) {
            setError('Name must be at least 3 characters');
            return;
        }

        if (trimmed.length > 20) {
            setError('Name must be less than 20 characters');
            return;
        }

        // Only alphanumeric and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            setError('Only letters, numbers, and underscores allowed');
            return;
        }

        onUpdateName(trimmed);
        setIsEditing(false);
        setError('');
    };

    const handleClose = () => {
        setIsEditing(false);
        setNewName(user.name);
        setError('');
    };

    if (!isEditing) {
        return (
            <div className="user-profile" onClick={() => setIsEditing(true)}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="user-icon">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="user-name">{user.name}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="edit-icon">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </div>
        );
    }

    return (
        <>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="username-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Change Username</h3>
                        <button className="modal-close" onClick={handleClose}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="username-form">
                        <div className="form-group">
                            <label htmlFor="username">Your Display Name</label>
                            <input
                                id="username"
                                type="text"
                                value={newName}
                                onChange={(e) => {
                                    setNewName(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your name"
                                autoFocus
                                maxLength={20}
                            />
                            {error && <span className="form-error">{error}</span>}
                            <span className="form-hint">3-20 characters, letters, numbers, underscores only</span>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save">
                                Save Name
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
