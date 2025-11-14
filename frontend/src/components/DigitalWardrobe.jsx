// DigitalWardrobe.jsx - FIXED VERSION with delete button
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DigitalWardrobe = ({ wardrobe, onAddItem, onDeleteItem }) => {
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'top',
    color: '',
    occasion: 'casual',
    tags: ''
  });

  const categories = [
    { value: 'top', label: 'Top', icon: '👕' },
    { value: 'bottom', label: 'Bottom', icon: '👖' },
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { value: 'accessory', label: 'Accessory', icon: '🕶️' },
    { value: 'dress', label: 'Dress', icon: '👗' }
  ];

  const occasions = ['casual', 'formal', 'sport', 'party', 'work'];

  const addItem = async () => {
    if (newItem.name && newItem.color) {
      try {
        const tags = newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        const itemData = {
          ...newItem,
          tags
        };
        
        await onAddItem(itemData);
        
        setNewItem({
          name: '',
          category: 'top',
          color: '',
          occasion: 'casual',
          tags: ''
        });
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
      }
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await onDeleteItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white mb-8 text-center"
      >
        Digital Wardrobe
      </motion.h1>

      {/* Add Item Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-800 mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add Clothing Item</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Black Leather Jacket"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Category</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Color</label>
            <input
              type="text"
              value={newItem.color}
              onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
              placeholder="e.g., Black, Navy, White"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Occasion</label>
            <select
              value={newItem.occasion}
              onChange={(e) => setNewItem(prev => ({ ...prev, occasion: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {occasions.map(occ => (
                <option key={occ} value={occ}>
                  {occ.charAt(0).toUpperCase() + occ.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">Tags (comma separated)</label>
            <input
              type="text"
              value={newItem.tags}
              onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., vintage, leather, casual"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <motion.button
          onClick={addItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold shadow-2xl"
        >
          + Add to Wardrobe
        </motion.button>
      </motion.div>

      {/* Clothing Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {wardrobe.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 relative group"
          >
            {/* Delete Button */}
            <button
              onClick={() => deleteItem(item._id)}
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30"
              title="Delete item"
            >
              🗑️
            </button>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">
                {categories.find(cat => cat.value === item.category)?.icon}
              </span>
              <span className="text-sm text-gray-400 capitalize">{item.category}</span>
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-400 mb-2">Color: {item.color}</p>
            <p className="text-gray-400 mb-3 capitalize">Occasion: {item.occasion}</p>
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {wardrobe.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">👕</div>
          <h3 className="text-xl text-gray-400">Your wardrobe is empty</h3>
          <p className="text-gray-500">Add some clothing items to get started!</p>
        </motion.div>
      )}
    </div>
  );
};

export default DigitalWardrobe;