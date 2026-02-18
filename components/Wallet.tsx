
import React from 'react';
import { User } from '../types';

interface WalletProps {
    user: User;
}

const Wallet: React.FC<WalletProps> = ({ user }) => {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">My Wallet</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your credits and earnings overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Global Credits Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                    <div className="flex items-center space-x-3 mb-4">
                        <span className="text-3xl">💰</span>
                        <h2 className="text-2xl font-bold">Global Credits</h2>
                    </div>
                    <p className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">{user.wallet.globalCredits}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Earned from platform activities like winning ranks. Use them for in-app purchases or convert them to cash from a limited monthly pool.
                    </p>
                </div>

                {/* Individual Credits Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-t-4 border-green-500">
                     <div className="flex items-center space-x-3 mb-4">
                        <span className="text-3xl">💵</span>
                        <h2 className="text-2xl font-bold">Individual Credits</h2>
                    </div>
                    <p className="text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">{user.wallet.individualCredits}</p>
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        Earned from direct payments for services like private tutoring. Each credit has a real-world value and can be fully converted to cash.
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                <p className="font-bold">Understanding Credits</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">The dual-credit system ensures fair pay for creators while rewarding all users for their engagement, creating a balanced and sustainable economy.</p>
            </div>
        </div>
    );
};

export default Wallet;
