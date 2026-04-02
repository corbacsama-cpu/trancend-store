// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import "~/lib/i18n";

mount(() => <StartClient />, document.getElementById("app")!);
