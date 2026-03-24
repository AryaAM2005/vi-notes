import { useState } from 'react'
import Editor from './components/Editor'
import Auth from './components/Auth'
import './App.css'

interface Note {
  id: string;
  title: string;
  content: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);

  const [notes, setNotes] = useState<Note[]>([{ id: '1', title: 'Untitled Note 1', content: '' }]);
  const [activeNoteId, setActiveNoteId] = useState<string>('1');

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleNoteChange = (content: string) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content } : n));
  };

  const handleAddNote = () => {
    const newId = Date.now().toString();
    const newNote = { id: newId, title: `Untitled Note ${notes.length + 1}`, content: '' };
    setNotes([...notes, newNote]);
    setActiveNoteId(newId);
  };

  const saveSession = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: `Session - ${new Date().toLocaleString()}`, notes })
      });
      if (response.ok) {
        alert('Session saved successfully!');
      } else {
        alert('Failed to save session');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving session');
    }
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-dot"></div>
          <h1>Vi-Notes</h1>
        </div>
        <div className="header-status">
          {user && <span className="user-greeting">Hi, {user.username}</span>}
          <button className="save-session-btn" onClick={saveSession}>Save Session</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <span className="pulse-indicator"></span>
          Authenticity Monitor Active
        </div>
      </header>
      <div className="main-layout">
        <aside className="sidebar">
          <button className="add-note-btn" onClick={handleAddNote}>+ New Note</button>
          <ul className="note-list">
            {notes.map(note => (
              <li 
                key={note.id} 
                className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="note-title">{note.title}</div>
                <div className="note-preview">{note.content.substring(0, 30) || 'Empty note...'}</div>
              </li>
            ))}
          </ul>
        </aside>
        <main className="main-content">
          <Editor key={activeNote.id} initialText={activeNote.content} onChange={handleNoteChange} />
        </main>
      </div>
    </div>
  )
}

export default App
