export const products = [
    {
        slug: "home",
        name: "Docs Home",
        link: "/docs",
        version: []
    },
    {
        slug: "kubernetes",
        name: "Kubernetes (K8s)",
        link: "/docs/kubernetes",
        version: [
            { id: "latest", name: "Latest", link: "latest/quick-start" }
        ]
    },
    {
        slug: "edge-stack",
        name: "Edge Stack",
        link: "/docs/edge-stack",
        version: [
            { id: "pre-release", name: "Pre-Release", link: "pre-release/tutorials/getting-started" },
            { id: "latest", name: "Latest", link: "latest/tutorials/getting-started" },
            { id: "1.13", name: "1.13", link: "1.13/tutorials/getting-started" },
            { id: "1.12", name: "1.12", link: "1.12/tutorials/getting-started" },
            { id: "1.11", name: "1.11", link: "1.11/tutorials/getting-started" },
            { id: "1.10", name: "1.10", link: "1.10/tutorials/getting-started" },
            { id: "1.9", name: "1.9", link: "1.9/tutorials/getting-started" },
            { id: "1.8", name: "1.8", link: "1.8/tutorials/getting-started" },
            { id: "1.7", name: "1.7", link: "1.7/tutorials/getting-started" },
            { id: "1.6", name: "1.6", link: "1.6/tutorials/getting-started" },
            { id: "1.5", name: "1.5", link: "1.5/tutorials/getting-started" },
            { id: "1.4", name: "1.4", link: "1.4/tutorials/getting-started" },
            { id: "1.3", name: "1.3", link: "1.3/tutorials/getting-started" }
        ]
    },
    {
        slug: "telepresence",
        name: "Telepresence",
        link: "/docs/telepresence",
        version: [
            { id: "pre-release", name: "Pre-Release", link: "pre-release/quick-start" },
            { id: "latest", name: "Latest", link: "latest/quick-start" },
            { id: "2.2", name: "2.2", link: "2.2/quick-start" },
            { id: "2.1", name: "2.1", link: "2.1/quick-start" },
            { id: "2.0", name: "2.0", link: "2.0/quick-start" }
        ]
    },
    {
        slug: "argo",
        name: "Argo",
        link: "/docs/argo",
        version: [
            { id: "latest", name: "Latest", link: "latest/quick-start" }
        ]
    },
    {
        slug: "cloud",
        name: "Cloud",
        link: "/docs/cloud",
        version: [
            { id: "latest", name: "Latest", link: "latest/service-catalog/quick-start" }
        ]
    }
];

export const oldStructure = ["1.9", "1.8", "1.7", "1.6", "1.5", "1.4", "1.3"];