import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsSection from '../components/landing/StatsSection';
import PopularCourses from '../components/landing/PopularCourses';
import CategoriesSection from '../components/landing/CategoriesSection';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import HowItWorks from '../components/landing/HowItWorks';
import InstructorsSection from '../components/landing/InstructorsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import CoursePreviewModal from '../components/landing/CoursePreviewModal';
import LiveNotificationToast from '../components/landing/LiveNotificationToast';
import BackToTop from '../components/landing/BackToTop';
import toast from 'react-hot-toast';

const LandingPage = () => {
  // Modal states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Search query propagated to Courses section
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handlers
  const handleOpenAuth = (tab = 'login') => {
    navigate(`/${tab}`);
  };

  const handlePreviewCourse = (course) => {
    setSelectedCourse(course);
    setIsPreviewOpen(true);
  };

  const handleEnrollCourse = (course) => {
    setSelectedCourse(course);
    // Direct to Auth modal or simulated checkout
    navigate('/signup');
    toast.success(`Selected "${course.title}". Create an account to complete enrollment!`);
  };

  const handleCategorySelect = (categoryId) => {
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* Fixed Sticky Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onSearchClick={() => {
          const el = document.getElementById('courses');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onStartLearning={() => handleOpenAuth('signup')}
          onQuickSearch={handleQuickSearch}
        />

        <StatsSection />

        <PopularCourses
          onPreviewCourse={handlePreviewCourse}
          onEnrollCourse={handleEnrollCourse}
          externalSearchQuery={searchQuery}
        />

        <CategoriesSection onSelectCategory={handleCategorySelect} />

        <WhyChooseUs />

        <HowItWorks onStartAction={() => handleOpenAuth('signup')} />

        <InstructorsSection
          onExploreInstructor={(id) => {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <TestimonialsSection />

        <FAQSection />

        <CTASection
          onExploreClick={() => {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onCreateAccount={() => handleOpenAuth('signup')}
        />
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Modals & Overlays */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEnroll={(course) => {
          setIsPreviewOpen(false);
          handleEnrollCourse(course);
        }}
      />

      <LiveNotificationToast />
      <BackToTop />

    </div>
  );
};

export default LandingPage;
