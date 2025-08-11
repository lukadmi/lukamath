// stackbit.config.ts
import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["client/public/content"],

      models: [
        // Data used inside pages (not a standalone page)
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

        // === Page models that appear in the Visual Editor sitemap ===

        // Home → "/"
        {
          name: "Home",
          type: "page",
          filePath: "client/public/content/home.json",
          urlPath: "/",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "subtitle", type: "string" },
            { name: "body", type: "markdown" }
          ]
        },

        // Blog → "/blog"
        {
          name: "BlogPage",
          type: "page",
          filePath: "client/public/content/blog.json",
          urlPath: "/blog",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "intro", type: "markdown" }
          ]
        },

        // App → "/app"
        {
          name: "AppPage",
          type: "page",
          filePath: "client/public/content/app.json",
          urlPath: "/app",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "intro", type: "markdown" }
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
