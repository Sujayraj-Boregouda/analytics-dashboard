import { createApp } from "./app";
import { env } from "./config";

createApp().listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});