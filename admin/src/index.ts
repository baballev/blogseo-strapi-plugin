import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";

import type { StrapiApp } from "@strapi/strapi/admin";

const plugin: StrapiApp["appPlugins"][string] = {
  register(app) {
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: { id: getTranslation("settings.section"), defaultMessage: "BlogSEO" },
      },
      [
        {
          intlLabel: { id: getTranslation("settings.link"), defaultMessage: "Configuration" },
          id: PLUGIN_ID,
          to: `/settings/${PLUGIN_ID}`,
          Component: () => import("./pages/Settings"),
          permissions: [],
        },
      ],
    );

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = (await import(`./translations/${locale}.json`)) as {
            default: Record<string, string>;
          };
          const newData: Record<string, string> = {};
          for (const key of Object.keys(data)) newData[getTranslation(key)] = data[key];
          return { data: newData, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },
};

export default plugin;
