import {
  $,
  component$,
  useOnDocument,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import {
  routeLoader$,
  useLocation,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { RemoteContainer } from "~/components/RemoteContainer";
import { Counter } from "~/components/counter";

function useMousePosition() {
  const position = useStore({ x: 0, y: 0 });
  useOnDocument(
    "mousemove",
    $((event) => {
      const { x, y } = event as MouseEvent;
      position.x = x;
      position.y = y;
    }),
  );
  return position;
}

// TODO: is it called when changing route on the client
export const loader = routeLoader$(() => "Hi! I was fetched on the server");

export default component$(() => {
  const loc = useLocation();
  const pos = useMousePosition();
  const d = loader();
  const openLocal = useSignal(true);
  const openClientSideSsr = useSignal(true);

  return (
    <>
      <div>
        MousePosition: ({pos.x}, {pos.y})
      </div>
      <br />
      <div>Current route: {loc.url.toString()}</div>
      <br />
      <div>Server loaded data: {d}</div>
      <br />
      <code>
        This button allows us mount and unmount SSR component on the client.
        <br />
        1. User requests main page
        <br />
        2. The server renders the specific component
        <br />
        3. On the client there is a need to unmount component and then mount
        again
      </code>
      <br />
      <br />
      <br />
      <br />
      {loc.url.toString().match("counter") && (
        <>
          <button
            onClick$={() => {
              openLocal.value = !openLocal.value;
            }}
          >
            toggle local
          </button>
          <br />
          This is an example of the local component
          {openLocal.value && <Counter />}
          <br />
          <br />
          <br />
          <br />
          <button
            onClick$={() => {
              openClientSideSsr.value = !openClientSideSsr.value;
            }}
          >
            toggle client side SSR
          </button>
          <br />
          This is an example of client side SSR
          <br />
          {openClientSideSsr.value && (
            <RemoteContainer
              type="counter"
              host="http://localhost:4567"
              htmlStreaming
            />
          )}
        </>
      )}
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
