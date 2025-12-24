import { useState } from 'react';
import React from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import I_Routes from '../routes/I_Routes';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <section className='lg:pt-[120px] md:pt-[100px] sm:pt-[72px] pt-[72px]'>
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      </section>
      <section className={`px-3 sm:px-4 md:px-6 lg:px-8 flex-grow transition-all duration-300 
        ${isOpen ? 'lg:ml-64 hidden lg:block' : 'ml-0'}`}>
        <I_Routes isOpen={isOpen} />
      </section>
      <section className="mt-auto">
        <Footer />
      </section>
    </main>
  );
};

export default Home;