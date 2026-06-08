export const CONFIG = {
  // Keep in sync with backend `spring.mvc.apiversion.use.header` + expected header value usage.
  apiVersionHeaderName: 'API-Version',
  apiVersionHeaderValue: '1.3',

  // Backend uses `@Value("${spring.application.name}")` as `systemId`.
  systemId: '2026b.Or.Shemesh',

  // Backend base URL (Vite dev server calls Spring Boot).
  apiBaseUrl: 'http://localhost:8081',
};

