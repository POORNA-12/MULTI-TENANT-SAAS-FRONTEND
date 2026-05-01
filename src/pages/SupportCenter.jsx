import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import notificationService from "../services/notificationService";

export default function SupportCenter() {
    const [issueType, setIssueType] = useState("BILLING");
    const [description, setDescription] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [isLoading, setIsLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const predefinedProblems = [
        { label: "Billing Inquiry", value: "BILLING" },
        { label: "Authentication or Login Failure", value: "AUTH" },
        { label: "Role & Permission Configuration", value: "ROLE" },
        { label: "Workflow Automation Setup", value: "WORKFLOW" },
        { label: "Bug Report", value: "BUG" },
        { label: "Feature Request", value: "FEATURE" },
        { label: "Other Technical Issue", value: "OTHER" }
    ];

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const data = await notificationService.getSupportRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load past requests", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!description.trim()) {
            setToast({ show: true, message: "Please provide a description of your issue.", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            await notificationService.createSupportRequest({
                category: issueType,
                description: description.trim()
            });
            setToast({ show: true, message: "Support request raised successfully!", type: "success" });
            setDescription("");
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error("Failed to submit", error);
            setToast({ show: true, message: "Failed to raise support request.", type: "error" });
        } finally {
            setIsLoading(false);
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        }
    };

    return (
        <DashboardLayout>
            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl border z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === "success" ? "bg-white border-green-200" : "bg-white border-red-200"}`}>
                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {toast.type === "success" ? "check_circle" : "error"}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0e141b]">{toast.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-xs text-[#4e7397]">{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-[#0e141b] tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-orange-600">contact_support</span>
                        Support Center
                    </h1>
                    <p className="text-[#4e7397] mt-2 font-medium">
                        Experiencing an issue? Raise a request directly to our customer care team and we will assist you shortly.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ticketing Form */}
                    <div className="lg:col-span-2 bg-white border border-[#d0dbe7] p-8 rounded-3xl shadow-sm">
                        <h2 className="text-lg font-bold text-[#0e141b] mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">mail</span>
                            Submit a Request
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#0e141b] mb-2">Issue Category</label>
                                <div className="relative">
                                    <select
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-slate-50 border border-[#e2e8f0] rounded-xl text-sm font-medium text-[#0e141b] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        {predefinedProblems.map(problem => (
                                            <option key={problem.value} value={problem.value}>{problem.label}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#0e141b] mb-2">Detailed Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe the issue, error messages you are seeing, and steps to reproduce..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-[#e2e8f0] rounded-xl text-sm text-[#0e141b] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all min-h-[160px] resize-y"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">{isLoading ? "hourglass_empty" : "send"}</span>
                                {isLoading ? "Submitting..." : "Submit Ticket"}
                            </button>
                        </form>
                    </div>

                    {/* Quick Help Side Panel */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-3xl text-white shadow-lg">
                            <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-orange-400">forum</span>
                            </div>
                            <h3 className="font-bold mb-2">Need Immediate Help?</h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                For urgent infrastructure and platform downtimes, our dedicated Enterprise team is available 24/7.
                            </p>
                            <p className="text-xs font-bold text-orange-400 bg-orange-400/10 py-2 px-3 rounded-lg flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                                +91 9133159867
                            </p>
                        </div>

                        <div className="bg-white border border-[#d0dbe7] p-6 rounded-3xl shadow-sm">
                            <h3 className="font-bold text-[#0e141b] mb-4 text-sm uppercase tracking-wider">Other Channels</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 group cursor-pointer">
                                    <div className="size-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                                        <span className="material-symbols-outlined text-[16px] text-purple-600">menu_book</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0e141b] group-hover:text-purple-600 transition-colors">Documentation</p>
                                        <p className="text-[10px] text-[#4e7397]">Browse API references & guides</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 group cursor-pointer">
                                    <div className="size-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                        <span className="material-symbols-outlined text-[16px] text-green-600">groups</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0e141b] group-hover:text-green-600 transition-colors">Community Forum</p>
                                        <p className="text-[10px] text-[#4e7397]">Ask other developers</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white border border-[#d0dbe7] rounded-3xl shadow-sm overflow-hidden mt-8">
                    <div className="p-6 lg:p-8 border-b border-[#f1f5f9]">
                        <h2 className="text-lg font-bold text-[#0e141b] flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">history</span>
                            My Support Requests
                        </h2>
                    </div>

                    {loadingRequests ? (
                        <div className="p-12 flex justify-center text-[#4e7397]">
                            <span className="material-symbols-outlined animate-spin text-3xl">hourglass_empty</span>
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="overflow-x-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f6f7f8] border-b border-[#d0dbe7] text-[#4e7397] text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold px-6 lg:px-8">Ticket ID</th>
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Category</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold px-6 lg:px-8">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 px-6 lg:px-8 text-sm font-bold text-[#0e141b]">#{req.id.toString().padStart(4, '0')}</td>
                                            <td className="p-4 text-sm text-[#4e7397] whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600">
                                                {predefinedProblems.find(p => p.value === req.category)?.label || req.category}
                                            </td>
                                            <td className="p-4 text-sm text-[#4e7397] max-w-sm truncate" title={req.description}>
                                                {req.description}
                                            </td>
                                            <td className="p-4 px-6 lg:px-8 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    req.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                                                    req.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-[#4e7397]">
                            You haven't submitted any support requests yet.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
