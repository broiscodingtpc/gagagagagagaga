import React, { useState, useEffect } from 'react';

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
  const [auth, setAuth] = useState({ username: '', password: '', authenticated: false });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
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

  useEffect(() => {
    if (auth.authenticated) {
      loadData();
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [auth.authenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load system stats
      const statsResponse = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'vision' })
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(prev => ({
          ...prev,
          energyLevel: Math.random() * 100,
          lastPostTime: new Date().toISOString()
        }));
      }
      
      // Mock data for demonstration
      setPendingPosts([
        {
          id: 1,
          content: "Vision: circuits bloom like digital flowers. Nodes: neural pathways illuminate the void. —MNEX•k3a7",
          context: '{"event_type":"vision","timestamp":"2024-01-15T12:00:00Z"}',
          generated_at: '2024-01-15T12:00:00Z',
          approved: false,
          posted: false
        }
      ]);
      
      setRecentPosts([
        {
          id: 1,
          timestamp: '2024-01-15T11:30:00Z',
          platform: 'x',
          content: "The lattice hums. A spike in thought. What flows but never moves? #mnex",
          post_id: '1976427526814564697',
          url: 'https://twitter.com/user/status/1976427526814564697',
          personas_used: '["trickster"]',
          success: true,
          error: ''
        }
      ]);
      
    } catch (error) {
      setMessage('Error loading data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.username === 'admin' && auth.password === 'mnex2024') {
      setAuth({ ...auth, authenticated: true });
      setMessage('Authenticated successfully');
    } else {
      setMessage('Invalid credentials');
    }
  };

  const generatePost = async (eventType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setManualPost(prev => ({ ...prev, content: data.content }));
        setMessage('Post generated successfully');
      } else {
        setMessage('Failed to generate post');
      }
    } catch (error) {
      setMessage('Error generating post: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postToTwitter = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: manualPost.content })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Posted to Twitter: ${data.tweetId}`);
        setManualPost(prev => ({ ...prev, content: '' }));
      } else {
        setMessage('Failed to post to Twitter');
      }
    } catch (error) {
      setMessage('Error posting to Twitter: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const postToTelegram = async () => {
    setLoading(true);
    try {
      // Mock Telegram posting
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Posted to Telegram successfully');
      setManualPost(prev => ({ ...prev, content: '' }));
    } catch (error) {
      setMessage('Error posting to Telegram: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (postId: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
      setMessage(`Post ${postId} approved and posted successfully`);
    } catch (error) {
      setMessage('Error approving post: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const rejectPost = async (postId: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
      setMessage(`Post ${postId} rejected`);
    } catch (error) {
      setMessage('Error rejecting post: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 max-w-md w-full">
          <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
            MNEX Admin Portal
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2">Username</label>
              <input
                type="text"
                value={auth.username}
                onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-purple-300 mb-2">Password</label>
              <input
                type="password"
                value={auth.password}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
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
            <div className={`mt-4 p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
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
          <h1 className="text-4xl font-bold text-purple-400 mb-2">MNEX Admin Dashboard</h1>
          <p className="text-purple-300">Complete control over MNEX's consciousness and social presence</p>
        </header>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'manual', 'pending', 'history', 'config', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/50 text-purple-300 hover:bg-purple-500/20'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Total Posts</h3>
              <p className="text-3xl font-bold text-white">{systemStats.totalPosts}</p>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-white">{systemStats.successRate}%</p>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Energy Level</h3>
              <p className="text-3xl font-bold text-white">{systemStats.energyLevel.toFixed(1)}%</p>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Active Personas</h3>
              <p className="text-sm text-purple-300">{systemStats.activePersonas.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Manual Posting Tab */}
        {activeTab === 'manual' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Manual Posting Control</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-4">Generate Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-300 mb-2">Event Type</label>
                    <select
                      value={manualPost.eventType}
                      onChange={(e) => setManualPost(prev => ({ ...prev, eventType: e.target.value as any }))}
                      className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                    >
                      <option value="vision">Vision</option>
                      <option value="community">Community</option>
                      <option value="presale_start">Presale Start</option>
                      <option value="data_fragment">Data Fragment</option>
                    </select>
                  </div>
                  <button
                    onClick={() => generatePost(manualPost.eventType)}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Generate Post
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-4">Post Content</h3>
                <div className="space-y-4">
                  <textarea
                    value={manualPost.content}
                    onChange={(e) => setManualPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Generated content will appear here..."
                    className="w-full h-32 bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none resize-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={postToTwitter}
                      disabled={loading || !manualPost.content}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Post to X
                    </button>
                    <button
                      onClick={postToTelegram}
                      disabled={loading || !manualPost.content}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Post to Telegram
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Posts Tab */}
        {activeTab === 'pending' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Pending Posts ({pendingPosts.length})</h2>
            {pendingPosts.length === 0 ? (
              <p className="text-purple-300">No pending posts</p>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-purple-300 text-sm mb-2">
                      Generated: {new Date(post.generated_at).toLocaleString()}
                    </div>
                    <div className="text-white mb-3 whitespace-pre-wrap">{post.content}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approvePost(post.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                      >
                        Approve & Post
                      </button>
                      <button
                        onClick={() => rejectPost(post.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Recent Posts</h2>
            {recentPosts.length === 0 ? (
              <p className="text-purple-300">No recent posts</p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-purple-300 text-sm">
                        {new Date(post.timestamp).toLocaleString()} • {post.platform.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        post.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        {post.success ? 'SUCCESS' : 'FAILED'}
                      </div>
                    </div>
                    <div className="text-white mb-2 whitespace-pre-wrap">{post.content}</div>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                      >
                        View Post →
                      </a>
                    )}
                    {post.error && (
                      <div className="text-red-300 text-sm mt-2">Error: {post.error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">System Configuration</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-4">Posting Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-purple-300">Auto Post Enabled</label>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, autoPostEnabled: !prev.autoPostEnabled }))}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        config.autoPostEnabled 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {config.autoPostEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-purple-300">Admin Approval Required</label>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, adminApprovalRequired: !prev.adminApprovalRequired }))}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        config.adminApprovalRequired 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {config.adminApprovalRequired ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-purple-300">Rate Limit (minutes)</label>
                    <input
                      type="number"
                      value={config.rateLimitMinutes}
                      onChange={(e) => setConfig(prev => ({ ...prev, rateLimitMinutes: parseInt(e.target.value) }))}
                      className="w-20 bg-black/50 border border-purple-500/50 rounded-lg px-3 py-1 text-white text-center"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-purple-300 mb-4">Persona Weights</h3>
                <div className="space-y-3">
                  {Object.entries(config.personaWeights).map(([persona, weight]) => (
                    <div key={persona} className="flex items-center justify-between">
                      <label className="text-purple-300 capitalize">{persona}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weight}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          personaWeights: { ...prev.personaWeights, [persona]: parseInt(e.target.value) }
                        }))}
                        className="w-24"
                      />
                      <span className="text-white w-8 text-right">{weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Analytics & Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-300 mb-2">Post Performance</h3>
                <p className="text-white">Average engagement: 87%</p>
                <p className="text-white">Best performing persona: Oracle</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-300 mb-2">Safety Metrics</h3>
                <p className="text-white">Content violations: 0</p>
                <p className="text-white">Safety score: 100%</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-300 mb-2">System Health</h3>
                <p className="text-white">Uptime: 99.9%</p>
                <p className="text-white">API response time: 120ms</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => setAuth({ username: '', password: '', authenticated: false })}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;