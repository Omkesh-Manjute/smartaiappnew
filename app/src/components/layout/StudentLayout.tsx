import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    BookOpen,
    LayoutDashboard,
    GraduationCap,
    FileText,
    Users,
    Swords,
    Bot,
    Mic,
    Brain,
    Calendar,
    Trophy,
    Bell,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Mail,
    Phone,
    MapPin,
    Github,
    Twitter,
    Linkedin,
    Heart,
    ClipboardList,
    User,
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Subjects', path: '/student/subjects', icon: GraduationCap },
    { label: 'Tests', path: '/student/tests', icon: FileText },
    { label: 'Homework', path: '/student/homework', icon: ClipboardList },
    { label: 'Groups', path: '/student/groups', icon: Users },
    { label: 'Battle', path: '/student/battle', icon: Swords },
    { label: 'AI Tutor', path: '/student/tutor', icon: Bot },
    { label: 'Voice Lab', path: '/student/voice', icon: Mic },
    { label: 'Brain Map', path: '/student/heatmap', icon: Brain },
    { label: 'Planner', path: '/student/planner', icon: Calendar },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
];

const FOOTER_LINKS = {
    Platform: [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'AI Tutor', path: '/student/tutor' },
        { label: 'Battle Mode', path: '/student/battle' },
        { label: 'Voice Practice', path: '/student/voice' },
    ],
    Learning: [
        { label: 'Subjects', path: '/student/subjects' },
        { label: 'Tests', path: '/student/tests' },
        { label: 'Brain Map', path: '/student/heatmap' },
        { label: 'Study Planner', path: '/student/planner' },
    ],
    Community: [
        { label: 'Leaderboard', path: '/student/leaderboard' },
        { label: 'Groups', path: '/student/groups' },
        { label: 'Profile', path: '/student/profile' },
    ],
};

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            {/* ─── HEADER ─── */}
            <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate('/student/dashboard')}
                        >
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-lg font-bold gradient-text">Smart Learning</p>
                                <p className="text-[10px] text-gray-400 -mt-1 tracking-wider uppercase">AI Education Platform</p>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {NAV_ITEMS.slice(0, 7).map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}

                            {/* More dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all">
                                    More
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                                    {NAV_ITEMS.slice(7).map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.path}
                                                onClick={() => navigate(item.path)}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isActive(item.path)
                                                    ? 'text-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <button
                                onClick={() => navigate('/student/notifications')}
                                className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdown(!profileDropdown)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    <Avatar className="w-8 h-8 ring-2 ring-blue-100">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                                            {user?.name?.[0] ?? 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-[10px] text-gray-400">Student</p>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
                                </button>

                                <AnimatePresence>
                                    {profileDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={() => { navigate('/student/profile'); setProfileDropdown(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                            >
                                                <User className="w-4 h-4" />
                                                My Profile
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden overflow-hidden border-t border-gray-100 bg-white"
                        >
                            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                                {NAV_ITEMS.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                navigate(item.path);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ─── PAGE CONTENT ─── */}
            <main className="flex-grow w-full shrink-0">
                <Outlet />
            </main>

            {/* ─── FOOTER ─── */}
            <footer className="bg-gray-900 text-gray-300 mt-auto shrink-0 relative z-10 w-full">
                {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">Smart Learning</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                AI-powered education platform helping students learn smarter with personalized tutoring, battle quizzes, and voice practice.
                            </p>
                            <div className="flex gap-3">
                                {[Twitter, Github, Linkedin].map((Icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns */}
                        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                            <div key={title}>
                                <h4 className="text-white font-semibold mb-4">{title}</h4>
                                <ul className="space-y-2.5">
                                    {links.map((link) => (
                                        <li key={link.path}>
                                            <button
                                                onClick={() => navigate(link.path)}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    support@smartlearning.edu
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    +91 98765 43210
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    India
                                </span>
                            </div>
                            <p className="inline-flex items-center gap-1">
                                Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Smart Learning © {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Click-outside overlay for profile dropdown */}
            {profileDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdown(false)}
                />
            )}
        </div>
    );
};

export default StudentLayout;
