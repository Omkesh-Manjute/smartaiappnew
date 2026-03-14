import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { schoolDB } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronLeft,
  School,
  Check,
  X,
  Sparkles,
  Users,
  Zap,
  Building2,
  CreditCard,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/types';

interface Plan {
  key: string;
  name: string;
  maxTeachers: number;
  maxStudents: number;
  price: number;
  features: string[];
  popular?: boolean;
}

const SchoolSubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const userSchool = schoolDB.getByAdmin(user.id);
      if (userSchool) {
        setSchool(userSchool);
      }
    }
  }, [user]);

  const handleSubscribe = (planKey: string) => {
    toast.success(`Subscribed to ${SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS].name} plan!`);
    // In a real app, this would redirect to a payment gateway
  };

  const plans: Plan[] = [
    { key: 'free', ...SUBSCRIPTION_PLANS.free, popular: false },
    { key: 'basic', ...SUBSCRIPTION_PLANS.basic, popular: false },
    { key: 'premium', ...SUBSCRIPTION_PLANS.premium, popular: true },
    { key: 'enterprise', ...SUBSCRIPTION_PLANS.enterprise, popular: false },
  ];

  const features = [
    'Unlimited Tests',
    'All Subjects',
    'Basic Analytics',
    'AI Tutor',
    'Voice Practice',
    'Advanced Analytics',
    'Parent Dashboard',
    'Custom Features',
    'Priority Support',
    'White Label',
  ];

  const getPlanFeatures = (planKey: string) => {
    switch (planKey) {
      case 'free':
        return [true, true, false, false, false, false, false, false, false, false];
      case 'basic':
        return [true, true, true, false, false, false, false, false, false, false];
      case 'premium':
        return [true, true, true, true, true, true, true, false, false, false];
      case 'enterprise':
        return [true, true, true, true, true, true, true, true, true, true];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <School className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold">School Subscription</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {school && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{school.name}</h2>
                    <p className="text-white/80">Current Plan: {school.subscription?.plan || 'Free'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-gray-500">Unlock the full potential of Smart Learning for your school</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full ${plan.popular ? 'border-2 border-purple-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Up to {plan.maxTeachers} teachers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span>Up to {plan.maxStudents} students</span>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.key)}
                      className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      variant={plan.key === 'free' ? 'outline' : 'default'}
                    >
                      {plan.key === 'free' ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.key} className="text-center py-3 px-4">{plan.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{feature}</td>
                      {plans.map((plan) => (
                        <td key={plan.key} className="text-center py-3 px-4">
                          {getPlanFeatures(plan.key)[index] ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Contact Sales */}
        <Card className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Need a custom plan?</h3>
                <p className="text-gray-400">Contact our sales team for enterprise solutions</p>
              </div>
              <Button variant="secondary">
                <CreditCard className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SchoolSubscriptionPage;
