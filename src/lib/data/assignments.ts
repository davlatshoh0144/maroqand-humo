import { Assignment } from '@/lib/types';

export const assignments: Assignment[] = [
  {
    id: 'assign-001',
    courseId: 'course-2',
    title: 'Broker Email Writing Exercise',
    description: 'Write a professional email to a broker responding to a load posting.',
    scenario:
      'You receive the following load posting from a broker at Great Lakes Brokerage:\n\nOrigin: Atlanta, GA\nDestination: Miami, FL\nMiles: 665\nRate: $1,800\nEquipment: Dry Van\nWeight: 44,000 lbs\nCommodity: Building Materials\nPickup: January 6th\nDelivery: January 7th\n\nThe broker is Tom Brown, known for being brief and to the point. Write a professional email responding to this posting. You want to accept the load but negotiate the rate to $2,100 based on current market rates for this lane. Include all necessary details and maintain a professional tone even though the broker tends to be curt.',
    rubric: [
      {
        criterion: 'Professional Tone',
        weight: 25,
        description: 'Email maintains a professional, respectful tone appropriate for broker communication.',
      },
      {
        criterion: 'Rate Negotiation',
        weight: 35,
        description: 'Rate negotiation is clear, justified with market data, and presented as a collaborative discussion rather than a demand.',
      },
      {
        criterion: 'Completeness',
        weight: 25,
        description: 'All relevant load details are confirmed or clarified (pickup time, delivery window, equipment, weight, commodity).',
      },
      {
        criterion: 'Structure & Clarity',
        weight: 15,
        description: 'Email is well-organized, easy to read, and follows professional email conventions.',
      },
    ],
    type: 'email',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-002',
    courseId: 'course-3',
    title: 'Load Calculation Homework',
    description: 'Calculate profitability for three different loads.',
    scenario:
      'You have a driver available in Memphis, TN. Your cost per mile is $2.20 (including driver pay, fuel, insurance, and truck payment). Analyze the following three loads and determine which is most profitable:\n\nLoad A: Memphis, TN to Dallas, TX — 450 miles, $1,575, 30 miles deadhead\nLoad B: Memphis, TN to Nashville, TN — 210 miles, $650, 15 miles deadhead\nLoad C: Memphis, TN to Atlanta, GA — 380 miles, $1,250, 50 miles deadhead\n\nFor each load, calculate: total miles (including deadhead), RPM, gross profit, and profit margin percentage. Then recommend which load to take and explain your reasoning, including backhaul potential.',
    rubric: [
      {
        criterion: 'Calculation Accuracy',
        weight: 40,
        description: 'All RPM, profit, and margin calculations are correct.',
      },
      {
        criterion: 'Analysis Depth',
        weight: 30,
        description: 'Analysis considers deadhead, backhaul potential, and overall profitability, not just the highest rate.',
      },
      {
        criterion: 'Recommendation Quality',
        weight: 30,
        description: 'Final recommendation is well-reasoned and supported by the calculations and analysis.',
      },
    ],
    type: 'calculation',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-003',
    courseId: 'course-6',
    title: 'Rate Confirmation Review',
    description: 'Review a rate confirmation for errors and discrepancies.',
    scenario:
      'You verbally agreed with broker Mike Johnson at Midwest Freight Partners on the following terms:\n- Chicago, IL to Dallas, TX\n- $2,750 flat rate\n- Dry van, 42,000 lbs\n- Pickup: Jan 5, 6:00 AM\n- Delivery: Jan 7, by 5:00 PM\n- Commodity: Consumer Electronics\n- TONU: $250\n\nHowever, the rate confirmation you received shows:\n- Origin: Chicago, IL 60601 ✓\n- Destination: Dallas, TX 75201 ✓\n- Rate: $2,500 ✗\n- Equipment: Flatbed ✗\n- Weight: 44,000 lbs ✗\n- Pickup: Jan 5, 8:00 AM ✗\n- Delivery: Jan 7, by 12:00 PM ✗\n- TONU: Not listed ✗\n- Commodity: General Merchandise ✗\n\nReview the rate confirmation and identify all discrepancies. Write an email to the broker listing each discrepancy and requesting a corrected rate confirmation.',
    rubric: [
      {
        criterion: 'Discrepancy Identification',
        weight: 40,
        description: 'All 7 discrepancies are correctly identified and documented.',
      },
      {
        criterion: 'Professional Communication',
        weight: 30,
        description: 'The email requesting corrections is professional, clear, and specific about each discrepancy.',
      },
      {
        criterion: 'Thoroughness',
        weight: 30,
        description: 'Review covers all fields on the rate confirmation, not just obvious errors. Missing items (TONU) are flagged.',
      },
    ],
    type: 'review',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-004',
    courseId: 'course-4',
    title: 'HOS Compliance Worksheet',
    description: 'Calculate driver availability and plan compliant schedules.',
    scenario:
      'Driver Robert Chen started his 70-hour/8-day period on Monday. Here is his log for the past 7 days:\n\nMonday: 10 hours on-duty (8 driving, 2 on-duty not driving)\nTuesday: 11 hours on-duty (9 driving, 2 on-duty not driving)\nWednesday: 12 hours on-duty (10 driving, 2 on-duty not driving)\nThursday: OFF DUTY (0 hours)\nFriday: 9 hours on-duty (7 driving, 2 on-duty not driving)\nSaturday: 10 hours on-duty (8 driving, 2 on-duty not driving)\nSunday: 8 hours on-duty (6 driving, 2 on-duty not driving)\n\nQuestions:\n1. How many total on-duty hours has Robert used in the 8-day period?\n2. How many hours does he have remaining in his 70-hour clock?\n3. Can Robert accept a load that requires 11 hours of driving tomorrow? Why or why not?\n4. If Robert takes a 34-hour reset starting tonight at 8:00 PM, when can he start driving again and with how many hours?',
    rubric: [
      {
        criterion: '70-Hour Calculation',
        weight: 30,
        description: 'Total on-duty hours are correctly calculated from the 7-day log.',
      },
      {
        criterion: 'Remaining Hours',
        weight: 25,
        description: 'Available hours remaining are correctly determined.',
      },
      {
        criterion: 'Load Acceptance Decision',
        weight: 25,
        description: 'Decision is correct and properly justified with HOS rules.',
      },
      {
        criterion: 'Reset Calculation',
        weight: 20,
        description: '34-hour reset timing and resulting available hours are correctly calculated.',
      },
    ],
    type: 'calculation',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-005',
    courseId: 'course-6',
    title: 'Document Checklist for Load Dispatch',
    description: 'Create a complete document checklist for dispatching a load.',
    scenario:
      'You are dispatching a driver on a full load from Houston, TX to New Orleans, LA. The load involves:\n- Flatbed equipment with steel coils\n- Broker: Gulf States Carrier\n- Rate: $1,350\n- Pickup: January 4th\n- Delivery: January 5th\n- Lumper may be needed at delivery\n- Broker requires proof of insurance before pickup\n\nCreate a comprehensive document checklist that the dispatcher should prepare and verify before, during, and after the load. Include all documents from initial rate confirmation to final invoicing. For each document, note when it should be prepared/collected and who is responsible.',
    rubric: [
      {
        criterion: 'Completeness',
        weight: 40,
        description: 'All required documents are included — rate confirmation, BOL, POD, insurance, lumper receipt, etc.',
      },
      {
        criterion: 'Timing & Responsibility',
        weight: 30,
        description: 'Each document has clear timing (before/during/after) and responsible party identified.',
      },
      {
        criterion: 'Flatbed-Specific Items',
        weight: 30,
        description: 'Flatbed-specific requirements (coil racks, tarps, securement certification) are included.',
      },
    ],
    type: 'checklist',
    difficulty: 'beginner',
  },
  {
    id: 'assign-006',
    courseId: 'course-2',
    title: 'Late Truck Scenario',
    description: 'Handle a situation where your truck will be late to delivery.',
    scenario:
      'Your driver James Wilson (TRK-1001) is currently hauling electronics from Chicago to Dallas. He was supposed to deliver at 5:00 PM today, but he just called you — he\'s stuck in a traffic jam outside Little Rock, AR due to a major accident on I-40. His GPS now shows an ETA of 9:00 PM, which is 4 hours late.\n\nThe broker is Mike Johnson at Midwest Freight Partners. The receiver (XYZ Distribution) closes at 7:00 PM and does not have after-hours receiving.\n\nWrite a detailed action plan: (1) What do you tell the broker? (2) What do you tell the receiver? (3) What do you tell the driver? (4) What are your options for resolving the delivery timing issue? Draft the email to the broker.',
    rubric: [
      {
        criterion: 'Proactive Communication',
        weight: 30,
        description: 'Communication plan demonstrates "communicate early, communicate often" principle.',
      },
      {
        criterion: 'Solution Quality',
        weight: 35,
        description: 'Proposed solutions are practical and address the receiver\'s operating hours constraint.',
      },
      {
        criterion: 'Broker Email Quality',
        weight: 35,
        description: 'Email to broker is professional, factual (no blame), and includes a proposed solution.',
      },
    ],
    type: 'scenario',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-007',
    courseId: 'course-2',
    title: 'Angry Broker Scenario',
    description: 'De-escalate a heated conversation with an upset broker.',
    scenario:
      'Broker Tom Brown from Great Lakes Brokerage just called your office yelling. His exact words: "Your driver was 3 hours late to pickup and the shipper is furious! They\'re charging us a $500 late fee and I\'m deducting it from your pay! This is the second time your company has been late this month. I should pull all my freight from you!"\n\nYour driver was late because the previous delivery ran over by 2 hours (not your driver\'s fault — the receiver was slow unloading) and there was road construction adding another hour.\n\nWrite your response strategy: (1) What do you say in the moment to de-escalate? (2) How do you address the $500 late fee deduction? (3) How do you retain this broker relationship? (4) What systemic changes do you propose to prevent future issues?',
    rubric: [
      {
        criterion: 'De-escalation Technique',
        weight: 30,
        description: 'Initial response uses proper de-escalation — acknowledges frustration, stays calm, doesn\'t get defensive.',
      },
      {
        criterion: 'Fee Dispute Handling',
        weight: 30,
        description: 'Response to the $500 deduction is professional, references the rate confirmation terms, and protects carrier interests.',
      },
      {
        criterion: 'Relationship Retention',
        weight: 20,
        description: 'Strategy includes concrete steps to rebuild trust and maintain the business relationship.',
      },
      {
        criterion: 'Prevention Plan',
        weight: 20,
        description: 'Systemic improvements are practical and address the root cause.',
      },
    ],
    type: 'scenario',
    difficulty: 'advanced',
  },
  {
    id: 'assign-008',
    courseId: 'course-8',
    title: 'Overweight Load Scenario',
    description: 'Handle a load that exceeds legal weight limits at the scale.',
    scenario:
      'Your driver Carlos Hernandez just crossed the Arkansas scale on I-40 and was flagged at 82,500 lbs — 2,500 lbs over the 80,000 lb federal limit. The scale master gave him a violation notice and told him he cannot continue until the weight is reduced.\n\nThe load was booked as 44,000 lbs on a van from Memphis to Nashville. The BOL shows 44,000 lbs. The driver says the shipper loaded more than the BOL stated.\n\nCreate an action plan: (1) Immediate steps for the driver at the scale. (2) How to communicate with the broker and shipper. (3) How to resolve the overweight issue. (4) How to prevent this from happening again. (5) Who pays for any additional costs incurred?',
    rubric: [
      {
        criterion: 'Immediate Response',
        weight: 25,
        description: 'Driver instructions are clear, legal, and prioritize safety and compliance.',
      },
      {
        criterion: 'Stakeholder Communication',
        weight: 25,
        description: 'Communication plan addresses broker, shipper, and driver with appropriate messages for each.',
      },
      {
        criterion: 'Resolution Strategy',
        weight: 25,
        description: 'Practical plan to reduce weight or re-book the load legally.',
      },
      {
        criterion: 'Prevention & Accountability',
        weight: 25,
        description: 'Prevention measures address root cause. Cost accountability is clearly assigned based on industry standards.',
      },
    ],
    type: 'scenario',
    difficulty: 'advanced',
  },
  {
    id: 'assign-009',
    courseId: 'course-2',
    title: 'Missed Appointment Scenario',
    description: 'Manage a missed delivery appointment and minimize impact.',
    scenario:
      'Your driver Sarah Thompson was scheduled to deliver steel beams in Pittsburgh at 10:00 AM. At 9:30 AM, she calls to report that her truck has a flat tire on I-70 near Breezewood, PA — about 90 miles from the delivery point. Roadside assistance says it will take 2-3 hours to get a service truck to her location.\n\nThe receiver (Pittsburgh Steel Works) needs these beams for a construction project starting tomorrow morning. Missing delivery today means the project is delayed, and the broker (Badger State Freight) has already warned that penalties may apply.\n\nDevelop a comprehensive response plan including: (1) Immediate communication to all parties. (2) Options for meeting the delivery need (can another truck relay the load?). (3) Managing the broker\'s expectations about penalties. (4) Supporting your stranded driver. (5) Follow-up actions after resolution.',
    rubric: [
      {
        criterion: 'Communication Speed & Quality',
        weight: 25,
        description: 'All stakeholders are notified immediately with accurate, solution-oriented information.',
      },
      {
        criterion: 'Creative Problem Solving',
        weight: 30,
        description: 'Explores multiple options (relay, next-day delivery, partial solutions) rather than just reporting the problem.',
      },
      {
        criterion: 'Driver Support',
        weight: 20,
        description: 'Plan includes care for the stranded driver\'s safety and HOS situation.',
      },
      {
        criterion: 'Post-Incident Follow-up',
        weight: 25,
        description: 'Follow-up plan addresses documentation, billing, relationship repair, and prevention.',
      },
    ],
    type: 'scenario',
    difficulty: 'advanced',
  },
  {
    id: 'assign-010',
    courseId: 'course-11',
    title: 'Appointment Delay Scenario',
    description: 'Handle a late-arrival risk on an Amazon-style freight appointment.',
    scenario:
      'Your driver is 55 miles from pickup for an Amazon-style freight load with a 2:00 PM appointment. A crash has slowed the route and the new ETA is 2:35 PM. The facility instructions require arrival within the appointment window, and the load has a same-day delivery connection.\n\nCreate an action plan covering: (1) what you tell the driver, (2) what you tell the broker or customer contact, (3) how often you send updates, (4) what documentation you collect, and (5) how you try to recover the appointment.',
    rubric: [
      {
        criterion: 'Speed of Escalation',
        weight: 30,
        description: 'The plan notifies stakeholders before the appointment is missed.',
      },
      {
        criterion: 'Driver Instructions',
        weight: 25,
        description: 'Instructions are safe, clear, and specific to the appointment window.',
      },
      {
        criterion: 'Documentation',
        weight: 20,
        description: 'Plan captures ETA, cause, location, timestamps, and facility response.',
      },
      {
        criterion: 'Recovery Options',
        weight: 25,
        description: 'Plan includes practical appointment recovery or reschedule steps.',
      },
    ],
    type: 'scenario',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-011',
    courseId: 'course-11',
    title: 'Broker or Customer Email Response',
    description: 'Write a delay update for a strict appointment-based load.',
    scenario:
      'A broker or customer contact asks why your truck has not checked in for an Amazon-style freight pickup. The driver is delayed by heavy traffic, current ETA is 35 minutes after the appointment, and you need to protect the relationship while asking whether the facility can still receive the truck.\n\nDraft the email response. Include current location, ETA, reason for delay, recovery request, next update time, and a professional tone.',
    rubric: [
      {
        criterion: 'Factual Clarity',
        weight: 30,
        description: 'Email gives location, ETA, reason, and appointment impact without vague language.',
      },
      {
        criterion: 'Professional Tone',
        weight: 25,
        description: 'Message is calm, direct, and relationship-aware.',
      },
      {
        criterion: 'Recovery Request',
        weight: 25,
        description: 'Email asks for a clear next step from the contact or facility.',
      },
      {
        criterion: 'Update Cadence',
        weight: 20,
        description: 'Email states when the next update will be sent.',
      },
    ],
    type: 'email',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-012',
    courseId: 'course-11',
    title: 'Rate and Route Evaluation Worksheet',
    description: 'Evaluate whether an appointment-based load is worth booking.',
    scenario:
      'Review this Amazon-style freight option:\n\nOrigin: Joliet, IL\nDestination: Hebron, KY\nLoaded miles: 310\nDeadhead to pickup: 42\nRate: $925\nPickup appointment: 4:00 PM today\nDelivery appointment: 11:00 PM today\nDriver available: 12:30 PM with 8.5 drive hours remaining\nTrailer: dry van, clean, swing doors\n\nCalculate all-in RPM including deadhead, check timing feasibility, identify service risks, and decide whether to book, reject, or negotiate.',
    rubric: [
      {
        criterion: 'Calculation Accuracy',
        weight: 30,
        description: 'RPM and total-mile calculations include deadhead.',
      },
      {
        criterion: 'Timing Analysis',
        weight: 30,
        description: 'Worksheet checks appointment timing against driver availability and route reality.',
      },
      {
        criterion: 'Risk Review',
        weight: 20,
        description: 'Identifies trailer, HOS, traffic, and facility risk factors.',
      },
      {
        criterion: 'Booking Decision',
        weight: 20,
        description: 'Decision is clear and supported by the calculations.',
      },
    ],
    type: 'calculation',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-013',
    courseId: 'course-12',
    title: 'Late Pickup Scenario',
    description: 'Manage late pickup risk on postal-style freight.',
    scenario:
      'A driver assigned to a postal-style freight lane is delayed leaving the previous delivery. Pickup is scheduled for 6:00 PM, the driver ETA is now 6:40 PM, and the lane has an overnight delivery commitment.\n\nBuild a response plan covering driver instructions, stakeholder notification, route timing recovery, documentation, and follow-up after pickup.',
    rubric: [
      {
        criterion: 'Service Protection',
        weight: 30,
        description: 'Plan prioritizes on-time performance and early escalation.',
      },
      {
        criterion: 'Stakeholder Communication',
        weight: 25,
        description: 'Notifications are timely, factual, and include next update timing.',
      },
      {
        criterion: 'Route Recovery',
        weight: 25,
        description: 'Plan evaluates whether timing can still be recovered legally.',
      },
      {
        criterion: 'Documentation',
        weight: 20,
        description: 'Plan captures timestamps, cause, ETA, and pickup outcome.',
      },
    ],
    type: 'scenario',
    difficulty: 'intermediate',
  },
  {
    id: 'assign-014',
    courseId: 'course-12',
    title: 'Seal and Document Checklist',
    description: 'Create a checklist for postal-style freight closeout and seal control.',
    scenario:
      'You are dispatching a postal-style freight load with a drop-and-hook pickup. The driver must hook trailer PZ-4821, verify the seal, confirm trailer cleanliness, and submit paperwork after departure.\n\nCreate a dispatcher checklist that covers pre-arrival, hook, seal check, paperwork review, departure update, and closeout.',
    rubric: [
      {
        criterion: 'Checklist Completeness',
        weight: 35,
        description: 'Checklist covers trailer, seal, documents, timestamps, and closeout.',
      },
      {
        criterion: 'Operational Sequence',
        weight: 25,
        description: 'Steps are ordered in the way the dispatcher and driver would actually use them.',
      },
      {
        criterion: 'Seal Control',
        weight: 25,
        description: 'Seal number capture and mismatch escalation are clear.',
      },
      {
        criterion: 'Documentation Quality',
        weight: 15,
        description: 'Checklist requires legible paperwork and correct load identifiers.',
      },
    ],
    type: 'checklist',
    difficulty: 'beginner',
  },
  {
    id: 'assign-015',
    courseId: 'course-12',
    title: 'Route Timing Exercise',
    description: 'Build a timing plan for a USPS-related freight training lane.',
    scenario:
      'Plan this postal-style freight lane:\n\nPickup: Indianapolis, IN at 8:00 PM\nDelivery: Pittsburgh, PA by 5:30 AM\nLoaded miles: 360\nDriver starts 35 miles from pickup at 6:30 PM\nEstimated average speed: 58 mph\nRequired fuel stop: 25 minutes\nPre-trip and check-in buffer: 35 minutes\n\nDetermine whether the lane is feasible, identify the tightest timing points, and write the update schedule you would use during transit.',
    rubric: [
      {
        criterion: 'Timing Math',
        weight: 35,
        description: 'Calculates deadhead, loaded drive time, fuel stop, and buffer time accurately.',
      },
      {
        criterion: 'Feasibility Decision',
        weight: 25,
        description: 'Decision is clearly supported by the timeline.',
      },
      {
        criterion: 'Risk Identification',
        weight: 20,
        description: 'Identifies traffic, weather, HOS, and facility timing risks.',
      },
      {
        criterion: 'Update Schedule',
        weight: 20,
        description: 'Includes practical check-call or status update timing.',
      },
    ],
    type: 'calculation',
    difficulty: 'intermediate',
  },
];
