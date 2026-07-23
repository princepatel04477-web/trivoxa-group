import { Config } from "@remotion/cli/config";

// Backgrounds are baked on navy, so JPEG frames are fine and keep renders fast.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
