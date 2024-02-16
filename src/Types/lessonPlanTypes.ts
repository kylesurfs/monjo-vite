export type State = {
  id: string;
  name: string;
};

export const states: State[] = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
];

export type Grade = {
  id: string;
  name: string;
};

export const grades: Grade[] = [
  { id: 'first', name: '1st' },
  { id: 'second', name: '2nd' },
  { id: 'third', name: '3rd' },
  { id: 'fourth', name: '4th' },
  { id: 'fifth', name: '5th' },
  { id: 'sixth', name: '6th' },
  { id: 'seventh', name: '7th' },
  { id: 'eighth', name: '8th' },
  { id: 'ninth', name: '9th' },
  { id: 'tenth', name: '10th' },
  { id: 'eleventh', name: '11th' },
  { id: 'twelfth', name: '12th' },
];

export type Subject = {
  id: string;
  name: string;
};

export const subjects: Subject[] = [
  { id: 'math', name: 'Math' },
  { id: 'science', name: 'Science' },
  { id: 'english', name: 'English' },
  { id: 'social_studies', name: 'Social Studies' },
  { id: 'art', name: 'Art' },
  { id: 'music', name: 'Music' },
  { id: 'foreign_language', name: 'Foreign Language' },
];

export type LessonStandard = {
  id: string;
  name: string;
};

export const lessonStandards: LessonStandard[] = [
  { id: 'ccss', name: 'Common Core State Standards (CCSS)' },
  { id: 'nex_gen_science', name: 'Next Generation Science Standards (NGSS)' },
  { id: 'ib', name: 'International Baccalaureate (IB)' },
  { id: 'cie', name: 'Cambridge International Examinations (CIE)' },
  { id: 'college_readiness', name: 'College and Career Readiness Standards' },
  { id: 'ncss', name: 'National Council for Social Studies (NCSS)' },
  {
    id: 'actfl',
    name: 'American Council on the Teaching of Foreign Languages (ACTFL)',
  },
  {
    id: 'iste_students',
    name: 'International Society for Technology in Education (ISTE)',
  },
  { id: 'skills_21st_century', name: '21st Century Skills' },
  {
    id: 'early_childhood_education',
    name: 'Early Childhood Education Standards',
  },
];

//-- Desired Outputs textarea --//
export type DesiredOutputsText = string;

//-- Desired Outputs buttons --//
export type DesiredOutputs = {
  id: string;
  name: string;
};

export const desiredOutputsButtons: DesiredOutputs[] = [
  { id: 'practice_questions', name: 'Set of practice questions' },
  {
    id: 'reading_assingment',
    name: 'Reading assignment (of a few paragraphs)',
  },
  {
    id: 'detailed_explanations',
    name: 'Detailed explanations of certain topics',
  },
  {
    id: 'vocabulary',
    name: 'List of vocabulary words + definitions + example sentences',
  },
  {
    id: 'exit ticket',
    name: 'Exit ticket',
  },
  // TODO -- add more and edit the above
];

//-- Handle text area for Desired Outputs --//
export type SelectedDesiredOutputs = {
  [key: string]: boolean;
};

export type LessonPlanDataType = {
  grade: Grade;
  subject: Subject;
  state: State;
  lessonStandard: LessonStandard;
  prompt: string | null;
  desiredOutputs?: DesiredOutputsText;
  selectedDesiredOutputs?: SelectedDesiredOutputs;
};
