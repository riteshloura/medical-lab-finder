import { Button, Input, Card, CardBody, CardFooter, Chip, Skeleton, Avatar } from "@heroui/react";
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
  Navigation,
  MapPinned,
  Loader2,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useEffect, useState } from "react";
import LabsMap from "../components/LabsMap";

function Home() {
  const [nearbyLabs, setNearbyLabs] = useState([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
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
      setIsLoadingLabs(true);
      const response = await api.get(`/labs/nearby?lat=${lat}&lng=${lng}&radius=1000`);
     
      console.log('API Response Data:', response.data);
      setNearbyLabs(response.data);
    } catch (error) {
      console.error('Error fetching nearby labs:', error);
      setLocationError("Failed to fetch nearby labs");
    } finally {
      setIsLoadingLabs(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      setIsLoadingLabs(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        getNearbyLabs(lat, lng);
      },
      (error) => {
        console.error(error);
        setLocationError("Please enable location access to find nearby labs");
        setIsLoadingLabs(false);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Redesigned */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-700">
                    Trusted by 50,000+ patients
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-4 sm:mb-6"
              >
                Your Health,{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                    Simplified
                  </span>
                  <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M0 4C50 4 50 4 100 4C150 4 150 4 200 4" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed"
              >
                Find nearby labs, compare prices, and book diagnostic tests online. 
                Get digital reports and save up to <span className="font-bold text-emerald-600">60%</span> on medical tests.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10"
              >
              <a href="#nearby-labs">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-6 sm:px-8 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all h-12 sm:h-14"
                  endContent={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  Find Labs Near You
                </Button>
              </a>
              <a href="#browse-tests">
                <Button
                  size="lg"
                  variant="bordered"
                  className="border-2 border-gray-300 font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all h-12 sm:h-14"
                  startContent={<TestTube className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  Browse Tests
                </Button>
              </a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">NABL Certified</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Verified Labs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">24 Hour Reports</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Fast Results</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">4.8 Rating</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">50K+ Reviews</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Search Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative lg:pl-8 order-1 lg:order-2"
            >
              <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 p-6 sm:p-8 border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Search for Tests
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">Find the best labs near you</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    placeholder="Search for tests or health packages..."
                    startContent={<Search className="w-5 h-5 text-gray-400" />}
                    size="lg"
                    classNames={{
                      input: "text-sm sm:text-base",
                      inputWrapper: "bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 focus-within:border-emerald-500 transition-colors h-12 sm:h-14",
                    }}
                  />
                  
                  <Input
                    placeholder="Enter your location"
                    startContent={<MapPin className="w-5 h-5 text-gray-400" />}
                    size="lg"
                    classNames={{
                      input: "text-sm sm:text-base",
                      inputWrapper: "bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 focus-within:border-emerald-500 transition-colors h-12 sm:h-14",
                    }}
                  />

                  <Button
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all h-12 sm:h-14"
                    endContent={<Search className="w-5 h-5" />}
                  >
                    Search Labs
                  </Button>
                </div>

                {/* Popular Searches */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {["CBC Test", "Thyroid", "Diabetes", "Lipid Profile"].map((tag) => (
                      <Chip
                        key={tag}
                        size="sm"
                        variant="flat"
                        className="cursor-pointer hover:bg-emerald-100 transition-colors text-xs"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Stats - Better positioned */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-12 top-16 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden 2xl:block z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 leading-none">50K+</p>
                    <p className="text-sm text-gray-500 mt-1">Happy Users</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -right-12 bottom-16 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden 2xl:block z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 leading-none">500+</p>
                    <p className="text-sm text-gray-500 mt-1">Partner Labs</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-emerald-200 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Labs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <MapPinned className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Find Labs Near You</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Nearby{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Diagnostic Labs
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {userLocation 
                ? `Found ${nearbyLabs.length} labs near your location` 
                : "Enable location access to discover labs in your area"}
            </p>
          </motion.div>

          {/* Map and Labs Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Map View</h3>
                <Chip 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<MapPin className="w-3 h-3" />}
                >
                  {nearbyLabs.length} Labs
                </Chip>
              </div>
              <LabsMap userLocation={userLocation} labs={nearbyLabs} className="h-[500px]" />
            </motion.div>

            {/* Right Column - Labs List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Lab List</h3>
                <Button
                  size="sm"
                  variant="light"
                  endContent={<ChevronRight className="w-4 h-4" />}
                  className="text-emerald-600"
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Loading State */}
              {isLoadingLabs && (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border border-gray-100">
                      <CardBody className="p-5">
                        <Skeleton className="w-3/4 h-6 rounded-lg mb-3" />
                        <Skeleton className="w-full h-4 rounded-lg mb-2" />
                        <Skeleton className="w-2/3 h-4 rounded-lg mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="w-20 h-6 rounded-full" />
                          <Skeleton className="w-20 h-6 rounded-full" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </>
              )}

              {/* Location Error State */}
              {!isLoadingLabs && locationError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gray-50 rounded-2xl"
                >
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Location Access Required</h3>
                  <p className="text-gray-500 mb-4">{locationError}</p>
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={getUserLocation}
                    startContent={<Navigation className="w-4 h-4" />}
                  >
                    Enable Location
                  </Button>
                </motion.div>
              )}

              {/* No Labs Found */}
              {!isLoadingLabs && !locationError && nearbyLabs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gray-50 rounded-2xl"
                >
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Labs Found Nearby</h3>
                  <p className="text-gray-500">We couldn't find any labs within 100km of your location.</p>
                </motion.div>
              )}

              {/* Labs List */}
              {!isLoadingLabs && !locationError && nearbyLabs.map((lab, index) => (
                <motion.div
                  key={lab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                    <CardBody className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{lab.name}</h3>
                            <p className="text-sm text-gray-500">{lab.city}, {lab.state}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">{lab.address}</p>
                      </div>

                      {lab.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{lab.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Chip size="sm" variant="flat" color="success" startContent={<Shield className="w-3 h-3" />}>
                          Verified
                        </Chip>
                        {lab.slotCapacityOnline > 0 && (
                          <Chip size="sm" variant="flat" color="primary">
                            {lab.slotCapacityOnline} slots available
                          </Chip>
                        )}
                      </div>

                      {lab.contactNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Phone className="w-4 h-4" />
                          <span>{lab.contactNumber}</span>
                        </div>
                      )}

                      <Link to={`/lab/${lab.id}`}>
                        <Button
                          fullWidth
                          className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium"
                        >
                          View Lab & Book
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Why Choose Us</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                One Place
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make diagnostic testing simple, affordable, and accessible for everyone across India.
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
                className="group"
              >
                <div className="relative h-full bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Arrow indicator */}
                    <div className="mt-6 flex items-center text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full mb-4">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">Simple Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Book Your Test in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              From search to report, we've made it incredibly simple
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200"></div>
            
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center group">
                  {/* Step Number Circle */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {item.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests - Redesigned */}
      <section id="browse-tests" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full mb-4">
                <Award className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-700">Most Booked</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                Popular{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Health Tests
                </span>
              </h2>
              <p className="text-lg text-gray-600">Get up to 60% off on these tests</p>
            </div>
            <Button
              variant="bordered"
              endContent={<ChevronRight className="w-4 h-4" />}
              className="border-2 border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50"
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
                className="group"
              >
                <div className="relative h-full bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                  {/* Discount Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {test.discount}
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                        {test.name}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <TestTube className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-emerald-600">
                      {test.price}
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      ₹{parseInt(test.price.replace('₹', '')) * 2}
                    </span>
                  </div>

                  <Button
                    fullWidth
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all"
                    endContent={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  >
                    Book Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 rounded-[2.5rem] p-12 sm:p-16 text-center text-white overflow-hidden"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Limited Time Offer</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              >
                Get 20% Off on Your
                <br />
                First Booking!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-xl text-white/90 max-w-2xl mx-auto mb-10"
              >
                Join thousands of users who are saving money and time on diagnostic tests. 
                Sign up now and start your health journey with us.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 font-bold px-10 shadow-2xl hover:scale-105 transition-transform"
                    endContent={<ArrowRight className="w-5 h-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="bordered"
                  className="border-2 border-white text-white font-bold px-10 hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 flex flex-wrap justify-center gap-8 text-white/80"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </motion.div>
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
