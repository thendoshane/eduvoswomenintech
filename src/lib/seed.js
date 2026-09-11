import { pad } from './utils'

function atToday(hour, minute) {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function relative(minutes) {
  return new Date(Date.now() + minutes * 60000).toISOString()
}

export function createDemoData() {
  const today = new Date()
  const dateOnly = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const speakers = [
    {
      id: 'speaker_lerato',
      name: 'Lerato Mokoena',
      title: 'Technology Leader',
      organisation: 'Industry Partner',
      bio: 'Technology professional focused on leadership, digital transformation and creating pathways for women in technology.',
      imageUrl: '',
      linkedinUrl: '',
      category:'Speaker',
      showOnPanel:true
    },
    {
      id: 'speaker_naledi',
      name: 'Naledi Khumalo',
      title: 'AI & Data Specialist',
      organisation: 'Technology Industry',
      bio: 'AI and data practitioner sharing practical lessons on skills, career growth and the future of work.',
      imageUrl: '',
      linkedinUrl: '',
      category:'Speaker',
      showOnPanel:true
    },
    {
      id: 'speaker_ayanda',
      name: 'Ayanda Dlamini',
      title: 'Cybersecurity Professional',
      organisation: 'Digital Security',
      bio: 'Cybersecurity specialist passionate about secure innovation, mentorship and expanding participation in technology careers.',
      imageUrl: '',
      linkedinUrl: '',
      category:'Speaker',
      showOnPanel:true
    }
  ]

  const sessions = [
    {
      id: 'session_welcome',
      title: 'Welcome & Opening',
      description: 'Opening remarks, event orientation and a quick look at the day ahead.',
      startAt: relative(-70),
      endAt: relative(-40),
      room: 'Main Stage',
      type: 'Opening',
      speakerIds: ['speaker_lerato'],
      manualStatus: 'finished',
      qnaEnabled: false,
      streamUrl: ''
    },
    {
      id: 'session_ai',
      title: 'Women Shaping the Future of AI',
      description: 'A practical conversation on AI, career pathways, emerging roles and the opportunities available to the next generation of technologists.',
      startAt: relative(-20),
      endAt: relative(25),
      room: 'Main Stage',
      type: 'Keynote',
      speakerIds: ['speaker_naledi'],
      manualStatus: 'auto',
      qnaEnabled: true,
      streamUrl: ''
    },
    {
      id: 'session_cyber',
      title: 'Cybersecurity, Leadership & Opportunity',
      description: 'A discussion on cybersecurity careers, leadership and how women can build visible, sustainable careers in a fast-moving field.',
      startAt: relative(35),
      endAt: relative(80),
      room: 'Main Stage',
      type: 'Panel',
      speakerIds: ['speaker_ayanda', 'speaker_lerato'],
      manualStatus: 'auto',
      qnaEnabled: true,
      streamUrl: ''
    },
    {
      id: 'session_network',
      title: 'Networking & Closing',
      description: 'Connect with speakers and attendees, share key takeaways and close the summit.',
      startAt: relative(90),
      endAt: relative(130),
      room: 'Networking Area',
      type: 'Networking',
      speakerIds: [],
      manualStatus: 'auto',
      qnaEnabled: false,
      streamUrl: ''
    }
  ]

  return {
    event: {
      id: 'women-in-tech-summit',
      name: 'Eduvos Women in Tech Summit',
      organiser: 'Eduvos',
      tagline: 'Women Shaping the Future of Technology.',
      homeIntro: 'Women in IT Summit is a premier platform designed to inspire, empower, and connect women across the technology ecosystem around South Africa. The summit seeks to address the gender gap in technology by creating opportunities for learning, mentorship, networking, leadership development, and industry collaboration. The event will bring together students, academics, technology professionals, entrepreneurs, executives, policymakers, and industry leaders to engage in meaningful conversations about the future of technology and the critical role women play in driving innovation.\n\nThrough keynote presentations, panel discussions, mentorship sessions, and networking opportunities, participants will gain valuable insights, practical skills, and professional connections that support their growth within the digital economy as females.',
      date: '2026-09-21',
      venue: 'Eduvos Bedfordview Campus',
      locationNote: "Lv201, Building E, Gillooly's View Office Park, Osborne Lane, Bedfordview",
      eventFormat:'Hybrid event',
      startTime:'08:00',
      endTime:'16:00',
      hashtag: '#WomenInTech',
      wifiName: '',
      wifiPassword: '',
      contacts: [
        { name:'Siba Maphukata', role:'Chairperson', email:'siba.maphukata@eduvos.com', phone:'', imageUrl:'' },
        { name:'Danica Heusdens', role:'Deputy Chairperson', email:'danica.heusdens@eduvos.com', phone:'', imageUrl:'' },
        { name:'Yvonne Fayeti', role:'Treasurer', email:'yvonne.fayeti@eduvos.com', phone:'', imageUrl:'' },
        { name:'Siyaxolisa Dayisi', role:'Project Analyst', email:'siyaxolisa.dayisi@eduvos.com', phone:'' }
      ],
      streamUrl: '',
      streamEmbedUrl: '',
      contactName: 'Event Team',
      contactPhone: '',
      contactEmail: '',
      websiteUrl: 'https://www.eduvos.com/',
      eventStatus: 'live',
      welcomeMessage: 'Be inspired by women driving innovation, leadership and change across the technology industry. Follow the programme live, explore speakers, ask questions and stay connected throughout the summit.',
      updatedAt: new Date().toISOString()
    },
    sessions,
    speakers,
    announcements: [
      {
        id: 'announcement_welcome',
        message: 'Welcome to the Women in Tech Summit. Programme changes will appear here live.',
        active: true,
        createdAt: new Date().toISOString()
      }
    ],
    questions: [
      {
        id: 'question_demo_1',
        sessionId: 'session_ai',
        text: 'Which AI skills should graduates prioritise when entering the industry?',
        userId: 'demo-user-1',
        voteCount: 8,
        voterIds: [],
        status: 'visible',
        pinned: true,
        answered: false,
        createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'question_demo_2',
        sessionId: 'session_ai',
        text: 'What is one practical way to build experience before getting a first tech role?',
        userId: 'demo-user-2',
        voteCount: 5,
        voterIds: [],
        status: 'visible',
        pinned: false,
        answered: false,
        createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
}
