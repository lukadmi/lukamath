// stackbit.config.ts
import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      // This matches your repo layout
      contentDirs: ["client/public/content"],

      models: [
        // Editable data used by your site (not a standalone page)
        {
          name: "CertificatesData",
          type: "data",
          filePath: "client/public/content/certificates.json",
          fields: [
            {
              name: "certificates",
              type: "list",
              items: {
                type: "object",
                fields: [
                  { name: "title", type: "string", required: true },
                  { name: "institution", type: "string" },
                  { name: "type", type: "string" },
                  { name: "description", type: "text" },
                  { name: "logo", type: "image", required: false },
                  { name: "logoAlt", type: "string", required: false }
                ]
              }
            }
          ]
        },

        // Home page model (maps to "/")
        {
          name: "Home",
          type: "page",
          urlPath: "/", // static homepage URL
          filePath: "client/public/content/home.json",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "subtitle", type: "string" },
            { name: "body", type: "markdown" }
          ]
        }
      ],

      // Make uploads go under client/public/uploads and be served as /uploads/*
      assetsConfig: {
        referenceType: "static",
        staticDir: "client/public",
        uploadDir: "uploads",
        publicPath: "/"
      }
    })
  ],

  // No slug usage here; map Home → "/" and anything else → "/{id}" as a fallback
  siteMap: ({ documents, models }) => {
    const pageModels = models.filter((m) => m.type === "page");

    return documents
      .filter((d) => pageModels.some((m) => m.name === d.modelName))
      .map((document) => {
        const isHome = document.modelName === "Home";
        return {
          stableId: document.id,
          urlPath: isHome ? "/" : `/${document.id}`,
          document,
          isHomePage: isHome
        } as SiteMapEntry;
      });
  }
});

