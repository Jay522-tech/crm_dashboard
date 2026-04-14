import React from 'react'
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FeatureCard from '../components/FeatureCard'

const BillingPage = () => {
    return (
        <div className="flex flex-col gap-4 min-h-0">
            <PageHeader
                title="Billing"
                subtitle="Plan, invoices, and payment settings"
                icon={<CreditCard size={18} />}
                actions={(
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
                    >
                        Upgrade
                        <ArrowRight size={16} />
                    </button>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeatureCard
                        title="Current plan"
                        description="You’re on Free plan (demo)."
                        items={[
                            'Workspaces: unlimited',
                            'Members: up to 3',
                            'Reports: basic',
                        ]}
                        rightSlot={<span className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-3 py-1">Free</span>}
                    />
                    <FeatureCard
                        title="Payment method"
                        description="Add a card to enable upgrades and invoice history."
                        items={[
                            'Secure card storage',
                            'Automatic invoices',
                            'Cancel anytime',
                        ]}
                    />
                    <div className="md:col-span-2">
                        <FeatureCard
                            title="Invoices"
                            description="Your invoices will appear here once billing is enabled."
                            items={[
                                'Download PDF invoices',
                                'Billing email & tax settings',
                            ]}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Next steps</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                        {[
                            'Connect Stripe/Razorpay',
                            'Store plan on workspace',
                            'Show invoice history',
                        ].map((t) => (
                            <div key={t} className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-blue-600 mt-0.5" />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPage

