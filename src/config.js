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
      { id: '2.3', name: '2.3', link: '2.3/tutorials/getting-started' },
      { id: '2.2', name: '2.2', link: '2.2/tutorials/getting-started' },
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
      { id: '2.3', name: '2.3', link: '2.3/tutorials/getting-started' },
      { id: '2.2', name: '2.2', link: '2.2/tutorials/getting-started' },
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
      { id: '2.6', name: '2.6', link: '2.6/quick-start' },
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
  'docs/edge-stack/latest/topics/concepts/gitops-continuous-delivery/': {
    description:
      'GitOps and continuous delivery. Ambassador Edge Stack supports a decentralized configuration model. Individual policies are written in different files',
  },
  'docs/edge-stack/latest/howtos/client-cert-validation/': {
    description:
      'Client certificate validation - for security or authentication purposes, you want the server to validate the client before establishing an encrypted connection',
  },
  'docs/edge-stack/latest/topics/running/resolvers/': {
    description:
      'Ambassador Edge Stack uses information from service discovery to determine where to route incoming requests. The API Gateway supports the following mechanisms',
  },
  'docs/edge-stack/latest/topics/running/services/ext_authz/': {
    description:
      'ExtAuth protocol. The ExtAuth service receives info about every request through Ambassador and must indicate whether the request is to be allowed or not',
  },
  'docs/edge-stack/latest/topics/running/services/tracing-service/': {
    description:
      'Ambassador Edge Stack - Tracing service. Distributed tracing is a powerful tool to debug and analyze your system in addition to request logging and metrics',
  },
  'docs/edge-stack/latest/topics/using/authservice/': {
    description:
      'An AuthService can be disabled for a specific Mapping using bypass_auth attribute. This tells Ambassador Edge Stack to allow requests for that Mapping through',
  },
  'docs/edge-stack/latest/topics/using/canary/': {
    description:
      'Ambassador Edge Stack API Gateway supports fine-grained canary releases. It uses a weighted round-robin scheme to route traffic between multiple services',
  },
  'docs/edge-stack/latest/topics/using/circuit-breakers/': {
    description:
      'A default circuit breaking config can be set for Ambassador Edge Stack resources. Set to a different value on a per-resource basis for Mappings, AuthServices...',
  },
  'docs/edge-stack/latest/topics/using/defaults/': {
    description:
      'Using ambassador Module defaults. Currently, only the Mapping resource uses the defaults mechanism. Mapping looks first for defaultable resources in...',
  },
  'docs/edge-stack/latest/topics/using/keepalive/': {
    description:
      'Keepalive configuration can be set for all Ambassador Edge Stack mappings in the ambassador Module or set per Mapping. The following fields are supported...',
  },
  'docs/edge-stack/latest/tutorials/dev-portal-tutorial/': {
    description:
      'Dev Portal. This tutorial assumes you have connected your cluster to Ambassador Cloud and deployed the quote app with the Mapping from Ambassador Edge Stack',
  },
  'docs/emissary/latest/howtos/cert-manager/': {
    description:
      "If you're running Emissary-ingress, or if you require more flexible certificate management (such as using ACME's dns-01 challenge, or using a non-ACME...",
  },
  'docs/edge-stack/latest/howtos/prometheus/': {
    description:
      'This guide focus on deploying Prometheus and Grafana alongside Edge Stack in Kubernetes using the Prometheus Operator. Both can be deployed as standalone apps',
  },
  'docs/edge-stack/latest/topics/running/ingress-controller/': {
    description:
      'Edge Stack can function as a fully-fledged Ingress controller, making it easy to work with other Ingress-oriented tools within the Kubernetes ecosystem',
  },
  'docs/edge-stack/latest/topics/running/tls/mtls/': {
    description:
      'Ambassador Edge Stack and Mutual TLS (mTLS). Since Ambassador Edge Stack is a reverse proxy acting as the entry point to your cluster...',
  },
  'docs/edge-stack/latest/topics/using/cors/': {
    description:
      'CORS configuration can be set for all Edge Stack mappings in the ambassador Module, or set per Mapping. Cross-Origin resource sharing lets users request...',
  },
  'docs/edge-stack/latest/topics/using/shadowing/': {
    description:
      'Edge Stack - Traffic shadowing is a deployment pattern where production traffic is asynchronously copied to a non-production service for testing',
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
