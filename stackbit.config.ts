import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,

      // Matches your repo layout
      contentDirs: ["client/public/content"],

      models: [
        // ---- Data (not a page) ----
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

        // ---- Page (will appear in sitemap) ----
        {
          name: "Home",
          type: "page",                       // <- marks this as a page model
          filePath: "client/public/content/home.json",
          urlPath: "/",                       // <- constant URL for the homepage
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
  ]
});