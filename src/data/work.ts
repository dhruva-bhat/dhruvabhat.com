/** Home screen work section: one entry per section of public/resume/dhruva-bhat-resume.pdf. */
export type WorkEntry = {
  title: string
  role: string
  /** Empty for undated projects. */
  dates: string
  lead: string
  points: string[]
  stack: string
}

export const work: WorkEntry[] = [
  {
    title: 'Oak Ridge National Lab',
    role: 'Software engineering intern',
    dates: 'May 2026 – July 2026',
    lead: 'An asynchronous pipeline for drug-discovery molecular generation, built to recover from failures on its own.',
    points: [
      'Designed and developed an asynchronous FastAPI pipeline for drug-discovery molecular generation.',
      'Generated over 700 molecular hypotheses per run with the Google Co-Scientist tournament-reasoning package.',
      'Added retries, fallbacks, monitoring, and observability for pipeline failures, cutting 6 manual handoffs to 1 request, and wrote 46 tests for orchestration and package failures.',
      'Refactored a C++14 speculative-simulation framework for cell-interaction modeling to support CPU-only and GPU-only builds, with 52 sanitizer tests for clean compilation and portability.',
    ],
    stack: 'FastAPI · Python · async I/O · C++14 · testing and observability',
  },
  {
    title: 'Blueprint at Berkeley',
    role: 'Contract software developer',
    dates: 'Feb 2026 – present',
    lead: 'Automatic volunteer routing for the nonprofit Amigos de Los Rios, across more than 300 sites.',
    points: [
      'Developed a website that generates volunteer routes from tree distances, volunteer availability, and days since watering, coordinating volunteers across 300+ sites.',
      'Implemented the backend and authentication for a Vercel-deployed Next.js / Supabase platform: authorization, row-level security, PostgreSQL migrations, and data access for locations, watering sessions, volunteers, and routes.',
      'Built a shortest-route microservice on AWS Lambda that prioritizes 300+ API-sourced locations, cutting staff labor from 20 to 2 hours per week.',
    ],
    stack: 'Next.js · Supabase · PostgreSQL · AWS Lambda · Vercel',
  },
  {
    title: 'Carnegie Mellon University',
    role: 'Software engineer and AI safety researcher',
    dates: 'Mar 2026 – present',
    lead: 'Research into how rationally LLMs decide inside institutions, and the backend that runs the experiments.',
    points: [
      'Collaborating with Professor Sarah H. Cen to study bounded rationality in LLMs, designing experiments that evaluate model decision-making against game-theoretic baselines in simulated institutional settings.',
      'Developed a modular backend pipeline for large-scale LLM in-game data gathering (17 GPU hours per run), integrating OpenAI, Hugging Face, and Ollama inference APIs with asynchronous experiment scheduling.',
      'Automated JSON pipelines for analysis, measuring temperature-based performance differences with 96% confidence.',
    ],
    stack: 'Python · OpenAI / Hugging Face / Ollama APIs · async scheduling',
  },
  {
    title: 'UC San Francisco',
    role: 'Machine learning / bioinformatics researcher',
    dates: 'Aug 2025 – present',
    lead: 'Machine learning across 8.68 million records to find the best lung cancer gene markers.',
    points: [
      'Working with Professor Oldham to identify optimal lung cancer gene markers, comparing gene marker quantity with cell type prevalence across tissue samples.',
      'Developed an unsupervised machine learning pipeline in R and ran it on 125,000+ patient data rows, with data cleaning, feature selection, hierarchical clustering, network-based outlier detection, and batch-effect correction.',
      'Built a biological data scraper, pipeline, and neural network for cross-study gene-marker identification.',
    ],
    stack: 'R · hierarchical clustering · neural networks · big-data analysis',
  },
  {
    title: 'Garcia Center for Polymers',
    role: 'Researcher',
    dates: 'Jun 2024 – Dec 2024',
    lead: 'Machine learning for materials science, across thin films and hydrogels.',
    points: [
      'Thin films: improved prediction of semiconductor wafer thickness, relating polystyrene molecular weight to film thickness with 4D manifold learning in PyTorch and a Gaussian process regression model.',
      'Hydrogels: ran rheological analysis of F88DMA cross-linked with APS and TEMED, finding a 97% correlation between concentration and crosslinking time across conditions.',
      'Published “Machine Learning for Assessing Impact of Polydispersity on Thin Film Thickness” in MRS Communications, presented at MRS Boston 2024 and the APS Summit 2025.',
    ],
    stack: 'PyTorch · Gaussian process regression · manifold learning · rheology',
  },
  {
    title: 'EEG Vector Database',
    role: 'Project',
    dates: '',
    lead: 'Vector embeddings that tell Parkinson’s neural activity apart from healthy patterns.',
    points: [
      'Built a CEBRA-based representation-learning pipeline that converts simulated EEG signals into vector embeddings.',
      'Simulated the signals with the Wilson–Cowan model to replicate the EEGs of Parkinson’s and healthy patients.',
      'Compared and distinguished the two in the embedding space, training an offset-10 model to identify the differences.',
    ],
    stack: 'Python · CEBRA · ChromaDB',
  },
  {
    title: 'Opioid-Overdose Prevention Device',
    role: 'Provisional patent, U.S. 63/657,693',
    dates: '',
    lead: 'An automated naloxone-delivery device driven by physiological monitoring.',
    points: [
      'Developed a device that delivers naloxone based on a patient’s respiratory rate, heartbeat, and other physiological signals.',
      'Delivers it with a proprietary microneedle dispensing method.',
      'Built a companion full-stack application and database.',
    ],
    stack: 'Hardware · physiological sensing · full-stack app',
  },
]
