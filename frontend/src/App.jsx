import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import './App.css'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import StylishAvatar from './components/StylishAvatar'
import MoodStylist from './components/MoodStylist'
import AIChatAssistant from './components/AIChatAssistant'
import ClerkAuthModal from './components/ClerkAuthModal'
import DigitalWardrobe from './components/DigitalWardrobe'
import StyleAnalyzer from './components/StyleAnalyzer'
import StyleBoard from './components/StyleBoard'
import TrendExplorer from './components/TrendExplorer'
import OutfitOfTheDay from './components/OutfitOfTheDay'
import PricingPage from './components/PricingPage'

// API Service - FIXED VERSION
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const createApi = (getToken) => ({
  async request(endpoint, options = {}) {
    try {
      let token;
      let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Get Clerk token if available
      if (getToken) {
        try {
          token = await getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.log('🔑 No Clerk token available, proceeding without authentication');
        }
      }

      const config = {
        headers,
        ...options,
        credentials: 'include'
      };

      let url = `${API_BASE}${endpoint}`;
      if (options.params && Object.keys(options.params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value);
          }
        });
        url += `?${searchParams.toString()}`;
      }

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
        }
        
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You may not have permission for this action.';
        } else if (response.status === 404) {
          errorMessage = 'Resource not found.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`🔴 API Error at ${endpoint}:`, error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if backend is running on port 5000.');
      }
      
      throw error;
    }
  },

  // AI
  async chat(message) {
    return this.request('/ai/chat', { method: 'POST', body: { message } });
  },

  async generateOutfit(mood, occasion, weather) {
    return this.request('/ai/generate-outfit', { 
      method: 'POST', 
      body: { mood, occasion, weather } 
    });
  },

  async analyzeStyle() {
    return this.request('/ai/style-analysis');
  },

  // Wardrobe
  async getWardrobe() {
    try {
      const data = await this.request('/wardrobe');
      return { success: true, items: data.items || data || [] };
    } catch (error) {
      console.error('Wardrobe fetch error:', error);
      return { success: false, error: error.message, items: [] };
    }
  },

  async addWardrobeItem(item) {
    const response = await this.request('/wardrobe', { method: 'POST', body: item });
    return { success: true, item: response.item || response };
  },

  async updateWardrobeItem(id, updates) {
    const response = await this.request(`/wardrobe/${id}`, { method: 'PUT', body: updates });
    return { success: true, item: response.item || response };
  },

  async deleteWardrobeItem(id) {
    const response = await this.request(`/wardrobe/${id}`, { method: 'DELETE' });
    return { success: true, ...response };
  },

  // StyleBoard
  async getStyleBoard() {
    try {
      const data = await this.request('/styleboard');
      return { success: true, looks: data.looks || data || [] };
    } catch (error) {
      console.error('StyleBoard fetch error:', error);
      return { success: false, error: error.message, looks: [] };
    }
  },

  async saveLook(look) {
    const response = await this.request('/styleboard', { method: 'POST', body: look });
    return { success: true, look: response.look || response };
  },

  async updateLook(id, updates) {
    const response = await this.request(`/styleboard/${id}`, { method: 'PUT', body: updates });
    return { success: true, look: response.look || response };
  },

  async deleteLook(id) {
    const response = await this.request(`/styleboard/${id}`, { method: 'DELETE' });
    return { success: true, ...response };
  },

  // Outfits
  async generateOOTD(mood, occasion, weather) {
    const params = {};
    if (mood) params.mood = mood;
    if (occasion) params.occasion = occasion;
    if (weather) params.weather = weather;
    
    return this.request('/outfits/generate/ootd', { 
      method: 'GET',
      params
    });
  },

  async getSmartOOTD() {
    return this.request('/outfits/smart/ootd');
  },
  
  // Weather
  async getWeather() {
    return this.request('/weather/current');
  }
});

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [userMood, setUserMood] = useState('confident')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [wardrobe, setWardrobe] = useState([])
  const [savedLooks, setSavedLooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [aiChatContext, setAiChatContext] = useState(null)

  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut, openSignIn } = useClerk()

  const api = createApi(getToken)

  useEffect(() => {
    if (showAuthModal) {
      setGlobalError('');
    }
  }, [showAuthModal]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        setCurrentView('dashboard');
        loadUserData();
      } else {
        setCurrentView('home');
        setWardrobe([]);
        setSavedLooks([]);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const wardrobeResult = await api.getWardrobe();
      if (wardrobeResult.success) {
        setWardrobe(wardrobeResult.items);
      } else {
        setWardrobe([]);
      }
      
      const looksResult = await api.getStyleBoard();
      if (looksResult.success) {
        setSavedLooks(looksResult.looks);
      } else {
        setSavedLooks([]);
      }
      
    } catch (error) {
      setGlobalError(`Failed to load data: ${error.message}`);
      setWardrobe([]);
      setSavedLooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToChatWithContext = (context) => {
    setAiChatContext(context);
    setCurrentView('chat');
  };

  const clearAiChatContext = () => {
    setAiChatContext(null);
  };

  const handleNavigate = (view) => {
    if (view === 'login') {
      openSignIn();
    } else {
      setCurrentView(view);
    }
  };

  const handleHeaderNavigation = (view) => {
    setCurrentView(view);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentView('home');
    } catch (error) {
      setGlobalError('Logout failed. Please try again.');
    }
  };

  const addWardrobeItem = async (item) => {
    try {
      const response = await api.addWardrobeItem(item);
      if (response.success) {
        setWardrobe(prev => [...prev, response.item]);
        return response.item;
      }
    } catch (error) {
      setGlobalError('Failed to add item: ' + error.message);
      throw error;
    }
  };

  const updateWardrobeItem = async (id, updates) => {
    try {
      const response = await api.updateWardrobeItem(id, updates);
      if (response.success) {
        setWardrobe(prev => prev.map(item => 
          item._id === id ? response.item : item
        ));
      }
    } catch (error) {
      setGlobalError('Failed to update item: ' + error.message);
      throw error;
    }
  };

  const deleteWardrobeItem = async (id) => {
    try {
      const response = await api.deleteWardrobeItem(id);
      if (response.success) {
        setWardrobe(prev => prev.filter(item => item._id !== id));
      }
    } catch (error) {
      setGlobalError('Failed to delete item: ' + error.message);
      throw error;
    }
  };

  const saveLook = async (look) => {
    try {
      const response = await api.saveLook(look);
      if (response.success) {
        // The backend now returns the fully populated look, so no manual population is needed.
        setSavedLooks(prev => [response.look, ...prev]);
        return response.look;
      }
    } catch (error) {
      setGlobalError('Failed to save look: ' + error.message);
      throw error;
    }
  };

  const updateLook = async (id, updates) => {
    try {
      const response = await api.updateLook(id, updates);
      if (response.success) {
        setSavedLooks(prev => prev.map(look => 
          look._id === id ? response.look : look
        ));
        return response.look;
      }
    } catch (error) {
      setGlobalError('Failed to update look: ' + error.message);
      throw error;
    }
  };

  const deleteLook = async (id) => {
    try {
      const response = await api.deleteLook(id);
      if (response.success) {
        setSavedLooks(prev => prev.filter(look => look._id !== id));
      }
    } catch (error) {
      setGlobalError('Failed to delete look: ' + error.message);
      throw error;
    }
  };

  const sendChatMessage = async (message) => {
    try {
      const response = await api.chat(message);
      return response;
    } catch (error) {
      setGlobalError('AI service unavailable. Using fallback responses.');
      throw error;
    }
  };

  const generateAIOutfit = async (mood, occasion, weather) => {
    try {
      const response = await api.generateOutfit(mood, occasion, weather);
      return response;
    } catch (error) {
      setGlobalError('Outfit generation failed. Please try again.');
      throw error;
    }
  };

  const analyzeStyleWithAI = async () => {
    try {
      const response = await api.analyzeStyle();
      return response;
    } catch (error) {
      setGlobalError('Style analysis unavailable. Using mock data.');
      throw error;
    }
  };

  const getCurrentWeather = async () => {
    try {
      const response = await api.getWeather();
      return response;
    } catch (error) {
      setGlobalError('Weather service unavailable. Using mock data.');
      throw error;
    }
  };

  const getSmartOOTD = async () => {
    try {
      const response = await api.getSmartOOTD();
      return response;
    } catch (error) {
      setGlobalError('OOTD service unavailable. Using fallback.');
      throw error;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-500 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {globalError && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-2xl max-w-md text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError('')}
              className="ml-2 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {isSignedIn && (
        <Header 
          currentView={currentView} 
          setCurrentView={handleHeaderNavigation}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          />
          <p className="text-white ml-4">Loading your fashion data...</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isSignedIn && currentView === 'home' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onNavigate={handleNavigate} />
          </motion.div>
        )}

        {isSignedIn && currentView === 'dashboard' && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <section className="container mx-auto px-4 py-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl font-bold text-white mb-4">
                  Welcome back, <span className="text-purple-400">{user?.username || user?.firstName || 'Fashion Lover'}</span>!
                </h1>
                <p className="text-xl text-gray-300">
                  Ready to discover your perfect looks? Let's start with your mood today!
                </p>
              </motion.div>

              <div className="flex flex-col xl:flex-row items-center xl:items-start gap-8 mb-16">
                <div className="flex-1 w-full xl:w-auto">
                  <StylishAvatar key={userMood} mood={userMood} />
                </div>

                <div className="flex-1 w-full xl:w-auto">
                  <MoodStylist 
                    onMoodSelect={setUserMood} 
                    currentMood={userMood}
                    onGenerateOutfit={generateAIOutfit}
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              >
                {[
                  { icon: '👔', label: 'My Wardrobe', view: 'wardrobe', count: wardrobe.length },
                  { icon: '🤖', label: 'AI Stylist', view: 'chat' },
                  { icon: '📊', label: 'Style Analysis', view: 'analyzer' },
                  { icon: '📌', label: 'StyleBoard', view: 'styleboard', count: savedLooks.length },
                  { icon: '🔥', label: 'Trend Explorer', view: 'trends' },
                  { icon: '👑', label: 'Outfit of the Day', view: 'ootd' },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    onClick={() => setCurrentView(action.view)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{action.label}</h3>
                    {action.count !== undefined && (
                      <div className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs inline-block mb-2">
                        {action.count} items
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">Explore your fashion journey</p>
                  </motion.button>
                ))}
              </motion.div>
            </section>
          </motion.main>
        )}

        {isSignedIn && currentView === 'chat' && (
          <motion.main
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-12 relative z-10"
          >
            <AIChatAssistant 
              onSendMessage={sendChatMessage} 
              trendContext={aiChatContext}
              onClearContext={clearAiChatContext}
              userId={user?.id}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'wardrobe' && (
          <motion.main
            key="wardrobe"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <DigitalWardrobe 
              wardrobe={wardrobe}
              onAddItem={addWardrobeItem}
              onUpdateItem={updateWardrobeItem}
              onDeleteItem={deleteWardrobeItem}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'analyzer' && (
          <motion.main
            key="analyzer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <StyleAnalyzer 
              wardrobe={wardrobe}
              onAnalyze={analyzeStyleWithAI}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'styleboard' && (
          <motion.main
            key="styleboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <StyleBoard 
              savedLooks={savedLooks}
              onSaveLook={saveLook}
              onUpdateLook={updateLook}
              onDeleteLook={deleteLook}
              wardrobe={wardrobe}
              currentMood={userMood}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'trends' && (
          <motion.main
            key="trends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <TrendExplorer 
              onSaveLook={saveLook}
              savedLooks={savedLooks}
              onNavigateToChat={handleNavigateToChatWithContext}
              setCurrentView={setCurrentView}
              api={api}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'ootd' && (
          <motion.main
            key="ootd"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <OutfitOfTheDay 
              onGenerateOutfit={getSmartOOTD}
              onGetWeather={getCurrentWeather}
              api={api}
              onSaveLook={saveLook}           
              savedLooks={savedLooks}
              wardrobe={wardrobe}
            />
          </motion.main>
        )}

        {isSignedIn && currentView === 'pricing' && (
          <motion.main
            key="pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <PricingPage setCurrentView={setCurrentView} />
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <ClerkAuthModal 
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;