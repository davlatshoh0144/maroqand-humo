'use client';

import { motion } from 'framer-motion';
import { Hero } from './hero';
import { WhyUs } from './why-us';
import { PartnerLogos } from './partner-logos';
import { CourseTracks } from './course-tracks';
import { FreePreview } from './free-preview';
import { StudentOutcomes } from './student-outcomes';
import { Testimonials } from './testimonials';
import { CareerOutcomes } from './career-outcomes';
import { Instructors } from './instructors';
import { Pricing } from './pricing';
import { FAQ } from './faq';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const sectionTransition = {
  duration: 0.6,
  ease: 'easeOut' as const,
};

const sectionViewport = {
  once: true,
  margin: '-100px' as const,
};

export function LandingPage() {
  return (
    <main>
      <Hero />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0 }}
      >
        <WhyUs />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.05 }}
      >
        <PartnerLogos />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.1 }}
      >
        <CourseTracks />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.1 }}
      >
        <FreePreview />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0 }}
      >
        <StudentOutcomes />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.05 }}
      >
        <Testimonials />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0 }}
      >
        <CareerOutcomes />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.1 }}
      >
        <Instructors />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0 }}
      >
        <Pricing />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        transition={{ ...sectionTransition, delay: 0.1 }}
      >
        <FAQ />
      </motion.div>
    </main>
  );
}
