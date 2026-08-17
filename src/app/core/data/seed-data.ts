import { Patient } from '../models/patient.model';
import { Medication } from '../models/medication.model';
import { FollowUp } from '../models/follow-up.model';
import { RecoveryTask } from '../models/recovery-task.model';
import { DischargePlan } from '../models/discharge-plan.model';

import { getOffsetISODate, getOffsetISODateTime } from '../utils/date-utils';

// Helper to calculate relative ISO dates from today
export function getRelativeDate(offsetDays: number): string {
  return getOffsetISODate(offsetDays);
}

export function getRelativeDateTime(offsetDays: number, hours = 10, minutes = 0): string {
  return getOffsetISODateTime(offsetDays, hours, minutes);
}

export function getInitialPatients(): Patient[] {
  return [
    {
      id: 'pat-101',
      fullName: 'Ramesh Kulkarni',
      age: 68,
      gender: 'Male',
      contactNumber: '+91 98230 45678',
      emergencyContact: '+91 98230 99887 (Son - Amit Kulkarni)',
      dischargeDate: getRelativeDate(-4),
      admissionDate: getRelativeDate(-8),
      primaryCondition: 'Total Knee Replacement (Right TKR)',
      assignedDoctor: 'Dr. Arvind Swaminathan',
      department: 'Orthopedics',
      status: 'attention_needed',
      notes: 'Requires strict home physiotherapy compliance and suture inspection for signs of infection or effusion.'
    },
    {
      id: 'pat-102',
      fullName: 'Sunita Sharma',
      age: 56,
      gender: 'Female',
      contactNumber: '+91 98112 34567',
      emergencyContact: '+91 98112 88776 (Husband - Suresh Sharma)',
      dischargeDate: getRelativeDate(-6),
      admissionDate: getRelativeDate(-12),
      primaryCondition: 'Post-CABG (Coronary Artery Bypass x 3)',
      assignedDoctor: 'Dr. Sanjay Verma',
      department: 'Cardiology',
      status: 'attention_needed',
      notes: 'Strict BP and sternal precaution monitoring needed. Patient missed scheduled 1-week cardiology OPD checkup.'
    },
    {
      id: 'pat-103',
      fullName: 'Pooja Iyer',
      age: 42,
      gender: 'Female',
      contactNumber: '+91 98450 12345',
      emergencyContact: '+91 98450 67890 (Husband - Karthik Iyer)',
      dischargeDate: getRelativeDate(-2),
      admissionDate: getRelativeDate(-4),
      primaryCondition: 'Laparoscopic Cholecystectomy',
      assignedDoctor: 'Dr. Rajeshwari Gupta',
      department: 'General Surgery',
      status: 'active',
      notes: 'Low-oil diet transition (khichdi, curd rice). Port incisions clean and healing normally.'
    },
    {
      id: 'pat-104',
      fullName: 'Mohammad Farooqui',
      age: 71,
      gender: 'Male',
      contactNumber: '+91 98901 23456',
      emergencyContact: '+91 98901 98765 (Son - Zeeshan Farooqui)',
      dischargeDate: getRelativeDate(-3),
      admissionDate: getRelativeDate(-9),
      primaryCondition: 'Community-Acquired Bronchopneumonia',
      assignedDoctor: 'Dr. Farhan Kidwai',
      department: 'Pulmonology',
      status: 'active',
      notes: 'Complete oral antibiotic course. Monitor pulse oximeter SpO2 twice daily before meals.'
    },
    {
      id: 'pat-105',
      fullName: 'Ananya Deshmukh',
      age: 61,
      gender: 'Female',
      contactNumber: '+91 97654 32109',
      emergencyContact: '+91 97654 88990 (Daughter - Sneha Deshmukh)',
      dischargeDate: getRelativeDate(-10),
      admissionDate: getRelativeDate(-15),
      primaryCondition: 'Type-2 Diabetes with Diabetic Foot Ulcer',
      assignedDoctor: 'Dr. Vivek Murthy',
      department: 'Endocrinology',
      status: 'active',
      notes: 'Plantar ulcer debridement healing with good granulation tissue. Excellent glycemic log maintenance.'
    },
    {
      id: 'pat-106',
      fullName: 'Vikramaditya Sengupta',
      age: 59,
      gender: 'Male',
      contactNumber: '+91 98300 11223',
      emergencyContact: '+91 98300 55443 (Wife - Aparna Sengupta)',
      dischargeDate: getRelativeDate(-14),
      admissionDate: getRelativeDate(-20),
      primaryCondition: 'Transient Ischemic Attack (TIA) Recovery',
      assignedDoctor: 'Dr. Debashish Roy',
      department: 'Neurology',
      status: 'completed',
      notes: 'Full recovery of speech and motor function. Completed all secondary neurovascular follow-ups.'
    }
  ];
}

export function getInitialMedications(): Medication[] {
  return [
    // Ramesh Kulkarni (pat-101)
    {
      id: 'med-101-1',
      patientId: 'pat-101',
      name: 'Enoxaparin (Clexane Injection)',
      dosage: '40 mg / 0.4 mL',
      frequency: 'Once daily (Subcutaneous injection at 8:00 PM)',
      startDate: getRelativeDate(-4),
      endDate: getRelativeDate(10),
      status: 'active',
      instructions: 'Administer subcutaneously in abdomen. DVT prophylaxis post joint replacement.',
      prescribedBy: 'Dr. Arvind Swaminathan'
    },
    {
      id: 'med-101-2',
      patientId: 'pat-101',
      name: 'Ultracet (Tramadol + Paracetamol)',
      dosage: '37.5 mg / 325 mg',
      frequency: 'Twice daily after meals as needed',
      startDate: getRelativeDate(-4),
      endDate: getRelativeDate(3),
      status: 'active',
      instructions: 'For right knee post-op pain. Take strictly after breakfast and dinner.',
      prescribedBy: 'Dr. Arvind Swaminathan'
    },
    {
      id: 'med-101-3',
      patientId: 'pat-101',
      name: 'Pantocid 40 (Pantoprazole)',
      dosage: '40 mg',
      frequency: 'Once daily (Empty stomach 30 mins before breakfast)',
      startDate: getRelativeDate(-4),
      endDate: getRelativeDate(14),
      status: 'active',
      instructions: 'Gastric mucosal protection during post-op medication regimen.',
      prescribedBy: 'Dr. Arvind Swaminathan'
    },

    // Sunita Sharma (pat-102)
    {
      id: 'med-102-1',
      patientId: 'pat-102',
      name: 'Betaloc 50 (Metoprolol Succinate)',
      dosage: '50 mg',
      frequency: 'Once daily morning with breakfast',
      startDate: getRelativeDate(-6),
      endDate: getRelativeDate(90),
      status: 'active',
      instructions: 'Hold medication and alert doctor if resting pulse is below 55 bpm.',
      prescribedBy: 'Dr. Sanjay Verma'
    },
    {
      id: 'med-102-2',
      patientId: 'pat-102',
      name: 'Atorva 40 (Atorvastatin)',
      dosage: '40 mg',
      frequency: 'Once daily at bedtime',
      startDate: getRelativeDate(-6),
      endDate: getRelativeDate(180),
      status: 'active',
      instructions: 'Maintain lipid management and plaque stabilization protocol.',
      prescribedBy: 'Dr. Sanjay Verma'
    },
    {
      id: 'med-102-3',
      patientId: 'pat-102',
      name: 'Ecosprin 75 (Aspirin Enteric Coated)',
      dosage: '75 mg',
      frequency: 'Once daily after lunch',
      startDate: getRelativeDate(-6),
      endDate: getRelativeDate(365),
      status: 'active',
      instructions: 'Antiplatelet therapy for coronary graft patency.',
      prescribedBy: 'Dr. Sanjay Verma'
    },

    // Pooja Iyer (pat-103)
    {
      id: 'med-103-1',
      patientId: 'pat-103',
      name: 'Dolo 650 (Paracetamol)',
      dosage: '650 mg',
      frequency: 'Every 8 hours as needed for soreness',
      startDate: getRelativeDate(-2),
      endDate: getRelativeDate(4),
      status: 'active',
      instructions: 'For laparoscopic port site discomfort. Do not exceed 3 tablets in 24 hours.',
      prescribedBy: 'Dr. Rajeshwari Gupta'
    },
    {
      id: 'med-103-2',
      patientId: 'pat-103',
      name: 'Cremaffin Plus Syrup',
      dosage: '15 mL',
      frequency: 'Once daily at bedtime with warm water',
      startDate: getRelativeDate(-2),
      endDate: getRelativeDate(5),
      status: 'active',
      instructions: 'Stool softener to prevent abdominal straining post laparoscopy.',
      prescribedBy: 'Dr. Rajeshwari Gupta'
    },

    // Mohammad Farooqui (pat-104)
    {
      id: 'med-104-1',
      patientId: 'pat-104',
      name: 'Augmentin 625 Duo (Amoxicillin + Clavulanic Acid)',
      dosage: '625 mg',
      frequency: 'Twice daily after meals (Morning & Night)',
      startDate: getRelativeDate(-3),
      endDate: getRelativeDate(4),
      status: 'active',
      instructions: 'Complete entire 7-day course without skipping any dose.',
      prescribedBy: 'Dr. Farhan Kidwai'
    },
    {
      id: 'med-104-2',
      patientId: 'pat-104',
      name: 'Foracort 200 Inhaler (Formoterol + Budesonide)',
      dosage: '200 mcg',
      frequency: '2 puffs twice daily',
      startDate: getRelativeDate(-3),
      endDate: getRelativeDate(30),
      status: 'active',
      instructions: 'Rinse mouth with water after inhalation to prevent oral thrush.',
      prescribedBy: 'Dr. Farhan Kidwai'
    },

    // Ananya Deshmukh (pat-105)
    {
      id: 'med-105-1',
      patientId: 'pat-105',
      name: 'Glycomet-GP 1 (Metformin 500mg + Glimepiride 1mg)',
      dosage: '500 / 1 mg',
      frequency: 'Twice daily before breakfast & dinner',
      startDate: getRelativeDate(-10),
      endDate: getRelativeDate(90),
      status: 'active',
      instructions: 'Maintain strict fasting and post-prandial glycemic log.',
      prescribedBy: 'Dr. Vivek Murthy'
    },
    {
      id: 'med-105-2',
      patientId: 'pat-105',
      name: 'Neurobion Forte (Vitamin B-Complex)',
      dosage: '1 Tablet',
      frequency: 'Once daily after breakfast',
      startDate: getRelativeDate(-10),
      endDate: getRelativeDate(50),
      status: 'active',
      instructions: 'For diabetic peripheral neuropathy nerve recovery.',
      prescribedBy: 'Dr. Vivek Murthy'
    },

    // Vikramaditya Sengupta (pat-106)
    {
      id: 'med-106-1',
      patientId: 'pat-106',
      name: 'Clopilet 75 (Clopidogrel)',
      dosage: '75 mg',
      frequency: 'Once daily after lunch',
      startDate: getRelativeDate(-14),
      endDate: getRelativeDate(90),
      status: 'active',
      instructions: 'Secondary antiplatelet prevention protocol.',
      prescribedBy: 'Dr. Debashish Roy'
    }
  ];
}

export function getInitialFollowUps(): FollowUp[] {
  return [
    // Ramesh Kulkarni (pat-101) - 1 Overdue Follow-up!
    {
      id: 'flw-101-1',
      patientId: 'pat-101',
      title: 'Orthopedic Post-Op Suture Removal & Knee ROM Check',
      appointmentDate: getRelativeDateTime(-1, 11, 0), // YESTERDAY -> OVERDUE
      department: 'Orthopedic Surgery OPD',
      doctorName: 'Dr. Arvind Swaminathan',
      status: 'overdue',
      notes: 'Patient missed scheduled post-op suture inspection and right knee stability assessment.',
      location: 'OPD Block B, Room 204'
    },
    {
      id: 'flw-101-2',
      patientId: 'pat-101',
      title: 'Physiotherapy Active Quad Strengthening & Gait Training',
      appointmentDate: getRelativeDateTime(3, 14, 0),
      department: 'Physiotherapy & Rehabilitation',
      doctorName: 'Dr. Snehal Kulkarni (PT)',
      status: 'upcoming',
      notes: 'Review 90-degree flexion milestone and unassisted walker transition.',
      location: 'Rehab Wing, Ground Floor'
    },

    // Sunita Sharma (pat-102) - 1 Overdue Follow-up!
    {
      id: 'flw-102-1',
      patientId: 'pat-102',
      title: 'Cardiology 1-Week Post-CABG Sternal Check & ECG Review',
      appointmentDate: getRelativeDateTime(-2, 9, 30), // 2 DAYS AGO -> OVERDUE
      department: 'Cardiology & CTVS OPD',
      doctorName: 'Dr. Sanjay Verma',
      status: 'overdue',
      notes: 'Vital 1-week post-bypass sternal wound check and resting 12-lead ECG review.',
      location: 'Heart Institute, Suite 102'
    },
    {
      id: 'flw-102-2',
      patientId: 'pat-102',
      title: 'Phase-II Cardiac Rehabilitation Intake Assessment',
      appointmentDate: getRelativeDateTime(6, 10, 0),
      department: 'Cardiac Rehabilitation',
      doctorName: 'Dr. Neha Kedia',
      status: 'upcoming',
      notes: 'Supervised progressive walking and functional capacity test.',
      location: 'Wellness Block, Floor 2'
    },

    // Pooja Iyer (pat-103) - Upcoming
    {
      id: 'flw-103-1',
      patientId: 'pat-103',
      title: 'Post-Cholecystectomy Laparoscopic Port Site Review',
      appointmentDate: getRelativeDateTime(2, 13, 15),
      department: 'Surgical OPD',
      doctorName: 'Dr. Rajeshwari Gupta',
      status: 'upcoming',
      notes: 'Inspect umbilical and subcostal port dressings; review transition to normal Indian diet.',
      location: 'General Surgery Clinic 4A'
    },

    // Mohammad Farooqui (pat-104) - Today's Follow-up!
    {
      id: 'flw-104-1',
      patientId: 'pat-104',
      title: 'Pulmonary Repeat Chest X-Ray & Spirometry Check',
      appointmentDate: getRelativeDateTime(0, 15, 30), // TODAY!
      department: 'Pulmonology OPD',
      doctorName: 'Dr. Farhan Kidwai',
      status: 'upcoming',
      notes: 'Assess resolution of lower lobe consolidation and room-air SpO2.',
      location: 'Chest Medicine Unit, Room 108'
    },

    // Ananya Deshmukh (pat-105) - Upcoming
    {
      id: 'flw-105-1',
      patientId: 'pat-105',
      title: 'Diabetic Foot Care Debridement Check & Glycemic Review',
      appointmentDate: getRelativeDateTime(4, 11, 0),
      department: 'Endocrinology & Podiatry OPD',
      doctorName: 'Dr. Vivek Murthy',
      status: 'upcoming',
      notes: 'Measure ulcer epithelialization and review glucometer reading logs.',
      location: 'Diabetes Center, Room 12'
    },

    // Vikramaditya Sengupta (pat-106) - Completed
    {
      id: 'flw-106-1',
      patientId: 'pat-106',
      title: 'Neurology 2-Week Post-TIA Carotid Doppler Review',
      appointmentDate: getRelativeDateTime(-3, 10, 0),
      department: 'Neurology OPD',
      doctorName: 'Dr. Debashish Roy',
      status: 'completed',
      notes: 'Carotid Doppler showed normal velocity. Blood pressure well controlled at 124/80 mmHg.',
      location: 'Neuroscience Center, Floor 3',
      completedAt: getRelativeDateTime(-3, 10, 45)
    }
  ];
}

export function getInitialRecoveryTasks(): RecoveryTask[] {
  return [
    // Ramesh Kulkarni (pat-101)
    {
      id: 'tsk-101-1',
      patientId: 'pat-101',
      title: 'Complete 30 min gentle knee flexion & ankle pump exercises',
      description: 'Perform 3 sets of 10 quadriceps sets and ankle pumps morning and evening.',
      dueDate: getRelativeDate(-1),
      completed: false, // Overdue task!
      category: 'Physical Therapy'
    },
    {
      id: 'tsk-101-2',
      patientId: 'pat-101',
      title: 'Inspect surgical incision dressing for redness or soakage',
      description: 'Ensure waterproof dressing is dry. Notify hospital if body temperature > 100.4°F.',
      dueDate: getRelativeDate(0),
      completed: false,
      category: 'Wound Care'
    },
    {
      id: 'tsk-101-3',
      patientId: 'pat-101',
      title: 'Apply ice pack over right knee 20 mins post mobility exercises',
      description: 'Use cloth barrier to prevent direct skin contact and reduce post-exercise swelling.',
      dueDate: getRelativeDate(1),
      completed: true,
      category: 'Physical Therapy',
      completedDate: getRelativeDate(0)
    },

    // Sunita Sharma (pat-102)
    {
      id: 'tsk-102-1',
      patientId: 'pat-102',
      title: 'Record morning blood pressure and resting pulse in diary',
      description: 'Target BP: 110-130 / 70-80 mmHg. Inform doctor if systolic > 145 or pulse < 55.',
      dueDate: getRelativeDate(-1),
      completed: false, // Overdue task!
      category: 'Vitals'
    },
    {
      id: 'tsk-102-2',
      patientId: 'pat-102',
      title: 'Daily morning weighing before breakfast (Fluid overload check)',
      description: 'Call care coordinator if weight increases by more than 1 kg in 24 hours.',
      dueDate: getRelativeDate(0),
      completed: false,
      category: 'Vitals'
    },
    {
      id: 'tsk-102-3',
      patientId: 'pat-102',
      title: 'Follow sternal precautions (Use heart hugger pillow when coughing)',
      description: 'Avoid pushing or pulling with arms when standing up from bed or chair.',
      dueDate: getRelativeDate(2),
      completed: true,
      category: 'General',
      completedDate: getRelativeDate(-2)
    },

    // Pooja Iyer (pat-103)
    {
      id: 'tsk-103-1',
      patientId: 'pat-103',
      title: 'Follow low-oil post-cholecystectomy diet (Khichdi, Dal, Curd Rice)',
      description: 'Eat 5-6 small light meals rather than heavy oily or spicy food.',
      dueDate: getRelativeDate(1),
      completed: true,
      category: 'Diet',
      completedDate: getRelativeDate(-1)
    },
    {
      id: 'tsk-103-2',
      patientId: 'pat-103',
      title: 'Walk 15 minutes twice daily inside house at comfortable pace',
      description: 'Light mobility prevents post-anesthesia gas discomfort and deep vein thrombosis.',
      dueDate: getRelativeDate(0),
      completed: false,
      category: 'Physical Therapy'
    },
    {
      id: 'tsk-103-3',
      patientId: 'pat-103',
      title: 'Avoid lifting heavy grocery bags or water buckets (> 5 kg)',
      description: 'Protect laparoscopic keyhole port sites from abdominal pressure or strain.',
      dueDate: getRelativeDate(5),
      completed: true,
      category: 'General',
      completedDate: getRelativeDate(-1)
    },

    // Mohammad Farooqui (pat-104)
    {
      id: 'tsk-104-1',
      patientId: 'pat-104',
      title: 'Incentive Spirometer exercises 10 breaths every 2 hours',
      description: 'Deep breathing promotes lung expansion and clears residual bronchial secretions.',
      dueDate: getRelativeDate(0),
      completed: true,
      category: 'Physical Therapy',
      completedDate: getRelativeDate(0)
    },
    {
      id: 'tsk-104-2',
      patientId: 'pat-104',
      title: 'Check and log pulse oximeter SpO2 reading twice daily',
      description: 'Alert pulmonology team immediately if SpO2 drops below 94% on room air.',
      dueDate: getRelativeDate(1),
      completed: false,
      category: 'Vitals'
    },
    {
      id: 'tsk-104-3',
      patientId: 'pat-104',
      title: 'Drink warm water and take steam inhalation twice daily',
      description: 'Helps liquefy mucus secretions and soothes respiratory airways.',
      dueDate: getRelativeDate(2),
      completed: true,
      category: 'Diet',
      completedDate: getRelativeDate(-1)
    },

    // Ananya Deshmukh (pat-105)
    {
      id: 'tsk-105-1',
      patientId: 'pat-105',
      title: 'Daily foot inspection using mirror for any new redness or hotspots',
      description: 'Inspect plantar aspect and web spaces of toes under good lighting.',
      dueDate: getRelativeDate(0),
      completed: true,
      category: 'Wound Care',
      completedDate: getRelativeDate(0)
    },
    {
      id: 'tsk-105-2',
      patientId: 'pat-105',
      title: 'Log fasting and 2-hour post-meal blood sugar levels in glucometer book',
      description: 'Target fasting: 90-130 mg/dL; Post-meal: < 170 mg/dL.',
      dueDate: getRelativeDate(1),
      completed: true,
      category: 'Vitals',
      completedDate: getRelativeDate(0)
    },
    {
      id: 'tsk-105-3',
      patientId: 'pat-105',
      title: 'Wear custom diabetic footwear at all times (Never walk barefoot)',
      description: 'Protects neuropathic soles from thermal or mechanical trauma at home.',
      dueDate: getRelativeDate(3),
      completed: true,
      category: 'General',
      completedDate: getRelativeDate(-3)
    },

    // Vikramaditya Sengupta (pat-106)
    {
      id: 'tsk-106-1',
      patientId: 'pat-106',
      title: 'Log daily morning digital blood pressure reading',
      description: 'Maintain strict control under 130/80 mmHg.',
      dueDate: getRelativeDate(-2),
      completed: true,
      category: 'Vitals',
      completedDate: getRelativeDate(-2)
    },
    {
      id: 'tsk-106-2',
      patientId: 'pat-106',
      title: 'Complete fine-motor hand dexterity & rubber ball squeezing',
      description: '15 minutes twice daily to restore right hand motor coordination.',
      dueDate: getRelativeDate(-1),
      completed: true,
      category: 'Physical Therapy',
      completedDate: getRelativeDate(-1)
    }
  ];
}

export function getInitialDischargePlans(): DischargePlan[] {
  return [
    {
      id: 'plan-101',
      patientId: 'pat-101',
      dischargeDate: getRelativeDate(-4),
      summary: 'Patient underwent uncomplicated right total knee arthroplasty (TKR). Mobilized on post-op Day 1 with walker support. Surgical incision clean and intact on discharge.',
      careInstructions: 'Keep surgical dressing completely dry until OPD suture inspection. Continue subcutaneous blood thinners. Do not squat, sit cross-legged on floor, or use Indian-style toilets.',
      dietaryRestrictions: 'High-protein diet (paneer, dalia, pulses); adequate fiber to prevent constipation from pain medications.',
      activityRestrictions: 'Weight bearing as tolerated with walker. Avoid twisting knee or abrupt movements.',
      caregiverName: 'Amit Kulkarni (Son)',
      caregiverPhone: '+91 98230 99887',
      emergencyContact: '+91 98230 99887',
      redFlags: [
        'Sudden calf swelling, warmth, or severe tenderness (possible DVT)',
        'Fever above 100.4°F (38.0°C) or persistent chills',
        'Increasing redness spreading outward from incision or foul-smelling soakage',
        'Severe sudden knee pain not relieved by prescribed analgesics'
      ],
      notes: 'Home physiotherapist visiting daily for supervised knee range of motion.'
    },
    {
      id: 'plan-102',
      patientId: 'pat-102',
      dischargeDate: getRelativeDate(-6),
      summary: 'Patient successfully underwent coronary artery bypass grafting (CABG x 3). Hemodynamically stable with normal cardiac rhythm upon discharge.',
      careInstructions: 'Strict compliance with cardiac medication regimen. Monitor sternotomy and leg saphenous vein harvest sites. Sponge bath only; keep wounds clean and dry.',
      dietaryRestrictions: 'Strict low-salt (< 2g/day) and low-oil heart diet. Avoid fried snacks, papads, pickles, and ghee.',
      activityRestrictions: 'Sternal precautions for 6 weeks: Do not push, pull, or lift objects > 2 kg. Do not drive.',
      caregiverName: 'Suresh Sharma (Spouse)',
      caregiverPhone: '+91 98112 88776',
      emergencyContact: '+91 98112 88776',
      redFlags: [
        'Chest pain or angina-like tightness similar to pre-operative symptoms',
        'Shortness of breath at rest or when lying flat (orthopnea)',
        'Sternal clicking, popping sound, or instability when coughing or turning',
        'Irregular rapid pulse or heart palpitations > 110 bpm'
      ],
      notes: 'Follow-up with Dr. Sanjay Verma was missed. Requires urgent rescheduling.'
    },
    {
      id: 'plan-103',
      patientId: 'pat-103',
      dischargeDate: getRelativeDate(-2),
      summary: 'Elective laparoscopic cholecystectomy for symptomatic cholelithiasis completed without complications. Discharged in stable condition.',
      careInstructions: 'Keyhole port sites closed with waterproof glue. May take gentle warm shower after 48 hours. Keep dry.',
      dietaryRestrictions: 'Light low-fat Indian meals (khichdi, idli, boiled vegetables, dal soup). Avoid oily curries, samosas, and dairy fats for 2 weeks.',
      activityRestrictions: 'No heavy lifting or strenuous household chores (> 5 kg) for 14 days.',
      caregiverName: 'Karthik Iyer (Spouse)',
      caregiverPhone: '+91 98450 67890',
      emergencyContact: '+91 98450 67890',
      redFlags: [
        'Yellowing of eyes/skin (Jaundice) or dark mustard-colored urine',
        'Persistent nausea, vomiting, or inability to retain fluids',
        'Severe worsening right upper quadrant abdominal pain',
        'Fever > 101°F'
      ]
    },
    {
      id: 'plan-104',
      patientId: 'pat-104',
      dischargeDate: getRelativeDate(-3),
      summary: 'Admitted for right lower lobe bronchopneumonia with fever and hypoxemia. Responded well to IV antibiotics and switched to oral medication upon discharge.',
      careInstructions: 'Complete full oral antibiotic regimen. Use incentive spirometer regularly and practice deep diaphragmatic breathing.',
      dietaryRestrictions: 'Nutritious diet with warm soups and high fluid intake (2.5+ liters/day).',
      activityRestrictions: 'Adequate rest. Avoid exposure to dust, smoke, cooking fumes, or cold air.',
      caregiverName: 'Zeeshan Farooqui (Son)',
      caregiverPhone: '+91 98901 98765',
      emergencyContact: '+91 98901 98765',
      redFlags: [
        'Recurrence of high fever or severe shivering',
        'Increasing breathlessness or audible wheezing',
        'SpO2 dropping below 93% on home pulse oximeter',
        'Coughing up rust-colored or bloody sputum'
      ]
    },
    {
      id: 'plan-105',
      patientId: 'pat-105',
      dischargeDate: getRelativeDate(-10),
      summary: 'Managed for left neuropathic plantar ulcer with debridement and antibiotic coverage. Blood sugars stabilized during admission.',
      careInstructions: 'Daily sterile dressing change. Keep offloading diabetic footwear on whenever standing or taking steps.',
      dietaryRestrictions: 'Diabetic meal plan with consistent complex carbs (multigrain roti, ragi, dal, green leafy vegetables). Avoid sweets, jaggery, and maida.',
      activityRestrictions: 'Strict non-weight-bearing on left forefoot unless wearing specialized relief shoe.',
      caregiverName: 'Sneha Deshmukh (Daughter)',
      caregiverPhone: '+91 97654 88990',
      emergencyContact: '+91 97654 88990',
      redFlags: [
        'New localized swelling, warmth, or foul odor from foot dressing',
        'Blood glucose persistently exceeding 250 mg/dL',
        'Sudden loss of sensation or black discoloration of toes'
      ]
    },
    {
      id: 'plan-106',
      patientId: 'pat-106',
      dischargeDate: getRelativeDate(-14),
      summary: 'Patient presented with transient ischemic attack (TIA) manifesting as transient right arm weakness. Brain MRI showed no acute infarction. Discharged on dual antiplatelets.',
      careInstructions: 'Strict adherence to blood pressure and antiplatelet medications. Daily home BP charting.',
      dietaryRestrictions: 'Low-salt, heart-healthy diet (oats, vegetables, seasonal fruits, low oil).',
      activityRestrictions: '30 mins daily brisk walking in morning or evening.',
      caregiverName: 'Aparna Sengupta (Spouse)',
      caregiverPhone: '+91 98300 55443',
      emergencyContact: '+91 98300 55443',
      redFlags: [
        'Sudden weakness or numbness of face, arm, or leg (especially one side)',
        'Sudden difficulty speaking, slurred speech, or understanding words',
        'Sudden loss of balance, vertigo, or visual disturbance'
      ]
    }
  ];
}
