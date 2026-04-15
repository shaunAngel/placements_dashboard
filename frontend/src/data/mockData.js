// Mock seed data for VNRVJIET Placement Portal
// 500+ students, 80 companies, 200+ offer submissions, 50 active offers

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CHEM'];
const BATCHES = ['2021-25', '2022-26', '2023-27', '2024-28'];
const COMPANY_TYPES = ['Service', 'Product', 'Core', 'Startup'];
const OFFER_TYPES = ['Full-time', 'Internship', 'PPO', 'Part-time'];
const STATUS_OPTIONS = ['Placed', 'Unplaced', 'PPO', 'Intern'];

const firstNames = [
  'Aarav', 'Aditi', 'Aishwarya', 'Akash', 'Ananya', 'Arun', 'Arjun', 'Bhavana', 'Chetan',
  'Deepika', 'Divya', 'Ganesh', 'Harini', 'Ishaan', 'Karthik', 'Kavya', 'Keerthi', 'Lavanya',
  'Mahesh', 'Manasa', 'Meghana', 'Mohan', 'Nandini', 'Naveen', 'Nikhil', 'Pooja', 'Pranav',
  'Priya', 'Rahul', 'Rajesh', 'Rakesh', 'Ramya', 'Ravi', 'Rohit', 'Sahithi', 'Sai', 'Sandeep',
  'Sanjana', 'Sarath', 'Shruti', 'Sindhu', 'Sneha', 'Sowmya', 'Sravani', 'Suresh', 'Swathi',
  'Tejasri', 'Teja', 'Uma', 'Usha', 'Varun', 'Vikram', 'Vimala', 'Vishal', 'Yamini', 'Yogesh',
  'Abhishek', 'Aditya', 'Amani', 'Amrutha', 'Anirudh', 'Anjali', 'Ankit', 'Anvitha', 'Asha',
  'Balaji', 'Bharat', 'Chandana', 'Chaitra', 'Darshan', 'Deeksha', 'Dhruv', 'Dinesh', 'Faisal',
  'Geeta', 'Girish', 'Gourav', 'Hema', 'Himaja', 'Indira', 'Janaki', 'Jaya', 'Kiran', 'Krishnan',
];

const lastNames = [
  'Reddy', 'Sharma', 'Kumar', 'Singh', 'Rao', 'Nair', 'Pillai', 'Naidu', 'Verma', 'Gupta',
  'Patel', 'Shah', 'Joshi', 'Mehta', 'Iyer', 'Krishnan', 'Subramaniam', 'Nambiar', 'Menon',
  'Shetty', 'Hegde', 'Kamath', 'Bhat', 'Gowda', 'Swamy', 'Murthy', 'Rajan', 'Chandra',
  'Bose', 'Das', 'Dey', 'Roy', 'Gosh', 'Banerjee', 'Mukherjee', 'Chakraborty', 'Chatterjee',
  'Mishra', 'Tiwari', 'Pandey', 'Aggarwal', 'Vyas', 'Trivedi', 'Jain', 'Kapoor', 'Malhotra',
];

const companies = [
  { id: 'c1', name: 'Tata Consultancy Services', shortName: 'TCS', type: 'Service', website: 'https://tcs.com', avgPackage: 7, highestPackage: 9.5, status: 'Active', branches: ['CSE', 'ECE', 'IT', 'MECH'], logo: null },
  { id: 'c2', name: 'Infosys', shortName: 'Infosys', type: 'Service', website: 'https://infosys.com', avgPackage: 6.5, highestPackage: 8, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c3', name: 'Wipro Technologies', shortName: 'Wipro', type: 'Service', website: 'https://wipro.com', avgPackage: 6, highestPackage: 7.5, status: 'Active', branches: ['CSE', 'ECE', 'EEE', 'IT'], logo: null },
  { id: 'c4', name: 'HCL Technologies', shortName: 'HCL', type: 'Service', website: 'https://hcltech.com', avgPackage: 6.8, highestPackage: 8.5, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c5', name: 'Cognizant Technology', shortName: 'CTS', type: 'Service', website: 'https://cognizant.com', avgPackage: 7.2, highestPackage: 9, status: 'Active', branches: ['CSE', 'ECE', 'IT', 'MECH'], logo: null },
  { id: 'c6', name: 'Microsoft India', shortName: 'Microsoft', type: 'Product', website: 'https://microsoft.com', avgPackage: 29, highestPackage: 45, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c7', name: 'Google India', shortName: 'Google', type: 'Product', website: 'https://google.com', avgPackage: 32, highestPackage: 48, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c8', name: 'Amazon India', shortName: 'Amazon', type: 'Product', website: 'https://amazon.com', avgPackage: 24, highestPackage: 38, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c9', name: 'Deloitte India', shortName: 'Deloitte', type: 'Service', website: 'https://deloitte.com', avgPackage: 8, highestPackage: 12, status: 'Active', branches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'], logo: null },
  { id: 'c10', name: 'Accenture', shortName: 'Accenture', type: 'Service', website: 'https://accenture.com', avgPackage: 7.5, highestPackage: 11, status: 'Active', branches: ['CSE', 'ECE', 'IT', 'MECH'], logo: null },
  { id: 'c11', name: 'Capgemini', shortName: 'Capgemini', type: 'Service', website: 'https://capgemini.com', avgPackage: 6.5, highestPackage: 8.5, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c12', name: 'Tech Mahindra', shortName: 'Tech Mahindra', type: 'Service', website: 'https://techmahindra.com', avgPackage: 6.2, highestPackage: 8, status: 'Active', branches: ['CSE', 'ECE', 'EEE', 'IT'], logo: null },
  { id: 'c13', name: 'Zoho Corporation', shortName: 'Zoho', type: 'Product', website: 'https://zoho.com', avgPackage: 12, highestPackage: 18, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c14', name: 'Flipkart', shortName: 'Flipkart', type: 'Product', website: 'https://flipkart.com', avgPackage: 18, highestPackage: 28, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c15', name: 'PhonePe', shortName: 'PhonePe', type: 'Startup', website: 'https://phonepe.com', avgPackage: 20, highestPackage: 32, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c16', name: 'Razorpay', shortName: 'Razorpay', type: 'Startup', website: 'https://razorpay.com', avgPackage: 22, highestPackage: 35, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c17', name: 'BHEL', shortName: 'BHEL', type: 'Core', website: 'https://bhel.com', avgPackage: 8.5, highestPackage: 10, status: 'Active', branches: ['MECH', 'EEE', 'ECE', 'CIVIL'], logo: null },
  { id: 'c18', name: 'ONGC', shortName: 'ONGC', type: 'Core', website: 'https://ongcindia.com', avgPackage: 9, highestPackage: 11, status: 'Active', branches: ['MECH', 'CIVIL', 'CHEM', 'EEE'], logo: null },
  { id: 'c19', name: 'L&T Technology Services', shortName: 'LTTS', type: 'Core', website: 'https://ltts.com', avgPackage: 10, highestPackage: 15, status: 'Active', branches: ['MECH', 'ECE', 'EEE', 'CIVIL', 'CSE'], logo: null },
  { id: 'c20', name: 'Oracle India', shortName: 'Oracle', type: 'Product', website: 'https://oracle.com', avgPackage: 16, highestPackage: 24, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c21', name: 'SAP Labs India', shortName: 'SAP', type: 'Product', website: 'https://sap.com', avgPackage: 15, highestPackage: 22, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c22', name: 'Goldman Sachs', shortName: 'Goldman Sachs', type: 'Product', website: 'https://goldmansachs.com', avgPackage: 28, highestPackage: 40, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c23', name: 'Morgan Stanley', shortName: 'Morgan Stanley', type: 'Product', website: 'https://morganstanley.com', avgPackage: 26, highestPackage: 38, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c24', name: 'PayPal India', shortName: 'PayPal', type: 'Product', website: 'https://paypal.com', avgPackage: 21, highestPackage: 30, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c25', name: 'Qualcomm India', shortName: 'Qualcomm', type: 'Core', website: 'https://qualcomm.com', avgPackage: 18, highestPackage: 26, status: 'Active', branches: ['ECE', 'EEE'], logo: null },
  { id: 'c26', name: 'Texas Instruments', shortName: 'TI', type: 'Core', website: 'https://ti.com', avgPackage: 16, highestPackage: 22, status: 'Active', branches: ['ECE', 'EEE', 'CSE'], logo: null },
  { id: 'c27', name: 'Bosch India', shortName: 'Bosch', type: 'Core', website: 'https://bosch.com', avgPackage: 11, highestPackage: 16, status: 'Active', branches: ['MECH', 'ECE', 'EEE', 'CIVIL'], logo: null },
  { id: 'c28', name: 'Siemens India', shortName: 'Siemens', type: 'Core', website: 'https://siemens.com', avgPackage: 12, highestPackage: 17, status: 'Active', branches: ['MECH', 'EEE', 'ECE', 'CIVIL'], logo: null },
  { id: 'c29', name: 'IBM India', shortName: 'IBM', type: 'Service', website: 'https://ibm.com', avgPackage: 9.5, highestPackage: 14, status: 'Active', branches: ['CSE', 'ECE', 'IT', 'EEE'], logo: null },
  { id: 'c30', name: 'Epam Systems', shortName: 'Epam', type: 'Service', website: 'https://epam.com', avgPackage: 13, highestPackage: 18, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c31', name: 'Mphasis', shortName: 'Mphasis', type: 'Service', website: 'https://mphasis.com', avgPackage: 7.8, highestPackage: 10, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c32', name: 'Mindtree', shortName: 'Mindtree', type: 'Service', website: 'https://mindtree.com', avgPackage: 8.2, highestPackage: 11, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c33', name: 'Hexaware Technologies', shortName: 'Hexaware', type: 'Service', website: 'https://hexaware.com', avgPackage: 7, highestPackage: 9, status: 'Active', branches: ['CSE', 'ECE', 'IT', 'MECH'], logo: null },
  { id: 'c34', name: 'Persistent Systems', shortName: 'Persistent', type: 'Service', website: 'https://persistent.com', avgPackage: 8.5, highestPackage: 12, status: 'Active', branches: ['CSE', 'ECE', 'IT'], logo: null },
  { id: 'c35', name: 'Freshworks', shortName: 'Freshworks', type: 'Startup', website: 'https://freshworks.com', avgPackage: 14, highestPackage: 20, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c36', name: 'Swiggy', shortName: 'Swiggy', type: 'Startup', website: 'https://swiggy.com', avgPackage: 16, highestPackage: 24, status: 'Active', branches: ['CSE', 'IT', 'ECE'], logo: null },
  { id: 'c37', name: 'Zomato', shortName: 'Zomato', type: 'Startup', website: 'https://zomato.com', avgPackage: 15, highestPackage: 22, status: 'Active', branches: ['CSE', 'IT'], logo: null },
  { id: 'c38', name: 'Byju\'s', shortName: 'Byju\'s', type: 'Startup', website: 'https://byjus.com', avgPackage: 7.5, highestPackage: 10, status: 'Inactive', branches: ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'], logo: null },
  { id: 'c39', name: 'KPMG India', shortName: 'KPMG', type: 'Service', website: 'https://kpmg.com/in', avgPackage: 10, highestPackage: 14, status: 'Active', branches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'], logo: null },
  { id: 'c40', name: 'PwC India', shortName: 'PwC', type: 'Service', website: 'https://pwc.in', avgPackage: 9.5, highestPackage: 13, status: 'Active', branches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'], logo: null },
];

// Extend companies to 80
for (let i = 41; i <= 80; i++) {
  const extraCompanies = [
    { name: `Wipro GE`, type: 'Core' }, { name: 'Larsen & Toubro Infotech', type: 'Service' },
    { name: 'Muthoot Finance', type: 'Service' }, { name: 'Tata Motors', type: 'Core' },
    { name: 'Hero MotoCorp', type: 'Core' }, { name: 'Asian Paints', type: 'Core' },
    { name: 'Bajaj Auto', type: 'Core' }, { name: 'Maruti Suzuki', type: 'Core' },
    { name: 'JSW Steel', type: 'Core' }, { name: 'Vedanta Limited', type: 'Core' },
    { name: 'Hindustan Unilever', type: 'Service' }, { name: 'ITC Limited', type: 'Core' },
    { name: 'Hindustan Aeronautics', type: 'Core' }, { name: 'DRDO', type: 'Core' },
    { name: 'ISRO', type: 'Core' }, { name: 'NIC', type: 'Service' },
    { name: 'Jio Platforms', type: 'Product' }, { name: 'Paytm', type: 'Startup' },
    { name: 'PolicyBazaar', type: 'Startup' }, { name: 'CureFit', type: 'Startup' },
    { name: 'Nykaa', type: 'Startup' }, { name: 'Udaan', type: 'Startup' },
    { name: 'Meesho', type: 'Startup' }, { name: 'CRED', type: 'Startup' },
    { name: 'Cars24', type: 'Startup' }, { name: 'OYO Rooms', type: 'Startup' },
    { name: 'MakeMyTrip', type: 'Startup' }, { name: 'Naukri.com', type: 'Startup' },
    { name: 'Info Edge', type: 'Startup' }, { name: '99acres', type: 'Startup' },
    { name: 'Moj (ShareChat)', type: 'Startup' }, { name: 'InMobi', type: 'Startup' },
    { name: 'Springworks', type: 'Startup' }, { name: 'Darwinbox', type: 'Startup' },
    { name: 'Browserstack', type: 'Product' }, { name: 'Chargebee', type: 'Startup' },
    { name: 'Postman', type: 'Startup' }, { name: 'Hasura', type: 'Startup' },
    { name: 'Locus', type: 'Startup' }, { name: 'Unacademy', type: 'Startup' },
  ];
  const extra = extraCompanies[(i - 41) % extraCompanies.length];
  const allBranches = ['CSE', 'ECE', 'IT'];
  const avgPkg = parseFloat((Math.random() * 15 + 5).toFixed(1));
  companies.push({
    id: `c${i}`,
    name: `${extra.name} ${i > 60 ? '(Unit ' + (i - 60) + ')' : ''}`.trim(),
    shortName: extra.name.split(' ')[0],
    type: extra.type,
    website: `https://company${i}.com`,
    avgPackage: avgPkg,
    highestPackage: parseFloat((avgPkg + Math.random() * 8 + 2).toFixed(1)),
    status: Math.random() > 0.15 ? 'Active' : 'Inactive',
    branches: allBranches.slice(0, Math.floor(Math.random() * 3) + 1),
    logo: null,
  });
}

// Generate students
function generateStudents() {
  const students = [];
  let studentId = 1;
  for (const batch of BATCHES) {
    const batchYear = parseInt(batch.split('-')[1]);
    for (const branch of BRANCHES) {
      const count = Math.floor(Math.random() * 30 + 50); // 50-80 per branch per batch
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rollNo = `${batchYear}${branch}${String(studentId % 1000).padStart(3, '0')}`;
        const isPlaced = Math.random() > 0.25;
        const company = isPlaced ? companies[Math.floor(Math.random() * 30)] : null;
        const pkg = isPlaced ? parseFloat((Math.random() * 25 + 4).toFixed(2)) : null;
        const status = !isPlaced
          ? 'Unplaced'
          : (Math.random() > 0.85 ? 'PPO' : (Math.random() > 0.9 ? 'Intern' : 'Placed'));

        students.push({
          id: `s${studentId}`,
          rollNo,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          branch,
          batch,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@vnrvjiet.ac.in`,
          personalEmail: `${firstName.toLowerCase()}${studentId}@gmail.com`,
          contact: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
          cgpa: parseFloat((Math.random() * 3 + 6.5).toFixed(2)),
          status,
          company: company ? company.name : null,
          companyId: company ? company.id : null,
          package: pkg,
          offerType: isPlaced ? (Math.random() > 0.8 ? 'Internship' : 'Full-time') : null,
          offerDate: isPlaced ? `2024-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}` : null,
          multipleOffers: isPlaced && Math.random() > 0.8,
          photo: null,
        });
        studentId++;
      }
    }
  }
  return students;
}

const students = generateStudents();

// Generate offer submissions
function generateSubmissions(students) {
  const submissions = [];
  const placedStudents = students.filter(s => s.status !== 'Unplaced');
  for (let i = 0; i < Math.min(placedStudents.length, 240); i++) {
    const student = placedStudents[i];
    const statuses = ['Verified', 'Verified', 'Verified', 'Pending', 'Pending', 'Rejected'];
    const submissionStatus = statuses[Math.floor(Math.random() * statuses.length)];
    submissions.push({
      id: `sub${i + 1}`,
      submissionDate: `2024-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
      rollNo: student.rollNo,
      studentId: student.id,
      name: student.name,
      branch: student.branch,
      batch: student.batch,
      company: student.company,
      companyId: student.companyId,
      package: student.package,
      offerType: student.offerType || 'Full-time',
      offerLetterRef: `OL${String(i + 1).padStart(5, '0')}`,
      joiningDate: `2024-07-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
      location: ['Hyderabad', 'Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Delhi'][Math.floor(Math.random() * 6)],
      status: submissionStatus,
      rejectionReason: submissionStatus === 'Rejected' ? 'Document unclear, please resubmit a legible copy.' : null,
      verifiedBy: submissionStatus === 'Verified' ? 'Dr. Ramesh Kumar' : null,
    });
  }
  return submissions;
}

// Generate active offers
function generateActiveOffers() {
  const offers = [];
  const roles = [
    'Software Development Engineer', 'Graduate Trainee', 'System Engineer',
    'Associate Consultant', 'Data Analyst', 'Product Manager Intern',
    'Backend Developer', 'Frontend Developer', 'Full Stack Engineer',
    'DevOps Engineer', 'Machine Learning Engineer', 'Network Engineer',
    'VLSI Design Engineer', 'Embedded Systems Engineer', 'Mechanical Design Engineer',
    'Civil Site Engineer', 'Operations Analyst', 'Business Analyst',
  ];
  const locations = ['Hyderabad', 'Bangalore', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Noida', 'Gurgaon'];

  for (let i = 0; i < 55; i++) {
    const company = companies[Math.floor(Math.random() * 40)];
    const isPast = i >= 35;
    const deadline = isPast
      ? `2024-${String(Math.floor(Math.random() * 6 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`
      : `2025-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`;
    const offerType = OFFER_TYPES[Math.floor(Math.random() * OFFER_TYPES.length)];
    const pkg = offerType === 'Internship'
      ? `${Math.floor(Math.random() * 30 + 10)}k/month`
      : `${parseFloat((Math.random() * 20 + 4).toFixed(1))} LPA`;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));

    let status = 'Open';
    if (isPast || daysLeft < 0) status = 'Closed';
    else if (daysLeft > 30) status = 'Upcoming';

    offers.push({
      id: `offer${i + 1}`,
      companyId: company.id,
      companyName: company.name,
      companyType: company.type,
      role: roles[Math.floor(Math.random() * roles.length)],
      offerType,
      package: pkg,
      stipend: offerType === 'Internship' ? pkg : null,
      eligibleBranches: company.branches,
      eligibleBatch: BATCHES[Math.floor(Math.random() * BATCHES.length)],
      cgpaCutoff: parseFloat((Math.random() * 2 + 6).toFixed(1)),
      deadline,
      daysLeft: Math.max(daysLeft, 0),
      location: locations[Math.floor(Math.random() * locations.length)],
      status,
      isPinned: i < 3,
      postedBy: 'Placement Cell, VNRVJIET',
      postedDate: `2024-${String(Math.floor(Math.random() * 6 + 1)).padStart(2, '0')}-01`,
      updatedDate: `2024-${String(Math.floor(Math.random() * 6 + 1)).padStart(2, '0')}-15`,
      description: `${company.name} is hiring ${offerType === 'Internship' ? 'interns' : 'full-time engineers'} for the role of ${roles[Math.floor(Math.random() * roles.length)]}. This is an excellent opportunity to work with a leading ${company.type.toLowerCase()} company.`,
      process: ['Online Assessment', 'Technical Interview Round 1', 'Technical Interview Round 2', 'HR Interview'].slice(0, Math.floor(Math.random() * 3 + 2)),
      applyUrl: company.website,
    });
  }
  return offers;
}

// Year-over-year placement data
const yearlyStats = [
  { year: '2020-21', placed: 312, total: 480, avgPackage: 6.8, highestPackage: 28, companies: 45, offers: 380 },
  { year: '2021-22', placed: 358, total: 492, avgPackage: 7.4, highestPackage: 32, companies: 52, offers: 420 },
  { year: '2022-23', placed: 390, total: 510, avgPackage: 8.1, highestPackage: 38, companies: 61, offers: 468 },
  { year: '2023-24', placed: 421, total: 524, avgPackage: 9.2, highestPackage: 45, companies: 72, offers: 512 },
  { year: '2024-25', placed: 183, total: 260, avgPackage: 10.1, highestPackage: 48, companies: 38, offers: 234 },
];

// Branch-wise stats
const branchStats = [
  { branch: 'CSE', total: 180, placed: 162, avgPackage: 12.4, highest: 48 },
  { branch: 'ECE', total: 120, placed: 98, avgPackage: 9.8, highest: 26 },
  { branch: 'EEE', total: 80, placed: 58, avgPackage: 8.2, highest: 17 },
  { branch: 'MECH', total: 100, placed: 72, avgPackage: 7.1, highest: 16 },
  { branch: 'CIVIL', total: 60, placed: 38, avgPackage: 6.4, highest: 11 },
  { branch: 'IT', total: 100, placed: 91, avgPackage: 11.8, highest: 38 },
  { branch: 'CHEM', total: 40, placed: 28, avgPackage: 7.8, highest: 14 },
];

// Package distribution
const packageDistribution = [
  { bracket: 'Below 5 LPA', count: 48, color: '#94a3b8' },
  { bracket: '5–10 LPA', count: 198, color: '#1A3A6B' },
  { bracket: '10–20 LPA', count: 132, color: '#2a5099' },
  { bracket: '20–30 LPA', count: 52, color: '#F5A623' },
  { bracket: 'Above 30 LPA', count: 18, color: '#d4891a' },
];

// Top companies by placed count
const topCompanies = [
  { company: 'TCS', count: 68, id: 'c1' },
  { company: 'Infosys', count: 52, id: 'c2' },
  { company: 'Wipro', count: 45, id: 'c3' },
  { company: 'Cognizant', count: 38, id: 'c5' },
  { company: 'HCL', count: 34, id: 'c4' },
  { company: 'Accenture', count: 29, id: 'c10' },
  { company: 'Capgemini', count: 24, id: 'c11' },
  { company: 'Deloitte', count: 22, id: 'c9' },
  { company: 'Amazon', count: 18, id: 'c8' },
  { company: 'Microsoft', count: 15, id: 'c6' },
];

// Users
const users = [
  { id: 'u1', name: 'Admin User', email: 'admin@vnrvjiet.ac.in', role: 'Admin', branch: null, batch: null, status: 'Active' },
  { id: 'u2', name: 'Dr. Ramesh Kumar', email: 'placement@vnrvjiet.ac.in', role: 'Staff', branch: null, batch: null, status: 'Active' },
  { id: 'u3', name: 'Prof. Lakshmi Devi', email: 'faculty@vnrvjiet.ac.in', role: 'Faculty', branch: 'CSE', batch: null, status: 'Active' },
  { id: 'u4', name: 'Aarav Reddy', email: 'aarav.reddy@vnrvjiet.ac.in', role: 'Student', branch: 'CSE', batch: '2021-25', status: 'Active', studentId: 's1' },
];

const activeOffers = generateActiveOffers();
const submissions = generateSubmissions(students);

export {
  students,
  companies,
  activeOffers,
  submissions,
  yearlyStats,
  branchStats,
  packageDistribution,
  topCompanies,
  users,
  BRANCHES,
  BATCHES,
  COMPANY_TYPES,
  OFFER_TYPES,
  STATUS_OPTIONS,
};
