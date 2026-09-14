import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// StayNRide frontend — talks to the Django backend (h_r_be) on :8010.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    open: true,
  },
});
