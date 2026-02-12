import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

type CallbackStatus = 'loading' | 'success' | 'error';

interface CallbackState {
  status: CallbackStatus;
  message: string;
  details?: string;
}

const safeParseState = (stateParam: string | null): { organizationId?: string; timestamp?: number } | null => {
  if (!stateParam) return null;
  try {
    const json = atob(stateParam);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const MetaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ui, setUi] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing your connection...',
  });

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');
    const stateParam = searchParams.get('state');

    if (error) {
      setUi({
        status: 'error',
        message: errorReason || 'Connection cancelled',
        details: errorDescription || undefined,
      });
      return;
    }

    if (!code) {
      setUi({
        status: 'error',
        message: 'Missing authorization code',
        details: 'Please try connecting again.',
      });
      return;
    }

    const decoded = safeParseState(stateParam);
    let organizationId = decoded?.organizationId || localStorage.getItem('currentOrganizationId') || null;

    if (!organizationId) {
      setUi({
        status: 'error',
        message: 'Organization context lost',
        details: 'Go back and try again.',
      });
      return;
    }

    // Optional: state age check (10 mins)
    if (decoded?.timestamp) {
      const age = Date.now() - decoded.timestamp;
      if (age > 10 * 60 * 1000) {
        setUi({
          status: 'error',
          message: 'Authorization expired',
          details: 'Please try connecting again.',
        });
        return;
      }
    }

    try {
      setUi({ status: 'loading', message: 'Connecting your WhatsApp Business account...' });

      const response = await api.post('/meta/callback', { code, organizationId });

      if (response.data?.success) {
        setUi({
          status: 'success',
          message: 'WhatsApp Business connected successfully!',
          details: response.data?.data?.account?.displayName || response.data?.data?.account?.phoneNumber,
        });

        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        throw new Error(response.data?.message || 'Connection failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete connection';
      setUi({ status: 'error', message: msg, details: 'Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          {ui.status === 'loading' && (
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          )}
          {ui.status === 'success' && (
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}
          {ui.status === 'error' && (
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        <h1 className={`text-2xl font-bold mb-2 ${ui.status === 'error' ? 'text-red-900' : 'text-gray-900'}`}>
          {ui.status === 'loading' ? 'Connecting...' : ui.status === 'success' ? 'Connected!' : 'Connection Failed'}
        </h1>

        <p className="text-gray-600 mb-4">{ui.message}</p>
        {ui.details && <p className="text-sm text-gray-500 mb-6">{ui.details}</p>}

        {ui.status === 'error' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        )}

        {ui.status === 'success' && <p className="text-sm text-gray-500">Redirecting…</p>}
      </div>
    </div>
  );
};

export default MetaCallback;