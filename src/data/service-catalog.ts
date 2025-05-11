
import type { LucideIcon } from 'lucide-react';
import { Brain, Cog, Bot, Search, ShieldCheck, TestTube2, BarChartBig, CloudCog, Zap, Layers, Database, Users, BarChart, Workflow, Globe, Lock, Telescope } from 'lucide-react'; // Added Layers, Database, Users, and icons for new services

export interface ServiceUseCase {
  title: string;
  description: string;
  image?: string; // Optional: URL for an image illustrating the use case
  dataAiHint?: string; // AI hint for use case image
}

export interface ServiceFeature {
  name: string;
  description: string;
  icon?: LucideIcon; // Optional: Icon for the feature
}

export interface Service {
  id: string; // e.g., AI-ML-100
  category: string; // e.g., "AI & Machine Learning"
  categorySlug: string; // e.g., "ai-ml"
  categoryDescription: string;
  categoryIcon?: LucideIcon; 
  categoryBannerImage?: string; // URL for category banner
  categoryDataAiHint?: string; // AI hint for category banner image
  serviceName: string; // e.g., "Program Roadmap and Capability Advisory"
  serviceSlug: string; // e.g., "program-roadmap-capability-advisory"
  tagline: string;
  overview: string; // "What It Is"
  shortDescription: string; // For cards/listings
  benefits: string[];
  useCases?: ServiceUseCase[];
  features?: ServiceFeature[];
  relatedProducts?: string[];
  serviceIcon?: LucideIcon; // Optional icon for the service card itself
  mediaPlaceholder?: {
    type: 'video' | 'diagram' | 'gallery' | 'gif';
    caption: string;
    src?: string; // for video embed or main gallery image/gif
    galleryImages?: string[]; // for gallery type
  };
}

export const serviceCategories = [
  {
    name: "AI & Machine Learning",
    slug: "ai-ml",
    description: "Leverage the power of Artificial Intelligence and Machine Learning to unlock new insights, automate processes, and create intelligent applications.",
    icon: Brain,
    bannerImage: "https://picsum.photos/1200/400?random=1",
    dataAiHint: "artificial intelligence"
  },
  {
    name: "CORE Engineering",
    slug: "core-engineering",
    description: "Build robust, scalable, and high-performance software solutions tailored to your specific business needs with our expert engineering practices.",
    icon: Cog,
    bannerImage: "https://picsum.photos/1200/400?random=2",
    dataAiHint: "software development"
  },
  {
    name: "Robotic Process Automation",
    slug: "rpa",
    description: "Automate repetitive tasks, improve efficiency, and reduce operational costs with our intelligent Robotic Process Automation solutions.",
    icon: Bot,
    bannerImage: "https://picsum.photos/1200/400?random=3",
    dataAiHint: "automation process"
  },
  {
    name: "Discovery & Analytics",
    slug: "discovery-analytics",
    description: "Uncover valuable insights from your data to make informed decisions and drive business growth with our advanced analytics capabilities.",
    icon: Search,
    bannerImage: "https://picsum.photos/1200/400?random=4",
    dataAiHint: "data analytics"
  },
  {
    name: "Power Platform Services", // New Category
    slug: "power-platform",
    description: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform. We help you build, govern, and scale low-code solutions.",
    icon: Layers, // Using Layers icon for Power Platform
    bannerImage: "https://picsum.photos/1200/400?random=7", // New random image
    dataAiHint: "low code platform"
  },
  {
    name: "Manage & Infrastructure",
    slug: "manage-infrastructure",
    description: "Optimize and manage your IT infrastructure for reliability, scalability, and security, ensuring seamless business operations.",
    icon: CloudCog,
    bannerImage: "https://picsum.photos/1200/400?random=5",
    dataAiHint: "cloud infrastructure"
  },
  {
    name: "Testing & Quality Assurance",
    slug: "testing-qa",
    description: "Ensure the highest quality and reliability of your software applications with our comprehensive testing and QA services.",
    icon: TestTube2,
    bannerImage: "https://picsum.photos/1200/400?random=6",
    dataAiHint: "software testing"
  }
];

export const services: Service[] = [
  // AI & Machine Learning
  {
    id: "AI-ML-100",
    category: "AI & Machine Learning",
    categorySlug: "ai-ml",
    categoryDescription: "Leverage the power of Artificial Intelligence and Machine Learning.",
    categoryIcon: Brain,
    serviceName: "AI Strategy & Roadmap",
    serviceSlug: "ai-strategy-roadmap",
    tagline: "Define your AI journey for transformative results.",
    shortDescription: "Develop a comprehensive AI strategy and roadmap aligned with your business objectives.",
    overview: "Our AI Strategy & Roadmap service helps you identify opportunities, define use cases, and create a prioritized plan for AI adoption. We assess your current capabilities, identify potential challenges, and outline the steps to achieve tangible business value through AI.",
    benefits: [
      "Clear path to AI adoption",
      "Maximized ROI on AI investments",
      "Alignment with business goals",
      "Risk mitigation"
    ],
    features: [
      { name: "Current State Assessment", description: "Evaluate your existing data, infrastructure, and AI maturity.", icon: BarChartBig },
      { name: "Use Case Identification & Prioritization", description: "Discover and rank high-impact AI applications for your business.", icon: Zap },
      { name: "Technology Stack Recommendation", description: "Advise on the optimal AI tools, platforms, and technologies.", icon: Cog },
      { name: "Implementation Roadmap", description: "Develop a phased plan with clear milestones and deliverables.", icon: CloudCog }
    ],
    useCases: [
      { title: "AI for Customer Personalization", description: "Understand how AI can tailor customer experiences at scale.", image: "https://picsum.photos/400/300?random=10", dataAiHint: "customer experience" },
      { title: "Predictive Maintenance with ML", description: "Explore AI's role in forecasting equipment failures to reduce downtime.", image: "https://picsum.photos/400/300?random=11", dataAiHint: "industrial machine" }
    ],
    relatedProducts: ["Data Analytics Platforms", "Cloud AI Services"],
    mediaPlaceholder: {
      type: "diagram",
      caption: "Visualizing your AI adoption journey.",
      src: "https://picsum.photos/600/400?random=12", 
    }
  },
  {
    id: "AI-ML-101",
    category: "AI & Machine Learning",
    categorySlug: "ai-ml",
    categoryDescription: "Leverage the power of Artificial Intelligence and Machine Learning.",
    categoryIcon: Brain,
    serviceName: "Custom ML Model Development",
    serviceSlug: "custom-ml-model-development",
    tagline: "Build tailored machine learning models for unique challenges.",
    shortDescription: "Design and deploy custom machine learning models to solve specific business problems and gain a competitive edge.",
    overview: "We specialize in developing bespoke machine learning models when off-the-shelf solutions fall short. Our process covers data collection, preprocessing, feature engineering, model training, evaluation, and deployment, ensuring solutions that are accurate, scalable, and interpretable.",
    benefits: [
      "Solutions tailored to specific needs",
      "Higher accuracy and performance",
      "Competitive differentiation",
      "Ownership of IP"
    ],
    features: [
      { name: "Data Preprocessing & Feature Engineering", description: "Prepare and transform your data for optimal model performance.", icon: Cog },
      { name: "Algorithm Selection & Tuning", description: "Choose and fine-tune the best ML algorithms for your specific problem.", icon: TestTube2 },
      { name: "Model Deployment & MLOps", description: "Integrate models into production systems and manage their lifecycle.", icon: CloudCog },
      { name: "Performance Monitoring & Retraining", description: "Continuously track model performance and retrain as needed.", icon: BarChartBig }
    ],
    useCases: [
        { title: "Fraud Detection Systems", description: "Develop custom models to identify and prevent fraudulent transactions with higher accuracy.", image: "https://picsum.photos/400/300?random=13", dataAiHint: "security system" },
        { title: "Natural Language Processing for Sentiment Analysis", description: "Build models to understand customer opinions from text data.", image: "https://picsum.photos/400/300?random=14", dataAiHint: "customer feedback" }
    ],
    relatedProducts: ["Python, TensorFlow, PyTorch", "Cloud ML Platforms"],
    mediaPlaceholder: {
      type: "video",
      caption: "See how custom ML models drive innovation.",
      src: "https://www.youtube.com/embed/honaayFV2gA", 
    }
  },
  // CORE Engineering
  {
    id: "CORE-200",
    category: "CORE Engineering",
    categorySlug: "core-engineering",
    categoryDescription: "Build robust, scalable, and high-performance software solutions.",
    categoryIcon: Cog,
    serviceName: "Custom Software Development",
    serviceSlug: "custom-software-development",
    tagline: "Tailored software solutions to meet your unique business needs.",
    shortDescription: "Design, develop, and deploy custom software applications that drive efficiency and innovation.",
    overview: "Our custom software development services provide end-to-end solutions, from initial concept and design to development, testing, deployment, and ongoing maintenance. We build scalable, secure, and high-performance applications tailored to your specific requirements.",
    benefits: [
      "Solutions perfectly aligned with business processes",
      "Scalability to support growth",
      "Enhanced operational efficiency",
      "Competitive advantage through unique features"
    ],
    features: [
      { name: "Full-Stack Development", description: "Expertise in front-end, back-end, and database technologies.", icon: Cog },
      { name: "Agile Methodology", description: "Iterative development for flexibility and faster delivery.", icon: Zap },
      { name: "UI/UX Design", description: "User-centric design for intuitive and engaging experiences.", icon: Brain },
      { name: "API Development & Integration", description: "Seamless integration with existing systems and third-party services.", icon: CloudCog }
    ],
    relatedProducts: ["Cloud Platforms (AWS, Azure, GCP)", "DevOps Tools"],
    mediaPlaceholder: {
      type: "gallery",
      caption: "Examples of our custom software projects.",
      galleryImages: [
        "https://picsum.photos/600/400?random=20",
        "https://picsum.photos/600/400?random=21",
        "https://picsum.photos/600/400?random=22",
      ]
    }
  },
  {
    id: "CORE-201",
    category: "CORE Engineering",
    categorySlug: "core-engineering",
    categoryDescription: "Build robust, scalable, and high-performance software solutions.",
    categoryIcon: Cog,
    serviceName: "Cloud-Native Application Development",
    serviceSlug: "cloud-native-app-development",
    tagline: "Build and modernize applications for the cloud era.",
    shortDescription: "Develop scalable, resilient, and agile applications designed specifically for cloud environments.",
    overview: "We help businesses leverage the full potential of cloud computing by building cloud-native applications. This includes microservices architecture, containerization (Docker, Kubernetes), serverless functions, and DevOps practices to ensure rapid deployment and continuous improvement.",
    benefits: [
      "Enhanced scalability and elasticity",
      "Improved resilience and fault tolerance",
      "Faster development and deployment cycles",
      "Optimized resource utilization and cost-efficiency"
    ],
    features: [
      { name: "Microservices Architecture", description: "Design applications as a collection of small, independent services.", icon: Zap },
      { name: "Containerization & Orchestration", description: "Package and manage applications using Docker and Kubernetes.", icon: CloudCog },
      { name: "Serverless Computing", description: "Build event-driven applications without managing servers.", icon: Zap },
      { name: "DevOps & CI/CD Pipelines", description: "Automate build, test, and deployment processes.", icon: Cog }
    ],
    useCases: [
        { title: "Scalable E-commerce Platforms", description: "Build online stores that can handle high traffic and seasonal peaks.", image: "https://picsum.photos/400/300?random=23", dataAiHint: "online shopping" },
        { title: "Real-time Data Processing Systems", description: "Develop applications that can process and analyze streaming data.", image: "https://picsum.photos/400/300?random=24", dataAiHint: "data stream" }
    ],
    relatedProducts: ["AWS, Azure, GCP", "Docker, Kubernetes"],
    mediaPlaceholder: {
      type: "diagram",
      caption: "Architecture of a cloud-native application.",
      src: "https://picsum.photos/600/400?random=25"
    }
  },
  // RPA
  {
    id: "RPA-300",
    category: "Robotic Process Automation",
    categorySlug: "rpa",
    categoryDescription: "Automate repetitive tasks with intelligent RPA solutions.",
    categoryIcon: Bot,
    serviceName: "RPA Implementation & Support",
    serviceSlug: "rpa-implementation-support",
    tagline: "Streamline operations with end-to-end RPA solutions.",
    shortDescription: "Implement and support RPA solutions to automate manual processes and improve operational efficiency.",
    overview: "Our RPA services cover the full lifecycle, from process discovery and bot development to deployment, monitoring, and ongoing support. We help you identify automation opportunities, build robust bots, and ensure they deliver consistent value.",
    benefits: [
      "Reduced operational costs",
      "Increased process speed and accuracy",
      "Improved employee productivity and satisfaction",
      "Enhanced compliance and auditability"
    ],
    features: [
        { name: "Process Discovery & Assessment", description: "Identify and evaluate processes suitable for automation.", icon: Search },
        { name: "Bot Development & Testing", description: "Design, build, and test resilient RPA bots.", icon: Bot },
        { name: "Deployment & Orchestration", description: "Deploy bots into your environment and manage their execution.", icon: CloudCog },
        { name: "Monitoring & Maintenance", description: "Provide ongoing support and optimization for your RPA solutions.", icon: Cog }
    ],
    useCases: [
        { title: "Automated Data Entry", description: "Eliminate manual data entry across multiple systems.", image: "https://picsum.photos/400/300?random=31", dataAiHint: "data entry" },
        { title: "Report Generation", description: "Automate the creation and distribution of regular reports.", image: "https://picsum.photos/400/300?random=32", dataAiHint: "financial report" }
    ],
    mediaPlaceholder: {
      type: "gif",
      caption: "RPA bot automating a data entry task.",
      src: "https://picsum.photos/600/400?random=30&gif", 
    }
  },
  // Discovery & Analytics
  {
    id: "DA-400",
    category: "Discovery & Analytics",
    categorySlug: "discovery-analytics",
    categoryDescription: "Uncover valuable insights from your data.",
    categoryIcon: Search,
    serviceName: "Data Visualization & BI",
    serviceSlug: "data-visualization-bi",
    tagline: "Transform data into actionable insights with powerful visualizations.",
    shortDescription: "Create interactive dashboards and reports for data-driven decision-making.",
    overview: "We help you make sense of complex data through intuitive and interactive visualizations and Business Intelligence (BI) dashboards. Our solutions empower users at all levels to explore data, identify trends, and make informed decisions quickly.",
    benefits: [
      "Clear understanding of key metrics and KPIs",
      "Faster and more confident decision-making",
      "Identification of trends and patterns",
      "Improved collaboration through shared insights"
    ],
    features: [
        { name: "Interactive Dashboards", description: "Develop dynamic dashboards for real-time data exploration.", icon: BarChartBig },
        { name: "Custom Reporting Solutions", description: "Design reports tailored to specific business needs and audiences.", icon: Cog },
        { name: "Data Source Integration", description: "Connect to various data sources for a unified view.", icon: Database },
        { name: "User Training & Adoption", description: "Empower your team to effectively use BI tools.", icon: Users } 
    ],
    relatedProducts: ["Tableau, Power BI, Qlik", "Data Warehousing solutions"],
    mediaPlaceholder: {
        type: "gallery",
        caption: "Examples of our BI dashboards.",
        galleryImages: [
          "https://picsum.photos/600/400?random=40",
          "https://picsum.photos/600/400?random=41",
        ]
      }
  },
  // Manage & Infrastructure
  {
    id: "MI-500",
    category: "Manage & Infrastructure",
    categorySlug: "manage-infrastructure",
    categoryDescription: "Optimize and manage your IT infrastructure.",
    categoryIcon: CloudCog,
    serviceName: "Cloud Migration Services",
    serviceSlug: "cloud-migration-services",
    tagline: "Seamlessly transition your applications and data to the cloud.",
    shortDescription: "Plan and execute a smooth and secure migration of your IT assets to leading cloud platforms.",
    overview: "Our cloud migration services provide a structured approach to moving your workloads to the cloud. We assess your current environment, develop a migration strategy, execute the migration with minimal disruption, and optimize your cloud setup for performance and cost.",
    benefits: [
      "Reduced infrastructure costs",
      "Increased scalability and agility",
      "Enhanced security and disaster recovery",
      "Access to advanced cloud services"
    ],
    features: [
        { name: "Cloud Readiness Assessment", description: "Evaluate your applications and infrastructure for cloud suitability.", icon: Search },
        { name: "Migration Strategy & Planning", description: "Develop a tailored migration plan (Rehost, Replatform, Refactor, etc.).", icon: Cog },
        { name: "Secure Data & Application Migration", description: "Execute the migration process with robust security measures.", icon: ShieldCheck },
        { name: "Post-Migration Optimization", description: "Fine-tune your cloud environment for cost and performance.", icon: Zap }
    ],
    mediaPlaceholder: {
        type: "diagram",
        caption: "Phased approach to cloud migration.",
        src: "https://picsum.photos/600/400?random=50"
      }
  },
  // Testing & QA
  {
    id: "TQA-600",
    category: "Testing & Quality Assurance",
    categorySlug: "testing-qa",
    categoryDescription: "Ensure the highest quality and reliability of your software.",
    categoryIcon: TestTube2,
    serviceName: "Automated Testing Solutions",
    serviceSlug: "automated-testing-solutions",
    tagline: "Accelerate delivery and improve quality with test automation.",
    shortDescription: "Implement automated testing frameworks to ensure software quality and speed up release cycles.",
    overview: "We design and implement robust test automation frameworks for web, mobile, and API testing. Our solutions help you achieve higher test coverage, reduce manual testing efforts, and detect defects earlier in the development lifecycle, leading to faster, more reliable releases.",
    benefits: [
      "Faster release cycles",
      "Improved test coverage and accuracy",
      "Reduced testing costs",
      "Early defect detection"
    ],
    features: [
        { name: "Test Automation Strategy", description: "Define a comprehensive strategy for test automation.", icon: Cog },
        { name: "Framework Development", description: "Build custom, reusable test automation frameworks.", icon: Zap },
        { name: "Script Development & Execution", description: "Write and execute automated test scripts.", icon: TestTube2 },
        { name: "CI/CD Integration", description: "Integrate test automation into your CI/CD pipeline.", icon: CloudCog }
    ],
    mediaPlaceholder: {
        type: "video",
        caption: "Demonstration of our test automation framework in action.",
        src: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder video
      }
  },
  // Power Platform Services 
  {
    id: "PP-700",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Power Apps Development",
    serviceSlug: "power-apps-development",
    tagline: "Crea aplicaciones empresariales personalizadas rápidamente.",
    shortDescription: "Permite crear aplicaciones empresariales personalizadas sin necesidad de codificación, según Microsoft.",
    overview: "Leverage Power Apps to quickly create low-code applications that modernize processes and tackle business challenges. We guide you through the entire lifecycle, from ideation and design to development, deployment, and governance, enabling citizen developers and professional developers alike. Permite crear aplicaciones empresariales personalizadas sin necesidad de codificación, según Microsoft.",
    benefits: [
      "Desarrollo acelerado de aplicaciones",
      "Eficiencia operativa mejorada mediante soluciones personalizadas",
      "Empoderamiento de los desarrolladores ciudadanos",
      "Integración perfecta con el ecosistema de Microsoft"
    ],
    features: [
      { name: "Custom App Design & Prototyping", description: "Visualize and refine your app idea before development.", icon: Brain },
      { name: "Canvas & Model-Driven App Development", description: "Build both UI-focused and data-centric applications.", icon: Layers },
      { name: "Dataverse Integration & Custom Connectors", description: "Connect to your data sources securely and efficiently.", icon: Database },
      { name: "Power Platform Governance & ALM", description: "Establish best practices for managing and deploying Power Apps.", icon: ShieldCheck }
    ],
    useCases: [
      { title: "Field Service Mobile Apps", description: "Equip field technicians with custom apps for real-time data access and updates.", image: "https://picsum.photos/400/300?random=70", dataAiHint: "mobile application" },
      { title: "Internal Process Automation Apps", description: "Develop apps for expense approvals, inventory management, or employee onboarding.", image: "https://picsum.photos/400/300?random=71", dataAiHint: "business process" }
    ],
    relatedProducts: ["Microsoft Power Automate", "Microsoft Power BI", "Microsoft Dataverse", "SharePoint"],
    serviceIcon: Layers,
    mediaPlaceholder: {
      type: "gallery",
      caption: "Screenshots of custom Power Apps solutions.",
      galleryImages: [
        "https://picsum.photos/600/400?random=72",
        "https://picsum.photos/600/400?random=73",
      ]
    }
  },
  {
    id: "PP-701",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Power BI",
    serviceSlug: "power-bi",
    tagline: "Visualiza y analiza datos para decisiones.",
    shortDescription: "Permite visualizar y analizar datos para la toma de decisiones.",
    overview: "Permite visualizar y analizar datos para la toma de decisiones.",
    benefits: [
        "Información basada en datos",
        "Paneles interactivos",
        "Toma de decisiones informada"
    ],
    serviceIcon: BarChart,
  },
  {
    id: "PP-702",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Power Automate (Cloud & Desktop Flows)",
    serviceSlug: "power-automate",
    tagline: "Automatiza flujos y tareas repetitivas.",
    shortDescription: "Automatiza flujos de trabajo y tareas repetitivas para aumentar la productividad.",
    overview: "Automatiza flujos de trabajo y tareas repetitivas para aumentar la productividad. Nuestros Desktop Flows son tan buenos que casi desearían ser robots RPA... ¡pero están demasiado ocupados haciendo tu trabajo!",
    benefits: [
        "Productividad incrementada",
        "Reducción del esfuerzo manual",
        "Procesos de negocio optimizados"
    ],
    serviceIcon: Workflow,
  },
  {
    id: "PP-703",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Power Pages",
    serviceSlug: "power-pages",
    tagline: "Crea sitios web y soluciones de cliente.",
    shortDescription: "Permite crear sitios web y soluciones de cliente rápidamente.",
    overview: "Permite crear sitios web y soluciones de cliente rápidamente.",
    benefits: [
        "Despliegue rápido de sitios web",
        "Portales de cliente seguros",
        "Interacción con el cliente mejorada"
    ],
    serviceIcon: Globe,
  },
  {
    id: "PP-704",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Microsoft Dataverse",
    serviceSlug: "dataverse",
    tagline: "Plataforma de datos para tus aplicaciones.",
    shortDescription: "Una plataforma de datos que almacena y gestiona los datos de las aplicaciones y flujos de trabajo.",
    overview: "Una plataforma de datos que almacena y gestiona los datos de las aplicaciones y flujos de trabajo.",
    benefits: [
        "Gestión de datos centralizada",
        "Almacenamiento de datos seguro y escalable",
        "Integración perfecta con Power Platform"
    ],
    serviceIcon: Database,
  },
  {
    id: "PP-705",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Copilot Studio",
    serviceSlug: "copilot-studio",
    tagline: "Construye copilots personalizados.",
    shortDescription: "Permite construir copilots personalizados para mejorar las experiencias de los clientes y empleados.",
    overview: "Permite construir copilots personalizados para mejorar las experiencias de los clientes y empleados.",
    benefits: [
        "Servicio al cliente mejorado con IA",
        "Productividad de empleados mejorada mediante asistentes personalizados",
        "Experiencias de IA a medida"
    ],
    serviceIcon: Telescope, // Using Bot as a placeholder, consider a more specific icon for Copilots if available/created
  },
  {
    id: "PP-706",
    category: "Power Platform Services",
    categorySlug: "power-platform",
    categoryDescription: "Empower your organization with custom apps, automated workflows, and insightful analytics using Microsoft Power Platform.",
    categoryIcon: Layers,
    serviceName: "Power Platform Security & Governance",
    serviceSlug: "power-platform-security-governance",
    tagline: "Gestiona y protege tus inversiones low-code.",
    shortDescription: "Ofrece herramientas para gestionar, supervisar y proteger las inversiones de bajo código, con cumplimiento y gobernanza de nivel empresarial.",
    overview: "Ofrece herramientas para gestionar, supervisar y proteger las inversiones de bajo código, con cumplimiento y gobernanza de nivel empresarial.",
    benefits: [
        "Seguridad de nivel empresarial",
        "Garantía de cumplimiento normativo",
        "Gobernanza robusta de low-code"
    ],
    serviceIcon: Lock,
  }
];

// Helper functions to get data
export const getCategories = () => {
  return serviceCategories.map(cat => ({
    ...cat,
    services: services.filter(s => s.categorySlug === cat.slug)
  }));
};

export const getCategoryBySlug = (slug: string) => {
  const categoryInfo = serviceCategories.find(c => c.slug === slug);
  if (!categoryInfo) return null;
  return {
    ...categoryInfo,
    services: services.filter(s => s.categorySlug === slug)
  };
};

export const getServiceBySlugs = (categorySlug: string, serviceSlug: string) => {
  return services.find(s => s.categorySlug === categorySlug && s.serviceSlug === serviceSlug) || null;
};

export const commonBusinessChallenges = [
  {
    title: "Streamline Operations",
    description: "Reduce manual effort and boost efficiency with automation and optimized workflows.",
    link: "/solutions/rpa", 
    icon: Zap,
    dataAiHint: "workflow automation"
  },
  {
    title: "Innovate with AI",
    description: "Unlock new possibilities and gain a competitive edge by integrating AI and ML into your core processes.",
    link: "/solutions/ai-ml",
    icon: Brain,
    dataAiHint: "machine learning"
  },
  {
    title: "Optimize Infrastructure",
    description: "Build a scalable, secure, and cost-effective IT backbone to support your growing business needs.",
    link: "/solutions/manage-infrastructure",
    icon: CloudCog,
    dataAiHint: "cloud computing"
  },
  {
    title: "Enhance Data Insights",
    description: "Turn your data into actionable intelligence for smarter decisions and strategic planning.",
    link: "/solutions/discovery-analytics",
    icon: BarChartBig,
    dataAiHint: "business intelligence"
  },
  { 
    title: "Accelerate Digital Transformation",
    description: "Rapidly build and deploy custom applications and automated workflows with low-code solutions.",
    link: "/solutions/power-platform",
    icon: Layers, 
    dataAiHint: "digital transformation"
  }
];
