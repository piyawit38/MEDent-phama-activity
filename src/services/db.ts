/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Registration, Attachment, ActivityQA } from '../types';

const ACTIVITIES_KEY = 'medent_phama_activities';
const REGISTRATIONS_KEY = 'medent_phama_registrations';
const QAS_KEY = 'medent_phama_qas';

// Mock Q&As to pre-seed
const PRESEEDED_QAS: ActivityQA[] = [
  {
    id: 'qa_1',
    activityId: 'act_1',
    authorName: 'คุณแม่อัญชลี',
    authorRole: 'parent',
    question: 'มีรถรับส่งจากสนามบินหรือสถานีรถไฟเชียงใหม่ไหมคะ พอดีพาคุณลูกเดินทางมาจากกรุงเทพฯ ค่ะ',
    answer: 'สวัสดีครับคุณแม่อัญชลี ทางคณะผู้จัดงานมีรถตู้บริการรับส่งฟรีจากสนามบินเชียงใหม่ และสถานีรถไฟเชียงใหม่ ทุกๆ 1 ชั่วโมงครับ โดยจะมีเจ้าหน้าที่สวมเสื้อโครงการสีม่วงคอยต้อนรับที่ประตูทางออกครับ',
    answeredAt: new Date('2026-06-30T10:00:00Z').toISOString(),
    createdAt: new Date('2026-06-30T08:30:00Z').toISOString()
  },
  {
    id: 'qa_2',
    activityId: 'act_1',
    authorName: 'พ่อบ้านรักเรียน',
    authorRole: 'parent',
    question: 'น้องเรียนอยู่ ม.4 สนใจเข้าฟังหัวข้อสัมมนาของเภสัชกรรม จะมีเกียรติบัตรอิเล็กทรอนิกส์มอบให้หลังจบงานไหมครับ',
    answer: 'มีเกียรติบัตรอิเล็กทรอนิกส์ (e-Certificate) มอบให้สำหรับผู้เข้าร่วมสัมมนาทุกคนครับ โดยสามารถสแกน QR Code เพื่อทำแบบทดสอบหลังงานและดาวน์โหลดเกียรติบัตรได้ทันทีครับ',
    answeredAt: new Date('2026-06-30T15:20:00Z').toISOString(),
    createdAt: new Date('2026-06-30T14:15:00Z').toISOString()
  }
];

// Mock files to pre-seed
const PRESEEDED_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    title: 'นวัตกรรมทันตกรรมและเภสัชกรรมยุคใหม่ 2026 (Dental & Pharma Expo 2026)',
    date: '2026-10-15',
    endDate: '2026-10-17',
    time: '09:00 - 16:30 น.',
    location: 'คณะทันตแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่',
    status: 'open',
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80'
    ],
    description: `ขอเชิญผู้ปกครองและนักเรียนระดับมัธยมศึกษาตอนปลายเข้าร่วมชมนวัตกรรมด้านทันตกรรมและเทคโนโลยีเภสัชกรรม เพื่อพัฒนาศักยภาพเด็กไทยสู่สากล

ภายในงานผู้เข้าร่วมกิจกรรมจะได้สัมผัสและทดลองใช้งานเทคโนโลยีด้านทันตกรรมและยาชั้นสูง:
1. **ทันตกรรมดิจิทัล (Digital Dentistry):** ทดลองใช้เครื่องสแกนในช่องปาก 3 มิติ เพื่อสร้างแบบจำลองฟันดิจิทัล และเรียนรู้การขึ้นรูปครอบฟันด้วยเครื่องพิมพ์ 3 มิติ
2. **การปรุงยาเฉพาะบุคคล (Personalized Medicine):** เยี่ยมชมห้องปฏิบัติการวิเคราะห์โครงสร้างโมเลกุลยา และทดลองผสมสารสกัดธรรมชาติเพื่อพัฒนาเป็นเจลทารักษาแผลในช่องปาก
3. **เสวนาพิเศษ:** หัวข้อ "ทิศทางอาชีพทันตแพทย์และเภสัชกรยุค AI" โดยคณาจารย์ผู้ทรงคุณวุฒิ และไขข้อข้องใจเรื่องระบบ TCAS สำหรับคณะวิทยาศาสตร์สุขภาพ

*มีเกียรติบัตรเข้าร่วมกิจกรรมมอบให้ผู้ปกครองและนักเรียนหลังจบโครงการ*`,
    googleMaps: 'https://maps.google.com/?q=Faculty+of+Dentistry,+Chiang+Mai+University',
    thingsToPrepare: 'สมุดจดบันทึก หรือแท็บเล็ต/สมาร์ทโฟนสำหรับสแกนคิวอาร์โค้ดลงทะเบียนและทำแบบทดสอบระหว่างเวิร์กชอป',
    coordinator: 'ดร.ทพญ.พิมลพรรณ วงศ์วรรณ',
    phone: '081-234-5678',
    createdAt: new Date('2026-06-30T10:00:00Z').toISOString(),
    attachments: [
      {
        id: 'att_1_1',
        name: 'กำหนดการกิจกรรม_MEDent_Pharma_2026.pdf',
        size: '1.2 MB',
        type: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...' // Minimal PDF fallback placeholder
      },
      {
        id: 'att_1_2',
        name: 'คู่มือการลงทะเบียนสำหรับผู้ปกครอง.docx',
        size: '450 KB',
        type: 'word',
        dataUrl: ''
      },
      {
        id: 'att_1_3',
        name: 'สไลด์แนะนำเทคโนโลยีทันตกรรมยุคใหม่.pptx',
        size: '4.8 MB',
        type: 'powerpoint',
        dataUrl: ''
      }
    ]
  },
  {
    id: 'act_2',
    title: 'การดูแลสุขภาพช่องปากเด็กปฐมวัยและการใช้เทคโนโลยีสมุนไพรในครัวเรือน',
    date: '2026-11-12',
    time: '13:00 - 15:30 น.',
    location: 'โรงแรมแกรนด์ พาเลซ ห้องแกรนด์บอลรูม ชั้น 3',
    status: 'open',
    coverImage: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80'
    ],
    description: `กิจกรรมอบรมเชิงปฏิบัติการสำหรับผู้ปกครองในการดูแลรักษาสุขภาพช่องปากและฟันของเด็กตั้งแต่แรกเกิดถึง 6 ขวบ

หัวข้อเด่นที่น่าสนใจในงาน:
- วิธีเลือกแปรงสีฟันและยาสีฟันผสมฟลูออไรด์ที่เหมาะสมสำหรับช่วงวัยต่างๆ ของบุตรหลาน
- เทคนิคการสอนเด็กแปรงฟันอย่างสนุกสนานด้วยแอปพลิเคชัน AR และเพลงประกอบจังหวะ
- แนะนำสมุนไพรธรรมชาติรอบตัวที่มีคุณสมบัติลดการสะสมของคราบแบคทีเรีย และวิธีนำมาทำน้ำยาบ้วนปากสมุนไพรด้วยตัวเองอย่างปลอดภัยโดยไร้สารเคมีสังเคราะห์
- กิจกรรมร่วมตอบคำถามชิงรางวัลกระเป๋าชุดดูแลฟันสุขภาพดีสำหรับเด็กและผู้ปกครอง`,
    googleMaps: 'https://maps.google.com/?q=Grand+Palace+Hotel',
    thingsToPrepare: 'แปรงสีฟันประจำตัวของเด็ก (เพื่อรับบริการประเมินความสะอาดยาสีฟันฟรีในเวิร์กชอป)',
    coordinator: 'คุณพชรพล สุขสันต์',
    phone: '089-876-5432',
    createdAt: new Date('2026-06-29T08:30:00Z').toISOString(),
    attachments: [
      {
        id: 'att_2_1',
        name: 'แผ่นพับสาระน่ารู้_ฟันน้ำนมสุขภาพดี.pdf',
        size: '850 KB',
        type: 'pdf',
        dataUrl: ''
      }
    ]
  },
  {
    id: 'act_3',
    title: 'เวิร์กชอปเทคโนโลยีเภสัชกรรมและนวัตกรรมยาเพื่อสุขภาพ (Drug Discovery Workshop)',
    date: '2026-09-05',
    time: '09:00 - 12:00 น.',
    location: 'ศูนย์วิจัยนวัตกรรมสุขภาพ ชั้น 5 คณะเภสัชศาสตร์',
    status: 'closed',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80'
    ],
    description: `เรียนรู้แนวทางการคิดค้นยาในอนาคตและการใช้ปัญญาประดิษฐ์ (AI) ในอุตสาหกรรมยา

ผู้ปกครองและผู้ร่วมเวิร์กชอปจะได้เรียนรู้:
- ขั้นตอนกว่าจะมาเป็น "ยา 1 เม็ด" จากแล็บวิจัย สู่กระบวนการทดสอบในมนุษย์และการผลิตระดับอุตสาหกรรม
- ทดลองใช้งานคอมพิวเตอร์เพื่อส่องดูโครงสร้างโปรตีนโรคพืชและโรคอุบัติใหม่ และออกแบบยาสกัดสมุนไพรไทยให้เข้าจับกับโปรตีนเป้าหมาย
- เยี่ยมชมเครื่องจักรผลิตยาระดับนาโนเทคโนโลยี
- ซักถามและแลกเปลี่ยนความรู้กับเภสัชกรนักวิจัยระดับประเทศ`,
    googleMaps: 'https://maps.google.com/?q=Health+Innovation+Research+Center',
    thingsToPrepare: 'ไม่มี',
    coordinator: 'ดร.ทพญ.พิมลพรรณ วงศ์วรรณ',
    phone: '081-234-5678',
    createdAt: new Date('2026-06-25T14:15:00Z').toISOString(),
    attachments: []
  }
];

const PRESEEDED_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_1',
    activityId: 'act_1',
    activityTitle: 'นวัตกรรมทันตกรรมและเภสัชกรรมยุคใหม่ 2026 (Dental & Pharma Expo 2026)',
    studentName: 'เด็กชายสมชาย รักษ์ดี',
    parentName: 'นางสมศรี รักษ์ดี',
    phone: '082-111-2222',
    school: 'โรงเรียนอนุราชประสิทธิ์',
    grade: 'มัธยมศึกษาปีที่ 4',
    intent: 'join',
    remarks: 'น้องสนใจเรียนต่อด้านทันตแพทย์มากค่ะ อยากเรียนถามเกี่ยวกับแนวทางการเตรียมพอร์ตโฟลิโอ',
    registeredAt: new Date('2026-06-30T15:30:00-07:00').toISOString()
  },
  {
    id: 'reg_2',
    activityId: 'act_1',
    activityTitle: 'นวัตกรรมทันตกรรมและเภสัชกรรมยุคใหม่ 2026 (Dental & Pharma Expo 2026)',
    studentName: 'เด็กหญิงกิตติยา สุขใจ',
    parentName: 'นายประสิทธิ์ สุขใจ',
    phone: '085-555-6666',
    school: 'โรงเรียนสตรีวิทยา',
    grade: 'มัธยมศึกษาปีที่ 5',
    intent: 'join',
    remarks: 'ต้องการที่จอดรถยนต์สำหรับผู้เข้าร่วมงาน',
    registeredAt: new Date('2026-06-30T17:45:00-07:00').toISOString()
  },
  {
    id: 'reg_3',
    activityId: 'act_2',
    activityTitle: 'การดูแลสุขภาพช่องปากเด็กปฐมวัยและการใช้เทคโนโลยีสมุนไพรในครัวเรือน',
    studentName: 'เด็กชายวิทวัส มีทอง',
    parentName: 'นางสาวจารุวรรณ มีทอง',
    phone: '089-999-8888',
    school: 'โรงเรียนสันทรายวิทยาคม',
    grade: 'ประถมศึกษาปีที่ 1',
    intent: 'join',
    remarks: 'อยากรู้วิธีแปรงฟันสำหรับน้องที่ใส่เครื่องมือจัดฟันเบื้องต้น',
    registeredAt: new Date('2026-06-30T18:20:00-07:00').toISOString()
  },
  {
    id: 'reg_4',
    activityId: 'act_1',
    activityTitle: 'นวัตกรรมทันตกรรมและเภสัชกรรมยุคใหม่ 2026 (Dental & Pharma Expo 2026)',
    studentName: 'เด็กชายธนาธิป วิริยะ',
    parentName: 'นายอัครเดช วิริยะ',
    phone: '084-321-7654',
    school: 'โรงเรียนดาราวิทยาลัย',
    grade: 'มัธยมศึกษาปีที่ 6',
    intent: 'cannot_join',
    remarks: 'ติดสอบปลายภาคสัปดาห์นั้นพอดีครับ เสียดายมากๆ',
    registeredAt: new Date('2026-06-30T19:00:00-07:00').toISOString()
  }
];

export class DBService {
  private static init() {
    if (typeof window !== 'undefined') {
      const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
      if (!storedActivities) {
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(PRESEEDED_ACTIVITIES));
      } else {
        try {
          const list: Activity[] = JSON.parse(storedActivities);
          const act1 = list.find(a => a.id === 'act_1');
          if (act1 && !act1.endDate) {
            act1.endDate = '2026-10-17';
            localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
          }
        } catch (e) {
          console.error('Error migrating stored activities:', e);
        }
      }
      if (!localStorage.getItem(REGISTRATIONS_KEY)) {
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(PRESEEDED_REGISTRATIONS));
      }
      if (!localStorage.getItem(QAS_KEY)) {
        localStorage.setItem(QAS_KEY, JSON.stringify(PRESEEDED_QAS));
      }
    }
  }

  // Get all activities sorted by date (newest first / chronologically, as requested: "เรียงกิจกรรมตามวันที่")
  // Let's sort chronologically (closest date first)
  static getActivities(): Activity[] {
    this.init();
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ACTIVITIES_KEY);
      const list: Activity[] = data ? JSON.parse(data) : [];
      // Sort chronologically by date
      return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (e) {
      console.error('Error reading activities', e);
      return [];
    }
  }

  static getActivityById(id: string): Activity | null {
    const list = this.getActivities();
    return list.find((a) => a.id === id) || null;
  }

  // Save activity (create or edit)
  static saveActivity(activity: Activity): void {
    this.init();
    if (typeof window === 'undefined') return;
    try {
      const list = this.getActivities();
      const index = list.findIndex((a) => a.id === activity.id);
      
      if (index >= 0) {
        list[index] = { ...activity };
      } else {
        list.push({ ...activity, createdAt: new Date().toISOString() });
      }
      
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving activity', e);
    }
  }

  // Delete activity
  static deleteActivity(id: string): void {
    this.init();
    if (typeof window === 'undefined') return;
    try {
      let list = this.getActivities();
      list = list.filter((a) => a.id !== id);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));

      // Also clean up registrations for this activity
      let regs = this.getRegistrations();
      regs = regs.filter((r) => r.activityId !== id);
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
    } catch (e) {
      console.error('Error deleting activity', e);
    }
  }

  // Get all registrations
  static getRegistrations(): Registration[] {
    this.init();
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(REGISTRATIONS_KEY);
      const list: Registration[] = data ? JSON.parse(data) : [];
      // Newest registrations first
      return list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    } catch (e) {
      console.error('Error reading registrations', e);
      return [];
    }
  }

  // Register for an activity
  static saveRegistration(reg: Omit<Registration, 'id' | 'registeredAt'>): Registration {
    this.init();
    const newReg: Registration = {
      ...reg,
      id: 'reg_' + Math.random().toString(36).substring(2, 11),
      registeredAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const list = this.getRegistrations();
        list.push(newReg);
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Error saving registration', e);
      }
    }
    return newReg;
  }

  // Delete registration
  static deleteRegistration(id: string): void {
    this.init();
    if (typeof window === 'undefined') return;
    try {
      let list = this.getRegistrations();
      list = list.filter((r) => r.id !== id);
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting registration', e);
    }
  }

  // Get QAs for a specific activity
  static getQAsByActivity(activityId: string): ActivityQA[] {
    this.init();
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QAS_KEY);
      const list: ActivityQA[] = data ? JSON.parse(data) : [];
      const filtered = list.filter((qa) => qa.activityId === activityId);
      // Sort oldest first so conversation flows naturally down chronologically
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (e) {
      console.error('Error reading QAs', e);
      return [];
    }
  }

  // Get all QAs
  static getAllQAs(): ActivityQA[] {
    this.init();
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QAS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading all QAs', e);
      return [];
    }
  }

  // Save/add question
  static addQuestion(activityId: string, authorName: string, question: string): ActivityQA {
    this.init();
    const newQA: ActivityQA = {
      id: 'qa_' + Math.random().toString(36).substring(2, 11),
      activityId,
      authorName: authorName.trim() || 'ผู้ปกครองท่านหนึ่ง',
      authorRole: 'parent',
      question: question.trim(),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(QAS_KEY);
        const list: ActivityQA[] = data ? JSON.parse(data) : [];
        list.push(newQA);
        localStorage.setItem(QAS_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Error saving question', e);
      }
    }
    return newQA;
  }

  // Answer a question
  static answerQuestion(qaId: string, answer: string): void {
    this.init();
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(QAS_KEY);
      const list: ActivityQA[] = data ? JSON.parse(data) : [];
      const index = list.findIndex(qa => qa.id === qaId);
      if (index >= 0) {
        list[index].answer = answer.trim();
        list[index].answeredAt = new Date().toISOString();
        localStorage.setItem(QAS_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.error('Error answering question', e);
    }
  }

  // Delete a QA entry
  static deleteQA(qaId: string): void {
    this.init();
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(QAS_KEY);
      let list: ActivityQA[] = data ? JSON.parse(data) : [];
      list = list.filter(qa => qa.id !== qaId);
      localStorage.setItem(QAS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting QA', e);
    }
  }
}
