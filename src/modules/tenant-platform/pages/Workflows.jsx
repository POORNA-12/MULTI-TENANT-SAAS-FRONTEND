import { useState } from 'react';
import { Plus, ListFilter } from 'lucide-react';
import TemplateList from '../components/Workflows/TemplateList';
import MyRequestsList from '../components/Workflows/MyRequestsList';

export default function Workflows() {
    const [activeTab, setActiveTab] = useState('templates');

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Workflows</h1>
                    <p className="text-gray-500 mt-1">Manage approvals and automate your processes.</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'templates'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Browse Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'requests'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Requests
                    </button>
                </div>
            </div>

            {activeTab === 'templates' ? (
                <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                    <TemplateList />
                </div>
            ) : (
                <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                    <MyRequestsList />
                </div>
            )}
        </div>
    );
}
