import React from "react";

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-[100] overflow-auto bg-[#f8f9fa] text-slate-900 font-sans">
            {/* Independent Navigation for Demo */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
                            V
                        </div>
                        <span className="text-lg font-semibold text-slate-900">VEO Enterprise</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Dashboard</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Projects</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Team</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Settings</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Help
                        </button>
                        <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300"></div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="min-h-[calc(100vh-4rem)]">
                {children}
            </main>
        </div>
    );
}
