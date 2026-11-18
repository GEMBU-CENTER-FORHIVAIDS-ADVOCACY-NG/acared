import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import {
    Activity,
    Banknote,
    BedDouble,
    ClipboardList,
    FlaskConical,
    Pill,
    Stethoscope,
    Users,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Clock,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import ThemeSwitch from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="AldidsCared — Modern Healthcare Management" />
            <div className="flex min-h-screen flex-col dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Navigation */}
                <header className="sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0a]/80">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-9 w-9 rounded-lg object-cover" />
                            <span className="text-xl font-semibold text-gray-900 dark:text-white">
                                AldidsCared
                            </span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild variant="default" size="sm">
                                    <Link href={dashboardUrl}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button asChild variant="default" size="sm">
                                        <Link href={register()}>Get Started</Link>
                                    </Button>
                                </>
                            )}
                            <ThemeSwitch />
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section
                    className="relative flex min-h-[90vh] items-center justify-center overflow-hidden"
                    style={{
                        backgroundImage: "url('/background.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <div className="mx-auto max-w-3xl">
                            <div className="mb-6 flex justify-center">
                                <AppLogoIcon className="h-20 w-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20" />
                            </div>
                            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                Modern Healthcare
                                <br />
                                Management System
                            </h1>
                            <p className="mb-10 text-lg text-white/80 sm:text-xl">
                                Streamline patient care, billing, pharmacy, laboratory, and nursing operations
                                in one powerful platform. Built for clinics, hospitals, and healthcare teams.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {!auth.user && (
                                    <Button asChild size="lg" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                                        <Link href={register()}>
                                            Start Free Trial
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                {auth.user && (
                                    <Button asChild size="lg" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                                        <Link href={dashboardUrl}>
                                            Go to Dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20">
                                    <Link href={login()}>
                                        Log In
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 dark:bg-[#161615]">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Everything You Need to Run Your Practice
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                AldidsCared brings together all the tools your healthcare team needs
                                into a single, intuitive platform.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Patient Management */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                        <Users className="size-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Patient Management</CardTitle>
                                    <CardDescription>
                                        Complete patient records, registration, and history tracking.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                            Digital patient profiles
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                            Appointment scheduling
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                            Import/export patient data
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Billing & Finance */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Banknote className="size-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Billing & Finance</CardTitle>
                                    <CardDescription>
                                        Streamlined invoicing, payments, and financial reporting.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-blue-500" />
                                            Automated billing
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-blue-500" />
                                            Payment tracking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-blue-500" />
                                            Financial reports
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Pharmacy */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                        <Pill className="size-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Pharmacy</CardTitle>
                                    <CardDescription>
                                        Drug catalog, prescriptions, and inventory management.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-amber-500" />
                                            Prescription management
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-amber-500" />
                                            Drug inventory tracking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-amber-500" />
                                            Expiry alerts
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Laboratory */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <FlaskConical className="size-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Laboratory</CardTitle>
                                    <CardDescription>
                                        Lab intake, test orders, and result management.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-purple-500" />
                                            Lab test ordering
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-purple-500" />
                                            Result recording
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-purple-500" />
                                            Lab inventory
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Nursing & Wards */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                                        <BedDouble className="size-6 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Nursing & Wards</CardTitle>
                                    <CardDescription>
                                        Admissions, ward rounds, and nursing care records.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-rose-500" />
                                            Patient admissions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-rose-500" />
                                            Ward round tracking
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-rose-500" />
                                            Nursing examinations
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Consultations */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                                        <Stethoscope className="size-6 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <CardTitle className="text-gray-900 dark:text-white">Consultations</CardTitle>
                                    <CardDescription>
                                        Clinical records, appointments, and doctor notes.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-cyan-500" />
                                            Clinical examination forms
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-cyan-500" />
                                            Appointment history
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-cyan-500" />
                                            Doctor consultation notes
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                    Why Healthcare Teams Choose AldidsCared
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                Secure & Compliant
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Role-based access control, team isolation, and audit trails keep patient data safe and compliant.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Clock className="size-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                Real-Time Dashboard
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Monitor KPIs, revenue, appointments, and stock levels at a glance with live analytics.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <ClipboardList className="size-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                Comprehensive Reports
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Generate detailed reports on sales, categories, discounts, and operations with a single click.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <Activity className="size-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                All-in-One Platform
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                From reception to billing, pharmacy to lab — manage every department from a single system.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="hidden overflow-hidden rounded-2xl shadow-2xl lg:block"
                                style={{
                                    backgroundImage: "url('/background1.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    minHeight: '400px',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div
                            className="relative overflow-hidden rounded-2xl px-6 py-16 text-center text-white sm:px-16 sm:py-20"
                            style={{
                                backgroundImage: "url('/bg.jpg')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-emerald-900/80" />
                            <div className="relative z-10">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    Ready to Transform Your Practice?
                                </h2>
                                <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
                                    Join healthcare teams who trust AldidsCared to manage their daily operations efficiently.
                                </p>
                                {!auth.user && (
                                    <Button asChild size="lg" className="gap-2 bg-white text-emerald-800 hover:bg-gray-100">
                                        <Link href={register()}>
                                            Get Started Free
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                {auth.user && (
                                    <Button asChild size="lg" className="gap-2 bg-white text-emerald-800 hover:bg-gray-100">
                                        <Link href={dashboardUrl}>
                                            Open Dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 dark:border-gray-800 dark:bg-[#161615]">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                            <div className="flex items-center gap-3">
                                <AppLogoIcon className="h-8 w-8 rounded-lg object-cover" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    AldidsCared
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Powered by{' '}
                                <a
                                    href="https://aldids.ng"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Aldids
                                </a>
                                {' '}with support from{' '}
                                <a
                                    href="https://smb.ng"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    SmartBizness
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
