import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Main,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from "@strapi/design-system";
import { Layouts, Page, useFetchClient, useNotification } from "@strapi/strapi/admin";

const PLUGIN_BASE = "/blogseo";

interface StatusResponse {
  connected: boolean;
  siteUrl: string | null;
  pluralApiId: string | null;
}

interface ContentTypeOption {
  uid: string;
  displayName: string;
  pluralApiId: string;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
  return data?.error?.message ?? fallback;
};

const Settings = () => {
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentTypeOption[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [pluralApiId, setPluralApiId] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const [statusRes, contentTypesRes] = await Promise.all([
          get<StatusResponse>(`${PLUGIN_BASE}/status`),
          get<{ contentTypes: ContentTypeOption[] }>(`${PLUGIN_BASE}/content-types`),
        ]);
        setStatus(statusRes.data);
        setContentTypes(contentTypesRes.data.contentTypes ?? []);
        if (contentTypesRes.data.contentTypes?.length)
          setPluralApiId(contentTypesRes.data.contentTypes[0].pluralApiId);
      } catch {
        toggleNotification({ type: "danger", message: "Could not load BlogSEO settings." });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [get, toggleNotification]);
  const handleConnect = async () => {
    if (!apiKey.trim())
      return toggleNotification({ type: "warning", message: "Paste your BlogSEO connection key first." });
    if (!pluralApiId)
      return toggleNotification({ type: "warning", message: "Pick a collection to publish into." });
    setIsSubmitting(true);
    try {
      const { data } = await post<{ connected: boolean; siteUrl: string | null }>(
        `${PLUGIN_BASE}/connect`,
        { apiKey: apiKey.trim(), pluralApiId },
      );
      setStatus({ connected: true, siteUrl: data.siteUrl, pluralApiId });
      setApiKey("");
      toggleNotification({
        type: "success",
        message: "Connected to BlogSEO! Articles will now publish into this Strapi.",
      });
    } catch (error) {
      toggleNotification({
        type: "danger",
        message: extractErrorMessage(error, "Failed to connect to BlogSEO."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDisconnect = async () => {
    setIsSubmitting(true);
    try {
      await post(`${PLUGIN_BASE}/disconnect`, {});
      setStatus({ connected: false, siteUrl: null, pluralApiId: null });
      toggleNotification({ type: "success", message: "Disconnected from BlogSEO." });
    } catch {
      toggleNotification({ type: "danger", message: "Failed to disconnect." });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) return <Page.Loading />;
  return (
    <Main>
      <Layouts.Header
        title="BlogSEO"
        subtitle="Publish AI-generated SEO articles and build backlinks straight into this Strapi."
      />
      <Layouts.Content>
        <Box background="neutral0" padding={6} shadow="tableShadow" hasRadius>
          {status?.connected ? (
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Typography variant="delta">Connected to BlogSEO</Typography>
              <Box>
                <Typography textColor="neutral600">Publishing into&nbsp;</Typography>
                <Typography fontWeight="bold">{status.pluralApiId ?? "—"}</Typography>
                {status.siteUrl ? (
                  <Typography textColor="neutral600">&nbsp;· {status.siteUrl}</Typography>
                ) : null}
              </Box>
              <Box>
                <Button variant="danger-light" onClick={handleDisconnect} loading={isSubmitting}>
                  Disconnect
                </Button>
              </Box>
            </Flex>
          ) : (
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Typography variant="delta">Connect your BlogSEO account</Typography>
              <Field.Root name="apiKey">
                <Field.Label>BlogSEO connection key</Field.Label>
                <Field.Input
                  type="password"
                  value={apiKey}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value)}
                  placeholder="blogseo_sp_..."
                />
                <Field.Hint>
                  Generate this in your BlogSEO dashboard → Integrations → Strapi → “Connect with the
                  Strapi plugin”.
                </Field.Hint>
              </Field.Root>
              <Field.Root name="contentType">
                <Field.Label>Collection to publish into</Field.Label>
                <SingleSelect
                  value={pluralApiId}
                  onChange={(value: string | number) => setPluralApiId(String(value))}
                  placeholder="Select a collection"
                >
                  {contentTypes.map((contentType) => (
                    <SingleSelectOption key={contentType.uid} value={contentType.pluralApiId}>
                      {contentType.displayName} ({contentType.pluralApiId})
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
                <Field.Hint>New articles from BlogSEO are created as entries here.</Field.Hint>
              </Field.Root>
              <Box>
                <Button onClick={handleConnect} loading={isSubmitting} disabled={!apiKey || !pluralApiId}>
                  Connect
                </Button>
              </Box>
            </Flex>
          )}
        </Box>
      </Layouts.Content>
    </Main>
  );
};

export default Settings;
