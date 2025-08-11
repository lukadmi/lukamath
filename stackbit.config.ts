// stackbit.config.ts
import { defineStackbitConfig, SiteMapEntry } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["client/public/content"],

      models: [
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
        {
          name: "Home",
          type: "page",
          urlPath: "/",
          filePath: "client/public/content/home.json",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "subtitle", type: "string" },
            { name: "body", type: "markdown" }
          ]
        }
      ],

      assetsConfig: {
        referenceType: "static",
        staticDir: "client/public",
        uploadDir: "uploads",
        publicPath: "/"
      }
    })
  ],

  // Keep it dead simple: if we see the Home document, map it to "/".
  siteMap: ({ documents }) => {
    const entries: SiteMapEntry[] = [];

    for (const doc of documents) {
      const isHome =
        doc.modelName === "Home" ||
        (typeof (doc as any).filePath === "string" &&
          (doc as any).filePath.endsWith("/client/public/content/home.json"));

      if (isHome) {
        entries.push({
          stableId: doc.id,
          urlPath: "/",
          document: doc,
          isHomePage: true
        });
      }
    }

    return entries;
  }
});