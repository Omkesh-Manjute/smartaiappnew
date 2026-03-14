import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Bot,
    Swords,
    Mic,
    Brain,
    Trophy,
    ArrowRight,
    CheckCircle,
    Star,
    Sparkles,
    GraduationCap,
    Users,
    Mail,
    Phone,
    MapPin,
    Github,
    Twitter,
    Linkedin,
    Heart,
    ChevronRight,
    Zap,
    Shield,
    Globe,
} from 'lucide-react';

const FEATURES = [
    {
        icon: Bot,
        title: 'AI Tutor',
        desc: 'Get personalized explanations in 4 learning modes — Simple, Teacher, Exam Prep & Quiz.',
        color: 'from-purple-500 to-indigo-600',
    },
    {
        icon: Swords,
        title: 'Battle Mode',
        desc: 'Challenge friends or AI opponents in real-time quiz battles. Earn XP & climb ranks.',
        color: 'from-red-500 to-orange-500',
    },
    {
        icon: Mic,
        title: 'Voice Practice Lab',
        desc: 'Improve pronunciation with AI-powered speech analysis, WPM tracking & voice comparison.',
        color: 'from-emerald-500 to-cyan-500',
    },
    {
        icon: Brain,
        title: 'Brain Map',
        desc: 'Visualize your strengths and weaknesses with smart subject mastery heatmaps.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Trophy,
        title: 'Gamification',
        desc: 'Earn XP, unlock badges, maintain streaks — learning feels like a game.',
        color: 'from-amber-500 to-yellow-500',
    },
    {
        icon: GraduationCap,
        title: 'Smart Tests',
        desc: 'AI-generated tests with instant grading, detailed analytics & performance tracking.',
        color: 'from-blue-500 to-cyan-500',
    },
];

const STATS = [
    { value: '10K+', label: 'Students', icon: Users },
    { value: '500+', label: 'Courses', icon: BookOpen },
    { value: '98%', label: 'Satisfaction', icon: Star },
    { value: '24/7', label: 'AI Support', icon: Zap },
];

const TESTIMONIALS = [
    {
        text: 'Smart Learning transformed how I study. The AI Tutor explains things better than any textbook!',
        name: 'Priya Sharma',
        role: 'Class 10 Student',
        rating: 5,
    },
    {
        text: 'Battle Mode makes studying so fun. I compete with friends daily and my scores have improved by 40%.',
        name: 'Rahul Kumar',
        role: 'Class 12 Student',
        rating: 5,
    },
    {
        text: 'As a teacher, the analytics dashboard helps me understand each student\'s progress perfectly.',
        name: 'Dr. Anjali Mehta',
        role: 'Physics Teacher',
        rating: 5,
    },
];

const PRICING = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        features: ['Basic Subjects', '5 Tests/Month', 'Leaderboard Access', 'Community Groups'],
        cta: 'Get Started Free',
        gradient: 'from-gray-600 to-gray-700',
        popular: false,
    },
    {
        name: 'Pro',
        price: '₹299',
        period: '/month',
        features: [
            'All Subjects',
            'Unlimited Tests',
            'AI Tutor (All Modes)',
            'Battle Mode',
            'Voice Practice Lab',
            'Brain Map',
            'Priority Support',
        ],
        cta: 'Start Pro Trial',
        gradient: 'from-blue-600 to-purple-600',
        popular: true,
    },
    {
        name: 'School',
        price: '₹999',
        period: '/month',
        features: [
            'Everything in Pro',
            'Teacher Dashboard',
            'Admin Panel',
            'Parent Portal',
            'Custom Branding',
            'Dedicated Support',
        ],
        cta: 'Contact Sales',
        gradient: 'from-emerald-600 to-cyan-600',
        popular: false,
    },
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* ─── NAVBAR ─── */}
            <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Smart Learning</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
                            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-medium">
                                Sign In
                            </Button>
                            <Button onClick={() => navigate('/register')} className="gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float-delay" />
                    <div className="absolute top-40 right-1/4 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4" />
                                AI-Powered Learning Platform
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                Learn & Grow With
                                <br />
                                <span className="gradient-text">Smart AI</span> Education
                            </h1>

                            <p className="text-lg text-gray-600 max-w-lg mb-8 leading-relaxed">
                                Discover top courses, upgrade your skills with AI-powered tutoring, battle quizzes, and voice practice. Learn from experts at your own pace.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/register')}
                                    className="gradient-primary text-white h-12 px-8 text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                                >
                                    Explore Courses
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    className="h-12 px-8 text-base"
                                >
                                    Contact Us
                                </Button>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>Secure & Private</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    <span>Learn Anywhere</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span>AI Powered</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Image / Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                                    alt="Students learning together"
                                    className="w-full h-[450px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
                            </div>

                            {/* Floating cards */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-4 border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">40+ Courses</p>
                                        <p className="text-xs text-gray-500">Expert Teachers</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">10K+ Students</p>
                                        <p className="text-xs text-gray-500">Already Enrolled</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── STATS BAR ─── */}
            <section className="bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {STATS.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <Icon className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                                    <p className="text-3xl font-black gradient-text">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Why Choose Us</p>
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Our Core <span className="gradient-text">Features</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Everything you need for a world-class learning experience, powered by cutting-edge AI technology.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 card-hover"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Testimonials</p>
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Kind Words From Our <span className="gradient-text">Students</span>
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-6 border border-gray-100 card-hover"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── PRICING ─── */}
            <section id="pricing" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Pricing Plans</p>
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            Choose Your <span className="gradient-text">Plan</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Start free and upgrade as you grow. All plans include core learning features.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {PRICING.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative bg-white rounded-2xl p-6 border-2 card-hover ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-100'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-white text-xs font-semibold shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <div className="flex items-end gap-1 mb-5">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    <span className="text-sm text-gray-500 mb-1">{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={() => navigate('/register')}
                                    className={`w-full h-11 ${plan.popular
                                            ? 'gradient-primary text-white shadow-lg shadow-blue-500/25'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="gradient-primary rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
                            <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
                        </div>
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to Start Learning?</h2>
                            <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                                Join thousands of students who are already learning smarter with AI.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/register')}
                                    className="bg-white text-blue-600 hover:bg-white/90 h-12 px-8 text-base font-semibold shadow-xl"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base"
                                >
                                    Sign In
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="bg-gray-900 text-gray-300">
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
                                AI-powered education platform making learning interactive, personalized, and fun.
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

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    support@smartlearning.edu
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    +91 98765 43210
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    India
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                        <p className="flex items-center gap-1">
                            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Smart Learning © {new Date().getFullYear()}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
