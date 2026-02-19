"use client";

import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50">
            {/* Header Section */}
            <section className="pt-20 pb-16 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Whether you're here to learn a new skill or share your expertise with the world, our pricing is designed to be fair and straightforward.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="px-4 pb-20 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-8">

                {/* Student Pricing */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">For Students</h2>
                        <p className="text-slate-500 mt-2">Pay only for what you learn. No hidden subscription fees.</p>
                    </div>

                    <div className="mb-8 flex items-baseline text-slate-900">
                        <span className="text-5xl font-extrabold">Pay-per-course</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                            <span className="text-slate-600">Lifetime access to purchased courses</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                            <span className="text-slate-600">Premium video streaming with Mux</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                            <span className="text-slate-600">Downloadable attachments & resources</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                            <span className="text-slate-600">Track your progress seamlessly</span>
                        </li>
                    </ul>

                    <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800" asChild>
                        <Link href="/search">
                            Browse Courses
                        </Link>
                    </Button>
                </div>

                {/* Instructor Pricing */}
                <div className="bg-sky-600 rounded-3xl p-8 border border-sky-500 shadow-xl flex flex-col text-white relative overflow-hidden">
                    {/* Background glow for the premium card */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-sky-500 rounded-full blur-[50px] pointer-events-none" />

                    <div className="mb-6 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-sky-500/30 text-sky-100 text-xs font-semibold uppercase tracking-wider">
                            Most Popular
                        </div>
                        <h2 className="text-2xl font-bold">For Instructors</h2>
                        <p className="text-sky-100 mt-2">Start teaching today with zero upfront costs. We only earn when you earn.</p>
                    </div>

                    <div className="mb-2 flex items-baseline relative z-10">
                        <span className="text-5xl font-extrabold">85%</span>
                        <span className="text-xl text-sky-200 ml-2">payout</span>
                    </div>
                    <div className="flex items-center text-sm text-sky-200 mb-8 relative z-10">
                        <Info className="h-4 w-4 mr-1.5" />
                        15% platform fee per transaction
                    </div>

                    <ul className="space-y-4 mb-8 flex-1 relative z-10">
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-sky-200 mr-3 shrink-0" />
                            <span className="text-sky-50">Free video hosting & encoding (No Mux limits)</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-sky-200 mr-3 shrink-0" />
                            <span className="text-sky-50">Automated global payments via Stripe Connect</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-sky-200 mr-3 shrink-0" />
                            <span className="text-sky-50">Detailed revenue analytics dashboard</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="h-5 w-5 text-sky-200 mr-3 shrink-0" />
                            <span className="text-sky-50">Build unlimited courses & modules</span>
                        </li>
                    </ul>

                    <Button size="lg" className="w-full bg-white text-sky-600 hover:bg-slate-100 relative z-10" asChild>
                        <Link href="/teacher/courses">
                            Start Teaching
                        </Link>
                    </Button>
                </div>

            </section>
        </div>
    );
};
