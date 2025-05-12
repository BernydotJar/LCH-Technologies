
export interface BlogPostContentItem {
  type: 'heading' | 'paragraph' | 'list';
  text?: string; // For heading, paragraph
  level?: 1 | 2 | 3 | 4; // For heading
  items?: string[]; // For list
}

export type BlogPostContent = BlogPostContentItem[];

export interface BlogSource {
  text: string;
  url?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO 8601 format (e.g., "2024-05-15")
  author: string;
  excerpt: string;
  image?: string; // URL for the main blog post image
  content: BlogPostContent;
  sources?: BlogSource[];
}

const blogPosts: BlogPost[] = [
  {
    slug: 'architect-as-catalyst',
    title: 'The Architect as Catalyst: Elevating Functions, Enabling Business, and Capturing True Value',
    date: '2024-05-15', // Assuming a date, update if needed
    author: 'TechFront Insights Team',
    excerpt: 'The landscape for technology architects is undergoing a profound transformation. It is no longer sufficient for architects to merely design and oversee the technical construction of solutions...',
    image: 'https://picsum.photos/800/600?random=blog1', // Placeholder image
    content: [
      {
        type: 'heading',
        level: 2,
        text: 'I. Beyond Implementation: The New Mandate for Technology Architects',
      },
      {
        type: 'paragraph',
        text: `The landscape for technology architects is undergoing a profound transformation. It is no longer sufficient for architects to merely design and oversee the technical construction of solutions. Today’s dynamic business environment demands architects who transcend traditional technical boundaries to become strategic thinkers, integrators of complex systems and processes, and, crucially, elevators of the entire technology function within an organization.

Stakeholders are increasingly posing questions that reflect this shift: "Can you elevate the function?" "Will you play well across leadership and technical teams?" and "Are you the architect we want to build with — not just for — in the long term?" This evolution signifies a move away from evaluations based solely on technical prowess towards a more holistic assessment encompassing leadership, collaborative aptitude, and the capacity for strategic partnership.

The era of the architect as a siloed technical specialist, operating in isolation, is rapidly receding. In its place, the modern architect is emerging as a "T-shaped" professional. This model describes an individual who possesses deep technical expertise in specific domains—such as Robotic Process Automation (RPA) with platforms like UiPath and Power Platform, or technologies like AI and cloud infrastructure—combined with a broad understanding of business operations, strategy, and highly developed collaborative skills. Enterprise and solution architects are now expected to align closely with a business perspective, supporting wider organizational objectives beyond their immediate technical tasks.

This requires a fundamental change in mindset. The new mandate calls for a proactive, outcome-focused approach, deeply attuned to the human and business context in which technology operates. This redefinition of the architect's role is not simply about adding more responsibilities; it represents a fundamental shift in the architect's identity within the organization. The architect is evolving from a position of primarily technical authority to that of a strategic business partner. This transition is evidenced by the expectation that architects will support wider organizational objectives and ensure that IT strategy aligns with overarching business goals. Such a role is pulled "upward" into the strategic echelons of the company, implying a new way of contributing at a significantly higher level.

This shift naturally creates a competency gap. Organizations now seek individuals who can navigate not only complex technological systems but also the intricate human dynamics and pressing business imperatives that drive or impede technological success. Professionals with multidisciplinary backgrounds, for instance, combining deep technological expertise with an understanding of Business Psychology, are uniquely positioned to fill this void. The demand is for architects who can bridge the gap between traditional technical architecture and these newly emphasized strategic and human-centric skills, offering a direct response to evolving market needs.`
      },
      {
        type: 'heading',
        level: 2,
        text: 'II. Decoding Stakeholder Needs: A Business Psychology Perspective',
      },
      {
        type: 'paragraph',
        text: `To effectively elevate the technology function and forge lasting partnerships, an architect must first develop a profound understanding of what different stakeholders are genuinely evaluating. Often, their true needs and concerns lie deeper than their explicitly stated questions. A background in Business Psychology, for example, underscores the importance of looking beyond surface-level inquiries to uncover underlying motivations, anxieties, and aspirations. This section explores the perspectives of key stakeholders, viewing them not merely as roles but as individuals operating under specific pressures and pursuing distinct objectives.`
      },
      {
        type: 'heading',
        level: 3,
        text: 'The RPA Center of Excellence (CoE) Leader: Seeking Strategic Partnership for Standards, Scalability, and Governance',
      },
      {
        type: 'paragraph',
        text: `The RPA CoE Leader typically asks: "Can this person drive standards, scale, and cross-functional governance as a strategic partner?"

Underlying this question is a critical need: "I require an individual who can help establish and maintain a sustainable, efficient, and highly regarded automation capability across the entire enterprise. This means an architect who thinks beyond isolated projects, focusing on the long-term health and maturity of our RPA program. It's about ensuring we are not just building automations, but building them correctly and prioritizing the right automations."

The CoE leader seeks an ally in managing complexity and mitigating risk. An RPA Solution Architect plays a pivotal role in this context by ensuring that everyone within the CoE, including all stakeholders, agrees upon and adheres to best practices. This includes establishing proper coding standards and guidelines, identifying reusable components to prevent redundant effort, and meticulously managing configurable parameters, queues, and robot schedules to optimize both cost and runtime. Such responsibilities form the bedrock of robust standards, effective scalability, and sound governance.

The architect is a critical figure within the CoE, responsible for defining the architecture of RPA solutions and overseeing their development from inception to completion, demonstrating the strategic oversight expected by the CoE Leader.`
      },
    ],
    sources: [
      { text: 'Solution Architect: Role and Responsibilities - AltexSoft', url: 'https://www.altexsoft.com/blog/solution-architect-role/' },
      { text: 'Enterprise architect - Government Digital and Data Profession Capability Framework', url: 'https://ddat-capability-framework.service.gov.uk/role/enterprise-architect' },
      { text: 'Director IT Architecture - UL Solutions | Built In Chicago', url: 'https://www.builtinchicago.org/job/director-it-architecture/259791' },
      { text: 'Business Psychology - The Decision Lab', url: 'https://thedecisionlab.com/reference-guide/management/business-psychology' },
      { text: 'The Psychology of Stakeholder Management in Tech Projects ...', url: 'https://www.brandonperfetti.com/articles/stakeholder-manageent' }, // Note: manageent might be a typo in original
      { text: 'What makes a good RPA Solution Architect! - auxiliobits', url: 'https://www.auxiliobits.com/what-makes-a-good-rpa-solution-architect/' },
      { text: 'How to Build an RPA Center of Excellence (CoE) - Blueprint', url: 'https://www.blueprintsys.com/content/rpa/build-rpa-center-of-excellence/' },
    ],
  },
];

export const getBlogPosts = (): BlogPost[] => {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};
