import React, { useState, useEffect, useContext, createContext } from 'react';
import './App.css';

// Context for user authentication and language
const AuthContext = createContext();
const LanguageContext = createContext();

// Custom hooks
const useAuth = () => useContext(AuthContext);
const useLanguage = () => useContext(LanguageContext);

// API base URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// API helper functions
const api = {
  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  get: async (endpoint, token = null) => {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return response.json();
  },
  
  delete: async (endpoint, token = null) => {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  }
};

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
  </div>
);

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { translations } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', formData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user, response.token);
      } else {
        setError(response.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">SW</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {translations.app_name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {translations.login}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : translations.login}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    business_name: '',
    sector: 'it',
    location: '',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { translations } = useLanguage();

  const sectors = [
    { value: 'primary', label: 'Primary (Agriculture, Mining)' },
    { value: 'secondary', label: 'Secondary (Manufacturing)' },
    { value: 'tertiary', label: 'Tertiary (Services)' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', formData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onRegister(response.user, response.token);
      } else {
        setError(response.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">SW</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {translations.app_name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {translations.register}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Business Name (Optional)
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
              >
                {sectors.map(sector => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : translations.register}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout }) => {
  const { language, setLanguage, translations } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              {translations.app_name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user.username}</span>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                {translations.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Navigation = ({ activeTab, setActiveTab }) => {
  const { translations } = useLanguage();

  const tabs = [
    { id: 'dashboard', label: translations.dashboard, icon: '📊' },
    { id: 'tech', label: translations.technology_monitoring, icon: '🔬' },
    { id: 'competitor', label: translations.competitive_monitoring, icon: '🏢' },
    { id: 'credibility', label: translations.credibility_monitoring, icon: '🌐' },
    { id: 'marketing', label: translations.marketing_monitoring, icon: '📈' }
  ];

  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Dashboard = ({ user, token }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          api.get('/api/dashboard/stats', token),
          api.get('/api/dashboard/recent-activity', token)
        ]);

        setStats(statsResponse.stats);
        setRecentActivity(activityResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.username}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your monitoring activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tech News</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.tech_news_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Social Mentions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.twitter_mentions_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Competitors</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.competitors_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sentiment</p>
              <div className="flex space-x-2 text-sm">
                <span className="text-green-600">+{stats?.sentiment_summary?.positive || 0}</span>
                <span className="text-gray-600">◯{stats?.sentiment_summary?.neutral || 0}</span>
                <span className="text-red-600">-{stats?.sentiment_summary?.negative || 0}</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{translations.recent_news}</h3>
          </div>
          <div className="p-6">
            {recentActivity?.recent_news?.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.recent_news.map((article, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium text-gray-900 line-clamp-2">{article.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{article.source}</p>
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.sentiment?.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800'
                          : article.sentiment?.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.sentiment?.sentiment || 'neutral'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent news available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{translations.recent_mentions}</h3>
          </div>
          <div className="p-6">
            {recentActivity?.recent_tweets?.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.recent_tweets.map((tweet, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-gray-900 line-clamp-3">{tweet.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tweet.sentiment?.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800'
                          : tweet.sentiment?.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tweet.sentiment?.sentiment || 'neutral'}
                      </span>
                      <span className="text-sm text-gray-500">
                        👍 {tweet.public_metrics?.like_count || 0} | 
                        🔄 {tweet.public_metrics?.retweet_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent mentions available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TechMonitoring = ({ token }) => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const { translations } = useLanguage();

  const fetchTechNews = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/monitoring/tech-news${keywords ? `?keywords=${keywords}` : ''}`,
        token
      );
      if (response.success) {
        setArticles(response.articles);
      }
    } catch (error) {
      console.error('Error fetching tech news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechNews();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {translations.technology_monitoring}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter keywords (e.g., AI, blockchain, fintech)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={fetchTechNews}
            disabled={isLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Loading...' : 'Search News'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{article.source}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    article.sentiment?.sentiment === 'positive' 
                      ? 'bg-green-100 text-green-800'
                      : article.sentiment?.sentiment === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {article.sentiment?.sentiment || 'neutral'}
                  </span>
                </div>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No articles found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

const CompetitorMonitoring = ({ token }) => {
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    website: '',
    description: ''
  });
  const { translations } = useLanguage();

  const fetchCompetitors = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/monitoring/competitors', token);
      if (response.success) {
        setCompetitors(response.competitors);
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitor.name.trim()) return;
    
    try {
      const response = await api.post('/api/monitoring/competitors', newCompetitor, token);
      if (response.success) {
        setCompetitors([...competitors, response.competitor]);
        setNewCompetitor({ name: '', website: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const deleteCompetitor = async (competitorId) => {
    try {
      const response = await api.delete(`/api/monitoring/competitors/${competitorId}`, token);
      if (response.success) {
        setCompetitors(competitors.filter(c => c.id !== competitorId));
      }
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {translations.competitive_monitoring}
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {translations.add_competitor}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Competitor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter competitor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={newCompetitor.website}
                  onChange={(e) => setNewCompetitor({...newCompetitor, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCompetitor.description}
                  onChange={(e) => setNewCompetitor({...newCompetitor, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                  placeholder="Brief description of the competitor"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={addCompetitor}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Add Competitor
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitors.map((competitor) => (
            <div key={competitor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                <button
                  onClick={() => deleteCompetitor(competitor.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
              
              {competitor.website && (
                <a
                  href={competitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-800 text-sm mb-2 block"
                >
                  {competitor.website}
                </a>
              )}
              
              {competitor.description && (
                <p className="text-gray-600 text-sm mb-4">{competitor.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                Added: {new Date(competitor.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && competitors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No competitors added yet. Add your first competitor to start monitoring.</p>
        </div>
      )}
    </div>
  );
};

const CredibilityMonitoring = ({ token }) => {
  const [mentions, setMentions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const { translations } = useLanguage();

  const fetchTwitterMentions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/monitoring/twitter-mentions${keywords ? `?keywords=${keywords}` : ''}`,
        token
      );
      if (response.success) {
        setMentions(response.tweets);
      }
    } catch (error) {
      console.error('Error fetching Twitter mentions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTwitterMentions();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {translations.credibility_monitoring}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter keywords to monitor (e.g., your business name)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={fetchTwitterMentions}
            disabled={isLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Loading...' : 'Search Mentions'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {mentions.map((mention, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🐦</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Twitter</p>
                    <p className="text-sm text-gray-500">
                      {new Date(mention.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mention.sentiment?.sentiment === 'positive' 
                    ? 'bg-green-100 text-green-800'
                    : mention.sentiment?.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {mention.sentiment?.sentiment || 'neutral'}
                </span>
              </div>
              
              <p className="text-gray-900 mb-4">{mention.text}</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>👍 {mention.public_metrics?.like_count || 0}</span>
                  <span>🔄 {mention.public_metrics?.retweet_count || 0}</span>
                  <span>💬 {mention.public_metrics?.reply_count || 0}</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  Polarity: {mention.sentiment?.polarity?.toFixed(2) || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && mentions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No mentions found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

const MarketingMonitoring = ({ token }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { translations } = useLanguage();

  const fetchMarketingNews = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/monitoring/tech-news?keywords=marketing,digital marketing,social media marketing', token);
      if (response.success) {
        setCampaigns(response.articles);
      }
    } catch (error) {
      console.error('Error fetching marketing news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingNews();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {translations.marketing_monitoring}
        </h2>
        <p className="text-gray-600">
          Stay updated with the latest marketing trends and campaigns.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              {campaign.image_url && (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {campaign.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{campaign.source}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.sentiment?.sentiment === 'positive' 
                      ? 'bg-green-100 text-green-800'
                      : campaign.sentiment?.sentiment === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.sentiment?.sentiment || 'neutral'}
                  </span>
                </div>
                
                <a
                  href={campaign.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && campaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No marketing content found.</p>
        </div>
      )}
    </div>
  );
};

const MainApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleRegister = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} token={token} />;
      case 'tech':
        return <TechMonitoring token={token} />;
      case 'competitor':
        return <CompetitorMonitoring token={token} />;
      case 'credibility':
        return <CredibilityMonitoring token={token} />;
      case 'marketing':
        return <MarketingMonitoring token={token} />;
      default:
        return <Dashboard user={user} token={token} />;
    }
  };

  if (!user || !token) {
    return showLogin ? (
      <div>
        <LoginForm onLogin={handleLogin} />
        <div className="text-center mt-4">
          <button
            onClick={() => setShowLogin(false)}
            className="text-orange-600 hover:text-orange-800 text-sm"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    ) : (
      <div>
        <RegisterForm onRegister={handleRegister} />
        <div className="text-center mt-4">
          <button
            onClick={() => setShowLogin(true)}
            className="text-orange-600 hover:text-orange-800 text-sm"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>{renderContent()}</main>
    </div>
  );
};

const App = () => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await api.get(`/api/translations/${language}`);
        if (response.success) {
          setTranslations(response.translations);
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
        // Fallback translations
        setTranslations({
          app_name: "Simba-Watch",
          dashboard: "Dashboard",
          technology_monitoring: "Technology Monitoring",
          competitive_monitoring: "Competitive Monitoring",
          credibility_monitoring: "Credibility Monitoring",
          marketing_monitoring: "Marketing Monitoring",
          recent_news: "Recent News",
          recent_mentions: "Recent Mentions",
          competitors: "Competitors",
          add_competitor: "Add Competitor",
          login: "Login",
          register: "Register",
          logout: "Logout"
        });
      }
    };

    fetchTranslations();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      <AuthContext.Provider value={{}}>
        <MainApp />
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;