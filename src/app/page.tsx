'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Process } from '@/components/landing/Process';
import { AntiError } from '@/components/landing/AntiError';
import { MainCTA, Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Process />
      <AntiError />
      <MainCTA />
      <Footer />
    </>
  );
}
