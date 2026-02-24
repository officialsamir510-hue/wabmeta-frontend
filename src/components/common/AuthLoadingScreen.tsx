// src/components/common/AuthLoadingScreen.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthLoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                {/* Logo */}
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-white text-2xl font-bold">W</span>
                </div>

                {/* Loading spinner */}
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />

                {/* Text */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Loading your session...
                </p>
            </div>
        </div>
    );
};

export default AuthLoadingScreen;