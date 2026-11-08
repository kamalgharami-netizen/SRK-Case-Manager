import { Company, CaseItem, Party, CauseItem, User } from '../types';

const defaultUser: User = {
  id: 'u_default_admin',
  name: 'Adv. S. K. Roy',
  email: 'skroy.advocate@gmail.com',
  phone: '9830112233',
  role: 'Admin',
  password: '1234',
  passcode: '1234',
  isMain: true,
  createdAt: Date.now() - 30 * 86400000
};

const defaultParties: Party[] = [
  {
    id: 'p_1',
    name: 'Debashis Chatterjee',
    type: 'Client',
    phone: '9830112233',
    email: 'debashis.c@gmail.com',
    address: 'Vill & P.O. Rajarhat, Dist. North 24 Parganas, PIN 700135',
    createdAt: Date.now() - 20 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  },
  {
    id: 'p_2',
    name: 'Ashok Kumar Mondal',
    type: 'Client',
    phone: '9874556677',
    email: 'ashok.mondal@yahoo.com',
    address: 'Mouza Gopalpur, J.L. No. 2, Block Rajarhat',
    createdAt: Date.now() - 15 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  },
  {
    id: 'p_3',
    name: 'Subrata Banerjee',
    type: 'Client',
    phone: '9433221100',
    email: 'subrata.b@outlook.com',
    address: 'Action Area II, New Town, Kolkata - 700156',
    createdAt: Date.now() - 10 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  }
];

const todayStr = new Date().toISOString().slice(0, 10);

const defaultCases: CaseItem[] = [
  {
    id: 'case_mute_101',
    type: 'mutation',
    caseNo: 'MN/2026/0412',
    appNo: 'MUTE/2026/9021',
    subType: 'Warishan & Purchase Mutation',
    status: 'Hearing Fixed',
    party: 'Debashis Chatterjee',
    opp: 'State of West Bengal & Ors',
    forum: 'Office of the BL&LRO, Rajarhat',
    filingDate: '2026-01-15',
    nextDate: todayStr,
    priority: 'High',
    landSchedules: [
      {
        id: 'ls_1',
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: 'Rajarhat Bishnupur',
        jl: '12',
        khatian: '412',
        dag: '856',
        area: '0.15',
        unit: 'acre',
        classification: 'Sali',
        recordType: 'ROR'
      }
    ],
    applicants: [
      {
        id: 'app_1',
        name: 'Debashis Chatterjee',
        father: 'Late Birendra Nath Chatterjee',
        address: 'Vill Rajarhat, North 24 Parganas',
        phone: '9830112233'
      }
    ],
    respondents: [],
    addresses: [],
    chainLinks: [],
    attachments: [],
    createdAt: Date.now() - 15 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  },
  {
    id: 'case_misc_202',
    type: 'misc',
    caseNo: 'MISC/2026/0118',
    appNo: 'MISC/APP/5512',
    subType: 'Rectification of Share u/s 50A',
    status: 'Under Inquiry',
    party: 'Ashok Kumar Mondal',
    opp: 'Pranab Ghosh & Ors',
    forum: 'Office of the BL&LRO, Rajarhat',
    filingDate: '2026-02-01',
    nextDate: todayStr,
    priority: 'Normal',
    landSchedules: [
      {
        id: 'ls_2',
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: 'Gopalpur',
        jl: '2',
        khatian: '789',
        dag: '1240',
        area: '0.22',
        unit: 'acre',
        classification: 'Bastu',
        recordType: 'ROR'
      }
    ],
    applicants: [
      {
        id: 'app_2',
        name: 'Ashok Kumar Mondal',
        father: 'Late Radhashyam Mondal',
        address: 'Mouza Gopalpur, Rajarhat',
        phone: '9874556677'
      }
    ],
    respondents: [],
    addresses: [],
    chainLinks: [],
    attachments: [],
    createdAt: Date.now() - 10 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  },
  {
    id: 'case_cert_303',
    type: 'certcopy',
    caseNo: 'AIN/2026/44129',
    ainNo: 'AIN/2026/44129',
    appNo: 'AIN/2026/44129',
    grnNo: '192026002345118',
    applicantDeedNo: 'I-04128',
    applicantDeedYear: '2021',
    applicantAdsr: 'ADSR Rajarhat at Bidhannagar',
    district: 'North 24 Parganas',
    subType: 'Certified Copy of Registered Sale Deed',
    status: 'Ready for Delivery',
    party: 'Subrata Banerjee',
    opp: '—',
    forum: 'ADSR Office Rajarhat',
    filingDate: '2026-02-10',
    nextDate: todayStr,
    priority: 'Normal',
    landSchedules: [],
    applicants: [
      {
        id: 'app_3',
        name: 'Subrata Banerjee',
        father: 'Late Sachindra Banerjee',
        address: 'Action Area II, New Town',
        phone: '9433221100'
      }
    ],
    respondents: [],
    addresses: [],
    chainLinks: [],
    attachments: [],
    createdAt: Date.now() - 5 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  },
  {
    id: 'case_rorpi_404',
    type: 'rorpi',
    caseNo: 'ROR/2026/8891',
    rorPiNo: 'ROR/2026/8891',
    appNo: 'ROR/2026/8891',
    grnNo: '192026009871120',
    subType: 'Certified ROR (খতিয়ান নকল / পরচা)',
    status: 'Ready for Delivery',
    party: 'Debashis Chatterjee',
    opp: '—',
    forum: 'Banglarbhumi BL&LRO Portal',
    filingDate: '2026-02-12',
    nextDate: todayStr,
    priority: 'Normal',
    landSchedules: [
      {
        id: 'ls_3',
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: 'Rajarhat Bishnupur',
        jl: '12',
        khatian: '412',
        dag: '856',
        area: '0.15',
        unit: 'acre',
        classification: 'Sali',
        recordType: 'ROR'
      }
    ],
    applicants: [
      {
        id: 'app_4',
        name: 'Debashis Chatterjee',
        father: 'Late Birendra Nath Chatterjee',
        address: 'Vill Rajarhat',
        phone: '9830112233'
      }
    ],
    respondents: [],
    addresses: [],
    chainLinks: [],
    attachments: [],
    createdAt: Date.now() - 3 * 86400000,
    createdBy: 'Adv. S. K. Roy'
  }
];

const defaultCauseList: CauseItem[] = [
  {
    id: 'cause_1',
    time: '11:00 AM',
    caseNo: 'MN/2026/0412',
    forum: 'BL&LRO Rajarhat',
    party: 'Debashis Chatterjee',
    status: 'READY',
    date: todayStr,
    benchRoom: 'Court Room 1'
  },
  {
    id: 'cause_2',
    time: '12:30 PM',
    caseNo: 'MISC/2026/0118',
    forum: 'BL&LRO Rajarhat',
    party: 'Ashok Kumar Mondal',
    status: 'PENDING',
    date: todayStr,
    benchRoom: 'Revenue Officer Chamber'
  }
];

export const INITIAL_DEFAULT_COMPANY: Company = {
  id: 'c_default_srk_chamber',
  name: 'Adv. S. K. Roy & Associates (Chamber of Revenue & Land Laws)',
  type: 'Advocate Chamber',
  barCouncil: 'WB/1482/2012',
  gst: '',
  address: 'Rajarhat Main Road, Opposite BL&LRO Office',
  city: 'North 24 Parganas',
  state: 'West Bengal',
  pin: '700135',
  phone: '9830112233',
  email: 'skroy.advocate@gmail.com',
  logoBadge: 'scales',
  logoColor: '#1E3A8A',
  createdAt: Date.now() - 30 * 86400000,
  users: [defaultUser],
  cases: defaultCases,
  parties: defaultParties,
  causeList: defaultCauseList,
  vaultFiles: [],
  diaryData: {},
  messages: [],
  activityLog: [
    {
      id: 'log_1',
      time: Date.now() - 86400000,
      text: 'Chamber workspace initialized with land revenue registers.',
      userName: 'Adv. S. K. Roy',
      role: 'Admin'
    }
  ],
  whatsappSettings: {
    enabled: true,
    senderPhone: '9830112233',
    defaultLanguage: 'bilingual',
    chamberSignature: 'Adv. S. K. Roy & Associates, Rajarhat Chamber',
    includeBarCouncil: true
  }
};
