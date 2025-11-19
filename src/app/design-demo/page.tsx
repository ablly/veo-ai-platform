import React from "react";
import {
    BarChart3,
    Users,
    Video,
    HardDrive,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Filter,
    Download,
    Plus
} from "lucide-react";

export default function DemoPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                    <p className="mt-1 text-sm text-slate-500">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <Plus className="h-4 w-4" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Videos", value: "1,284", change: "+12.5%", trend: "up", icon: Video },
                    { label: "Active Users", value: "8,420", change: "+4.3%", trend: "up", icon: Users },
                    { label: "Storage Used", value: "4.2 TB", change: "+8.1%", trend: "up", icon: HardDrive },
                    { label: "Avg. Watch Time", value: "4m 12s", change: "-2.4%", trend: "down", icon: BarChart3 },
                ].map((stat, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            {stat.trend === "up" ? (
                                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="mr-1 h-3 w-3" />
                                    {stat.change}
                                </span>
                            ) : (
                                <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                    <ArrowDownRight className="mr-1 h-3 w-3" />
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Projects Table */}
                <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
                        <button className="rounded p-1 hover:bg-slate-100 text-slate-500">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Project Name</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {[
                                    { name: "Q4 Marketing Campaign", status: "Processing", date: "Oct 24, 2025" },
                                    { name: "Product Launch Teaser", status: "Completed", date: "Oct 22, 2025" },
                                    { name: "Social Media Shorts", status: "Draft", date: "Oct 21, 2025" },
                                    { name: "Corporate Training v2", status: "Completed", date: "Oct 19, 2025" },
                                    { name: "Customer Testimonials", status: "Failed", date: "Oct 18, 2025" },
                                ].map((project, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{project.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${project.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                                    project.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                        project.status === 'Draft' ? 'bg-slate-100 text-slate-800' :
                                                            'bg-rose-100 text-rose-800'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{project.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-200 px-6 py-4">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View all projects &rarr;
                        </button>
                    </div>
                </div>

                {/* System Status / Usage */}
                <div className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Storage Usage</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Video Assets</span>
                                    <span className="font-medium text-slate-900">75%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: "75%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Images</span>
                                    <span className="font-medium text-slate-900">45%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: "45%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Audio</span>
                                    <span className="font-medium text-slate-900">20%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: "20%" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 rounded-md bg-slate-50 p-4">
                            <p className="text-sm text-slate-600">
                                You've used <span className="font-semibold text-slate-900">8.5 GB</span> of your 10 GB plan.
                            </p>
                            <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                                Upgrade Plan
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium text-slate-700">
                                Import from YouTube
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium text-slate-700">
                                Create Team Workspace
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium text-slate-700">
                                Schedule Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
