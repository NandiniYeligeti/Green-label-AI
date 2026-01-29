import { useState, useEffect } from 'react';
import { History as HistoryIcon, Package, Clock, Trash2, ScanLine } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../../config";

interface SearchHistoryItem {
  id: number;
  barcode: string;
  product_name: string | null;
  searched_at: string;
}

export default function History() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/history`);
      const data = await response.json();

      // backend returns { success: true, history: [...] }
      if (Array.isArray(data)) {
        setHistory(data || []);
      } else if (data && data.success) {
        setHistory(data.history || []);
      } else {
        setError('Failed to load search history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all search history?')) return;

    try {

      // ... existing imports

      const response = await fetch(`${API_BASE_URL}/history/clear`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data && data.success) {
        setHistory([]);
      } else {
        setError('Failed to clear history');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: 'var(--page-bg)' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p style={{ color: 'var(--muted)' }}>Loading search history...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--page-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HistoryIcon className="w-8 h-8" style={{ color: 'var(--cream)' }} />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--cream)' }}>Search History</h1>
                <p className="text-sm text-gray-400">{history.length} recent scans</p>
              </div>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No search history yet</h3>
            <p className="text-gray-600 mb-6">Your scanned products will appear here for easy access</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <ScanLine className="w-5 h-5" />
              Start Scanning
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link
                key={`${item.barcode}-${item.searched_at}`}
                to={`/product/${item.barcode}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Package className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product_name || `Product ${item.barcode}`}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">Barcode: {item.barcode}</p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">{formatDate(item.searched_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
