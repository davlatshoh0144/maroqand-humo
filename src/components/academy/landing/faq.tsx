'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is this beginner friendly?',
    answer:
      'Absolutely. Our courses start from the very basics — no prior dispatch or trucking experience is required. We explain every concept from scratch and build up gradually. The Dispatch Fundamentals course is specifically designed for complete beginners.',
  },
  {
    question: 'Do I need trucking experience?',
    answer:
      'No. Our training is designed for people entering the industry from scratch. The courses introduce USA truck dispatch concepts, terminology, workflows, and practice scenarios from the ground up.',
  },
  {
    question: 'Are certificates real?',
    answer:
      'Yes. Certificates issued by Marokand Humo Academy are digital course-completion records. Each certificate has a credential ID that can be verified on our platform. Employer acceptance is up to each employer.',
  },
  {
    question: 'Is this connected to DAT/Samsara/Gmail?',
    answer:
      'No. Marokand Humo Academy is an independent training platform. We are not affiliated with, endorsed by, or connected to DAT, Samsara, Gmail, FMCSA, DOT, or any other third-party service. Our courses teach concepts and skills relevant to these tools, but all exercises use simulated scenarios — not live systems.',
  },
  {
    question: 'Is this live dispatch software?',
    answer:
      'No. Marokand Humo Academy is training software only. We provide practice assignments, case studies, broker email exercises, load evaluation worksheets, and fleet visibility lessons — all in a safe learning environment. This is not live dispatch software and should not be used for real freight operations.',
  },
  {
    question: 'Is Marokand Humo Academy affiliated with any government agency?',
    answer:
      'No. We are a private education company and are not affiliated with or endorsed by FMCSA, DOT, or any government agency. Our courses teach relevant regulations and compliance concepts for educational purposes only.',
  },
    {
    question: 'How long does training take?',
    answer:
      'It depends on your pace and the plan you choose. Individual courses range from 6 to 12 hours of content, and learners can study part-time on their own schedule. Career Track assignments and feedback may take longer depending on how much practice you do.',
  },
];

export function FAQ() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Everything you need to know before getting started
          </p>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
              >
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
