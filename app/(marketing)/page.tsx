"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle, GraduationCap, Video, Wallet } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MarketingPage() {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    const onGetStarted = () => {
        if (isSignedIn) {
            router.push("/search");
        } else {
            router.push("/sign-up");
        }
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-sky-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-800 shadow-sm transition-all hover:shadow-md">
                    <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    Transforming Education for Everyone
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
                    Master In-Demand Skills with{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                        Spero Academy
                    </span>
                </h1>

                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Whether you want to learn programming, design, or business, we connect you with expert instructors worldwide. High-quality video courses, lifetime access, and an ever-growing library.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button onClick={onGetStarted} size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all font-semibold bg-sky-600 hover:bg-sky-700">
                        Start Learning Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Link href="/pricing">
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full font-medium border-slate-300 text-slate-700 hover:bg-slate-50">
                            Become an Instructor
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Lifetime Access
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        HD Quality Videos
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Expert Instructors
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why choose Spero Academy?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">We provide the best tools for both students to learn efficiently and instructors to manage their courses seamlessly.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6 text-sky-600">
                                <Video className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Streaming</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Powered by Mux, experience flawless adaptive HTTP live streaming. No buffering, no waiting, just learning.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Organized Curriculum</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Structured chapters with progress tracking, attachments, and clear milestones to keep you motivated.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">For Instructors</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Integrated Stripe Connect for automatic payouts in multiple currencies, deep analytics, and easy course building.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
