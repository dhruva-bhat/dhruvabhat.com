export type Discipline =
  | 'AI Infrastructure'
  | 'Backend Engineering'
  | 'Computational Biology'
  | 'Neuroscience'
  | 'Scientific Machine Learning'
  | 'Bioengineering'
  | 'Materials Science'
  | 'Public-Interest Technology'

export type Project = {
  slug: string
  title: string
  institution: string
  role: string
  dates: string
  summary: string
  description: string
  disciplines: Discipline[]
  technologies: string[]
  status: string
  metric?: string
  topology: string[]
  sections: {
    problem: string
    approach: string
    contribution: string
    results: string
    reflection: string
  }
  relatedProjects?: string[]
}

export type Experience = {
  id: string
  organization: string
  role: string
  dates: string
  summary: string
  details: string[]
  technologies: string[]
  current?: boolean
  disciplines: Discipline[]
  projectSlugs: string[]
}

export type TimelineEntry = Experience & {
  kind: 'experience' | 'education'
}

export type Publication = {
  title: string
  type: 'Paper' | 'Oral presentation' | 'Patent'
  venue: string
  year: number
  status: string
  summary: string
  link?: string
}

export type Skill = {
  name: string
  group: 'Languages' | 'Backend / Infrastructure' | 'AI / ML'
  projectSlugs: string[]
}

export const siteConfig = {
  name: 'Dhruva Bhat',
  email: 'dhruva.betkoppa@gmail.com',
  phone: '858-205-4029',
  linkedin: 'https://linkedin.com/in/dhruvabhat',
  github: '',
  scholar: '',
  orcid: '',
  resume: '/resume/dhruva-bhat-resume.pdf',
  positioning: 'AI Infrastructure Engineer / ML Platform Engineer',
  currentRole: 'AI Platform Engineering Intern at Oak Ridge National Laboratory',
  education: 'B.S. Electrical Engineering and Computer Science + Bioengineering · UC Berkeley · May 2028',
} as const

export const navigation = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
] as const

export const socialLinks = [
  { label: 'LinkedIn', href: siteConfig.linkedin, external: true },
  { label: 'Email', href: `mailto:${siteConfig.email}`, external: false },
  { label: 'Résumé', href: siteConfig.resume, external: true },
] as const

export const projectPriority = [
  'ornl-ai-infrastructure',
  'blueprint-routing-platform',
  'cmu-llm-evaluation',
  'eeg-vector-database',
  'thin-film-machine-learning',
] as const

function sections(
  problem: string,
  approach: string,
  contribution: string,
  results: string,
  reflection: string,
) {
  return { problem, approach, contribution, results, reflection }
}

export const projects: Project[] = [
  {
    slug: 'ornl-ai-infrastructure',
    title: 'AI Infrastructure Pipeline',
    institution: 'Oak Ridge National Laboratory',
    role: 'AI Platform Engineering Intern',
    dates: 'May — Jul 2026',
    summary: 'Reliable infrastructure for asynchronous, multi-stage AI workflows in a national-laboratory environment.',
    description: 'FastAPI services orchestrating multi-agent reasoning, retrieval, generative models, and molecular diffusion workflows.',
    disciplines: ['AI Infrastructure', 'Backend Engineering', 'Scientific Machine Learning'],
    technologies: ['Python', 'FastAPI', 'Docker', 'Async I/O', 'RAG', 'Multi-agent systems'],
    status: 'Summer 2026',
    topology: ['FastAPI gateway', 'Async orchestration', 'Agents + RAG + generation', 'Cache + retry + fallback', 'Results + evaluation'],
    sections: sections(
      'Complex AI workflows required multiple reasoning, retrieval, and generation services to operate reliably as one system.',
      'Build modular FastAPI services with asynchronous task execution around Google CoScientist, multi-agent tournament reasoning, RAG, and molecular diffusion models.',
      'Dhruva engineered the end-to-end orchestration pipeline, service APIs, caching layers, retry mechanisms, fallback strategies, and Dockerized environments.',
      'The resulting infrastructure standardized dependencies and improved robustness across multi-stage, multi-environment workflows.',
      'AI platform work depends as much on failure handling and service boundaries as it does on model capability.',
    ),
    relatedProjects: ['cmu-llm-evaluation', 'blueprint-routing-platform'],
  },
  {
    slug: 'blueprint-routing-platform',
    title: 'Volunteer Application and Routing Platform',
    institution: 'Blueprint at Berkeley',
    role: 'Full-Stack and Algorithms Developer',
    dates: 'Feb 2026 — Present',
    summary: 'A production cloud application and constraint-aware routing system for Amigos de Los Rios.',
    description: 'React and Next.js interfaces backed by Supabase, PostgreSQL, AWS Lambda, authentication, and geospatial routing logic.',
    disciplines: ['Backend Engineering', 'Public-Interest Technology'],
    technologies: ['React', 'Next.js', 'AWS Lambda', 'Supabase', 'PostgreSQL', 'REST APIs'],
    status: 'Ongoing',
    topology: ['PlanItGeo REST API', 'PostgreSQL data', 'Routing algorithm', 'Volunteer workflows'],
    sections: sections(
      'Volunteers and administrators needed operational software that could assign feasible watering routes under time, location, and resource constraints.',
      'Combine authenticated workflows, dynamic admin dashboards, PlanItGeo REST data, and PostgreSQL-backed waterfall prioritization.',
      'Dhruva built and deployed the cloud application and designed the geospatial routing algorithm and backend decision logic.',
      'The system generates volunteer routes from live operational constraints rather than static assignments.',
      'Backend algorithms create value only when they fit the real workflows and interfaces around them.',
    ),
    relatedProjects: ['ornl-ai-infrastructure', 'cmu-llm-evaluation'],
  },
  {
    slug: 'cmu-llm-evaluation',
    title: 'Modular LLM Evaluation Framework',
    institution: 'Carnegie Mellon University',
    role: 'AI Safety Research Assistant',
    dates: 'Mar 2025 — Present',
    summary: 'Backend infrastructure for orchestrating LLM experiments across multiple model environments.',
    description: 'A modular experimentation pipeline integrating inference APIs, experiment configuration, and automated analysis.',
    disciplines: ['AI Infrastructure', 'Backend Engineering'],
    technologies: ['Python', 'LLM APIs', 'Experiment pipelines', 'Automated evaluation'],
    status: 'Ongoing',
    topology: ['Experiment config', 'Model orchestration', 'Inference APIs', 'Automated analysis'],
    sections: sections(
      'LLM behavior needed to be tested consistently across model environments and compared with game-theory baselines.',
      'Create a modular backend that separates experiment configuration, inference integration, orchestration, and analysis.',
      'Dhruva developed the experimentation pipeline while collaborating with Professor Sarah H. Cen on bounded rationality in institutional settings.',
      'The framework supports repeatable model experiments and automated downstream analysis.',
      'Reliable evaluation systems require reproducibility, clear configuration, and comparable outputs across providers.',
    ),
    relatedProjects: ['ornl-ai-infrastructure', 'blueprint-routing-platform'],
  },
  {
    slug: 'eeg-vector-database',
    title: 'EEG Vector Representation System',
    institution: 'Independent Project',
    role: 'Research Developer',
    dates: '2025',
    summary: 'A vector representation pipeline for comparing Parkinson’s and healthy-patient EEG signals.',
    description: 'Wilson–Cowen signals transformed with CEBRA and stored as searchable vector embeddings.',
    disciplines: ['Neuroscience', 'Scientific Machine Learning'],
    technologies: ['Python', 'CEBRA', 'ChromaDB', 'EEG'],
    status: 'Complete',
    topology: ['EEG signals', 'CEBRA encoder', 'Vector embeddings', 'Comparative analysis'],
    sections: sections(
      'Neurological signals are high-dimensional and difficult to compare directly.',
      'Generate excitatory-inhibitory patterns with the Wilson–Cowen model, encode EEG data with CEBRA, and store the representations in a vector database.',
      'Dhruva built the simulation, embedding, storage, visualization, and comparison workflow.',
      'An offset-10 model was trained to identify differences between Parkinson’s and healthy-patient EEG data.',
      'Representation design determines which neurological differences become legible to downstream systems.',
    ),
    relatedProjects: ['ucsf-ml-pipeline', 'thin-film-machine-learning'],
  },
  {
    slug: 'thin-film-machine-learning',
    title: 'Thin-Film Scientific ML',
    institution: 'Garcia Center for Polymers at Engineering Interfaces',
    role: 'Researcher',
    dates: 'Jun — Dec 2024',
    summary: 'PyTorch and Gaussian-process models for predicting thin-film thickness from molecular properties.',
    description: 'Computational materials research using four-dimensional manifold learning and Gaussian Process Regression.',
    disciplines: ['Scientific Machine Learning', 'Materials Science'],
    technologies: ['PyTorch', 'Gaussian Process Regression', 'Manifold learning'],
    status: 'Research complete',
    topology: ['Polymer data', '4D representation', 'Gaussian process', 'Thickness prediction'],
    sections: sections(
      'Thin-film behavior depends on nonlinear relationships between molecular properties and material thickness.',
      'Use four-dimensional manifold learning in PyTorch and Gaussian Process Regression to model molecular weight and film thickness.',
      'Dhruva implemented the representation-learning and predictive-modeling workflow.',
      'The model predicted commercial polystyrene semiconductor-wafer thickness.',
      'Scientific ML is strongest when representation choices and uncertainty remain interpretable.',
    ),
    relatedProjects: ['hydrogel-research', 'ucsf-ml-pipeline'],
  },
  {
    slug: 'ucsf-ml-pipeline',
    title: 'Bioinformatics ML and Data Pipeline',
    institution: 'University of California, San Francisco',
    role: 'Machine Learning / Bioinformatics Research Assistant',
    dates: 'Aug 2025 — Present',
    summary: 'A large-scale machine-learning workflow for genomic and patient data.',
    description: 'R-based ingestion, preprocessing, unsupervised learning, outlier detection, and cross-study analysis.',
    disciplines: ['Computational Biology', 'Scientific Machine Learning'],
    technologies: ['R', 'PCA', 'Clustering', 'Data pipelines', 'Neural networks'],
    status: 'Ongoing',
    metric: '125K+ patient rows',
    topology: ['Data ingestion', 'Preprocessing', 'Unsupervised ML', 'Marker analysis'],
    sections: sections(
      'Large biological datasets contain technical variation, missingness, and high-dimensional signals.',
      'Implement cleaning, feature selection, hierarchical clustering, PCA, network outlier detection, and batch-effect correction.',
      'Dhruva built the pipeline, ran it across more than 125,000 patient rows, and is developing data scraping and neural cross-study analysis.',
      'The system supports lung-cancer gene-marker research with Professor Oldham.',
      'Data quality, reproducibility, and pipeline design are foundational ML-engineering concerns.',
    ),
    relatedProjects: ['eeg-vector-database', 'thin-film-machine-learning'],
  },
  {
    slug: 'hydrogel-research',
    title: 'Predictive Hydrogel Modeling',
    institution: 'Garcia Center for Polymers at Engineering Interfaces',
    role: 'Researcher',
    dates: 'Jun — Dec 2024',
    summary: 'Rheological and predictive analysis of cross-linked F88DMA hydrogels.',
    description: 'Experimental and computational analysis of F88DMA cross-linked with APS and TEMED.',
    disciplines: ['Materials Science', 'Bioengineering'],
    technologies: ['Rheology', 'Predictive modeling', 'F88DMA', 'APS / TEMED'],
    status: 'Research complete',
    metric: '97% observed correlation',
    topology: ['Formulation', 'Rheological analysis', 'Predictive model', 'Cross-link behavior'],
    sections: sections(
      'Hydrogel behavior depends on concentration and cross-linking conditions.',
      'Combine rheological analysis with predictive modeling across tested F88DMA, APS, and TEMED conditions.',
      'Dhruva conducted the rheological analysis and applied predictive methods to the tested conditions.',
      'A 97 percent correlation between concentration and cross-linking time was observed under the tested conditions.',
      'Experimental context and boundary conditions are essential when reporting materials correlations.',
    ),
    relatedProjects: ['thin-film-machine-learning'],
  },
  {
    slug: 'opioid-prevention-device',
    title: 'Opioid-Overdose Prevention Device',
    institution: 'Independent Project',
    role: 'Developer',
    dates: 'Ongoing',
    summary: 'A modular device and monitoring application designed around physiological overdose signals.',
    description: 'Physiological monitoring, control logic, microneedle naloxone delivery, and full-stack monitoring software.',
    disciplines: ['Bioengineering', 'Backend Engineering'],
    technologies: ['Physiological monitoring', 'CAD', 'Full-stack application'],
    status: 'Provisional patent',
    metric: 'U.S. 63/657,693',
    topology: ['Physiological signals', 'Risk logic', 'Microneedle delivery', 'Monitoring app'],
    sections: sections(
      'Opioid overdose can progress rapidly and requires timely intervention.',
      'Design a modular system around physiological monitoring, control logic, microneedle dispensing, and a monitoring application.',
      'Dhruva developed the device concept and is developing the associated full-stack application.',
      'Provisional U.S. patent application 63/657,693. Clinical efficacy is not claimed.',
      'Medical-device software requires careful integration of sensing, delivery, reliability, and responsible claims.',
    ),
    relatedProjects: ['eeg-vector-database'],
  },
]

export const experiences: Experience[] = [
  {
    id: 'ornl-2026',
    organization: 'Oak Ridge National Laboratory',
    role: 'AI Platform Engineering Intern',
    dates: 'May — Jul 2026',
    summary: 'Asynchronous AI orchestration, resilient FastAPI services, and Dockerized ML workflows.',
    details: [
      'Built a FastAPI orchestration system coordinating multi-agent reasoning, retrieval, and molecular-generation services.',
      'Implemented asynchronous execution, retries, caching, fallbacks, job tracking, and API-based service integration.',
      'Containerized workflows with Docker and automated environment configuration.',
    ],
    technologies: ['Python', 'FastAPI', 'Async I/O', 'RAG', 'Docker'],
    current: true,
    disciplines: ['AI Infrastructure', 'Backend Engineering'],
    projectSlugs: ['ornl-ai-infrastructure'],
  },
  {
    id: 'blueprint-2026',
    organization: 'Blueprint at Berkeley',
    role: 'Full-Stack and Algorithms Developer',
    dates: 'Feb 2026 — Present',
    summary: 'Production software and geospatial routing for Amigos de Los Rios.',
    details: [
      'Built a deployed volunteer-management platform with authenticated workflows and operational admin interfaces.',
      'Designed geospatial routing logic around time, location, resource, and prioritization constraints.',
    ],
    technologies: ['Next.js', 'React', 'Supabase', 'PostgreSQL', 'AWS Lambda'],
    current: true,
    disciplines: ['Backend Engineering', 'Public-Interest Technology'],
    projectSlugs: ['blueprint-routing-platform'],
  },
  {
    id: 'cmu-2025',
    organization: 'Carnegie Mellon University',
    role: 'AI Safety Research Assistant',
    dates: 'Mar 2025 — Present',
    summary: 'Modular LLM experimentation, model orchestration, API integration, and automated analysis.',
    details: [
      'Developed modular infrastructure for orchestrating LLM experiments across model environments.',
      'Integrated inference APIs, configurable experiments, automated benchmarking, and analysis workflows.',
    ],
    technologies: ['Python', 'LLM APIs', 'Experiment pipelines', 'Automated evaluation'],
    current: true,
    disciplines: ['AI Infrastructure', 'Backend Engineering'],
    projectSlugs: ['cmu-llm-evaluation'],
  },
  {
    id: 'ucsf-2025',
    organization: 'University of California, San Francisco',
    role: 'Machine Learning / Bioinformatics Research Assistant',
    dates: 'Aug 2025 — Present',
    summary: 'Large-scale biological data pipelines and machine-learning workflows.',
    details: [
      'Built data and machine-learning pipelines for large biological datasets.',
      'Processed more than 125,000 patient-data rows using preprocessing, clustering, PCA, and batch correction.',
    ],
    technologies: ['R', 'PCA', 'Clustering', 'Batch correction', 'Data pipelines'],
    current: true,
    disciplines: ['Computational Biology', 'Scientific Machine Learning'],
    projectSlugs: ['ucsf-ml-pipeline'],
  },
  {
    id: 'garcia-2024',
    organization: 'Garcia Center for Polymers at Engineering Interfaces',
    role: 'Researcher at Stony Brook University',
    dates: 'Jun — Dec 2024',
    summary: 'PyTorch, Gaussian-process, and predictive modeling for computational materials research.',
    details: [
      'Developed PyTorch representation-learning and Gaussian Process models for materials-property prediction.',
      'Combined computational modeling with rheological analysis across thin-film and hydrogel research.',
    ],
    technologies: ['PyTorch', 'Gaussian processes', 'Manifold learning', 'Rheology'],
    disciplines: ['Scientific Machine Learning', 'Materials Science'],
    projectSlugs: ['thin-film-machine-learning', 'hydrogel-research'],
  },
]

export const timelineEntries: TimelineEntry[] = [
  ...experiences.map((experience) => ({ ...experience, kind: 'experience' as const })),
  {
    id: 'berkeley-education',
    kind: 'education',
    organization: 'University of California, Berkeley',
    role: 'B.S. Electrical Engineering and Computer Science + Bioengineering',
    dates: 'Expected May 2028',
    summary: 'A dual technical foundation spanning computing systems, machine learning, and biological engineering.',
    details: ['Studying Electrical Engineering and Computer Science alongside Bioengineering.'],
    technologies: ['EECS', 'Bioengineering'],
    current: true,
    disciplines: ['Backend Engineering', 'Bioengineering'],
    projectSlugs: [],
  },
]

export const publications: Publication[] = [
  {
    type: 'Paper',
    title: 'Machine Learning for Assessing the Impact of Polydispersity on Thin-Film Thickness',
    venue: 'MRS Communications',
    year: 2024,
    status: 'Paper',
    summary: 'Machine-learning analysis of molecular weight and thin-film thickness.',
  },
  {
    type: 'Oral presentation',
    title: 'Machine Learning for Assessing the Impact of Polydispersity on Thin-Film Thickness',
    venue: 'MRS Boston',
    year: 2024,
    status: 'Presented',
    summary: 'Oral presentation of thin-film modeling research.',
  },
  {
    type: 'Paper',
    title: 'Ethics of Machine-Learning-Aided Treatment Planning and Early Detection of Neurodegenerative Diseases',
    venue: 'APS Summit / JESTI',
    year: 2025,
    status: 'Presented',
    summary: 'Analysis of ML-assisted neurodegenerative-disease workflows.',
  },
  {
    type: 'Patent',
    title: 'Opioid-Overdose Prevention Device',
    venue: 'U.S. provisional application 63/657,693',
    year: 2024,
    status: 'Provisional',
    summary: 'Physiological-signal-driven naloxone dispensing device.',
  },
]

export const skills: Skill[] = [
  ...['Python', 'JavaScript', 'SQL', 'R'].map((name) => ({ name, group: 'Languages' as const, projectSlugs: [] })),
  ...['FastAPI', 'REST APIs', 'PostgreSQL', 'Supabase', 'AWS Lambda', 'Docker', 'Linux', 'Git', 'CI/CD', 'Async I/O', 'Ansible', 'Vercel'].map((name) => ({ name, group: 'Backend / Infrastructure' as const, projectSlugs: ['ornl-ai-infrastructure', 'blueprint-routing-platform', 'cmu-llm-evaluation'] })),
  ...['PyTorch', 'Scikit-learn', 'RAG', 'LLM Systems', 'LangGraph', 'Machine Learning Pipelines', 'ChromaDB', 'Pandas'].map((name) => ({ name, group: 'AI / ML' as const, projectSlugs: ['ornl-ai-infrastructure', 'cmu-llm-evaluation', 'eeg-vector-database', 'thin-film-machine-learning'] })),
]
