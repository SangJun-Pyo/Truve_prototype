import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        index:      resolve(__dirname, "index.html"),
        donation:   resolve(__dirname, "donation.html"),
        foundations:resolve(__dirname, "foundations.html"),
        foundationInfo: resolve(__dirname, "foundation-info.html"),
        foundationDetail: resolve(__dirname, "foundation-detail.html"),
        governance: resolve(__dirname, "governance.html"),
        status:     resolve(__dirname, "status.html"),
        community:  resolve(__dirname, "community.html"),
        mobile:     resolve(__dirname, "mobile.html"),
        about:      resolve(__dirname, "about.html"),
        support:    resolve(__dirname, "support.html"),
        privacy:    resolve(__dirname, "privacy.html"),
        terms:      resolve(__dirname, "terms.html"),
        auth:       resolve(__dirname, "auth.html"),
        account:    resolve(__dirname, "account.html"),
        passwordHelp: resolve(__dirname, "password-help.html"),
        exchangeNotice: resolve(__dirname, "exchange-notice.html"),
        preDonationNotice: resolve(__dirname, "pre-donation-notice.html"),
        credentialNotice: resolve(__dirname, "credential-notice.html"),
        admin:      resolve(__dirname, "admin.html"),
        verify:     resolve(__dirname, "verify.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
