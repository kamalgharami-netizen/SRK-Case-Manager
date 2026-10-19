import { Company } from '../types';

// Initial registered chamber structure with zero fake/demo data
export const initialChamberData: Company = {
  id: 'c_srk_chamber_main',
  name: 'S.R. Khan Legal Chamber & Associates',
  type: 'Advocate Chamber',
  barCouncil: 'WB/1482/2012',
  gst: '19AAACS8841M1ZU',
  address: 'Alipore Judges Court Bar Association Building, Ground Floor, Room No. 14',
  city: 'Kolkata',
  state: 'West Bengal',
  pin: '700027',
  phone: '+91 98301 23456',
  email: 'srkhan.advocate@kolkata-law.in',
  createdAt: Date.now() - 365 * 86400000,
  users: [
    {
      id: 'u_admin_srk',
      name: 'Adv. S. R. Khan',
      email: 'srkhan.advocate@kolkata-law.in',
      phone: '+91 98301 23456',
      role: 'Admin',
      password: 'admin',
      passcode: '1234',
      isMain: true,
      createdAt: Date.now() - 365 * 86400000
    },
    {
      id: 'u_jr_priyabrata',
      name: 'Adv. Priyabrata Roy',
      email: 'priyabrata.law@gmail.com',
      phone: '+91 98312 88765',
      role: 'Junior Advocate',
      password: 'user123',
      passcode: '1234',
      isMain: false,
      createdAt: Date.now() - 180 * 86400000
    }
  ],
  cases: [],
  parties: [],
  causeList: [],
  vaultFiles: [],
  messages: [],
  diaryData: {},
  activityLog: []
};
