import {
  isBrowser,
  component$,
  SSRStream,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import {
  writeHtml,
  getClientStream,
  fetchAndExecuteModule,
  fixRemotePathsInDevMode,
  getSSRStreamFunction,
} from "./utils";

interface IProps {
  type: string;
  host: string;
}

const StreamingClientRemoteContainer = component$(({ type, host }: IProps) => {
  const ref = useSignal<HTMLElement>();

  useVisibleTask$(async ({ cleanup }) => {
    getClientStream(
      ref.value,
      new URL(
        `/w/${type}?serverData=${JSON.stringify({ initialState: 12 })}`,
        import.meta.env.DEV ? host : window.location.origin,
      ),
    );
  });

  return <div ref={ref} />;
});

// =========================
// =========================
// full blown client chunk
// =========================
// =========================

const ClientRemoteContainer = component$(({ type }: IProps) => {
  const ref = useSignal<HTMLElement>();

  useVisibleTask$(async ({ cleanup }) => {
    const { success, module } = await fetchAndExecuteModule(
      `/w/${type}/c/render.js`,
    );

    if (success) {
      const dispose = await module.render({
        initialState: 10,
        parentNode: ref.value,
      });
      cleanup(() => dispose.cleanup());
    }
  });

  return <div ref={ref} />;
});

// =========================
// =========================
// SSR
// =========================
// =========================

const SSRRemoteContainer = component$(({ type, host }: IProps) => {
  return (
    <SSRStream>
      {getSSRStreamFunction(
        `/w/${type}?serverData=${JSON.stringify({ initialState: 12 })}`,
        host,
      )}
    </SSRStream>
  );
});

// =========================
// =========================
// RemoteContainer
// =========================
// =========================
export const RemoteContainer = component$(
  ({ type, host, htmlStreaming }: IProps & { htmlStreaming?: boolean }) => {
    if (isBrowser && htmlStreaming) {
      return <StreamingClientRemoteContainer type={type} host={host} />;
    }

    if (isBrowser) {
      return <ClientRemoteContainer type={type} />;
    }

    return <SSRRemoteContainer type={type} host={host} />;
  },
);

// /**
//  * Attempt to get an asset hosted by a fragment service.
//  *
//  * Such asset requests start with `/_fragment/{service-name}/`, which enables us
//  * to choose the appropriate service binding and delegate the request there.
//  */
// export async function tryGetFragmentAsset(
// 	env: Record<string, unknown>,
// 	request: Request
// ) {
// 	const url = new URL(request.url);
// 	const match = /^\/_fragment\/([^/]+)(\/.*)$/.exec(url.pathname);
// 	if (match === null) {
// 		return null;
// 	}
// 	const serviceName = match[1];
// 	const service = env[serviceName];
// 	if (!isFetcher(service)) {
// 		throw new Error("Unknown fragment service: " + serviceName);
// 	}
// 	return await service.fetch(
// 		new Request(new URL(match[2], request.url), request)
// 	);
// }
//
// export async function fetchFragment(
// 	env: Record<string, unknown>,
// 	fragmentName: string,
// 	request: Request
// ) {
// 	const service = env[fragmentName];
// 	if (!isFetcher(service)) {
// 		throw new Error(
// 			`Fragment ${fragmentName} does not have an equivalent service binding.`
// 		);
// 	}
// 	const url = new URL(request.url);
// 	url.searchParams.set("base", `/_fragment/${fragmentName}/`);
// 	const response = await service.fetch(new Request(url, request));
// 	if (response.body === null) {
// 		throw new Error(`Response from "${fragmentName}" request is null.`);
// 	}
// 	return response.body;
// }
//
// function isFetcher(obj: unknown): obj is Fetcher {
// 	return Boolean((obj as Fetcher).fetch);
// }
//
