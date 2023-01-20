import { useEffect, useState } from "react";
import {
  json,
  redirect,
  type ActionArgs,
  type LinksFunction,
  type LoaderArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import adminStylesHref from "./css/admin.css";

export function loader({ context }: LoaderArgs) {
  return json({
    delay: context.session.get("delay"),
    shouldDefer: Boolean(context.session.get("defer")),
  });
}

export async function action({ context, request }: ActionArgs) {
  const formData = await request.formData();
  const delay = Number(formData.get("delay"));
  const shouldDefer = Boolean(formData.get("defer"));

  console.log({ delay });
  context.session.set("delay", delay);
  context.session.set("defer", shouldDefer);

  const url = new URL(request.headers.get("Referer") || request.url);
  return redirect(url.pathname);
}

export let links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
  },
  { rel: "stylesheet", href: adminStylesHref },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Northwind Traders | Remix D1 Demo",
  viewport: "width=device-width,initial-scale=1",
});

function updateClock() {
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    const now = new Date();
    clockElement.innerHTML = now.toLocaleTimeString();
  }
}

export default function App() {
  const { delay, shouldDefer } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [subMenu, setSubMenu] = useState(false);

  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <html className="no-js" lang="en-US">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="app">
          <nav id="navbar-main" className="navbar is-fixed-top">
            <div className="navbar-brand">
              <button
                onClick={() => {
                  document.documentElement.classList.toggle(
                    "aside-mobile-expanded"
                  );
                }}
                className="mobile-aside-button navbar-item"
              >
                <span className="icon mobile-aside-button material-icons">
                  menu
                </span>
              </button>
            </div>
            <div className="navbar-brand is-right">
              <button
                className="navbar-item --jb-navbar-menu-toggle"
                data-target="navbar-menu"
              >
                <span className="icon material-icons">more_vert</span>
              </button>
            </div>
            <div className="navbar-menu" id="navbar-menu">
              <div id="clock" className="navbar-item ml-6 text-gray-800"></div>
              <div className="navbar-end">
                <div
                  className={`navbar-item dropdown has-divider ${
                    subMenu ? "active" : ""
                  }`}
                >
                  <button
                    className="navbar-link"
                    onClick={() => {
                      setSubMenu(!subMenu);
                    }}
                  >
                    <span className="icon material-icons">menu</span>
                    <span>SQLite Links</span>
                    <span className="icon material-icons">
                      keyboard_arrow_down
                    </span>
                  </button>
                  <div className="navbar-dropdown">
                    <a
                      href="https://blog.cloudflare.com/introducing-d1"
                      className="navbar-item"
                    >
                      <span className="icon material-icons">link</span>
                      <span>Introducing D1</span>
                    </a>
                    <a
                      href="https://www.sqlite.org/lang.html"
                      className="navbar-item"
                    >
                      <span className="icon material-icons">link</span>
                      <span>SQLite SQL Flavour</span>
                    </a>
                    <a
                      href="https://developers.cloudflare.com/workers/learning/using-durable-objects/"
                      className="navbar-item"
                    >
                      <span className="icon material-icons">link</span>
                      <span>Durable Objects</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <aside className="aside is-placed-left is-expanded">
            <div className="aside-tools">
              <div>
                <b className="font-black">Northwind</b> Traders
              </div>
            </div>
            <div className="menu is-menu-main">
              <p className="menu-label">General</p>
              <ul className="menu-list">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                    end
                  >
                    <span className="icon material-icons">home</span>
                    <span className="menu-item-label">Home</span>
                  </NavLink>
                  <NavLink
                    to="/dash"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">
                      display_settings
                    </span>
                    <span className="menu-item-label">Dashboard</span>
                  </NavLink>
                </li>
              </ul>
              <p className="menu-label">Backoffice</p>
              <ul className="menu-list">
                <li>
                  <NavLink
                    to="/suppliers"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">inventory</span>
                    <span className="menu-item-label">Suppliers</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">
                      production_quantity_limits
                    </span>
                    <span className="menu-item-label">Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">shopping_cart</span>
                    <span className="menu-item-label">Orders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/employees"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">badge</span>
                    <span className="menu-item-label">Employees</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/customers"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">group</span>
                    <span className="menu-item-label">Customers</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/search"
                    className={({ isActive }) =>
                      isActive ? "active" : undefined
                    }
                  >
                    <span className="icon material-icons">search</span>
                    <span className="menu-item-label">Search</span>
                  </NavLink>
                </li>
              </ul>
              <Form
                replace
                method="post"
                className="mt-4 p-3"
                onChange={(event) => {
                  if (
                    event.target instanceof HTMLInputElement &&
                    event.target.name === "defer" &&
                    event.target.form
                  ) {
                    submit(event.target.form, { replace: true });
                  }
                }}
              >
                <div className="field">
                  <label className="label text-[#D1D5DB]">
                    Data delay (ms)
                  </label>
                  <div className="field-body">
                    <div className="field">
                      <div className="control">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="delay"
                          defaultValue={delay || 0}
                          min={0}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label text-[#D1D5DB]">Data loading</label>
                  <div className="field-body">
                    <div className="field grouped multiline">
                      <div className="control">
                        <label className="radio">
                          <input
                            type="radio"
                            name="defer"
                            value=""
                            defaultChecked={!shouldDefer}
                          />
                          <span className="check"></span>
                          <span className="control-label text-[#D1D5DB]">
                            await
                          </span>
                        </label>
                      </div>
                      <div className="control">
                        <label className="radio">
                          <input
                            type="radio"
                            name="defer"
                            value="1"
                            defaultChecked={shouldDefer}
                          />
                          <span className="check"></span>
                          <span className="control-label text-[#D1D5DB]">
                            defer
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </aside>

          <section
            className={
              "section main-section " +
              (navigation.state === "loading" ? "fade-out" : "")
            }
          >
            <Outlet />
          </section>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
