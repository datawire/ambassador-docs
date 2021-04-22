import { goToEdgeStackQuickStart, goToMappings, goToHostCRD, goToLoadBalancer, goToCircuitBreakers, goToCanaryReleases, goToOauth, goToJWT, goToExtFilters, goToRateLimits, goToRateLimitsEdgeStack, goToAdvancedRateLimiting, goToGRPC, goToTlsTermination, GoToWebsockets, goToArgoQuickStart, goToArgoCICD, goToArgoCanary, goToCloudQuickStart, goToTelepresenceHowTo, goToTelepresenceContextProp, goToTelepresenceFAQs, goToKubernetesConceptsBasics, goToKubernetesHowtosCodeCluster, goToKubernetesHowtosDiagnose } from '../../../src/utils/routes';

export const EdgeStackCards = [
  {
    title: 'Edge Stack',
    description: 'Route and secure traffic to your cluster with a Kubernetes-native API Gateway.',
    link: goToEdgeStackQuickStart,
    linkText: 'Get Started',
    section: 'basics'
  },
  {
    title: 'Mappings',
    description: 'Use a declarative configuration to map requests to services.',
    link: goToMappings,
    linkText: 'Learn How',
    section: 'basics'
  },
  {
    title: 'Host',
    description: 'Configure a hostname and TLS options for your ingress.',
    link: goToHostCRD,
    linkText: 'Learn How',
    section: 'basics'
  },
  {
    title: 'Load Balancing',
    description: 'Maximize the scalability and availability of your application.',
    link: goToLoadBalancer,
    linkText: 'Learn How',
    section: 'trafficManagement'
  },
  {
    title: 'Circuit Breaking',
    description: 'Limit the blast radius of an overloaded service by preventing additional connections.',
    link: goToCircuitBreakers,
    linkText: 'Learn How',
    section: 'trafficManagement'
  },
  {
    title: 'Canary Releases',
    description: 'Manipulate production traffic for testing features before release',
    link: goToCanaryReleases,
    linkText: 'Learn How',
    section: 'trafficManagement'
  },
  {
    title: 'Single Sign-On',
    description: 'Secure access to your services and integrate with popular identity providers.',
    link: goToOauth,
    linkText: 'Learn How',
    section: 'authentication'
  },
  {
    title: 'JWT Validation',
    description: 'Validate users via bearer tokens.',
    link: goToJWT,
    linkText: 'Learn How',
    section: 'authentication'
  },
  {
    title: 'External Filters',
    description: 'Authenticate users via an external auth service.',
    link: goToExtFilters,
    linkText: 'Learn How',
    section: 'authentication'
  },
  {
    title: 'Rate Limiting Concepts',
    description: 'Ensure your services remain available, even when under heavy load.',
    link: goToRateLimits,
    linkText: 'Learn How',
    section: 'rateLimiting'
  },
  {
    title: 'Using Rate Limits',
    description: 'Create policies to control sustained traffic loads.',
    link: goToRateLimitsEdgeStack,
    linkText: 'Learn How',
    section: 'rateLimiting'
  },
  {
    title: 'Advanced Rate Limiting',
    description: 'Regulate traffic with greater granularity.',
    link: goToAdvancedRateLimiting,
    linkText: 'Learn How',
    section: 'rateLimiting'
  },
  {
    title: 'TLS Termination',
    description: 'Automatically secure your traffic with TLS.',
    link: goToTlsTermination,
    linkText: 'Learn How',
    section: 'ingress'
  },
  {
    title: 'Websockets',
    description: 'Add support for the WebSocket protocol',
    link: GoToWebsockets,
    linkText: 'Learn How',
    section: 'ingress'
  },
  {
    title: 'gRPC',
    description: 'Configure access to gRPC services.',
    link: goToGRPC,
    linkText: 'Learn How',
    section: 'ingress'
  }
];

export const EdgeStackSections = [
  {
    name: 'Basics',
    id: 'basics'
  },
  {
    name: 'Traffic Management',
    id: 'trafficManagement'
  },
  {
    name: 'Authentication',
    id: 'authentication'
  },
  {
    name: 'Rate Limiting',
    id: 'rateLimiting'
  },
  {
    name: 'Ingress',
    id: 'ingress'
  }
];

export const ArgoCards = [
  {
    title: 'Argo Rollouts Quick Start',
    description: 'Create and deploy canary releases using Argo Rollouts integrated with Edge Stack.',
    link: goToArgoQuickStart,
    linkText: 'Learn How',
    icon: 'rollouts'
  },
  {
    title: 'CI/CD and Continuous Delivery',
    description: 'How this practice can help deliver code to production safe and reliably.',
    link: goToArgoCICD,
    linkText: 'Learn How',
    icon: 'cicd'
  },
  {
    title: 'Canary Deployments',
    description: 'Roll out features in a way that is safe but still supports rapid development.',
    link: goToArgoCanary,
    linkText: 'Learn How',
    icon: 'rocket'
  }
];

export const CloudCards = [
  {
    title: 'Service Catalog Quick Start',
    description: 'Eliminate tribal knowledge, speed incident response, and improve developer productivity.',
    link: goToCloudQuickStart,
    linkText: 'Get Started',
    icon: 'service-catalog'
  }
];

export const TelepresenceCards = [
  {
    title: 'Share Dev Environments',
    description: 'Collaborate with your dev team (or others outside your organization) in a shared dev environment using Preview URLs.',
    link: goToTelepresenceHowTo,
    linkText: 'Learn How',
    icon: 'high-five'
  },
  {
    title: 'Accelerate Your Inner Dev Loop',
    description: 'Deploying containers to test code takes time. Telepresence intelligently routes requests to the appropriate destination using context propagation.',
    link: goToTelepresenceContextProp,
    linkText: 'Learn more',
    icon: 'rocket'
  },
  {
    title: 'FAQs',
    description: 'Learn more about uses cases and the technical implementation of Telepresence.',
    link: goToTelepresenceFAQs,
    linkText: 'Browse FAQs',
    icon: 'faqs'
  },
];

export const KubernetesCards = [
  {
    title: 'Kubernetes Basics',
    description: 'What is Kubernetes and how is it related to containers?',
    link: goToKubernetesConceptsBasics,
    linkText: 'Get started',
    icon: 'diagnose'
  },
  {
    title: 'Set up a powerful dev environment',
    description: 'These tools can help supercharge your work in K8s on the terminal.',
    link: goToKubernetesHowtosCodeCluster,
    linkText: 'Learn How',
    icon: 'learn-icon'
  },
  {
    title: 'Debug code on Kubernetes',
    description: 'What do you do first when a Deployment won’t run?',
    link: goToKubernetesHowtosDebug,
    linkText: 'Learn How',
    icon: 'tools-green'
  }
]