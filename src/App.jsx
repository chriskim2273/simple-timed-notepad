import React, { useState, useEffect, useRef } from 'react';

const TimedNotepad = () => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const textareaRefs = useRef([]);
  const clickTimeoutRefs = useRef({});

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('timedNotepadNotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setActiveNoteId(parsedNotes[0].id);
        }
      } catch (e) {
        console.error('Failed to parse saved notes', e);
        initializeDefaultNote();
      }
    } else {
      initializeDefaultNote();
    }
  }, []);

  const initializeDefaultNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Note 1',
      lines: [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        content: ''
      }]
    };
    setNotes([newNote]);
    setActiveNoteId(newNote.id);
  };

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('timedNotepadNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const activeNote = notes.find(note => note.id === activeNoteId) || notes[0] || null;
  const lines = activeNote ? activeNote.lines : [];

  const handleNoteClick = (noteId) => {
    // Clear any existing timeout
    if (clickTimeoutRefs.current[noteId]) {
      clearTimeout(clickTimeoutRefs.current[noteId]);
      clickTimeoutRefs.current[noteId] = null;
    }
    
    // Set a timeout to select the note
    clickTimeoutRefs.current[noteId] = setTimeout(() => {
      setActiveNoteId(noteId);
      clickTimeoutRefs.current[noteId] = null;
    }, 300); // 300ms delay to detect double click
  };

  const handleNoteDoubleClick = (noteId) => {
    // Clear the single click timeout
    if (clickTimeoutRefs.current[noteId]) {
      clearTimeout(clickTimeoutRefs.current[noteId]);
      clickTimeoutRefs.current[noteId] = null;
    }
    
    // Set the note in edit mode
    setEditingNoteId(noteId);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Create a new line with timestamp
      const now = new Date();
      const newLine = {
        id: Date.now(),
        timestamp: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        content: ''
      };
      
      // Insert the new line after the current line
      const updatedNotes = notes.map(note => {
        if (note.id === activeNoteId) {
          const newLines = [...note.lines];
          newLines.splice(index + 1, 0, newLine);
          return { ...note, lines: newLines };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      
      // Focus the new line after a short delay
      setTimeout(() => {
        if (textareaRefs.current[index + 1]) {
          textareaRefs.current[index + 1].focus();
        }
      }, 10);
    }
    
    // Handle backspace on empty line
    if (e.key === 'Backspace' && lines[index].content === '' && lines.length > 1) {
      e.preventDefault();
      
      const updatedNotes = notes.map(note => {
        if (note.id === activeNoteId) {
          const newLines = note.lines.filter((_, i) => i !== index);
          return { ...note, lines: newLines };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      
      // Focus the previous line
      setTimeout(() => {
        if (textareaRefs.current[index - 1]) {
          textareaRefs.current[index - 1].focus();
        }
      }, 10);
    }
  };

  const updateLineContent = (index, content) => {
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) {
        const newLines = [...note.lines];
        newLines[index].content = content;
        return { ...note, lines: newLines };
      }
      return note;
    });
    
    setNotes(updatedNotes);
  };

  const clearAllLines = () => {
    if (window.confirm('Are you sure you want to clear all lines in this note?')) {
      const updatedNotes = notes.map(note => {
        if (note.id === activeNoteId) {
          const now = new Date();
          return {
            ...note,
            lines: [{
              id: Date.now(),
              timestamp: now.toLocaleTimeString(),
              date: now.toLocaleDateString(),
              content: ''
            }]
          };
        }
        return note;
      });
      
      setNotes(updatedNotes);
    }
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      lines: [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        content: ''
      }]
    };
    
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (noteId) => {
    if (notes.length <= 1) {
      alert('You must have at least one note!');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      if (activeNoteId === noteId) {
        setActiveNoteId(updatedNotes[0].id);
      }
      
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
      }
    }
  };

  const updateNoteTitle = (noteId, newTitle) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, title: newTitle };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    setEditingNoteId(null);
  };

  const handleTitleKeyDown = (e, noteId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateNoteTitle(noteId, e.target.value);
    } else if (e.key === 'Escape') {
      setEditingNoteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Timed notepad for pookie ❤️</h1>
            <button 
              onClick={clearAllLines}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Current Note
            </button>
          </div>
          
          {/* Notes Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                onDoubleClick={() => handleNoteDoubleClick(note.id)}
                className={`flex items-center rounded-md px-3 py-2 text-sm ${
                  activeNoteId === note.id 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {editingNoteId === note.id ? (
                  <input
                    type="text"
                    defaultValue={note.title}
                    onBlur={(e) => updateNoteTitle(note.id, e.target.value)}
                    onKeyDown={(e) => handleTitleKeyDown(e, note.id)}
                    autoFocus
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-white w-full"
                  />
                ) : (
                  <>
                    <span>{note.title}</span>
                    {notes.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="ml-2 text-xs hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </>
                )}
              </button>
            ))}
            <button 
              onClick={createNewNote}
              className="flex items-center rounded-md px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
            >
              + New Note
            </button>
          </div>
          
          {/* Lines */}
          {activeNote && (
            <div className="font-mono text-sm bg-gray-50 rounded-lg border border-gray-200 p-2">
              {lines.map((line, index) => (
                <div key={line.id} className="flex items-start py-1 hover:bg-gray-100">
                  <div className="w-32 pr-4 text-right text-gray-500 flex-shrink-0">
                    <div className="font-medium">{line.timestamp}</div>
                    <div className="text-xs">{line.date}</div>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      ref={el => textareaRefs.current[index] = el}
                      value={line.content}
                      onChange={(e) => updateLineContent(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-full p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none min-h-[24px] bg-white"
                      rows="1"
                      placeholder={index === 0 ? "Start typing here..." : ""}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimedNotepad;