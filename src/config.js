export const products = [
    {
        slug: "home",
        name: "Docs Home",
        link: "/docs",
        version: []
    },
    {
        slug: "edge-stack",
        name: "Edge Stack",
        link: "/docs/edge-stack/latest/tutorials/getting-started/",
        version: [
            { id: "pre-release", name: "Pre-Release", link: "pre-release" },
            { id: "latest", name: "Latest", link: "latest" },
            { id: "1.12", name: "1.12", link: "1.12" },
            { id: "1.11", name: "1.11", link: "1.11" },
            { id: "1.10", name: "1.10", link: "1.10" },
            { id: "1.9", name: "1.9", link: "1.9" },
            { id: "1.8", name: "1.8", link: "1.8" },
            { id: "1.7", name: "1.7", link: "1.7" },
            { id: "1.6", name: "1.6", link: "1.6" },
            { id: "1.5", name: "1.5", link: "1.5" },
            { id: "1.4", name: "1.4", link: "1.4" },
            { id: "1.3", name: "1.3", link: "1.3" }
        ]
    },
    {
        slug: "telepresence",
        name: "Telepresence",
        link: "/docs/telepresence/latest/quick-start/",
        version: [
            { id: "pre-release", name: "Pre-Release", link: "pre-release/quick-start/" },
            { id: "latest", name: "Latest", link: "latest/quick-start/" },
            { id: "2.1", name: "2.1", link: "2.1/quick-start/" },
            { id: "2.0", name: "2.0", link: "2.0/quick-start/" }
        ]
    },
    {
        slug: "cloud",
        name: "Cloud",
        link: "/docs/cloud/latest/service-catalog/quick-start/",
        version: [
            { id: "latest", name: "Latest", link: "latest/service-catalog/quick-start/" }
        ]
    },
    {
        slug: "argo",
        name: "Argo",
        link: "/docs/argo/latest/",
        version: [
            { id: "latest", name: "Latest", link: "latest" }
        ]
    },
    {
        slug: "kubernetes",
        name: "Your Kubernetes Environment",
        link: "/docs/kubernetes/latest/",
        version: [
            { id: "latest", name: "Latest", link: "latest" }
        ]
    }
];

export const oldStructure = ["1.9", "1.8", "1.7", "1.6", "1.5", "1.4", "1.3"];