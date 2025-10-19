import React from 'react';
import Banner from '../../components/Banner/Banner';
import FourSteps from '../../components/FourSteps/FourSteps';
import HomeBody from '../../components/HomeBody/HomeBody';
import HomeSections from '../../components/HomeSections/HomeSections';
import { useCourses } from '../../context/CourseContext';

function Home() {
  const { nestedCourses, isLoading, isError } = useCourses();

  if (isLoading) {
    return <div>Loading courses and promotions...</div>;
  }

  if (isError) {
    return <div>Error loading data. Please try again.</div>;
  }
  return (
    <div className="font-sans antialiased bg-white">
      <Banner
        activePromotions={nestedCourses.activePromotions}
        allCourses={nestedCourses} // Pass the full nestedCourses object
      />
      <FourSteps />
      <HomeBody />
      <HomeSections />
    </div>
  );
}

export default Home;
