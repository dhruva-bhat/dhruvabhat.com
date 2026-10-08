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
    role: 'AI platform engineering intern',
    dates: 'May 2026 – July 2026',
    lead: 'An asynchronous AI pipeline that generates scientific candidates, built to stay up across long multistage workflows.',
    points: [
      'Engineered an asynchronous pipeline in FastAPI that orchestrates Google CoScientist, multi-agent tournament reasoning, retrieval-augmented generation, and molecular diffusion models for candidate generation.',
      'Hardened the modular API services with asynchronous task execution, retries, fallback strategies, caching layers, and service orchestration.',
      'Containerized every service with Docker to standardize dependencies and run the same stack across environments.',
    ],
    stack: 'FastAPI · Python · async I/O · RAG · Docker',
  },
  {
    title: 'Blueprint at Berkeley',
    role: 'Full-stack and algorithms developer',
    dates: 'Feb 2026 – present',
    lead: 'A cloud volunteer platform and a routing algorithm for Amigos de Los Rios.',
    points: [
      'Built and deployed a cloud-based volunteer application with React, Next.js, Supabase, and AWS Lambda, including authentication workflows and live operational dashboards for admins.',
      'Designed a geospatial routing algorithm that joins REST API data from PlanItGeo with PostgreSQL to plan volunteer routes around time, location, and resource constraints.',
      'Ordered the routes with time-based waterfall prioritization.',
    ],
    stack: 'React · Next.js · Supabase · PostgreSQL · AWS Lambda · REST APIs',
  },
  {
    title: 'Carnegie Mellon University',
    role: 'AI safety research assistant',
    dates: 'Mar 2025 – present',
    lead: 'Backend infrastructure for LLM experiments, and research into how rationally LLMs behave inside institutions.',
    points: [
      'Developed a modular backend pipeline that orchestrates LLM experiments across multiple model environments, tying together inference APIs, experiment configuration, and automated analysis.',
      'Researching the bounded rationality of LLMs in institutional settings with Professor Sarah H. Cen, benchmarking model behavior against game-theory baselines.',
    ],
    stack: 'Python · inference APIs · experiment orchestration',
  },
  {
    title: 'UC San Francisco',
    role: 'Machine learning / bioinformatics research assistant',
    dates: 'Aug 2025 – present',
    lead: 'Unsupervised machine learning on genomic data to find the best lung cancer gene markers.',
    points: [
      'Implemented an unsupervised pipeline in R covering data cleaning, feature selection, hierarchical clustering, PCA, network-based outlier detection, and batch-effect correction.',
      'Ran it on 125,000+ patient data rows, comparing gene marker quantity with cell type prevalence across tissue samples, with Professor Oldham.',
      'Building a data scraper and pipeline for GRE data, and a neural network that compiles analysis across studies to surface the best markers for each cell type.',
    ],
    stack: 'R · PCA · hierarchical clustering · neural networks',
  },
  {
    title: 'Garcia Center for Polymers',
    role: 'Researcher, Stony Brook University',
    dates: 'Jun 2024 – Dec 2024',
    lead: 'Machine learning for materials science, across thin films and hydrogels.',
    points: [
      'Thin films: used 4D manifold learning in PyTorch and built a Gaussian process regression model relating molecular weight to film thickness, predicting commercial polystyrene semiconductor wafer thickness.',
      'Hydrogels: ran rheological analysis of F88DMA cross-linked with APS and TEMED, and found a 97% correlation between concentration and crosslinking time across conditions.',
      'Wrote and presented “Machine Learning for Assessing Impact of Polydispersity on Thin Film Thickness.”',
    ],
    stack: 'PyTorch · Gaussian process regression · manifold learning · rheology',
  },
  {
    title: 'EEG Vector Database',
    role: 'Project',
    dates: '',
    lead: 'Vector embeddings that tell Parkinson’s EEGs apart from healthy ones.',
    points: [
      'Used the Wilson–Cowan model to generate excitatory–inhibitory patterns that replicate the EEGs of Parkinson’s and healthy patients.',
      'Transformed the EEGs into vector embeddings with CEBRA and stored them in a vector database.',
      'Trained an offset-10 model to identify differences between Parkinson’s and healthy patient EEGs.',
    ],
    stack: 'Python · CEBRA · ChromaDB',
  },
  {
    title: 'Opioid-Overdose Prevention Device',
    role: 'Provisional patent, U.S. 63/657,693',
    dates: '',
    lead: 'A modular device that dispenses naloxone before an overdose turns fatal.',
    points: [
      'Dispenses naloxone based on a patient’s respiratory rate, heartbeat, and other physiological signals.',
      'Delivers it with a proprietary microneedle dispensing method.',
      'Currently developing the companion full-stack app.',
    ],
    stack: 'Hardware · physiological sensing · full-stack app',
  },
]
