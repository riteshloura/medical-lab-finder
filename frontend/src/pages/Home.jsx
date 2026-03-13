import { Button, Input, Card, CardBody, CardFooter, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Calendar,
  FileText,
  Star,
  Clock,
  Shield,
  TrendingDown,
  Users,
  Building2,
  TestTube,
  ChevronRight,
  Phone,
  Mail,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useEffect } from "react";

function Home() {
  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Find Nearby Labs",
      description:
        "Discover verified diagnostic labs near your location with real-time availability.",
      color: "bg-emerald-500",
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: "Compare Prices",
      description:
        "Compare test prices across multiple labs and save up to 60% on medical tests.",
      color: "bg-green-500",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Easy Booking",
      description:
        "Book your preferred time slot online with instant confirmation.",
      color: "bg-teal-500",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Digital Reports",
      description:
        "Access your test reports digitally without visiting the lab again.",
      color: "bg-cyan-500",
    },
  ];

  const stats = [
    { value: "500+", label: "Partner Labs", icon: <Building2 /> },
    { value: "1000+", label: "Tests Available", icon: <TestTube /> },
    { value: "50K+", label: "Happy Users", icon: <Users /> },
    { value: "4.8", label: "User Rating", icon: <Star /> },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Search Tests",
      description: "Enter the test name or browse categories",
    },
    {
      step: "02",
      title: "Compare Labs",
      description: "View prices, ratings & distance of nearby labs",
    },
    {
      step: "03",
      title: "Book Slot",
      description: "Choose your preferred date and time",
    },
    {
      step: "04",
      title: "Get Reports",
      description: "Receive digital reports on the app",
    },
  ];

  const popularTests = [
    { name: "Complete Blood Count (CBC)", price: "₹299", discount: "40% off" },
    { name: "Lipid Profile", price: "₹399", discount: "35% off" },
    { name: "Thyroid Profile (T3, T4, TSH)", price: "₹449", discount: "50% off" },
    { name: "HbA1c (Glycated Hemoglobin)", price: "₹349", discount: "30% off" },
    { name: "Liver Function Test (LFT)", price: "₹499", discount: "45% off" },
    { name: "Kidney Function Test (KFT)", price: "₹549", discount: "40% off" },
  ];

//   const getLab = async () => {
//     const response = await api.get("/labs");
//     const data = await response.data;
//     console.log(data);
//   };

//   useEffect(() => {
//     getLab();
//   }, []);

    const getNearbyLabs = async (lat, lng) => {
  try {
    const response = await api.get(`/labs/nearby?lat=${lat}&lng=${lng}&radius=10`);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

const getUserLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      getNearbyLabs(lat, lng);
    },
    (error) => {
      console.error(error);
    }
  );
};

useEffect(() => {
  getUserLocation();
}, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chip
                color="primary"
                variant="flat"
                className="mb-6"
                startContent={<Heart className="w-4 h-4" />}
              >
                Trusted by 50,000+ patients across India
              </Chip>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Find Affordable{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Medical Labs
              </span>
              <br />
              Near You
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Compare prices, book appointments, and get your reports digitally.
              Save up to 60% on diagnostic tests.
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 max-w-3xl mx-auto"
            >
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-emerald-500/10 border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for tests, labs, or health packages..."
                      startContent={<Search className="w-5 h-5 text-gray-400" />}
                      size="lg"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "bg-gray-50 border-none shadow-none",
                      }}
                    />
                  </div>
                  <div className="flex-1 sm:max-w-[200px]">
                    <Input
                      placeholder="Enter location"
                      startContent={<MapPin className="w-5 h-5 text-gray-400" />}
                      size="lg"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "bg-gray-50 border-none shadow-none",
                      }}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 shadow-lg shadow-emerald-500/30"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>NABL Accredited Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                <span>Reports in 24 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>4.8/5 User Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="text-4xl sm:text-5xl font-bold">{stat.value}</div>
                <div className="mt-2 text-emerald-100 flex items-center justify-center gap-2">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                LabLocator?
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We make diagnostic testing simple, affordable, and accessible for everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
                  <CardBody className="p-6">
                    <div
                      className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Book your diagnostic test in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-emerald-500/30">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-emerald-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Popular{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Tests
                </span>
              </h2>
              <p className="mt-2 text-gray-600">Most booked tests by our users</p>
            </div>
            <Button
              variant="light"
              endContent={<ChevronRight className="w-4 h-4" />}
              className="text-emerald-600 hidden sm:flex"
            >
              View All Tests
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTests.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                  <CardBody className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-2xl font-bold text-emerald-600">
                            {test.price}
                          </span>
                          <Chip size="sm" color="success" variant="flat">
                            {test.discount}
                          </Chip>
                        </div>
                      </div>
                      <TestTube className="w-8 h-8 text-emerald-200" />
                    </div>
                  </CardBody>
                  <CardFooter className="pt-0 px-5 pb-5">
                    <Button
                      fullWidth
                      variant="flat"
                      color="primary"
                      className="font-medium"
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to Save on Your Medical Tests?
              </h2>
              <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
                Join thousands of users who are saving money and time on diagnostic tests.
                Sign up now and get 20% off on your first booking!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 font-semibold px-8 shadow-lg"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="bordered"
                  className="border-white text-white font-semibold px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <TestTube className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">LabLocator</span>
              </div>
              <p className="text-gray-400">
                Making diagnostic testing simple, affordable, and accessible for everyone in India.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Find Labs</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Browse Tests</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Health Packages</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Partner with Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Feedback</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2026 LabLocator. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
