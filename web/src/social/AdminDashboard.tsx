import React, { useState, useEffect } from 'react';

// Admin credentials - not exposed in public repo
const ADMIN_USERNAME = 'selenadev';
const ADMIN_PASSWORD = 'selena202528';

interface PendingPost {
  id: number;
  content: string;
  context: string;
  generated_at: string;
  approved: boolean;
  posted: boolean;
}

interface RecentPost {
  id: number;
  timestamp: string;
  platform: string;
  content: string;
  post_id: string;
  url: string;
  personas_used: string;
  success: boolean;
  error: string;
}

interface SystemStats {
  totalPosts: number;
  successRate: number;
  activePersonas: string[];
  lastPostTime: string;
  energyLevel: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Data states
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalPosts: 0,
    successRate: 0,
    activePersonas: [],
    lastPostTime: '',
    energyLevel: 0
  });
  
  // Manual posting
  const [manualPost, setManualPost] = useState({
    content: '',
    platform: 'twitter' as 'twitter' | 'telegram',
    eventType: 'vision' as 'vision' | 'community' | 'presale_start' | 'data_fragment'
  });
  
  // System configuration
  const [config, setConfig] = useState({
    autoPostEnabled: true,
    adminApprovalRequired: true,
    rateLimitMinutes: 5,
    maxPostsPerHour: 12,
    presaleMode: false,
    personaWeights: {
      oracle: 30,
      analyst: 20,
      trickster: 25,
      cultivator: 15,
      archivist: 10
    }
  });

  // Login function
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      // Store auth in sessionStorage for persistence
      sessionStorage.setItem('mnex_admin_auth', 'true');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('mnex_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mnex_admin_auth');
    setLoginForm({ username: '', password: '' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load system stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSystemStats(stats);
      }

      // Load pending posts
      const pendingResponse = await fetch('/api/admin/pending-posts');
      if (pendingResponse.ok) {
        const pending = await pendingResponse.json();
        setPendingPosts(pending);
      }

      // Load recent posts
      const recentResponse = await fetch('/api/admin/recent-posts');
      if (recentResponse.ok) {
        const recent = await recentResponse.json();
        setRecentPosts(recent);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const _generatePost = async (eventType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType })
      });
      
      if (response.ok) {
        const post = await response.json();
        setMessage(`Generated post: ${post.text.substring(0, 100)}...`);
        loadData(); // Refresh pending posts
      }
    } catch (error) {
      setMessage('Error generating post');
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (postId: number) => {
    try {
      const response = await fetch(`/api/admin/approve-post/${postId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setMessage('Post approved and scheduled');
        loadData();
      }
    } catch (error) {
      setMessage('Error approving post');
    }
  };

  const postManually = async () => {
    if (!manualPost.content.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualPost)
      });
      
      if (response.ok) {
        setMessage('Post sent successfully');
        setManualPost({ ...manualPost, content: '' });
      }
    } catch (error) {
      setMessage('Error posting');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 max-w-md w-full">
          <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
            MNEX Admin Portal
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-purple-300 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-purple-300 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                placeholder="mnex2024"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Authenticate
            </button>
          </form>
          {message && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-purple-400">MNEX Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {['overview', 'posts', 'manual', 'config'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">System Stats</h3>
              <div className="space-y-2">
                <p className="text-gray-300">Total Posts: <span className="text-white">{systemStats.totalPosts}</span></p>
                <p className="text-gray-300">Success Rate: <span className="text-green-400">{systemStats.successRate}%</span></p>
                <p className="text-gray-300">Energy Level: <span className="text-purple-400">{systemStats.energyLevel}%</span></p>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Active Personas</h3>
              <div className="flex flex-wrap gap-2">
                {systemStats.activePersonas.map((persona) => (
                  <span key={persona} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm">
                    {persona}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Activity</h3>
              <p className="text-gray-300">Last Post: <span className="text-white">{systemStats.lastPostTime || 'Never'}</span></p>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Pending Posts</h3>
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300 mb-2">{post.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approvePost(post.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-purple-400 font-medium">{post.platform}</span>
                      <span className="text-gray-400 text-sm">{post.timestamp}</span>
                    </div>
                    <p className="text-gray-300 mb-2">{post.content}</p>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.success ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {post.success ? 'Success' : 'Failed'}
                      </span>
                      <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {post.personas_used}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Manual Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-purple-300 mb-2">Content</label>
                <textarea
                  value={manualPost.content}
                  onChange={(e) => setManualPost({ ...manualPost, content: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none h-32"
                  placeholder="Enter your post content..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 mb-2">Platform</label>
                  <select
                    value={manualPost.platform}
                    onChange={(e) => setManualPost({ ...manualPost, platform: e.target.value as 'twitter' | 'telegram' })}
                    className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-300 mb-2">Event Type</label>
                  <select
                    value={manualPost.eventType}
                    onChange={(e) => setManualPost({ ...manualPost, eventType: e.target.value as any })}
                    className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="vision">Vision</option>
                    <option value="community">Community</option>
                    <option value="presale_start">Presale Start</option>
                    <option value="data_fragment">Data Fragment</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={postManually}
                disabled={loading || !manualPost.content.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Posting...' : 'Post Now'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auto Posting Enabled</span>
                <input
                  type="checkbox"
                  checked={config.autoPostEnabled}
                  onChange={(e) => setConfig({ ...config, autoPostEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Admin Approval Required</span>
                <input
                  type="checkbox"
                  checked={config.adminApprovalRequired}
                  onChange={(e) => setConfig({ ...config, adminApprovalRequired: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Presale Mode</span>
                <input
                  type="checkbox"
                  checked={config.presaleMode}
                  onChange={(e) => setConfig({ ...config, presaleMode: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
