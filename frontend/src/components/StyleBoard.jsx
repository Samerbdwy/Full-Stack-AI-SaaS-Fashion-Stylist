// components/StyleBoard.jsx - FIXED VERSION with persistent likes and sorting
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StyleBoard = ({ savedLooks, onSaveLook, onDeleteLook, wardrobe, onUpdateLook, currentMood }) => {
  const [filter, setFilter] = useState('all');
  const [selectedLook, setSelectedLook] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLook, setEditingLook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    mood: 'confident',
    occasion: 'casual'
  });
  const [likedLooks, setLikedLooks] = useState(new Set());

  const occasions = ['all', 'casual', 'work', 'party', 'sport', 'formal', 'beach', 'daily'];
  const moods = ['all', 'confident', 'chill', 'soft', 'power', 'edgy'];

  // Enhanced mood emojis with labels
  const moodEmojis = {
    confident: { emoji: '😎', label: 'Confident' },
    chill: { emoji: '🥶', label: 'Chill' },
    soft: { emoji: '😇', label: 'Soft' },
    power: { emoji: '💪', label: 'Power' },
    edgy: { emoji: '🖤', label: 'Edgy' }
  };

  // Load liked looks from localStorage when component mounts
  useEffect(() => {
    const savedLikes = localStorage.getItem('fashionai_liked_looks');
    if (savedLikes) {
      try {
        const likedArray = JSON.parse(savedLikes);
        setLikedLooks(new Set(likedArray));
      } catch (error) {
        console.error('Error loading liked looks:', error);
      }
    }
  }, []);

  // Sort filtered looks: liked ones first, then by creation date
  const filteredLooks = savedLooks
    .filter(look => filter === 'all' || look.occasion === filter || look.mood === filter)
    .sort((a, b) => {
      // Liked looks come first
      const aIsLiked = likedLooks.has(a._id);
      const bIsLiked = likedLooks.has(b._id);
      
      if (aIsLiked && !bIsLiked) return -1; // a comes first
      if (!aIsLiked && bIsLiked) return 1;  // b comes first
      
      // If both are liked or both are not liked, sort by creation date (newest first)
      return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
    });

  // Enhanced save function with random moods
  const saveNewLook = async () => {
    setIsSaving(true);
    try {
      // Use the currentMood passed from App.jsx instead of generating a random one
      const moodToSave = currentMood || 'confident'; 
      
      const newLook = {
        title: `My ${moodEmojis[moodToSave].label} Look`,
        description: 'A stylish outfit created from my wardrobe',
        mood: moodToSave,
        occasion: wardrobe.length > 0 && wardrobe[0].occasion ? wardrobe[0].occasion : 'casual',
        items: wardrobe.slice(0, 3).map(item => item._id),
        tags: [],
        weatherConditions: {
          temperature: 20,
          condition: 'moderate'
        }
      };

      await onSaveLook(newLook);
    } catch (error) {
      console.error('Error saving look:', error);
      alert('Failed to save look. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLook = async (id) => {
    if (window.confirm('Are you sure you want to delete this look?')) {
      try {
        await onDeleteLook(id);
        setSelectedLook(null);
      } catch (error) {
        console.error('Error deleting look:', error);
        alert('Failed to delete look. Please try again.');
      }
    }
  };

  // Fixed like function - now properly saves to localStorage and reorders looks
  const toggleLike = async (id, e) => {
    e.stopPropagation(); // Prevent opening the look details
    
    try {
      // Toggle like state
      const newLikedLooks = new Set(likedLooks);
      if (newLikedLooks.has(id)) {
        newLikedLooks.delete(id);
      } else {
        newLikedLooks.add(id);
      }
      setLikedLooks(newLikedLooks);

      // Save to localStorage for persistence
      localStorage.setItem('fashionai_liked_looks', JSON.stringify([...newLikedLooks]));

      console.log('Liked look:', id, 'Liked looks:', [...newLikedLooks]);
      
    } catch (error) {
      console.error('Error liking look:', error);
      // Revert optimistic update on error
      const revertedLikedLooks = new Set(likedLooks);
      if (revertedLikedLooks.has(id)) {
        revertedLikedLooks.delete(id);
      } else {
        revertedLikedLooks.add(id);
      }
      setLikedLooks(revertedLikedLooks);
    }
  };

  // Fixed edit functionality - no new tab
  const startEditing = (look, e) => {
    e.stopPropagation(); // Prevent opening the look details
    setEditingLook(look._id);
    setEditForm({
      title: look.title,
      mood: look.mood,
      occasion: look.occasion
    });
  };

  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingLook(null);
    setEditForm({
      title: '',
      mood: 'confident',
      occasion: 'casual'
    });
  };

  const saveEdit = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      if (onUpdateLook) {
        await onUpdateLook(id, editForm);
      }
      setEditingLook(null);
    } catch (error) {
      console.error('Error updating look:', error);
      alert('Failed to update look. Please try again.');
    }
  };

  const getEmojiForLook = (look) => {
    const tagEmojiMap = {
      'casual': '👕', 'sport': '👟', 'formal': '👔', 'party': '🎉', 'work': '💼', 'beach': '🏖️', 'daily': '🗓️',
      'denim': '👖', 'professional': '👩‍💼', 'elegant': '👗', 'feminine': '🌸', 'tops': '👚', 'footwear': '👟', 'outerwear': '🧥',
      'confident': '😎', 'chill': '🥶', 'soft': '😇', 'power': '💪', 'edgy': '🖤'
    };
  
    // Prioritize tags
    if (look.tags && look.tags.length > 0) {
      for (const tag of look.tags) {
        const lowerTag = tag.toLowerCase();
        if (tagEmojiMap[lowerTag]) {
          return tagEmojiMap[lowerTag];
        }
      }
    }
  
    // Fallback to mood
    if (look.mood && moodEmojis[look.mood]) {
      return moodEmojis[look.mood].emoji;
    }
  
    // Fallback to occasion
    if (look.occasion && tagEmojiMap[look.occasion.toLowerCase()]) {
      return tagEmojiMap[look.occasion.toLowerCase()];
    }
  
    // Random emoji if no match
    const randomEmojis = ['✨', '🌟', '💫', '💖', '🌈'];
    return randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
  };



  const getCategoryEmoji = (category) => {
    // Ensure category is a string before calling toLowerCase()
    const safeCategory = category ? String(category) : '';
    switch (safeCategory.toLowerCase()) {
      case 'top': return '👕';
      case 'bottom': return '👖';
      case 'shoes': return '👟';
      case 'accessory': return '💍';
      case 'outerwear': return '🧥';
      default: return '✨';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">StyleBoard</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your personal gallery of {savedLooks.length} saved outfits and fashion inspiration
        </p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Looks
          </button>
          
          {occasions.slice(1).map(occasion => (
            <button
              key={occasion}
              onClick={() => setFilter(occasion)}
              className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                filter === occasion 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>

        {/* Save New Look Button */}
        <motion.button
          onClick={saveNewLook}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSaving || wardrobe.length === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💫</span>
              <span>Save New Look</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Looks Grid */}
      {filteredLooks.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredLooks.map((look, index) => {
              const allDisplayedItems = look.items || [];

              return (
                <motion.div
                  key={look._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gray-900/80 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-800 cursor-pointer group"
                  onClick={() => setSelectedLook(look)}
                >
                  {/* Look Image/Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-purple-900/40 to-pink-900/40 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-60">
                        {getEmojiForLook(look)}
                      </span>
                    </div>
                    
                    {/* Enhanced Quick Actions Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      {/* Fixed Like Button - No number, just heart */}
                      <button
                        onClick={(e) => toggleLike(look._id, e)}
                        className={`bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all ${
                          likedLooks.has(look._id) 
                            ? 'text-red-500 bg-red-500/30' 
                            : 'text-white hover:bg-red-500/50'
                        }`}
                        title={likedLooks.has(look._id) ? "Unlike" : "Like"}
                      >
                        ❤️
                      </button>
                      {/* Edit Button */}
                      <button
                        onClick={(e) => startEditing(look, e)}
                        className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-blue-500/50 transition-all"
                        title="Edit Look"
                      >
                        ✏️
                      </button>

                    </div>

                    {/* Mood Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs capitalize">
                        {look.mood}
                      </span>
                    </div>

                    {/* Liked Badge - Shows when look is liked */}
                    {likedLooks.has(look._id) && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-red-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <span>❤️</span>
                          <span>Liked</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Look Details */}
                  <div className="p-4">
                    {editingLook === look._id ? (
                      // Edit Mode - Fixed to not open new tab
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="Look title"
                        />
                        <select
                          value={editForm.mood}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mood: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          {Object.entries(moodEmojis).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <select
                          value={editForm.occasion}
                          onChange={(e) => setEditForm(prev => ({ ...prev, occasion: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          {occasions.slice(1).map(occasion => (
                            <option key={occasion} value={occasion}>{occasion}</option>
                          ))}
                        </select>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => saveEdit(look._id, e)}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <h3 className="text-white font-bold text-lg mb-2 truncate">{look.title}</h3>
                        
                        <div className="space-y-1 mb-3">
                          {allDisplayedItems.slice(0, 2).map((item) => (
                            <p key={item._id} className="text-gray-400 text-sm truncate">
                              {getCategoryEmoji(item.category)} {item.name}
                            </p>
                          ))}
                          {allDisplayedItems.length > 2 && (
                            <p className="text-gray-500 text-sm">+{allDisplayedItems.length - 2} more items</p>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {look.tags && look.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📌</div>
          <h3 className="text-2xl text-white mb-2">
            {savedLooks.length === 0 ? 'No saved looks yet' : 'No looks match your filter'}
          </h3>
          <p className="text-gray-400 mb-6">
            {savedLooks.length === 0 
              ? 'Save your favorite AI-generated outfits to build your style collection!' 
              : 'Try changing your filter to see more looks.'}
          </p>
          {wardrobe.length === 0 && (
            <p className="text-yellow-400 text-sm mb-4">
              💡 Add items to your wardrobe first to create looks!
            </p>
          )}
          <motion.button
            onClick={saveNewLook}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={wardrobe.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold shadow-2xl disabled:opacity-50"
          >
            {wardrobe.length === 0 ? 'Add Wardrobe Items First' : 'Save Your First Look'}
          </motion.button>
        </motion.div>
      )}

      {/* Look Detail Modal */}
      <AnimatePresence>
        {selectedLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLook(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedLook.title}</h2>
                <button
                  onClick={() => setSelectedLook(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Look Preview */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl h-64 flex items-center justify-center">
                  <span className="text-8xl opacity-60">
                    {getEmojiForLook(selectedLook)}
                  </span>
                </div>

                {/* Look Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold mb-2">Outfit Details</h3>
                    {selectedLook.description && (
                      <p className="text-gray-300 mb-3">{selectedLook.description}</p>
                    )}
                    
                    <h4 className="text-white font-bold mb-2">Outfit Items</h4>
                    <div className="space-y-2">
                      {selectedLook.items && selectedLook.items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-3 bg-gray-800/50 rounded-xl p-3">
                          <span className="text-purple-400">{getCategoryEmoji(item.category)}</span>
                          <span className="text-white">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-gray-400 text-sm mb-1">Mood</h4>
                      <p className="text-white capitalize">{selectedLook.mood}</p>
                    </div>
                    <div>
                      <h4 className="text-gray-400 text-sm mb-1">Occasion</h4>
                      <p className="text-white capitalize">{selectedLook.occasion}</p>
                    </div>
                  </div>

                  {selectedLook.tags && selectedLook.tags.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLook.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Actions */}
                  <div className="flex space-x-3 pt-4">
                    {/* Fixed Like Button in Modal - No number */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => toggleLike(selectedLook._id, e)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                        likedLooks.has(selectedLook._id)
                          ? 'bg-red-500/30 text-red-300'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      <span>❤️</span>
                      <span>{likedLooks.has(selectedLook._id) ? 'Liked' : 'Like'}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteLook(selectedLook._id)}
                      className="flex-1 bg-red-500/20 text-red-300 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-all"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StyleBoard;