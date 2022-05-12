import {
  goToKubernetesDocs,
  goToEdgeStackDocs,
  goToEmissaryDocs,
  goToDocsTelepresence,
  goToDocsArgo,
  goToCloudDocs,
  goToEnvoy,
} from '../../src/utils/routes';

export const products = [
  {
    slug: 'home',
    name: 'Docs Home',
    link: '/docs',
    version: [],
  },
  {
    slug: 'code',
    name: 'Code',
    link: '/docs/code',
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest/quick-start' }],
  },
  {
    slug: 'ship',
    name: 'Ship',
    link: '/docs/ship',
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest/quick-start' }],
  },
  {
    slug: 'run',
    name: 'Run',
    link: '/docs/run',
    version: [],
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest/getting-started' }],
  },
  {
    slug: 'kubernetes',
    name: 'Kubernetes (K8s)',
    isProduct: true,
    link: '/docs/kubernetes',
    to: goToKubernetesDocs,
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest/quick-start' }],
  },
  {
    slug: 'edge-stack',
    name: 'Edge Stack',
    isProduct: true,
    link: '/docs/edge-stack',
    to: goToEdgeStackDocs,
    id: Math.random().toString(),
    version: [
      {
        id: 'pre-release',
        name: 'Pre-Release',
        link: 'pre-release/tutorials/getting-started',
      },
      {
        id: 'latest',
        name: 'Latest',
        link: 'latest/tutorials/getting-started',
      },
      { id: '2.2', name: '2.2', link: '2.1/tutorials/getting-started' },
      { id: '2.1', name: '2.1', link: '2.1/tutorials/getting-started' },
      { id: '2.0', name: '2.0', link: '2.0/tutorials/getting-started' },
      { id: '1.14', name: '1.14', link: '1.14/tutorials/getting-started' },
      { id: '1.13', name: '1.13', link: '1.13/tutorials/getting-started' },
      {
        id: '1.12',
        name: '1.12',
        link: '1.12/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.11',
        name: '1.11',
        link: '1.11/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.10',
        name: '1.10',
        link: '1.10/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.9',
        name: '1.9',
        link: '1.9/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.8',
        name: '1.8',
        link: '1.8/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.7',
        name: '1.7',
        link: '1.7/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.6',
        name: '1.6',
        link: '1.6/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.5',
        name: '1.5',
        link: '1.5/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.4',
        name: '1.4',
        link: '1.4/tutorials/getting-started',
        archived: true,
      },
      {
        id: '1.3',
        name: '1.3',
        link: '1.3/tutorials/getting-started',
        archived: true,
      },
    ],
  },
  {
    slug: 'emissary',
    name: 'Emissary-ingress',
    isProduct: true,
    link: '/docs/emissary',
    to: goToEmissaryDocs,
    id: Math.random().toString(),
    version: [
      {
        id: 'pre-release',
        name: 'Pre-Release',
        link: 'pre-release/tutorials/getting-started',
      },
      {
        id: 'latest',
        name: 'Latest',
        link: 'latest/tutorials/getting-started',
      },
      { id: '2.2', name: '2.2', link: '2.1/tutorials/getting-started' },
      { id: '2.1', name: '2.1', link: '2.1/tutorials/getting-started' },
      { id: '2.0', name: '2.0', link: '2.0/tutorials/getting-started' },
      { id: '1.14', name: '1.14', link: '1.14/tutorials/getting-started' },
      { id: '1.13', name: '1.13', link: '1.13/tutorials/getting-started' },
    ],
  },
  {
    slug: 'telepresence',
    name: 'Telepresence',
    isProduct: true,
    link: '/docs/telepresence',
    to: goToDocsTelepresence,
    id: Math.random().toString(),
    version: [
      {
        id: 'pre-release',
        name: 'Pre-Release',
        link: 'pre-release/quick-start',
      },
      { id: 'latest', name: 'Latest', link: 'latest/quick-start' },
      { id: '2.5', name: '2.5', link: '2.5/quick-start' },
      { id: '2.4', name: '2.4', link: '2.4/quick-start' },
      { id: '2.3', name: '2.3', link: '2.3/quick-start', archived: true },
      { id: '2.2', name: '2.2', link: '2.2/quick-start', archived: true },
      { id: '2.1', name: '2.1', link: '2.1/quick-start', archived: true },
      { id: '2.0', name: '2.0', link: '2.0/quick-start', archived: true },
    ],
  },
  {
    slug: 'argo',
    name: 'Argo',
    isProduct: true,
    link: '/docs/argo',
    to: goToDocsArgo,
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest/quick-start' }],
  },
  {
    slug: 'cloud',
    name: 'Cloud',
    isProduct: true,
    link: '/docs/cloud',
    to: goToCloudDocs,
    id: Math.random().toString(),
    version: [
      {
        id: 'latest',
        name: 'Latest',
        link: 'latest/service-catalog/quick-start',
      },
    ],
  },
  {
    slug: 'envoy',
    name: 'Envoy',
    isProduct: true,
    link: '/docs/envoy/latest/concepts/cloudnative',
    to: goToEnvoy,
    id: Math.random().toString(),
    version: [{ id: 'latest', name: 'Latest', link: 'latest' }],
  },
];

export const metaData = {
  home: {
    title: 'Docs Home | Ambassador Labs',
    description:
      'Concepts, guides, and examples to using Ambassador Cloud, Edge Stack, Telepresence, Kubernetes and Argo.',
  },
  code: {
    title: 'Code | Ambassador Labs',
    description: 'Code tutorials using Telepresence',
  },
  ship: {
    title: 'Ship | Ambassador Labs',
    description: 'Ship tutorials using Argo',
  },
  run: {
    title: 'Run | Ambassador Labs',
    description: 'Run tutorials using Edge Stack',
  },
  kubernetes: {
    title: 'Kubernetes (K8s) Docs | Ambassador Labs',
    description:
      'The complete guide to getting started with Kubernetes for developing and managing your apps productively.',
  },
  'edge-stack': {
    title: 'Edge Stack Docs | Ambassador Labs',
    description:
      'Ambassador Edge Stack Documentation. Route and secure traffic to your cluster with a Kubernetes-native API Gateway built on the Envoy Proxy.',
  },
  emissary: {
    title: 'Emissary-ingress Docs | Ambassador Labs',
    description:
      'Route and secure traffic to your cluster with a Kubernetes-native API Gateway built on the Envoy Proxy.',
  },
  telepresence: {
    title: 'Telepresence Docs | Ambassador Labs',
    description:
      'Code and test microservices locally against a remote Kubernetes cluster with Telepresence for sharing dev environments and accelerating the inner dev loop.',
  },
  argo: {
    title: 'Argo Docs',
    description:
      'Get started with Argo for Argo Rollouts, CI/CD and continuous delivery, and canary deployments.',
  },
  cloud: {
    title: 'Ambassador Cloud Docs | Ambassador Labs',
    description:
      'Ambassador Cloud is your central dashboard for all Ambassador tools. Get started with Service Catalog.',
  },
};

export const learningJourneys = [
  'local-development',
  'investigating-and-debugging-microservices',
  'continuous-delivery-within-kubernetes',
];

export const archivedVersionsLink = {
  id: 'archived',
  name: 'Older Versions',
  link: 'versions',
};

export const siteUrl = 'https://www.getambassador.io';

export const archivedDocsUrl = 'https://archive.getambassador.io';

export const getSiteUrl = () =>
  process.env.GATSBY_ARCHIVE_DOCS ? archivedDocsUrl : siteUrl;
