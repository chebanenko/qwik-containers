import {
  type RenderToStreamOptions,
  renderToStream,
} from "@builder.io/qwik/server";

import { Counter } from "./counter";

interface IOptions extends RenderToStreamOptions {
  attributes?: Record<string, any>;
}

export function renderWidget({
  containerTagName = "div",
  stream,
  serverData,
  ...options
}: IOptions) {
  return renderToStream(<Counter />, {
    streaming: {
      inOrder: {
        strategy: "direct",
      },
    },
    base: import.meta.env.DEV ? "http://localhost:4567/build/" : undefined,
    ...options,
    containerTagName,
    ...(!containerTagName ? { containerAttributes: { lang: "en" } } : {}),
    serverData,
    stream,
    preloader: false,
  });
}

export default renderWidget;
